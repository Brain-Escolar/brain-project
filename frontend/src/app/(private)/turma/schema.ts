import { z } from "zod";

export const turmaSchema = z.object({
  nome: z
    .string()
    .min(1, "Nome é obrigatório")
    .min(2, "Nome deve ter pelo menos 2 caracteres")
    .max(100, "Nome muito longo"),
  anoLetivo: z.string().min(1, "Ano letivo é obrigatório"),
  serieId: z.string().min(1, "Série é obrigatória"),
  turno: z.string().min(1, "Turno é obrigatório"),
  unidadeId: z.string().min(1, "Unidade é obrigatória"),
  salaFisica: z.string().optional(),
  vagasTotais: z
    .string()
    .min(1, "Vagas totais é obrigatório")
    .regex(/^\d+$/, "Informe um número válido"),
  gradeCurricularId: z.string().min(1, "Grade curricular é obrigatória"),
});

export type TurmaFormData = z.infer<typeof turmaSchema>;

export const turmaDefaultValues: TurmaFormData = {
  nome: "",
  anoLetivo: "",
  serieId: "",
  turno: "",
  unidadeId: "",
  salaFisica: "",
  vagasTotais: "",
  gradeCurricularId: "",
};
