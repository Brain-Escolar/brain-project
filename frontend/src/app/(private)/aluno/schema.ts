import { z } from "zod";

const telefoneRegex = /^\(\d{2}\) \d{4,5}-\d{4}$/;

const telefoneItemSchema = z.object({
  value: z
    .string()
    .min(1, "Telefone é obrigatório")
    .regex(telefoneRegex, "Telefone deve estar no formato (00) 00000-0000"),
});

export const alunoSchema = z
  .object({
    nomeCompleto: z
      .string()
      .min(2, "Nome completo deve ter pelo menos 2 caracteres")
      .max(100, "Nome muito longo")
      .regex(/^[A-Za-zÀ-ÿ\s]+$/, "Nome deve conter apenas letras"),
    nomeSocial: z.string().optional(),
    email: z.string().min(1, "E-mail é obrigatório").email("E-mail inválido"),
    dataNascimento: z
      .string()
      .min(1, "Data de nascimento é obrigatória")
      .regex(/^\d{2}\/\d{2}\/\d{4}$/, "Data deve estar no formato dd/mm/aaaa"),
    genero: z.string().min(1, "Gênero é obrigatório"),
    corRaca: z.string().optional(),
    cidadeNaturalidade: z.string().optional(),
    cpf: z
      .string()
      .min(1, "CPF é obrigatório")
      .regex(/^\d{3}\.\d{3}\.\d{3}-\d{2}$/, "CPF deve estar no formato 000.000.000-00"),
    rg: z.string().min(1, "RG é obrigatório").min(7, "RG deve ter pelo menos 7 caracteres"),
    telefones: z.array(telefoneItemSchema).min(1, "Informe pelo menos um telefone"),
    cep: z
      .string()
      .min(1, "CEP é obrigatório")
      .regex(/^\d{5}-\d{3}$/, "CEP deve estar no formato 00000-000"),
    logradouro: z.string().min(1, "Logradouro é obrigatório"),
    numero: z.string().min(1, "Número é obrigatório"),
    complemento: z.string().optional(),
    bairro: z.string().min(1, "Bairro é obrigatório"),
    cidade: z.string().min(1, "Cidade é obrigatória"),
    uf: z.string().min(1, "UF é obrigatório").length(2, "UF deve ter exatamente 2 caracteres"),
    responsaveis: z.array(
      z
        .object({
          nomeResponsavel: z.string().min(1, "Nome do responsável é obrigatório"),
          cpfResponsavel: z
            .string()
            .min(1, "CPF é obrigatório")
            .regex(/^\d{3}\.\d{3}\.\d{3}-\d{2}$/, "CPF deve estar no formato 000.000.000-00"),
          dataNascimentoResponsavel: z
            .string()
            .min(1, "Data de nascimento é obrigatória")
            .regex(/^\d{2}\/\d{2}\/\d{4}$/, "Data deve estar no formato dd/mm/aaaa"),
          emailResponsavel: z
            .string()
            .min(1, "E-mail é obrigatório")
            .email("E-mail inválido"),
          telefones: z.array(telefoneItemSchema).min(1, "Informe pelo menos um telefone"),
          financeiro: z.boolean().optional(),
          mesmoEnderecoAluno: z.boolean().optional(),
          cep: z.string().optional(),
          logradouro: z.string().optional(),
          numero: z.string().optional(),
          complemento: z.string().optional(),
          bairro: z.string().optional(),
          cidade: z.string().optional(),
          uf: z.string().optional(),
        })
        .superRefine((data, ctx) => {
          if (data.mesmoEnderecoAluno) return;

          const requiredAddressFields: Array<{
            field: "cep" | "logradouro" | "numero" | "bairro" | "cidade" | "uf";
            message: string;
          }> = [
            { field: "cep", message: "CEP é obrigatório" },
            { field: "logradouro", message: "Logradouro é obrigatório" },
            { field: "numero", message: "Número é obrigatório" },
            { field: "bairro", message: "Bairro é obrigatório" },
            { field: "cidade", message: "Cidade é obrigatória" },
            { field: "uf", message: "UF é obrigatório" },
          ];

          requiredAddressFields.forEach(({ field, message }) => {
            if (!data[field] || data[field]?.trim() === "") {
              ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message,
                path: [field],
              });
            }
          });

          if (data.cep && !/^\d{5}-\d{3}$/.test(data.cep)) {
            ctx.addIssue({
              code: z.ZodIssueCode.custom,
              message: "CEP deve estar no formato 00000-000",
              path: ["cep"],
            });
          }

          if (data.uf && data.uf.length !== 2) {
            ctx.addIssue({
              code: z.ZodIssueCode.custom,
              message: "UF deve ter exatamente 2 caracteres",
              path: ["uf"],
            });
          }
        }),
    ),
  })
  .superRefine((data, ctx) => {
    const financeiroCount = (data.responsaveis ?? []).filter((r) => r.financeiro).length;
    if (data.responsaveis && data.responsaveis.length > 0 && financeiroCount === 0) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Selecione pelo menos um responsável financeiro",
        path: ["responsaveis"],
      });
    }
  });

export type AlunoFormData = z.infer<typeof alunoSchema>;

export const alunoDefaultValues: AlunoFormData = {
  nomeCompleto: "",
  nomeSocial: "",
  email: "",
  dataNascimento: "",
  genero: "",
  corRaca: "",
  cidadeNaturalidade: "",
  cpf: "",
  rg: "",
  telefones: [{ value: "" }],
  cep: "",
  logradouro: "",
  numero: "",
  complemento: "",
  bairro: "",
  cidade: "",
  uf: "",
  responsaveis: [],
};
