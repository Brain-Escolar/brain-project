export type TipoAnotacao =
  | "DEVER_DE_CASA"
  | "CONVERSA"
  | "ATRASO"
  | "NAO_FEZ_ATIVIDADE"
  | "ENTREGA_DE_TRABALHO"
  | "SEM_MATERIAIS"
  | "OUTROS";

export const TIPOS_ANOTACAO: { value: TipoAnotacao; label: string }[] = [
  { value: "DEVER_DE_CASA", label: "Não entregou o dever de casa" },
  { value: "CONVERSA", label: "Conversa em sala de aula" },
  { value: "ATRASO", label: "Atraso" },
  { value: "NAO_FEZ_ATIVIDADE", label: "Não fez a atividade" },
  { value: "ENTREGA_DE_TRABALHO", label: "Não entregou o trabalho" },
  { value: "SEM_MATERIAIS", label: "Sem materiais" },
  { value: "OUTROS", label: "Outros" },
];

export interface CadastroAnotacaoRequest {
  alunoId: number;
  aulaId: number;
  tipoAnotacao: TipoAnotacao;
  data: string; // "YYYY-MM-DD"
  observacao?: string;
}

export interface CadastroAnotacaoLoteRequest {
  alunoIds: number[];
  aulaId: number;
  tipoAnotacao: TipoAnotacao;
  data: string; // "YYYY-MM-DD"
  observacao?: string;
}
