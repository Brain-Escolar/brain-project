import { z } from "zod";

// Regex para validar formato HH:mm
const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;

export const horarioSchema = z
  .object({
    nome: z
      .string()
      .min(1, "Nome é obrigatório")
      .min(2, "Nome deve ter pelo menos 2 caracteres")
      .max(100, "Nome muito longo"),
    horarioInicio: z
      .string()
      .min(1, "Horário de início é obrigatório")
      .regex(timeRegex, "Formato inválido. Use HH:mm (ex: 08:00)"),
    horarioFim: z
      .string()
      .min(1, "Horário de fim é obrigatório")
      .regex(timeRegex, "Formato inválido. Use HH:mm (ex: 09:00)"),
  })
  .refine(
    (data) => {
      if (!data.horarioInicio || !data.horarioFim) return true;
      const [inicioHora, inicioMin] = data.horarioInicio.split(":").map(Number);
      const [fimHora, fimMin] = data.horarioFim.split(":").map(Number);
      const inicioMinutos = inicioHora * 60 + inicioMin;
      const fimMinutos = fimHora * 60 + fimMin;
      return fimMinutos > inicioMinutos;
    },
    {
      message: "Horário de fim deve ser maior que horário de início",
      path: ["horarioFim"],
    },
  );

export type HorarioFormData = z.infer<typeof horarioSchema>;

export const horarioDefaultValues: HorarioFormData = {
  nome: "",
  horarioInicio: "",
  horarioFim: "",
};
