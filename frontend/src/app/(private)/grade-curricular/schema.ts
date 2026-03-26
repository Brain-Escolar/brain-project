import { z } from "zod";

export const gradeCurricularSchema = z.object({
  nome: z
    .string()
    .min(1, "Nome é obrigatório")
    .min(2, "Nome deve ter pelo menos 2 caracteres")
    .max(100, "Nome muito longo"),
  versao: z
    .string()
    .min(1, "Versão é obrigatória")
    .max(20, "Versão muito longa"),
  disciplinaIds: z
    .array(z.number())
    .min(1, "Selecione pelo menos uma disciplina"),
});

export type GradeCurricularFormData = z.infer<typeof gradeCurricularSchema>;

export const gradeCurricularDefaultValues: GradeCurricularFormData = {
  nome: "",
  versao: "",
  disciplinaIds: [],
};
