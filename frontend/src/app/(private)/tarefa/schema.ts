import { z } from "zod";

export const tarefaSchema = z.object({
  titulo: z
    .string()
    .min(1, "Título é obrigatório")
    .min(3, "Título deve ter pelo menos 3 caracteres")
    .max(200, "Título muito longo"),
  conteudo: z.string().optional(),
  documentoUrl: z.string().url("URL inválida").optional().or(z.literal("")),
  prazo: z
    .string()
    .min(1, "Prazo é obrigatório")
    .regex(/^\d{2}\/\d{2}\/\d{4}$/, "Data deve estar no formato dd/mm/aaaa"),
});

export type TarefaFormData = z.infer<typeof tarefaSchema>;

export const tarefaDefaultValues: TarefaFormData = {
  titulo: "",
  conteudo: "",
  documentoUrl: "",
  prazo: "",
};
