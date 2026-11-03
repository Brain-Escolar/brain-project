import { httpClient } from "@/services/http";
import {
  AtualizacaoProdutoRequest,
  CadastroModalidadeRequest,
  CadastroPrecoRequest,
  CadastroProdutoRequest,
} from "./request";
import {
  AlunoProdutoResponse,
  ModalidadeResponse,
  PrecoResponse,
  ProdutoDetalheResponse,
  ProdutoResponse,
} from "./response";

const BASE_ROUTE = "produto";

interface Paginado<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
}

export class ProdutoApi {
  listarComprasPorAluno(alunoId: string): Promise<AlunoProdutoResponse[]> {
    return httpClient.get(`${BASE_ROUTE}/alunos/${alunoId}`);
  }

  // ------------------------------------------------------------- catálogo

  listar(params?: { page?: number; size?: number }): Promise<Paginado<ProdutoResponse>> {
    return httpClient.get(BASE_ROUTE, { params });
  }

  detalhar(id: number): Promise<ProdutoDetalheResponse> {
    return httpClient.get(`${BASE_ROUTE}/${id}`);
  }

  cadastrar(dados: CadastroProdutoRequest): Promise<ProdutoDetalheResponse> {
    return httpClient.post(BASE_ROUTE, dados);
  }

  atualizar(id: number, dados: AtualizacaoProdutoRequest): Promise<ProdutoDetalheResponse> {
    return httpClient.put(`${BASE_ROUTE}/${id}`, dados);
  }

  adicionarModalidade(
    produtoId: number,
    dados: CadastroModalidadeRequest,
  ): Promise<ModalidadeResponse> {
    return httpClient.post(`${BASE_ROUTE}/${produtoId}/modalidades`, dados);
  }

  // --------------------------------------------------------------- preços

  listarPrecos(modalidadeId: number): Promise<PrecoResponse[]> {
    return httpClient.get(`${BASE_ROUTE}/modalidades/${modalidadeId}/precos`);
  }

  cadastrarPreco(modalidadeId: number, dados: CadastroPrecoRequest): Promise<PrecoResponse> {
    return httpClient.post(`${BASE_ROUTE}/modalidades/${modalidadeId}/precos`, dados);
  }

  /** Fecha a vigência. É a única alteração possível numa linha existente. */
  encerrarPreco(precoId: number, dataFim: string): Promise<PrecoResponse> {
    return httpClient.put(`${BASE_ROUTE}/precos/${precoId}/encerramento`, undefined, {
      params: { dataFim },
    });
  }

  /** Só para preço que ainda não entrou em vigor — erro de digitação antes de valer. */
  excluirPreco(precoId: number): Promise<void> {
    return httpClient.delete(`${BASE_ROUTE}/precos/${precoId}`);
  }
}
