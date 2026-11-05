"use client";

import { QUERY_KEYS } from "@/constants/queryKeys";
import { produtoApi } from "@/services/api";
import {
  CadastroModalidadeRequest,
  CadastroPrecoRequest,
  CadastroProdutoRequest,
} from "@/services/domains/produto";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { toast } from "react-toastify";

/**
 * O backend recusa preço com a razão específica: sobreposição de vigência com
 * outro preço do mesmo escopo, vigência que termina antes de começar, preço que
 * já entrou em vigor e por isso não se exclui. É a parte útil do erro — "marque
 * para encerrar o anterior" diz o que fazer.
 */
function mensagemDoBackend(erro: unknown, fallback: string): string {
  const resposta = (erro as AxiosError<{ message?: string; erro?: string }>)?.response?.data;
  return resposta?.message ?? resposta?.erro ?? fallback;
}

export function useCatalogoMutations() {
  const queryClient = useQueryClient();

  function invalidar() {
    queryClient.invalidateQueries({ queryKey: QUERY_KEYS.produtos.all });
    // Preço novo muda o teto de bolsa, que é calculado sobre o valor cheio.
    queryClient.invalidateQueries({ queryKey: QUERY_KEYS.bolsa.all });
  }

  const criarProduto = useMutation({
    mutationFn: (dados: CadastroProdutoRequest) => produtoApi.cadastrar(dados),
    onSuccess: (produto) => {
      invalidar();
      toast.success(`Produto "${produto.nome}" criado.`);
    },
    onError: (erro) => toast.error(mensagemDoBackend(erro, "Não foi possível criar o produto.")),
  });

  const criarModalidade = useMutation({
    mutationFn: ({ produtoId, dados }: { produtoId: number; dados: CadastroModalidadeRequest }) =>
      produtoApi.adicionarModalidade(produtoId, dados),
    onSuccess: () => {
      invalidar();
      toast.success("Modalidade criada. Agora cadastre o preço dela.");
    },
    onError: (erro) => toast.error(mensagemDoBackend(erro, "Não foi possível criar a modalidade.")),
  });

  const criarPreco = useMutation({
    mutationFn: ({ modalidadeId, dados }: { modalidadeId: number; dados: CadastroPrecoRequest }) =>
      produtoApi.cadastrarPreco(modalidadeId, dados),
    onSuccess: (preco) => {
      invalidar();
      // Nao dizer "ja vigente": o preco nasce pendente e nao precifica nada ate
      // alguem aprovar. Prometer vigencia aqui faria quem cadastrou ir embora
      // achando que o reajuste entrou -- e descobrir no boleto que nao entrou.
      if (preco.status === "PENDENTE_APROVACAO") {
        toast.info(
          "Reajuste enviado para aprovação. Até a decisão, o preço anterior continua valendo.",
        );
        return;
      }
      toast.success(
        preco.vigenteHoje
          ? "Preço cadastrado e já vigente."
          : `Preço cadastrado, vigente a partir de ${preco.vigenciaInicio.split("-").reverse().join("/")}.`,
      );
    },
    onError: (erro) => toast.error(mensagemDoBackend(erro, "Não foi possível cadastrar o preço.")),
  });

  const encerrarPreco = useMutation({
    mutationFn: ({ precoId, dataFim }: { precoId: number; dataFim: string }) =>
      produtoApi.encerrarPreco(precoId, dataFim),
    onSuccess: () => {
      invalidar();
      toast.success("Vigência encerrada.");
    },
    onError: (erro) => toast.error(mensagemDoBackend(erro, "Não foi possível encerrar a vigência.")),
  });

  const excluirPreco = useMutation({
    mutationFn: (precoId: number) => produtoApi.excluirPreco(precoId),
    onSuccess: () => {
      invalidar();
      toast.success("Preço excluído.");
    },
    onError: (erro) => toast.error(mensagemDoBackend(erro, "Não foi possível excluir o preço.")),
  });

  return { criarProduto, criarModalidade, criarPreco, encerrarPreco, excluirPreco };
}
