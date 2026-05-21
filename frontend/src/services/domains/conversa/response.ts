import { PerfilNomeEnum } from "@/enums/PerfilNomeEnum";

export type StatusConversa = "ABERTA" | "FECHADA";

export interface ConversaResponse {
  id: number;
  titulo: string;
  remetenteId: number;
  remetenteNome: string;
  remetentePerfilNome: string;
  destinatarioPerfilNome: string;
  status: StatusConversa;
  criadoEm: string;
  mensagensNaoLidas: number;
}

export interface ConversaCreateRequest {
  titulo: string;
  destinatarioPerfilNome: PerfilNomeEnum;
  primeiraMensagem: string;
}

export interface MensagemResponse {
  id: number;
  remetenteId: number;
  remetenteNome: string;
  conteudo: string;
  criadoEm: string;
}

export interface MensagemCreateRequest {
  conteudo: string;
}
