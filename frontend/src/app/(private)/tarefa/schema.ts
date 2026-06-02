import { z } from "zod";

export const tarefaSchema = z.object({
  conteudo: z
    .string()
    .min(1, "Descrição é obrigatória")
    .min(3, "Descrição deve ter pelo menos 3 caracteres")
    .max(500, "Descrição muito longa"),
  prazo: z
    .string()
    .min(1, "Prazo é obrigatório")
    .regex(/^\d{2}\/\d{2}\/\d{4}$/, "Data deve estar no formato dd/mm/aaaa"),
});

export type TarefaFormData = z.infer<typeof tarefaSchema>;

export const tarefaDefaultValues: TarefaFormData = {
  conteudo: "",
  prazo: "",
};
