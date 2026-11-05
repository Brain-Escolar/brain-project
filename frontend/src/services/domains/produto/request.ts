import { NaturezaProduto } from "./response";

/**
 * `natureza` é obrigatória, mesmo sendo campo novo.
 *
 * É ela que diz se o item é cobrado todo mês, uma vez no ano ou avulso — e a
 * efetivação da matrícula recusa produto sem ela. Deixar opcional aqui só
 * empurraria o erro para o balcão, na hora de fechar a matrícula.
 */
export interface CadastroProdutoRequest {
  nome: string;
  descricao?: string;
  natureza: NaturezaProduto;
  /** Se bolsa pode incidir sobre este item. Omitido, não permite. */
  permiteBolsa?: boolean;
}

export interface AtualizacaoProdutoRequest {
  nome?: string;
  descricao?: string;
  ativo?: boolean;
  natureza?: NaturezaProduto;
  permiteBolsa?: boolean;
}

export interface CadastroModalidadeRequest {
  modalidade: string;
  valor?: number;
}

/**
 * Um preço da modalidade, por dimensão e vigência.
 *
 * As quatro dimensões são opcionais e nulo significa "vale para qualquer": um
 * preço sem série vale para todas. A linha mais específica vence, então a escola
 * cadastra um preço geral e só as exceções em cima dele.
 */
export interface CadastroPrecoRequest {
  anoLetivo?: number;
  unidadeId?: number;
  serieId?: number;
  turno?: string;
  valor: number;
  vigenciaInicio: string;
  vigenciaFim?: string;
  /**
   * Reajuste: encerra o preço que hoje vale para este mesmo escopo, na véspera
   * do início deste. É o caminho que a migration V100 chama de disciplina —
   * nunca editar valor no lugar.
   */
  encerrarAnterior?: boolean;
}
