import { TipoInteracaoCrm, TipoProcessoCrm } from "./response";

export interface CadastroLeadCrmRequest {
  /** Aluno já existente (rematrícula) — quando informado, nomeAluno/email são ignorados. */
  alunoId?: number;
  nomeAluno?: string;
  email?: string;
  serieId?: number;
  anoLetivo: number;
  tipo: TipoProcessoCrm;
  origemId: number;
  responsavelNome?: string;
  responsavelTelefone?: string;
  funcionarioId?: number;
}

export interface CadastroInteracaoRequest {
  tipo: Exclude<TipoInteracaoCrm, "SISTEMA">;
  resultado?: string;
  observacoes?: string;
  proximaAcao?: string;
  moverParaEstagioId?: number;
  subestagio?: string;
}

export interface MarcarPerdidoRequest {
  motivo: string;
}

export interface ReatribuirRequest {
  funcionarioId: number;
}

export interface CadastroFunilEstagioRequest {
  nome: string;
  ordem: number;
  slaDias?: number;
}

export interface AtualizacaoFunilEstagioRequest {
  nome?: string;
  slaDias?: number;
}

export interface ListarProcessosCrmParams {
  status?: string;
  funcionarioId?: number;
  semDono?: boolean;
  tipo?: TipoProcessoCrm;
}
