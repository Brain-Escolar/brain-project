"use client";

import { useCallback, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { QUERY_KEYS } from "@/constants/queryKeys";
import { RouteConfig, codigoDaTela } from "@/constants/routesConfig";
import { usePerfilAtivo } from "@/contexts/PerfilAtivoContext";
import { useAuth } from "@/hooks/useAuth";
import { permissaoApi } from "@/services/api";

/**
 * O que o usuário logado pode fazer (docs/permissoes.md, seção 9).
 *
 * As telas devem perguntar "o que você pode" e não "quem você é". Um
 * `if (role === RESPONSAVEL)` espalhado pelo corpo de uma tela obriga quem
 * adiciona um perfil a caçar condicional em arquivo por arquivo.
 *
 * As permissões vêm de GET /permissoes/me, buscado uma vez no login e ao
 * recarregar a página, e ficam em cache: o hook não vai à rede a cada uso.
 * Telas e controles valem para o perfil ativo. A guarda de rota aceita a tela
 * liberada em qualquer perfil da pessoa, como o backend fará.
 *
 * Isto controla só o que aparece: quem protege os dados é o backend.
 */
export interface Permissoes {
  /** true até a primeira resposta chegar. */
  carregando: boolean;
  erro: boolean;
  /** Tela liberada no perfil ativo. */
  podeTela: (codigo: string) => boolean;
  /** Tela liberada em qualquer perfil da pessoa (guarda de rota). */
  podeTelaEmAlgumPerfil: (codigo: string) => boolean;
  /** Controle (ação dentro de uma tela) liberado no perfil ativo. */
  podeControle: (codigo: string) => boolean;
  /** Para o menu: rota livre ou tela liberada no perfil ativo. */
  podeVerRota: (rota: RouteConfig) => boolean;
  /** ADMIN e DIRETOR montam os grupos de acesso. */
  gerenciaPermissoes: boolean;
  recarregar: () => void;
}

export function usePermissoes(): Permissoes {
  const { user } = useAuth();
  const { perfilAtivo } = usePerfilAtivo();
  const { data, isPending, isError, refetch } = useQuery({
    queryKey: QUERY_KEYS.permissoes.minhas(user?.dadosPessoaisId),
    queryFn: () => permissaoApi.minhas(),
    enabled: !!user,
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: true,
  });

  const doPerfil = perfilAtivo ? data?.perfis[perfilAtivo] : undefined;
  const telas = useMemo(() => new Set(doPerfil?.telas ?? []), [doPerfil]);
  const controles = useMemo(() => new Set(doPerfil?.controles ?? []), [doPerfil]);
  const telasEmAlgumPerfil = useMemo(
    () => new Set(Object.values(data?.perfis ?? {}).flatMap((perfil) => perfil?.telas ?? [])),
    [data],
  );

  const podeTela = useCallback((codigo: string) => telas.has(codigo), [telas]);
  const podeControle = useCallback((codigo: string) => controles.has(codigo), [controles]);
  const podeTelaEmAlgumPerfil = useCallback(
    (codigo: string) => telasEmAlgumPerfil.has(codigo),
    [telasEmAlgumPerfil],
  );
  const podeVerRota = useCallback(
    (rota: RouteConfig) => {
      if (rota.livre) return true;
      const codigo = codigoDaTela(rota);
      return !!codigo && telas.has(codigo);
    },
    [telas],
  );

  return useMemo(
    () => ({
      carregando: isPending,
      erro: isError,
      podeTela,
      podeTelaEmAlgumPerfil,
      podeControle,
      podeVerRota,
      gerenciaPermissoes: data?.gerenciaPermissoes ?? false,
      recarregar: () => void refetch(),
    }),
    [
      isPending,
      isError,
      podeTela,
      podeTelaEmAlgumPerfil,
      podeControle,
      podeVerRota,
      data?.gerenciaPermissoes,
      refetch,
    ],
  );
}

/**
 * Atalho para um controle da tela: `usePermissao(CONTROLES.FICHA_MEDICA_EDITAR)`.
 * Enquanto as permissões carregam, devolve false — o botão aparece quando chegam.
 */
export function usePermissao(controle: string): boolean {
  return usePermissoes().podeControle(controle);
}
