import {
  EstudanteAnotacaoResponse,
  EstudanteTarefaResponse,
  RelatorioResponse,
} from "@/services/domains/estudante";
import { ArquivoResponse } from "@/services/domains/aluno/response";
import { StatusTitulo } from "@/services/domains/contrato";
import { FormaPagamento } from "@/services/domains/financeiro";

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
 * Medicacao em uso. Espelha ListagemMedicacaoDto — o mesmo registro que a
 * Orientacao consulta e complementa com receita, tipo de uso e periodo.
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
  /** Preenchidos pela Orientacao; nulos no que a familia acabou de incluir. */
  tipoUso: string | null;
  tipoUsoDescricao: string | null;
  dataInicio: string | null;
  dataFim: string | null;
  receita: ArquivoResponse | null;
}

/**
 * Laudo anexado a ficha. Espelha LaudoMedicoDto: o arquivo vem aninhado, e
 * tipo/observacao sao da Orientacao (o que a familia envia entra como OUTRO).
 */
export interface LaudoResponse {
  id: number;
  tipo: string | null;
  tipoDescricao: string | null;
  observacao: string | null;
  arquivo: ArquivoResponse | null;
}

/**
 * Ficha medica como o portal a entrega. Espelha DetalhamentoFichaMedicaDto —
 * o mesmo DTO que a ficha da Orientacao consome como FichaMedicaAlunoResponse
 * (`domains/aluno`); aqui os nulos ficam explicitos.
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

// ---------------------------------------------------------------- financeiro

export type SituacaoParcela =
  | "PAGA"
  | "A_VENCER"
  | "VENCE_HOJE"
  | "EM_ATRASO"
  | "CANCELADA"
  | "SUBSTITUIDA"
  | "ESTORNADA";

/**
 * Uma linha do carnê como a família vê.
 *
 * Bruto, desconto e líquido vêm os três, e é o ponto todo: a família vê
 * "mensalidade 1.350, bolsa −270, a pagar 1.080". Só o líquido esconderia a
 * bolsa de quem a recebeu.
 *
 * `situacao` é separada de `status` porque respondem perguntas diferentes:
 * status diz o que aconteceu com o registro, situação diz se precisa pagar e
 * quando. Um título ABERTO pode estar a vencer, vencendo hoje ou em atraso — e
 * quem decide é o calendário, não o status.
 */
export interface ParcelaPortalResponse {
  id: number;
  alunoId: number;
  alunoNome: string | null;
  contratoNumero: string;
  numeroParcela: number;
  totalParcelas: number;
  competencia: string;
  vencimento: string;
  descricao: string;
  valorBruto: number;
  valorDesconto: number;
  valorLiquido: number;
  status: StatusTitulo;
  situacao: SituacaoParcela;
  /** Zero ou negativo quando ainda não venceu. */
  diasDeAtraso: number;
  pagaEm: string | null;
  formaPagamento: FormaPagamento | null;
}

/**
 * O extrato do responsável: o que ele deve, o que já pagou e o que vem.
 *
 * Os totais ignoram parcelas canceladas, substituídas e estornadas — essas
 * continuam na lista, porque a família tem direito ao histórico, mas somar a
 * versão antiga e a nova da mesma parcela diria que ela deve o dobro.
 */
export interface CarneResponsavelResponse {
  anoLetivo: number | null;
  totalContratado: number;
  totalPago: number;
  totalAberto: number;
  totalEmAtraso: number;
  /** Quanto a bolsa abateu no período. É o número que a família nunca viu. */
  totalDeBolsa: number;
  proximoVencimento: string | null;
  valorDoProximoVencimento: number;
  parcelasEmAtraso: number;
  parcelas: ParcelaPortalResponse[];
}
