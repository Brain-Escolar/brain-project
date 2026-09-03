"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState, ReactNode } from "react";
import { useQuery } from "@tanstack/react-query";
import { QUERY_KEYS } from "@/constants/queryKeys";
import { responsavelPortalApi } from "@/services/api";
import { AlunoVinculadoResponse } from "@/services/domains/responsavel-portal";

const STORAGE_KEY = "brain.responsavel.alunoId";

interface AlunoSelecionadoContextType {
  /** Alunos sob responsabilidade de quem esta logado. */
  alunos: AlunoVinculadoResponse[];
  /** Aluno atualmente em foco. null enquanto carrega ou se nao ha vinculo. */
  alunoAtual: AlunoVinculadoResponse | null;
  /** Atalho para as queries: alunoAtual?.id. */
  alunoId: number | null;
  selecionarAluno: (alunoId: number) => void;
  /** true quando ha mais de um aluno — o seletor so aparece nesse caso. */
  precisaSeletor: boolean;
  isLoading: boolean;
  error: unknown;
}

const AlunoSelecionadoContext = createContext<AlunoSelecionadoContextType | undefined>(undefined);

function lerSelecaoSalva(): number | null {
  if (typeof window === "undefined") return null;
  try {
    const bruto = window.localStorage.getItem(STORAGE_KEY);
    if (!bruto) return null;
    const id = Number(bruto);
    return Number.isFinite(id) ? id : null;
  } catch {
    // localStorage pode lancar em janela privada ou com cookies bloqueados.
    return null;
  }
}

function salvarSelecao(alunoId: number) {
  try {
    window.localStorage.setItem(STORAGE_KEY, String(alunoId));
  } catch {
    // Sem persistencia a selecao apenas volta ao padrao no proximo acesso.
  }
}

/**
 * Contexto de "aluno selecionado" — a peca central do Portal do Responsavel.
 *
 * Um responsavel pode responder por mais de um aluno, e toda tela do portal
 * mostra os dados de um deles por vez. Este contexto e a unica fonte de qual.
 *
 * Regra que faz tudo funcionar: **toda queryKey do portal inclui o alunoId**.
 * Assim trocar de aluno invalida e refaz as queries sozinho, sem refetch
 * manual espalhado pelas telas.
 */
export function AlunoSelecionadoProvider({ children }: { children: ReactNode }) {
  const [alunoIdSelecionado, setAlunoIdSelecionado] = useState<number | null>(null);

  const {
    data: alunos = [],
    isLoading,
    error,
  } = useQuery({
    queryKey: QUERY_KEYS.responsavel.alunos(),
    queryFn: () => responsavelPortalApi.getAlunosVinculados(),
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
  });

  // Resolve a selecao assim que a lista chega: a salva, se ainda for valida;
  // senao o primeiro aluno. Validar importa porque o vinculo pode ter sido
  // removido pela secretaria entre uma sessao e outra.
  useEffect(() => {
    if (alunos.length === 0) return;

    setAlunoIdSelecionado((atual) => {
      if (atual !== null && alunos.some((a) => a.id === atual)) return atual;

      const salvo = lerSelecaoSalva();
      const valido = salvo !== null && alunos.some((a) => a.id === salvo);
      return valido ? salvo : alunos[0].id;
    });
  }, [alunos]);

  const selecionarAluno = useCallback(
    (alunoId: number) => {
      if (!alunos.some((a) => a.id === alunoId)) return;
      setAlunoIdSelecionado(alunoId);
      salvarSelecao(alunoId);
    },
    [alunos],
  );

  const alunoAtual = useMemo(
    () => alunos.find((a) => a.id === alunoIdSelecionado) ?? null,
    [alunos, alunoIdSelecionado],
  );

  const value = useMemo<AlunoSelecionadoContextType>(
    () => ({
      alunos,
      alunoAtual,
      alunoId: alunoAtual?.id ?? null,
      selecionarAluno,
      precisaSeletor: alunos.length > 1,
      isLoading,
      error,
    }),
    [alunos, alunoAtual, selecionarAluno, isLoading, error],
  );

  return (
    <AlunoSelecionadoContext.Provider value={value}>{children}</AlunoSelecionadoContext.Provider>
  );
}

/**
 * Fora do provider devolve um estado vazio em vez de lancar.
 *
 * Isso e proposital: telas compartilhadas (relatorios, calendario, materiais)
 * rodam para estudante, professor e responsavel. Elas chamam este hook e
 * decidem pelo alunoId; para quem nao e responsavel ele simplesmente vem null
 * e a tela usa a fonte de dados de sempre.
 */
export function useAlunoSelecionado(): AlunoSelecionadoContextType {
  const context = useContext(AlunoSelecionadoContext);
  if (!context) {
    return {
      alunos: [],
      alunoAtual: null,
      alunoId: null,
      selecionarAluno: () => {},
      precisaSeletor: false,
      isLoading: false,
      error: null,
    };
  }
  return context;
}
