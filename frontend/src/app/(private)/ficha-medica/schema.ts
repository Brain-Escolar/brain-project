import { z } from "zod";

export const fichaMedicaSchema = z.object({
  dadosPessoaisId: z
    .string()
    .min(1, "Usuário é obrigatório")
    .or(z.number().min(1, "Usuário é obrigatório")),
  tipoSanguineo: z.string().optional().or(z.literal("")),
  necessidadesEspeciais: z.string().optional().or(z.literal("")),
  doencasRespiratorias: z.string().optional().or(z.literal("")),
  alergiasAlimentares: z.string().optional().or(z.literal("")),
  alergiasMedicamentosas: z.string().optional().or(z.literal("")),
  laudos: z.array(z.instanceof(File)).optional().default([]),
});

export type FichaMedicaFormData = z.infer<typeof fichaMedicaSchema>;

export const fichaMedicaDefaultValues: FichaMedicaFormData = {
  dadosPessoaisId: "",
  tipoSanguineo: "",
  necessidadesEspeciais: "",
  doencasRespiratorias: "",
  alergiasAlimentares: "",
  alergiasMedicamentosas: "",
  laudos: [],
};
