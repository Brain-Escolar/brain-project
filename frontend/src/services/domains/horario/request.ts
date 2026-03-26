export interface HorarioPostRequest {
  nome: string;
  horarioInicio: string;
  horarioFim: string;
}

export interface HorarioPutRequest {
  id: string;
  nome: string;
  horarioInicio: string;
  horarioFim: string;
}
