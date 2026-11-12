export type StatusContratoServico = "RASCUNHO" | "VIGENTE" | "RESCINDIDO" | "ENCERRADO";

export type StatusTitulo = "ABERTO" | "PAGO" | "CANCELADO" | "ESTORNADO" | "RENEGOCIADO";

export interface ContratoItemResponse {
  id: number;
  descricao: string;
  valorUnitario: number;
  quantidade: number;
  total: number;
  /** Se a bolsa incidiu sobre esta linha. Material normalmente não. */
  elegivelBolsa: boolean;
}

/** Uma parcela do carnê. */
export interface TituloResponse {
  id: number;
  responsavelId: number;
  numeroParcela: number;
  /**
   * Qual tentativa desta parcela é: 1 no carnê original, 2 ou mais quando a
   * parcela foi estornada ou renegociada e reemitida. Sem isso a tela mostraria
   * duas linhas da parcela 3 sem explicar a diferença.
   */
  versao: number;
  competencia: string;
  vencimento: string;
  descricao: string;
  valorBruto: number;
  /** Separado do bruto para a bolsa aparecer na linha, e não só o líquido. */
  valorDesconto: number;
  valorLiquido: number;
  status: StatusTitulo;
  /**
   * Quantos títulos o item que gerou esta cobrança produz — não quantas
   * parcelas o contrato tem. Taxa de matrícula e material são cobradas de uma
   * vez: para elas isto é 1, e a linha não deve dizer "1/12".
   */
  totalParcelas: number;
  vencido: boolean;
}

/**
 * O contrato como a secretaria vê, já com o carnê.
 *
 * `somaDosTitulos` e `carneFecha` vêm do backend de propósito: é a prova de que o
 * carnê fecha com o contrato. Se divergirem, a família foi cobrada a mais ou a
 * menos do que assinou, e é melhor descobrir na tela do que na ligação.
 */
export interface ContratoResponse {
  id: number;
  numero: string;
  matriculaId: number;
  responsavelId: number;
  qtdParcelas: number;
  diaVencimento: number;
  valorBruto: number;
  valorDesconto: number;
  valorLiquido: number;
  status: StatusContratoServico;
  dataInicio: string;
  dataFim: string;
  itens: ContratoItemResponse[];
  titulos: TituloResponse[];
  somaDosTitulos: number;
  carneFecha: boolean;
}

/**
 * O que impede este pagador de receber cobrança.
 *
 * A tela usa isto ANTES do clique de efetivar. Boleto registrado sem endereço
 * completo do pagador é recusado pelo banco, e o erro volta em lote dias depois
 * da emissão — quando a escola já contava com aquele dinheiro.
 */
export interface PendenciaDoPagadorResponse {
  responsavelId: number | null;
  nome: string | null;
  /** Quanto deste contrato é pago por ele. */
  percentualRateio: number | null;
  /** Campos faltando, com o nome que aparece na tela. Vazio = pronto. */
  faltando: string[];
}
