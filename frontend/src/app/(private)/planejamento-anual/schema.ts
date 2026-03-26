import { z } from "zod";

export const planejamentoAnualSchema = z.object({
  ano: z
    .coerce.number()
    .int("Ano deve ser um número inteiro")
    .min(2000, "Ano deve ser maior ou igual a 2000")
    .max(2100, "Ano deve ser menor ou igual a 2100"),
  planejamento: z
    .instanceof(File, { message: "Arquivo é obrigatório" })
    .refine((file) => file.size > 0, "Arquivo é obrigatório")
    .refine(
      (file) =>
        file.type ===
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" ||
        file.type === "application/vnd.ms-excel",
      "O arquivo deve ser do tipo Excel (.xls ou .xlsx)",
    ),
});

export type PlanejamentoAnualFormData = z.infer<typeof planejamentoAnualSchema>;

export const planejamentoAnualDefaultValues: Partial<PlanejamentoAnualFormData> = {
  ano: new Date().getFullYear(),
};
