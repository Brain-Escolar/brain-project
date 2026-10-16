"use client";

import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { QUERY_KEYS } from "@/constants/queryKeys";
import { grupoUsuarioApi } from "@/services/api";
import { PerfilNomeEnum } from "@/enums/PerfilNomeEnum";

/** Leituras da tela de grupos de acesso. As escritas ficam em useGrupoUsuarioMutations. */

export function useGruposUsuarios() {
  const { data, isLoading, error } = useQuery({
    queryKey: QUERY_KEYS.gruposUsuarios.lists(),
    queryFn: () => grupoUsuarioApi.listar(),
  });

  return {
    grupos: data ?? [],
    loading: isLoading,
    error: error ? "Erro ao carregar os grupos de acesso." : null,
  };
}

export function useGrupoUsuario(id: number | null) {
  const { data, isLoading, error } = useQuery({
    queryKey: QUERY_KEYS.gruposUsuarios.detail(id ?? 0),
    queryFn: () => grupoUsuarioApi.detalhar(id!),
    enabled: id != null && !Number.isNaN(id),
  });

  return {
    grupo: data ?? null,
    loading: isLoading,
    error: error ? "Erro ao carregar o grupo de acesso." : null,
  };
}

/**
 * O teto do perfil, ou, com individual, o catálogo inteiro do acesso individual.
 * Só muda por migration, então fica em cache por mais tempo.
 */
export function useCatalogoPermissoes(perfil: PerfilNomeEnum | null, individual = false) {
  const { data, isLoading, error } = useQuery({
    queryKey: QUERY_KEYS.gruposUsuarios.catalogo(perfil ?? "", individual),
    queryFn: () => grupoUsuarioApi.catalogo(perfil!, individual),
    enabled: perfil != null,
    staleTime: 30 * 60 * 1000,
  });

  return {
    catalogo: data ?? null,
    loading: isLoading,
    error: error ? "Erro ao carregar as telas disponíveis para o perfil." : null,
  };
}

/** Acessos individuais da pessoa no perfil, com o que os grupos dela já dão. */
export function useAcessosIndividuais(
  dadosPessoaisId: number | null,
  perfil: PerfilNomeEnum | null,
) {
  const { data, isLoading, error } = useQuery({
    queryKey: QUERY_KEYS.gruposUsuarios.individuais(dadosPessoaisId ?? 0, perfil ?? ""),
    queryFn: () => grupoUsuarioApi.acessosIndividuais(dadosPessoaisId!, perfil!),
    enabled: dadosPessoaisId != null && !Number.isNaN(dadosPessoaisId) && perfil != null,
  });

  return {
    acessos: data ?? null,
    loading: isLoading,
    error: error ? "Erro ao carregar os acessos individuais." : null,
  };
}

/** Catálogo de telas para a busca da aba "Por tela". Só muda por migration. */
export function useTelasCatalogo() {
  const { data, isLoading, error } = useQuery({
    queryKey: QUERY_KEYS.gruposUsuarios.telas(),
    queryFn: () => grupoUsuarioApi.listarTelas(),
    staleTime: 30 * 60 * 1000,
  });

  return {
    telas: data ?? [],
    loading: isLoading,
    error: error ? "Erro ao carregar as telas." : null,
  };
}

/** Grupos e acessos individuais, de qualquer perfil, que concedem a tela escolhida. */
export function useAcessoPorTela(codigoTela: string | null) {
  const { data, isLoading, error } = useQuery({
    queryKey: QUERY_KEYS.gruposUsuarios.porTela(codigoTela ?? ""),
    queryFn: () => grupoUsuarioApi.porTela(codigoTela!),
    enabled: !!codigoTela,
  });

  return {
    acessos: data ?? [],
    loading: isLoading,
    error: error ? "Erro ao carregar quem tem acesso a essa tela." : null,
  };
}

interface UsePessoasDoGrupoParams {
  grupoId: number;
  /** membros = quem está no grupo; candidatos = quem pode entrar. */
  tipo: "membros" | "candidatos";
  busca: string;
  page: number;
  size: number;
  enabled?: boolean;
}

export function usePessoasDoGrupo({
  grupoId,
  tipo,
  busca,
  page,
  size,
  enabled = true,
}: UsePessoasDoGrupoParams) {
  const { data, isLoading, isFetching, error } = useQuery({
    queryKey:
      tipo === "membros"
        ? QUERY_KEYS.gruposUsuarios.membros(grupoId, busca, page)
        : QUERY_KEYS.gruposUsuarios.candidatos(grupoId, busca, page),
    queryFn: () =>
      tipo === "membros"
        ? grupoUsuarioApi.listarMembros(grupoId, { busca, page, size })
        : grupoUsuarioApi.listarCandidatos(grupoId, { busca, page, size }),
    enabled,
    // Mantém a página anterior na tela enquanto a próxima carrega.
    placeholderData: keepPreviousData,
  });

  return {
    pessoas: data?.content ?? [],
    total: data?.totalElements ?? 0,
    loading: isLoading,
    atualizando: isFetching,
    error: error ? "Erro ao carregar as pessoas." : null,
  };
}
