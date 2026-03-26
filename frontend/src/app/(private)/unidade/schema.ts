import { z } from "zod";

export const unidadeSchema = z.object({
  nome: z.string().min(2, "Nome da unidade deve ter pelo menos 2 caracteres"),
});

export type UnidadeFormData = z.infer<typeof unidadeSchema>;

export const unidadeDefaultValues: UnidadeFormData = {
  nome: "",
};
