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

/**
 * Medicacao em uso, declarada pelo responsavel. Espelha ListagemMedicacaoDto.
 *
 * `dosagem`, `horario` e `observacao` sao opcionais de proposito: o
 * CadastroMedicacaoDto so exige o nome, porque a familia nem sempre sabe a
 * dosagem exata na hora do cadastro e exigir o campo levaria a dado inventado
 * numa ficha de saude.
 */
export interface MedicacaoResponse {
  id: number;
  nome: string;
  dosagem: string | null;
  horario: string | null;
  observacao: string | null;
  /** Instant do backend — ISO-8601 com timezone. */
  registradaEm: string;
}

/** Laudo anexado a ficha. Espelha ListagemArquivoDto. */
export interface LaudoResponse {
  id: number;
  nome: string;
  contentType: string;
  tamanho: number;
  downloadUrl: string;
}

/**
 * Ficha medica como o portal a entrega. Espelha DetalhamentoFichaMedicaDto.
 *
 * NAO e o mesmo shape de FichaMedicaAlunoResponse (`domains/aluno`), que e
 * anterior a inclusao de `dataDeNascimento`, `laudos` e `medicacoes`.
 */
export interface FichaMedicaPortalResponse {
  id: number;
  nome: string | null;
  /** LocalDate — "yyyy-MM-dd". Null quando o cadastro nao tem nascimento. */
  dataDeNascimento: string | null;
  tipoSanguineo: string | null;
  necessidadesEspeciais: string | null;
  doencasRespiratorias: string | null;
  alergiasAlimentares: string | null;
  alergiasMedicamentosas: string | null;
  laudos: LaudoResponse[];
  medicacoes: MedicacaoResponse[];
}
