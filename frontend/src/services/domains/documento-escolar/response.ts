import { RelatorioResponse, RelatorioSituacao } from "@/services/domains/estudante/response";

export type TipoDocumentoEscolar = "boletim" | "historico";

export interface EscolaDocumentoResponse {
  nome: string | null;
  cnpj: string | null;
  unidade: string | null;
}

export interface AlunoDocumentoResponse {
  id: number;
  nome: string;
  matricula: string | null;
  /** yyyy-MM-dd */
  dataNascimento: string | null;
  cpf: string | null;
  naturalidade: string | null;
  serie: string | null;
  turma: string | null;
  unidade: string | null;
  matriculado: boolean;
  dataDesmatricula: string | null;
  motivoDesmatricula: string | null;
}

export interface BoletimResponse {
  escola: EscolaDocumentoResponse;
  aluno: AlunoDocumentoResponse;
  /** Anos em que o aluno teve turma, do mais recente ao mais antigo. */
  anosDisponiveis: number[];
  anoLetivo: number;
  periodoAte: number | null;
  ultimoPeriodoIniciado: number | null;
  turno: string | null;
  /** Nulo quando o aluno não tem turma no ano pedido. */
  relatorio: RelatorioResponse | null;
  emitidoPor: string | null;
  emitidoEm: string;
}

export interface AnoHistoricoResponse {
  anoLetivo: number;
  serie: string;
  turma: string;
  unidade: string | null;
  emCurso: boolean;
  cargaHoraria: number;
  frequencia: number | null;
  situacao: RelatorioSituacao;
}

export interface NotaAnoHistoricoResponse {
  anoLetivo: number;
  nota: number | null;
  cargaHoraria: number | null;
}

export interface ComponenteHistoricoResponse {
  area: string;
  nome: string;
  /** Mesma ordem de `HistoricoResponse.anos`. */
  anos: NotaAnoHistoricoResponse[];
}

export interface HistoricoResponse {
  escola: EscolaDocumentoResponse;
  aluno: AlunoDocumentoResponse;
  notaAprovacao: number | null;
  frequenciaMinima: number | null;
  casasDecimais: number | null;
  anos: AnoHistoricoResponse[];
  componentes: ComponenteHistoricoResponse[];
  emitidoPor: string | null;
  emitidoEm: string;
}
