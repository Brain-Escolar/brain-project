"use client";

import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-toastify";
import { QUERY_KEYS } from "@/constants/queryKeys";
import { usuarioApi } from "@/services/api";
import { mensagemDeErro } from "@/hooks/useDocumentoMutations";
import { PerfilNomeEnum } from "@/enums/PerfilNomeEnum";
import { FiltroUsuariosParams, UsuarioDetalheResponse } from "@/services/domains/usuario";

/** Lista da tela de Usuários, paginada e filtrada no servidor. */
export function useUsuarios(params: FiltroUsuariosParams) {
  const { data, isLoading, isFetching, error } = useQuery({
    queryKey: QUERY_KEYS.usuarios.list({ ...params }),
    queryFn: () => usuarioApi.listar(params),
    // Mantém a página anterior na tela enquanto a próxima carrega.
    placeholderData: keepPreviousData,
  });

  return {
    usuarios: data?.content ?? [],
    total: data?.totalElements ?? 0,
    loading: isLoading,
    atualizando: isFetching,
    error: error ? "Erro ao carregar os usuários." : null,
  };
}

/** Grupos normais para o filtro. Mudam pouco: ficam em cache por mais tempo. */
export function useGruposParaFiltro() {
  const { data } = useQuery({
    queryKey: QUERY_KEYS.usuarios.grupos(),
    queryFn: () => usuarioApi.gruposParaFiltro(),
    staleTime: 5 * 60 * 1000,
  });
  return data ?? [];
}

export function useUsuario(dadosPessoaisId: number | null) {
  const { data, isLoading, error } = useQuery({
    queryKey: QUERY_KEYS.usuarios.detail(dadosPessoaisId ?? 0),
    queryFn: () => usuarioApi.detalhar(dadosPessoaisId!),
    enabled: dadosPessoaisId != null && !Number.isNaN(dadosPessoaisId),
  });

  return {
    usuario: data ?? null,
    loading: isLoading,
    error: error ? mensagemDeErro(error, "Erro ao carregar o usuário.") : null,
  };
}

/**
 * Ações de login da tela de Usuários. A recusa do servidor (o próprio login,
 * fora do alcance, último administrador...) vem explicada e vai para o toast.
 */
export function useUsuarioMutations() {
  const queryClient = useQueryClient();

  const atualizarDetalhe = (detalhe: UsuarioDetalheResponse) => {
    queryClient.setQueryData(QUERY_KEYS.usuarios.detail(detalhe.dadosPessoaisId), detalhe);
    queryClient.invalidateQueries({ queryKey: QUERY_KEYS.usuarios.all });
  };

  const desativar = useMutation({
    retry: false,
    mutationFn: (dadosPessoaisId: number) => usuarioApi.desativar(dadosPessoaisId),
    onSuccess: (detalhe) => {
      atualizarDetalhe(detalhe);
      toast.success("Login desativado.");
    },
    onError: (error) => toast.error(mensagemDeErro(error, "Erro ao desativar o login.")),
  });

  const reativar = useMutation({
    retry: false,
    mutationFn: (dadosPessoaisId: number) => usuarioApi.reativar(dadosPessoaisId),
    onSuccess: (detalhe) => {
      atualizarDetalhe(detalhe);
      toast.success("Login reativado.");
    },
    onError: (error) => toast.error(mensagemDeErro(error, "Erro ao reativar o login.")),
  });

  const reenviarVerificacao = useMutation({
    retry: false,
    mutationFn: (dadosPessoaisId: number) => usuarioApi.reenviarVerificacao(dadosPessoaisId),
    onSuccess: () =>
      toast.success("Enviamos um novo link de primeiro acesso para o e-mail pessoal."),
    onError: (error) => toast.error(mensagemDeErro(error, "Erro ao reenviar a verificação.")),
  });

  const enviarRedefinicao = useMutation({
    retry: false,
    mutationFn: (dadosPessoaisId: number) => usuarioApi.enviarRedefinicao(dadosPessoaisId),
    onSuccess: () => toast.success("Enviamos o link de redefinição para o e-mail pessoal."),
    onError: (error) =>
      toast.error(mensagemDeErro(error, "Erro ao enviar a redefinição de senha.")),
  });

  return { desativar, reativar, reenviarVerificacao, enviarRedefinicao };
}

/** Seção "Acesso efetivo": só busca quando quem vê tem o controle. */
export function useAcessoEfetivo(dadosPessoaisId: number, habilitado: boolean) {
  const { data, isLoading, error } = useQuery({
    queryKey: QUERY_KEYS.usuarios.acessos(dadosPessoaisId),
    queryFn: () => usuarioApi.acessoEfetivo(dadosPessoaisId),
    enabled: habilitado,
  });
  return {
    acesso: data ?? null,
    loading: isLoading,
    error: error ? mensagemDeErro(error, "Erro ao carregar o acesso efetivo.") : null,
  };
}

/** Prévia do diálogo de conceder ou remover perfil. Sem cache: o grupo pode ter mudado. */
export function usePreviaPerfil(dadosPessoaisId: number, perfil: PerfilNomeEnum | null) {
  const { data, isLoading, error } = useQuery({
    queryKey: QUERY_KEYS.usuarios.previaPerfil(dadosPessoaisId, perfil ?? ""),
    queryFn: () => usuarioApi.previaPerfil(dadosPessoaisId, perfil!),
    enabled: perfil != null,
    staleTime: 0,
    gcTime: 0,
  });
  return {
    previa: data ?? null,
    loading: isLoading,
    error: error ? mensagemDeErro(error, "Erro ao carregar o que muda com o perfil.") : null,
  };
}

export function usePerfilMutations() {
  const queryClient = useQueryClient();

  const atualizar = (detalhe: UsuarioDetalheResponse) => {
    queryClient.setQueryData(QUERY_KEYS.usuarios.detail(detalhe.dadosPessoaisId), detalhe);
    queryClient.invalidateQueries({ queryKey: QUERY_KEYS.usuarios.all });
    queryClient.invalidateQueries({ queryKey: QUERY_KEYS.gruposUsuarios.all });
  };

  const conceder = useMutation({
    retry: false,
    mutationFn: ({
      dadosPessoaisId,
      perfil,
    }: {
      dadosPessoaisId: number;
      perfil: PerfilNomeEnum;
    }) => usuarioApi.concederPerfil(dadosPessoaisId, perfil),
    onSuccess: (detalhe) => {
      atualizar(detalhe);
      toast.success("Perfil concedido. O menu da pessoa muda no próximo login.");
    },
    onError: (error) => toast.error(mensagemDeErro(error, "Erro ao conceder o perfil.")),
  });

  const remover = useMutation({
    retry: false,
    mutationFn: ({
      dadosPessoaisId,
      perfil,
    }: {
      dadosPessoaisId: number;
      perfil: PerfilNomeEnum;
    }) => usuarioApi.removerPerfil(dadosPessoaisId, perfil),
    onSuccess: (detalhe) => {
      atualizar(detalhe);
      toast.success("Perfil removido. Os grupos ficam guardados caso ele volte.");
    },
    onError: (error) => toast.error(mensagemDeErro(error, "Erro ao remover o perfil.")),
  });

  return { conceder, remover };
}
