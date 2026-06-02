export interface CadastroConteudoRequest {
  conteudo: string;
  aulaId: number;
  data: string; // "YYYY-MM-DD"
}

export interface AtualizacaoConteudoRequest {
  conteudo: string;
}
