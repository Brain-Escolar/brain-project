import { httpClient } from "@/services/http";
import {
  AtualizacaoFunilEstagioRequest,
  CadastroFunilEstagioRequest,
  CadastroInteracaoRequest,
  CadastroLeadCrmRequest,
  ListarProcessosCrmParams,
  MarcarPerdidoRequest,
  ReatribuirRequest,
} from "./request";
import {
  CargaEquipeResponse,
  DetalhamentoProcessoCrmResponse,
  FunilEstagioResponse,
  ListagemProcessoCrmResponse,
  OrigemLeadResponse,
  RelatorioCrmResponse,
} from "./response";

const BASE_ROUTE = "crm";

export class CrmApi {
  getOrigens(): Promise<OrigemLeadResponse[]> {
    return httpClient.get(`${BASE_ROUTE}/origens`);
  }

  getEquipe(): Promise<CargaEquipeResponse[]> {
    return httpClient.get(`${BASE_ROUTE}/equipe`);
  }

  getRelatorios(anoLetivo?: number): Promise<RelatorioCrmResponse> {
    return httpClient.get(`${BASE_ROUTE}/relatorios`, { params: { anoLetivo } });
  }

  getEstagios(): Promise<FunilEstagioResponse[]> {
    return httpClient.get(`${BASE_ROUTE}/estagios`);
  }

  criarEstagio(dados: CadastroFunilEstagioRequest): Promise<FunilEstagioResponse> {
    return httpClient.post(`${BASE_ROUTE}/estagios`, dados);
  }

  atualizarEstagio(id: number, dados: AtualizacaoFunilEstagioRequest): Promise<FunilEstagioResponse> {
    return httpClient.put(`${BASE_ROUTE}/estagios/${id}`, dados);
  }

  moverEstagio(id: number, direcao: "CIMA" | "BAIXO"): Promise<void> {
    return httpClient.post(`${BASE_ROUTE}/estagios/${id}/mover`, direcao);
  }

  getProcessos(params?: ListarProcessosCrmParams): Promise<ListagemProcessoCrmResponse[]> {
    return httpClient.get(`${BASE_ROUTE}/processos`, { params });
  }

  getProcesso(id: number | string): Promise<DetalhamentoProcessoCrmResponse> {
    return httpClient.get(`${BASE_ROUTE}/processos/${id}`);
  }

  criarLead(dados: CadastroLeadCrmRequest): Promise<DetalhamentoProcessoCrmResponse> {
    return httpClient.post(`${BASE_ROUTE}/processos`, dados);
  }

  registrarInteracao(
    id: number | string,
    dados: CadastroInteracaoRequest,
  ): Promise<DetalhamentoProcessoCrmResponse> {
    return httpClient.post(`${BASE_ROUTE}/processos/${id}/interacoes`, dados);
  }

  avancarEstagio(id: number | string): Promise<DetalhamentoProcessoCrmResponse> {
    return httpClient.post(`${BASE_ROUTE}/processos/${id}/avancar-estagio`, {});
  }

  marcarPerdido(id: number | string, dados: MarcarPerdidoRequest): Promise<DetalhamentoProcessoCrmResponse> {
    return httpClient.post(`${BASE_ROUTE}/processos/${id}/perder`, dados);
  }

  marcarDesistiu(id: number | string, dados: MarcarPerdidoRequest): Promise<DetalhamentoProcessoCrmResponse> {
    return httpClient.post(`${BASE_ROUTE}/processos/${id}/desistir`, dados);
  }

  reatribuir(id: number | string, dados: ReatribuirRequest): Promise<DetalhamentoProcessoCrmResponse> {
    return httpClient.post(`${BASE_ROUTE}/processos/${id}/reatribuir`, dados);
  }

  atribuirAMim(id: number | string): Promise<DetalhamentoProcessoCrmResponse> {
    return httpClient.post(`${BASE_ROUTE}/processos/${id}/atribuir-a-mim`, {});
  }

  distribuirFila(): Promise<void> {
    return httpClient.post(`${BASE_ROUTE}/processos/distribuir`, {});
  }
}
