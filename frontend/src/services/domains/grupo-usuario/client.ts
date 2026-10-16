import { httpClient } from "@/services/http";
import { IBrainResult } from "@/services/commoResponse";
import { PerfilNomeEnum } from "@/enums/PerfilNomeEnum";
import {
  AcessosGrupoUsuarioRequest,
  AdicaoMembrosRequest,
  AtualizacaoGrupoUsuarioRequest,
  BuscaPessoasGrupoParams,
  CadastroGrupoUsuarioRequest,
  DuplicacaoGrupoUsuarioRequest,
} from "./request";
import {
  AcessosIndividuaisResponse,
  CatalogoPermissoesResponse,
  GrupoUsuarioDetalheResponse,
  GrupoUsuarioListaResponse,
  PessoaGrupoResponse,
} from "./response";

const BASE_ROUTE = "grupos-usuarios";

/** Tela de grupos de acesso (docs/permissoes.md). Restrita a ADMIN e DIRETOR no backend. */
export class GrupoUsuarioApi {
  listar(): Promise<GrupoUsuarioListaResponse[]> {
    return httpClient.get(BASE_ROUTE);
  }

  detalhar(id: number): Promise<GrupoUsuarioDetalheResponse> {
    return httpClient.get(`${BASE_ROUTE}/${id}`);
  }

  criar(dados: CadastroGrupoUsuarioRequest): Promise<GrupoUsuarioDetalheResponse> {
    return httpClient.post(BASE_ROUTE, dados);
  }

  atualizar(
    id: number,
    dados: AtualizacaoGrupoUsuarioRequest,
  ): Promise<GrupoUsuarioDetalheResponse> {
    return httpClient.put(`${BASE_ROUTE}/${id}`, dados);
  }

  salvarAcessos(
    id: number,
    dados: AcessosGrupoUsuarioRequest,
  ): Promise<GrupoUsuarioDetalheResponse> {
    return httpClient.put(`${BASE_ROUTE}/${id}/acessos`, dados);
  }

  duplicar(id: number, dados: DuplicacaoGrupoUsuarioRequest): Promise<GrupoUsuarioDetalheResponse> {
    return httpClient.post(`${BASE_ROUTE}/${id}/duplicar`, dados);
  }

  excluir(id: number): Promise<void> {
    return httpClient.delete(`${BASE_ROUTE}/${id}`);
  }

  listarMembros(
    id: number,
    params: BuscaPessoasGrupoParams,
  ): Promise<IBrainResult<PessoaGrupoResponse>> {
    return httpClient.get(`${BASE_ROUTE}/${id}/membros`, { params });
  }

  /** Quem pode entrar: tem login, tem o perfil do grupo e ainda não está nele. */
  listarCandidatos(
    id: number,
    params: BuscaPessoasGrupoParams,
  ): Promise<IBrainResult<PessoaGrupoResponse>> {
    return httpClient.get(`${BASE_ROUTE}/${id}/candidatos`, { params });
  }

  adicionarMembros(id: number, dados: AdicaoMembrosRequest): Promise<void> {
    return httpClient.post(`${BASE_ROUTE}/${id}/membros`, dados);
  }

  removerMembro(id: number, dadosPessoaisId: number): Promise<void> {
    return httpClient.delete(`${BASE_ROUTE}/${id}/membros/${dadosPessoaisId}`);
  }

  /** O que a pessoa tem além dos grupos, no perfil, e o que os grupos já dão. */
  acessosIndividuais(
    dadosPessoaisId: number,
    perfil: PerfilNomeEnum,
  ): Promise<AcessosIndividuaisResponse> {
    return httpClient.get(`${BASE_ROUTE}/individuais/${dadosPessoaisId}`, { params: { perfil } });
  }

  /** Conjunto completo: substitui os acessos individuais. Vazio apaga todos. */
  salvarAcessosIndividuais(
    dadosPessoaisId: number,
    perfil: PerfilNomeEnum,
    dados: AcessosGrupoUsuarioRequest,
  ): Promise<AcessosIndividuaisResponse> {
    return httpClient.put(`${BASE_ROUTE}/individuais/${dadosPessoaisId}`, dados, {
      params: { perfil },
    });
  }

  /** O teto do perfil; com individual, o sistema inteiro, com o que é de fora marcado. */
  catalogo(perfil: PerfilNomeEnum, individual = false): Promise<CatalogoPermissoesResponse> {
    return httpClient.get("permissoes/catalogo", { params: { perfil, individual } });
  }
}
