import { IBrainResult } from "@/services/commoResponse";
import { httpClient } from "@/services/http/httpClient";
import {
  ConversaCreateRequest,
  ConversaResponse,
  MensagemCreateRequest,
  MensagemResponse,
} from "./response";
import { PerfilNomeEnum } from "@/enums/PerfilNomeEnum";

const BASE = "conversas";

export class ConversaApi {
  listarComoRemetente(params?: { page?: number; size?: number }): Promise<IBrainResult<ConversaResponse>> {
    return httpClient.get(`${BASE}/remetente`, { params });
  }

  listarComoDestinatario(perfilNome: PerfilNomeEnum, params?: { page?: number; size?: number }): Promise<IBrainResult<ConversaResponse>> {
    return httpClient.get(`${BASE}/destinatario`, { params: { perfilNome, ...params } });
  }

  detalhar(id: number): Promise<ConversaResponse> {
    return httpClient.get(`${BASE}/${id}`);
  }

  criar(data: ConversaCreateRequest): Promise<ConversaResponse> {
    return httpClient.post(BASE, data);
  }

  fechar(id: number): Promise<ConversaResponse> {
    return httpClient.patch(`${BASE}/${id}/fechar`, {});
  }

  reabrir(id: number): Promise<ConversaResponse> {
    return httpClient.patch(`${BASE}/${id}/reabrir`, {});
  }

  listarMensagens(conversaId: number, params?: { page?: number; size?: number }): Promise<IBrainResult<MensagemResponse>> {
    return httpClient.get(`${BASE}/${conversaId}/mensagens`, { params });
  }

  enviarMensagem(conversaId: number, data: MensagemCreateRequest): Promise<MensagemResponse> {
    return httpClient.post(`${BASE}/${conversaId}/mensagens`, data);
  }

  marcarTodasComoLida(conversaId: number): Promise<void> {
    return httpClient.post(`${BASE}/${conversaId}/mensagens/lidas`, {});
  }

  marcarComoLida(conversaId: number, mensagemId: number): Promise<void> {
    return httpClient.post(`${BASE}/${conversaId}/mensagens/${mensagemId}/lida`, {});
  }

  contarNaoLidas(): Promise<number> {
    return httpClient.get(`${BASE}/nao-lidas/contagem`);
  }

  listarDestinatariosDisponiveis(): Promise<PerfilNomeEnum[]> {
    return httpClient.get(`${BASE}/destinatarios-disponiveis`);
  }
}
