export type TipoProcessoCrm = "NOVA" | "REMATRICULA";
export type StatusProcessoCrm = "ATIVO" | "MATRICULADO" | "PERDIDO" | "DESISTIU";
export type TipoInteracaoCrm = "LIGACAO" | "WHATSAPP" | "EMAIL" | "ANOTACAO" | "SISTEMA";

export interface OrigemLeadResponse {
  id: number;
  nome: string;
}

export interface FunilEstagioResponse {
  id: number;
  nome: string;
  ordem: number;
  slaDias?: number;
}

export interface CargaEquipeResponse {
  funcionarioId: number;
  nome: string;
  quantidadeAtiva: number;
}

export interface ListagemProcessoCrmResponse {
  id: number;
  alunoId: number;
  alunoNome: string;
  serieNome: string;
  tipo: TipoProcessoCrm;
  status: StatusProcessoCrm;
  origemNome: string;
  estagioId: number;
  estagioNome: string;
  subestagio?: string;
  funcionarioId?: number;
  funcionarioNome?: string;
  responsavelNome?: string;
  responsavelTelefone?: string;
  criadoEm: string;
  diasNoEstagio: number;
  proximaAcao?: string;
}

export interface StepFunilResponse {
  estagioId: number;
  nome: string;
  ordem: number;
  concluido: boolean;
  atual: boolean;
  dataEntrada?: string;
}

export interface ListagemInteracaoResponse {
  id: number;
  tipo: TipoInteracaoCrm;
  resultado?: string;
  observacoes?: string;
  autorNome: string;
  criadoEm: string;
  proximaAcao?: string;
}

export interface DetalhamentoProcessoCrmResponse {
  id: number;
  alunoId: number;
  alunoNome: string;
  alunoEmail: string;
  serieNome: string;
  tipo: TipoProcessoCrm;
  status: StatusProcessoCrm;
  origemNome: string;
  estagioAtualId: number;
  estagioAtualNome: string;
  subestagio?: string;
  anoLetivo: number;
  funcionarioId?: number;
  funcionarioNome?: string;
  funcionarioDesde?: string;
  responsavelNome?: string;
  responsavelTelefone?: string;
  motivoPerda?: string;
  criadoEm: string;
  dataConclusao?: string;
  steps: StepFunilResponse[];
  interacoes: ListagemInteracaoResponse[];
  proximaAcao?: string;
}

export interface RelatorioCrmResponse {
  totalLeads: number;
  totalMatriculados: number;
  totalPerdidos: number;
  conversaoPercentual: number;
  tempoMedioAteMatriculaDias?: number;
  tempoMedioAte1ContatoDias?: number;
  funil: { estagioNome: string; quantidade: number; tempoMedioDias?: number }[];
  origens: { origemNome: string; quantidade: number; conversaoPercentual: number }[];
  motivosPerda: { motivo: string; quantidade: number; percentual: number }[];
}
