import { z } from "zod";

export const avaliacaoSchema = z.object({
  nome: z
    .string()
    .min(1, "Nome é obrigatório")
    .min(2, "Nome deve ter pelo menos 2 caracteres")
    .max(100, "Nome muito longo"),
  disciplinaId: z.string().min(1, "Disciplina é obrigatória"),
  peso: z
    .string()
    .min(1, "Peso é obrigatório")
    .refine((val) => !isNaN(Number(val)) && Number(val) > 0, {
      message: "Peso deve ser um número positivo",
    }),
  conteudo: z
    .string()
    .min(1, "Conteúdo é obrigatório")
    .min(5, "Conteúdo deve ter pelo menos 5 caracteres"),
  notaExtra: z.boolean().default(false),
});

export type AvaliacaoFormData = z.infer<typeof avaliacaoSchema>;

export const avaliacaoDefaultValues: AvaliacaoFormData = {
  nome: "",
  disciplinaId: "",
  peso: "",
  conteudo: "",
  notaExtra: false,
};
