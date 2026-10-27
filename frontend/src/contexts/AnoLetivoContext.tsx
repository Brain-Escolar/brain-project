"use client";

import {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { QUERY_KEYS } from "@/constants/queryKeys";
import { usePerfilAtivo } from "@/contexts/PerfilAtivoContext";
import { UserRoleEnum } from "@/enums";
import { anoLetivoApi } from "@/services/api";
import { AnoLetivoResponse } from "@/services/domains/ano-letivo";
import {
  lerAnoLetivoSelecionado,
  salvarAnoLetivoSelecionado,
} from "@/services/http/anoLetivoSelecionado";

/**
 * Quem navega pela escola em mais de um ano. Aluno e responsável veem sempre o
 * próprio ano corrente — para eles o seletor não existe.
 */
const PERFIS_COM_SELETOR = new Set<UserRoleEnum>([
  UserRoleEnum.ADMIN,
  UserRoleEnum.DIRETOR,
  UserRoleEnum.SECRETARIO,
  UserRoleEnum.PROFESSOR,
  UserRoleEnum.ORIENTADOR,
]);

interface AnoLetivoContextType {
  anos: AnoLetivoResponse[];
  /** O ano ABERTO da escola. */
  anoCorrente: AnoLetivoResponse | null;
  /** O ano que as telas estão mostrando agora. */
  anoVisto: AnoLetivoResponse | null;
  selecionar: (ano: number) => void;
  voltarAoCorrente: () => void;
  /** true quando a pessoa está olhando um ano que não é o corrente. */
  vendoOutroAno: boolean;
  temSeletor: boolean;
}

const AnoLetivoContext = createContext<AnoLetivoContextType | undefined>(undefined);

/**
 * Ano letivo em contexto. A escolha vai em toda requisição (cabeçalho
 * X-Ano-Letivo, ver anoLetivoSelecionado.ts); trocar de ano descarta o cache do
 * React Query, porque quase tudo que está na tela é de um ano.
 */
export function AnoLetivoProvider({ children }: { children: ReactNode }) {
  const queryClient = useQueryClient();
  const { perfilAtivo } = usePerfilAtivo();
  const temSeletor = !!perfilAtivo && PERFIS_COM_SELETOR.has(perfilAtivo);

  const { data: anos = [] } = useQuery({
    queryKey: QUERY_KEYS.anosLetivos.lista(),
    queryFn: () => anoLetivoApi.listar(),
    enabled: temSeletor,
    staleTime: 10 * 60 * 1000,
    refetchOnWindowFocus: false,
  });

  const [selecionado, setSelecionado] = useState<number | null>(null);
  useEffect(() => setSelecionado(lerAnoLetivoSelecionado()), []);

  const anoCorrente = useMemo(() => anos.find((a) => a.status === "ABERTO") ?? null, [anos]);

  const trocar = useCallback(
    (ano: number | null) => {
      const valor = ano != null && ano === anoCorrente?.ano ? null : ano;
      salvarAnoLetivoSelecionado(valor);
      setSelecionado(valor);
      // Reset (e não só invalidate): o que está na tela é do ano anterior e
      // não pode aparecer nem por um instante como se fosse do novo.
      queryClient.resetQueries({
        predicate: (q) => q.queryKey[0] !== QUERY_KEYS.anosLetivos.all[0],
      });
    },
    [anoCorrente, queryClient],
  );

  // Ano escolhido que deixou de existir (ou perfil sem seletor): volta ao corrente.
  useEffect(() => {
    if (selecionado == null) return;
    const someu = anos.length > 0 && !anos.some((a) => a.ano === selecionado);
    if (someu || (perfilAtivo && !temSeletor)) {
      trocar(null);
    }
  }, [anos, selecionado, temSeletor, perfilAtivo, trocar]);

  const value = useMemo<AnoLetivoContextType>(() => {
    const anoVisto =
      (selecionado != null && anos.find((a) => a.ano === selecionado)) || anoCorrente;
    return {
      anos,
      anoCorrente,
      anoVisto,
      selecionar: (ano) => trocar(ano),
      voltarAoCorrente: () => trocar(null),
      vendoOutroAno: !!anoVisto && !!anoCorrente && anoVisto.ano !== anoCorrente.ano,
      temSeletor,
    };
  }, [anos, anoCorrente, selecionado, trocar, temSeletor]);

  return <AnoLetivoContext.Provider value={value}>{children}</AnoLetivoContext.Provider>;
}

export function useAnoLetivo(): AnoLetivoContextType {
  const context = useContext(AnoLetivoContext);
  if (!context) {
    return {
      anos: [],
      anoCorrente: null,
      anoVisto: null,
      selecionar: () => {},
      voltarAoCorrente: () => {},
      vendoOutroAno: false,
      temSeletor: false,
    };
  }
  return context;
}
