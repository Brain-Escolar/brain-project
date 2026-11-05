import { AxiosError } from "axios";

/**
 * Mensagem que o backend mandou no erro (ApiError.message), ou o fallback.
 * Um 409 "já está cadastrado como professor" diz o que corrigir; um toast
 * genérico não.
 */
export function mensagemDoBackend(erro: unknown, fallback: string): string {
  const resposta = (erro as AxiosError<{ message?: string; erro?: string }>)?.response?.data;
  return resposta?.message ?? resposta?.erro ?? fallback;
}
