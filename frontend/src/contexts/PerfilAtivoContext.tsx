"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState, ReactNode } from "react";
import { useAuth } from "@/hooks/useAuth";
import { UserRoleEnum } from "@/enums";
import { perfilPrincipal } from "@/utils/perfis";

const STORAGE_KEY = "brain.perfilAtivo";

interface PerfilAtivoContextType {
  /** Todos os perfis da pessoa. */
  perfis: UserRoleEnum[];
  /** O perfil sob o qual ela está navegando agora. */
  perfilAtivo: UserRoleEnum | null;
  trocarPerfil: (perfil: UserRoleEnum) => void;
  /** true quando há mais de um perfil — o seletor só existe nesse caso. */
  precisaSeletor: boolean;
}

const PerfilAtivoContext = createContext<PerfilAtivoContextType | undefined>(undefined);

function lerSalvo(): string | null {
  if (typeof window === "undefined") return null;
  try {
    return window.localStorage.getItem(STORAGE_KEY);
  } catch {
    return null;
  }
}

function salvar(perfil: UserRoleEnum) {
  try {
    window.localStorage.setItem(STORAGE_KEY, perfil);
  } catch {
    // Sem persistência a escolha volta ao padrão no próximo acesso.
  }
}

/**
 * Perfil ativo — sob qual papel a pessoa está usando o sistema agora.
 *
 * O modelo de dados permite acumular perfis (um professor que também é
 * responsável por um aluno). Mostrar a união dos menus embaralha dois mundos
 * no mesmo nível: some o contexto de qual chapéu está em uso, e o seletor de
 * aluno aparece até enquanto a pessoa navega como professor.
 *
 * Com um perfil ativo por vez, tudo volta a ser inequívoco — menu, dashboard
 * e permissões olham para um só — e a troca fica explícita.
 */
export function PerfilAtivoProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const perfis = useMemo(() => user?.roles ?? [], [user?.roles]);
  const [perfilAtivo, setPerfilAtivo] = useState<UserRoleEnum | null>(null);

  // Valida o salvo contra os perfis atuais: a secretaria pode ter removido um
  // vínculo entre uma sessão e outra.
  useEffect(() => {
    if (perfis.length === 0) {
      setPerfilAtivo(null);
      return;
    }

    setPerfilAtivo((atual) => {
      if (atual && perfis.includes(atual)) return atual;

      const salvo = lerSalvo() as UserRoleEnum | null;
      return salvo && perfis.includes(salvo) ? salvo : perfilPrincipal(perfis);
    });
  }, [perfis]);

  const trocarPerfil = useCallback(
    (perfil: UserRoleEnum) => {
      if (!perfis.includes(perfil)) return;
      setPerfilAtivo(perfil);
      salvar(perfil);
    },
    [perfis],
  );

  const value = useMemo<PerfilAtivoContextType>(
    () => ({
      perfis,
      perfilAtivo,
      trocarPerfil,
      precisaSeletor: perfis.length > 1,
    }),
    [perfis, perfilAtivo, trocarPerfil],
  );

  return <PerfilAtivoContext.Provider value={value}>{children}</PerfilAtivoContext.Provider>;
}

/**
 * Fora do provider devolve um estado vazio em vez de lançar — o mesmo contrato
 * do useAlunoSelecionado, para telas que renderizam em contextos parciais.
 */
export function usePerfilAtivo(): PerfilAtivoContextType {
  const context = useContext(PerfilAtivoContext);
  if (!context) {
    return { perfis: [], perfilAtivo: null, trocarPerfil: () => {}, precisaSeletor: false };
  }
  return context;
}
