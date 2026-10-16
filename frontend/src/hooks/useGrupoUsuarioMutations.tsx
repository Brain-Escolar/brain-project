"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-toastify";
import { QUERY_KEYS } from "@/constants/queryKeys";
import { grupoUsuarioApi } from "@/services/api";
import { mensagemDeErro } from "@/hooks/useDocumentoMutations";
import {
  AcessosGrupoUsuarioRequest,
  AtualizacaoGrupoUsuarioRequest,
  CadastroGrupoUsuarioRequest,
  DuplicacaoGrupoUsuarioRequest,
} from "@/services/domains/grupo-usuario";

/**
 * Recusa do backend (nome repetido, dependência faltando...) não muda repetindo;
 * só falha de rede, sem status HTTP, tenta de novo. Sem isso, o retry global das
 * mutações atrasava em um segundo a mensagem de erro.
 */
function repetirSoFalhaDeRede(falhas: number, erro: Error): boolean {
  const status = (erro as Error & { status?: number }).status;
  return status === undefined && falhas < 1;
}

/**
 * Escritas da tela de grupos de acesso.
 *
 * Toda escrita invalida os grupos inteiros: lista, detalhe e páginas de
 * pessoas mostram contagens que mudam juntas. O backend devolve a explicação
 * das recusas (nome repetido, dependência faltando...), e ela vai para o toast.
 */
export function useGrupoUsuarioMutations() {
  const queryClient = useQueryClient();
  // As permissões de quem está logado também: a pessoa pode ter editado um grupo
  // em que ela mesma está.
  const invalidar = () => {
    queryClient.invalidateQueries({ queryKey: QUERY_KEYS.gruposUsuarios.all });
    queryClient.invalidateQueries({ queryKey: QUERY_KEYS.permissoes.all });
  };

  const criar = useMutation({
    retry: repetirSoFalhaDeRede,
    mutationFn: (dados: CadastroGrupoUsuarioRequest) => grupoUsuarioApi.criar(dados),
    onSuccess: () => {
      invalidar();
      toast.success("Grupo criado.");
    },
    onError: (error) => toast.error(mensagemDeErro(error, "Erro ao criar o grupo.")),
  });

  const atualizar = useMutation({
    retry: repetirSoFalhaDeRede,
    mutationFn: ({ id, dados }: { id: number; dados: AtualizacaoGrupoUsuarioRequest }) =>
      grupoUsuarioApi.atualizar(id, dados),
    onSuccess: () => {
      invalidar();
      toast.success("Grupo atualizado.");
    },
    onError: (error) => toast.error(mensagemDeErro(error, "Erro ao atualizar o grupo.")),
  });

  const salvarAcessos = useMutation({
    retry: repetirSoFalhaDeRede,
    mutationFn: ({ id, dados }: { id: number; dados: AcessosGrupoUsuarioRequest }) =>
      grupoUsuarioApi.salvarAcessos(id, dados),
    onSuccess: () => {
      invalidar();
      toast.success("Acessos salvos.");
    },
    onError: (error) => toast.error(mensagemDeErro(error, "Erro ao salvar os acessos.")),
  });

  const duplicar = useMutation({
    retry: repetirSoFalhaDeRede,
    mutationFn: ({ id, dados }: { id: number; dados: DuplicacaoGrupoUsuarioRequest }) =>
      grupoUsuarioApi.duplicar(id, dados),
    onSuccess: () => {
      invalidar();
      toast.success("Grupo duplicado.");
    },
    onError: (error) => toast.error(mensagemDeErro(error, "Erro ao duplicar o grupo.")),
  });

  const excluir = useMutation({
    retry: repetirSoFalhaDeRede,
    mutationFn: (id: number) => grupoUsuarioApi.excluir(id),
    onSuccess: () => {
      // Só a lista: invalidar tudo faria a página do grupo, ainda aberta,
      // buscar de novo o grupo que acabou de ser excluído (404).
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.gruposUsuarios.lists() });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.permissoes.all });
      toast.success("Grupo excluído.");
    },
    onError: (error) => toast.error(mensagemDeErro(error, "Erro ao excluir o grupo.")),
  });

  const adicionarMembros = useMutation({
    retry: repetirSoFalhaDeRede,
    mutationFn: ({ id, dadosPessoaisIds }: { id: number; dadosPessoaisIds: number[] }) =>
      grupoUsuarioApi.adicionarMembros(id, { dadosPessoaisIds }),
    onSuccess: (_, { dadosPessoaisIds }) => {
      invalidar();
      toast.success(
        dadosPessoaisIds.length === 1
          ? "Pessoa adicionada ao grupo."
          : `${dadosPessoaisIds.length} pessoas adicionadas ao grupo.`,
      );
    },
    onError: (error) => toast.error(mensagemDeErro(error, "Erro ao adicionar as pessoas.")),
  });

  const removerMembro = useMutation({
    retry: repetirSoFalhaDeRede,
    mutationFn: ({ id, dadosPessoaisId }: { id: number; dadosPessoaisId: number }) =>
      grupoUsuarioApi.removerMembro(id, dadosPessoaisId),
    onSuccess: () => {
      invalidar();
      toast.success("Pessoa removida do grupo.");
    },
    onError: (error) => toast.error(mensagemDeErro(error, "Erro ao remover a pessoa.")),
  });

  return { criar, atualizar, salvarAcessos, duplicar, excluir, adicionarMembros, removerMembro };
}
