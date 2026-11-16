import { httpClient } from "@/services/http";
import { IBrainResult } from "@/services/commoResponse";
import {
  EsqueciSenhaRequest,
  FiltroUsuariosParams,
  NovaSenhaRequest,
  VerificarContaRequest,
} from "./request";
import {
  GrupoFiltroResponse,
  InformacaoLinkSenhaResponse,
  UsuarioDetalheResponse,
  UsuarioListaResponse,
  VerificarContaResponse,
} from "./response";

const BASE_ROUTE = "usuario";
const GESTAO = "usuarios";

export class UsuarioAPI {
  verificarConta(request: VerificarContaRequest): Promise<VerificarContaResponse> {
    return httpClient.get(`${BASE_ROUTE}/verificar-conta`, {
      params: request,
    });
  }

  // ---------- Tela de Usuários (docs/permissoes.md, seção 8.7). O id é o da pessoa.

  listar(params: FiltroUsuariosParams): Promise<IBrainResult<UsuarioListaResponse>> {
    return httpClient.get(GESTAO, { params });
  }

  gruposParaFiltro(): Promise<GrupoFiltroResponse[]> {
    return httpClient.get(`${GESTAO}/grupos`);
  }

  detalhar(dadosPessoaisId: number): Promise<UsuarioDetalheResponse> {
    return httpClient.get(`${GESTAO}/${dadosPessoaisId}`);
  }

  desativar(dadosPessoaisId: number): Promise<UsuarioDetalheResponse> {
    return httpClient.post(`${GESTAO}/${dadosPessoaisId}/login/desativar`);
  }

  reativar(dadosPessoaisId: number): Promise<UsuarioDetalheResponse> {
    return httpClient.post(`${GESTAO}/${dadosPessoaisId}/login/reativar`);
  }

  reenviarVerificacao(dadosPessoaisId: number): Promise<void> {
    return httpClient.post(`${GESTAO}/${dadosPessoaisId}/login/reenviar-verificacao`);
  }

  enviarRedefinicao(dadosPessoaisId: number): Promise<void> {
    return httpClient.post(`${GESTAO}/${dadosPessoaisId}/login/redefinir-senha`);
  }

  // ---------- Públicos: esqueci a senha e o link de nova senha (D48).

  esqueciSenha(dados: EsqueciSenhaRequest): Promise<void> {
    return httpClient.post("login/esqueci-minha-senha", dados);
  }

  informacaoLinkSenha(token: string): Promise<InformacaoLinkSenhaResponse> {
    return httpClient.get("login/nova-senha", { params: { token } });
  }

  definirSenha(dados: NovaSenhaRequest): Promise<void> {
    return httpClient.post("login/nova-senha", dados);
  }
}
