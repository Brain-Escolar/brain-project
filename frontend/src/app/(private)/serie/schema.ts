import { z } from "zod";

export const serieSchema = z.object({
  nome: z
    .string()
    .min(1, "Nome é obrigatório")
    .min(2, "Nome deve ter pelo menos 2 caracteres")
    .max(100, "Nome muito longo"),
});

export type SerieFormData = z.infer<typeof serieSchema>;

export const serieDefaultValues: SerieFormData = {
  nome: "",
};
