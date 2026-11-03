import { httpClient } from "@/services/http";
import { PessoaExistenteResponse } from "./response";

const BASE_ROUTE = "dados-pessoais";

export class DadosPessoaisApi {
  /** A pessoa, ou null (204) quando ninguém tem esse CPF. */
  async buscarExistente(cpf: string): Promise<PessoaExistenteResponse | null> {
    const pessoa = await httpClient.get<PessoaExistenteResponse | "">(`${BASE_ROUTE}/existente`, {
      params: { cpf },
    });
    return pessoa || null;
  }
}
