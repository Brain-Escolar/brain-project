import { z } from "zod";

export const avaliacaoSchema = z.object({
  nome: z.string().trim().min(1, "Nome é obrigatório"),
  disciplinaId: z.string().min(1, "Disciplina é obrigatória"),
  tipo: z.enum(["PROVA", "TRABALHO", "LISTA", "SEMINARIO"]),
  notaMaxima: z.string().min(1, "Nota máxima é obrigatória"),
  conteudo: z.string().optional(),
  notaExtra: z.boolean(),
  turmaIds: z.array(z.number()).min(1, "Selecione ao menos uma turma"),
  datas: z.record(
    z.string(),
    z.object({
      dataAplicacao: z.date().nullable().optional(),
      dataEntregaNotas: z.date().nullable().optional(),
    }),
  ),
});

export type AvaliacaoFormData = z.infer<typeof avaliacaoSchema>;

export const avaliacaoDefaultValues: AvaliacaoFormData = {
  nome: "",
  disciplinaId: "",
  tipo: "PROVA",
  notaMaxima: "10",
  conteudo: "",
  notaExtra: false,
  turmaIds: [],
  datas: {},
};
