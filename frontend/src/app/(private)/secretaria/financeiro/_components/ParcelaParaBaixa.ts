/**
 * O mínimo que os diálogos de baixa e estorno precisam saber de uma parcela.
 *
 * Tipo próprio, e não TituloResponse, porque as duas origens da baixa carregam
 * coisas diferentes: a linha da inadimplência sabe o nome do aluno e não sabe a
 * versão da parcela; o carnê sabe a versão e não repete o nome em cada linha.
 * Pedir o tipo inteiro obrigaria uma das duas a inventar campo.
 */
export interface ParcelaParaBaixa {
  tituloId: number;
  numeroParcela: number;
  vencimento: string;
  valorLiquido: number;
  alunoNome?: string | null;
  contratoNumero?: string | null;
}
