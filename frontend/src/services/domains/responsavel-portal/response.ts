import {
  EstudanteAnotacaoResponse,
  EstudanteTarefaResponse,
  RelatorioResponse,
} from "@/services/domains/estudante";

/**
 * Aluno vinculado ao responsavel logado — item do seletor.
 *
 * "Vinculado", nao "filho": o vinculo responsavel-aluno admite avo, irmao,
 * tutor e OUTRO (ver o enum GrauParentesco no backend), entao nomear por
 * parentesco estaria errado para parte dos usuarios.
 *
 * Espelha AlunoVinculadoDto.
 */
export interface AlunoVinculadoResponse {
  id: number;
  nome: string | null;
  nomeSocial: string | null;
  matricula: string | null;
  serie: string | null;
  turma: string | null;
  unidade: string | null;
  serieId: number | null;
  turmaId: number | null;
  unidadeId: number | null;
  matriculado: boolean;
}

/** Espelha ResponsavelLogadoDto. */
export interface ResponsavelLogadoResponse {
  id: number;
  nome: string | null;
  nomeSocial: string | null;
  email: string | null;
  /** Espelha Responsavel.financeiro — decide se o modulo Financeiro aparece. */
  acessoFinanceiro: boolean;
  alunos: AlunoVinculadoResponse[];
}

/**
 * Payload unico da Home. Espelha ResumoAlunoDto.
 * Existe para evitar a cascata de requests a cada troca de aluno no seletor.
 */
export interface ResumoAlunoResponse {
  aluno: AlunoVinculadoResponse;
  relatorio: RelatorioResponse;
  proximasTarefas: EstudanteTarefaResponse[];
  ocorrenciasDaSemana: EstudanteAnotacaoResponse[];
}

/**
 * Aula na grade horaria semanal. Espelha ListagemAulaDto — que NAO e o mesmo
 * shape de EstudanteAulaResponse (aquele traz quantidadeAlunos e nao traz os
 * ids de serie/turma/disciplina).
 */
export interface AulaGradeResponse {
  id: number;
  unidade: string;
  serieId: number;
  serie: string;
  turmaId: number;
  turma: string;
  disciplinaId: number;
  disciplina: string;
  professor: string;
  diaDaSemana: string;
  sala: string;
  horarioInicio: string;
  horarioFim: string;
}

/** Espelha ListagemAlunoProdutoDto. */
export interface AlunoProdutoResponse {
  id: number;
  alunoId: number;
  alunoNome: string;
  produtoModalidadeId: number;
  produtoNome: string;
  modalidade: string;
  valorOriginal: number;
  desconto: number;
  valorPago: number;
  dataCompra: string;
  status: "ATIVO" | "CANCELADO";
}
