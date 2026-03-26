import { z } from "zod";

export const disciplinaSchema = z.object({
  serieId: z.string().min(1, "Série é obrigatória"),
  nome: z
    .string()
    .min(1, "Nome é obrigatório")
    .min(2, "Nome deve ter pelo menos 2 caracteres")
    .max(100, "Nome muito longo"),
  cargaHoraria: z
    .string()
    .min(1, "Carga horária é obrigatória")
    .refine((val) => !isNaN(Number(val)) && Number(val) > 0, {
      message: "Carga horária deve ser um número positivo",
    }),
  grupoId: z.string().min(1, "Grupo é obrigatório"),
});

export type DisciplinaFormData = z.infer<typeof disciplinaSchema>;

export const disciplinaDefaultValues: DisciplinaFormData = {
  serieId: "",
  nome: "",
  cargaHoraria: "",
  grupoId: "",
};
