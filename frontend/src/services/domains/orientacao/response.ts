import { AlunoListaResponse } from "@/services/domains/aluno/response";
import { ComunicadoListResponse } from "@/services/domains/comunicado/response";
import { ConversaResponse } from "@/services/domains/conversa/response";

/** Contagens do topo da tela inicial da Orientação. */
export interface IndicadoresOrientacaoResponse {
  alunosMatriculados: number;
  alunosSemTurma: number;
  turmas: number;
  atendimentosAbertos: number;
  atendimentosNaoLidos: number;
  comunicadosRecentes: number;
}

/** Payload único de `GET /orientacao/inicio`. */
export interface InicioOrientacaoResponse {
  indicadores: IndicadoresOrientacaoResponse;
  atendimentos: ConversaResponse[];
  comunicados: ComunicadoListResponse[];
}

export type AlunoOrientacaoResponse = AlunoListaResponse;

export interface BuscaAlunosOrientacaoParams {
  termo?: string;
  unidadeId?: number;
  serieId?: number;
  turmaId?: number;
  page?: number;
  size?: number;
}
