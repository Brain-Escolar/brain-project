export interface PresencaAlunoRequest {
  alunoId: number;
  presente: boolean;
}

export interface CadastroChamadaRequest {
  aulaId: number;
  data: string; // "YYYY-MM-DD"
  presencas: PresencaAlunoRequest[];
}

export interface AtualizacaoChamadaLoteRequest {
  presencas: PresencaAlunoRequest[];
}
