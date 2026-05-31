import { z } from "zod";

export const comunicadoSchema = z.object({
  titulo: z
    .string()
    .min(1, "Título é obrigatório")
    .min(3, "Título deve ter pelo menos 3 caracteres")
    .max(200, "Título muito longo"),
  conteudo: z
    .string()
    .min(1, "Conteúdo é obrigatório")
    .min(10, "Conteúdo deve ter pelo menos 10 caracteres"),
  data: z
    .string()
    .min(1, "Data é obrigatória")
    .regex(/^\d{2}\/\d{2}\/\d{4}$/, "Data deve estar no formato dd/mm/aaaa"),
  categoria: z.string().optional(),
  anexoUrl: z.string().optional(),
});

export type ComunicadoFormData = z.infer<typeof comunicadoSchema>;

export const comunicadoDefaultValues: ComunicadoFormData = {
  titulo: "",
  conteudo: "",
  data: "",
  categoria: "",
  anexoUrl: "",
};
