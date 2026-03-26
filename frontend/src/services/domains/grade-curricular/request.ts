export interface GradeCurricularPostRequest {
  nome: string;
  versao: string;
  disciplinaIds: number[];
}

export interface GradeCurricularPutRequest extends GradeCurricularPostRequest {
  id: string;
}

export interface GradeCurricularAdicionarDisciplinasRequest {
  gradeCurricularId: number;
  disciplinaIds: number[];
}
