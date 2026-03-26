import { z } from "zod";

export const grupoDisciplinaSchema = z.object({
  nome: z
    .string()
    .min(1, "Nome é obrigatório")
    .min(2, "Nome deve ter pelo menos 2 caracteres")
    .max(100, "Nome muito longo"),
  area: z.string().min(1, "Área é obrigatória").min(2, "Área deve ter pelo menos 2 caracteres"),
});

export type GrupoDisciplinaFormData = z.infer<typeof grupoDisciplinaSchema>;

export const grupoDisciplinaDefaultValues: GrupoDisciplinaFormData = {
  nome: "",
  area: "",
};
