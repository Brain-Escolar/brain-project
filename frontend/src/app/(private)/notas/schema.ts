import { z } from "zod";

export const notaSchema = z.object({
  alunoId: z.string().min(1, "Aluno é obrigatório"),
  avaliacaoId: z.string().min(1, "Avaliação é obrigatória"),
  pontuacao: z
    .string()
    .min(1, "Pontuação é obrigatória")
    .refine((val) => !isNaN(Number(val)) && Number(val) >= 0, {
      message: "Pontuação deve ser um número positivo ou zero",
    }),
  periodoReferencia: z.string().min(1, "Período de referência é obrigatório"),
});

export type NotaFormData = z.infer<typeof notaSchema>;

export const notaDefaultValues: NotaFormData = {
  alunoId: "",
  avaliacaoId: "",
  pontuacao: "",
  periodoReferencia: "",
};
