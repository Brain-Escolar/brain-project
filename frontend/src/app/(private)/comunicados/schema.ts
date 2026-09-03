import { z } from "zod";

const destinatarioSchema = z
  .object({
    publico: z.enum(["ALUNOS", "RESPONSAVEIS", "PROFESSORES", "TODOS"]),
    abrangencia: z.enum(["GERAL", "TURMA", "SEGMENTO"]),
    turmaId: z.string().optional(),
    serieId: z.string().optional(),
  })
  .refine((valor) => valor.abrangencia !== "TURMA" || !!valor.turmaId, {
    message: "Selecione a turma",
    path: ["turmaId"],
  })
  .refine((valor) => valor.abrangencia !== "SEGMENTO" || !!valor.serieId, {
    message: "Selecione o segmento",
    path: ["serieId"],
  });

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
  destinatarios: z
    .array(destinatarioSchema)
    .min(1, "Defina ao menos um público destinatário"),
});

export type ComunicadoFormData = z.infer<typeof comunicadoSchema>;
export type DestinatarioFormData = z.infer<typeof destinatarioSchema>;

export const destinatarioDefaultValue: DestinatarioFormData = {
  publico: "TODOS",
  abrangencia: "GERAL",
  turmaId: "",
  serieId: "",
};

export const comunicadoDefaultValues: ComunicadoFormData = {
  titulo: "",
  conteudo: "",
  data: "",
  categoria: "",
  destinatarios: [destinatarioDefaultValue],
};
