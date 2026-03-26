export interface GradeCurricularDisciplinaResponse {
  id: number;
  nome: string;
  cargaHorariaSemanal: number;
  obrigatoria: boolean;
}

export interface GradeCurricularListaResponse {
  id: number;
  nome: string;
  versao: string;
  ativo: boolean;
  cargaHorariaTotal: number;
  quantidadeDisciplinas: number;
}

export interface GradeCurricularDetalheResponse {
  id: number;
  nome: string;
  versao: string;
  ativo: boolean;
  disciplinas: GradeCurricularDisciplinaResponse[];
}
