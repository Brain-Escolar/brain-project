import { httpClient } from "@/services/http";
import { GoogleEventoRequest, GoogleEventosRequest } from "./request";

const BASE_ROUTE = "calendar/google";

export class CalendarGoogleApi {
  /**
   * Cria um ou mais eventos no Google Calendar (calendário "primary" do usuário autenticado).
   * Retorna a lista de eventos enviados.
   */
  criarEventos(eventos: GoogleEventoRequest[]): Promise<GoogleEventoRequest[]> {
    const body: GoogleEventosRequest = { eventos };
    return httpClient.post(`${BASE_ROUTE}/eventos`, body);
  }

  /**
   * Cria um novo calendário no Google Calendar do usuário autenticado.
   * Retorna o nome do calendário criado.
   */
  criarCalendario(nomeCalendario: string): Promise<string> {
    return httpClient.post(BASE_ROUTE, undefined, { params: { nomeCalendario } });
  }
}
