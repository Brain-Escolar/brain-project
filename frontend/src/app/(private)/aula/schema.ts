import { z } from "zod";

export const aulaSchema = z.object({
  disciplinaId: z.coerce.number().int().positive("Disciplina é obrigatória"),
  turmaId: z.coerce.number().int().positive("Turma é obrigatória"),
  professorId: z.coerce.number().int().positive("Professor é obrigatório"),
  diaSemana: z
    .string()
    .refine(
      (val) =>
        ["MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY", "SATURDAY", "SUNDAY"].includes(
          val,
        ),
      { message: "Dia da semana é obrigatório" },
    ),
  sala: z.string().min(1, "Sala é obrigatória").max(50, "Sala muito longa"),
  horarioId: z.coerce.number().int().positive("Horário é obrigatório"),
});

export type AulaFormData = z.infer<typeof aulaSchema>;

export const aulaDefaultValues: AulaFormData = {
  disciplinaId: 0,
  turmaId: 0,
  professorId: 0,
  diaSemana: "MONDAY",
  sala: "",
  horarioId: 0,
};
