import { z } from "zod";

const dependenteSchema = z.object({
  nomeCompleto: z
    .string()
    .min(2, "Nome completo deve ter pelo menos 2 caracteres")
    .max(100, "Nome muito longo")
    .regex(/^[A-Za-zÀ-ÿ\s]+$/, "Nome deve conter apenas letras"),
  cpf: z
    .string()
    .min(1, "CPF é obrigatório")
    .regex(/^\d{3}\.\d{3}\.\d{3}-\d{2}$/, "CPF deve estar no formato 000.000.000-00"),
  dataNascimento: z
    .string()
    .min(1, "Data de nascimento é obrigatória")
    .regex(/^\d{2}\/\d{2}\/\d{4}$/, "Data deve estar no formato dd/mm/aaaa"),
  parentesco: z.string().min(1, "Parentesco é obrigatório"),
});

export type DependenteFormData = z.infer<typeof dependenteSchema>;

export const dependenteDefaultValues: DependenteFormData = {
  nomeCompleto: "",
  cpf: "",
  dataNascimento: "",
  parentesco: "",
};

export const professorSchema = z.object({
  // Dados Pessoais
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
  corRaca: z.string().min(1, "Cor/Raça é obrigatória"),
  cidadeNaturalidade: z
    .string()
    .min(2, "Cidade de naturalidade é obrigatória")
    .regex(/^[A-Za-zÀ-ÿ\s]+$/, "Cidade deve conter apenas letras"),
  // Documentos (agrupados em Dados Pessoais)
  cpf: z
    .string()
    .min(1, "CPF é obrigatório")
    .regex(/^\d{3}\.\d{3}\.\d{3}-\d{2}$/, "CPF deve estar no formato 000.000.000-00"),
  rg: z.string().min(1, "RG é obrigatório").min(7, "RG deve ter pelo menos 7 caracteres"),
  carteiraTrabalho: z
    .string()
    .min(1, "Carteira de trabalho é obrigatória")
    .min(7, "Carteira de trabalho deve ter pelo menos 7 dígitos"),
  tituloEleitor: z.string().min(1, "Título de Eleitor é obrigatório"),
  pisPasep: z.string().min(1, "PIS/PASEP é obrigatório"),
  // Endereço
  cep: z
    .string()
    .min(1, "CEP é obrigatório")
    .regex(/^\d{5}-\d{3}$/, "CEP deve estar no formato 00000-000"),
  logradouro: z
    .string()
    .min(1, "Logradouro é obrigatório")
    .min(5, "Logradouro deve ter pelo menos 5 caracteres"),
  numero: z.string().min(1, "Número é obrigatório"),
  complemento: z.string().optional(),
  bairro: z
    .string()
    .min(1, "Bairro é obrigatório")
    .min(2, "Bairro deve ter pelo menos 2 caracteres"),
  cidade: z
    .string()
    .min(1, "Cidade é obrigatória")
    .regex(/^[A-Za-zÀ-ÿ\s]+$/, "Cidade deve conter apenas letras"),
  uf: z.string().min(1, "UF é obrigatório").length(2, "UF deve ter exatamente 2 caracteres"),
  // Contato
  telefone: z
    .string()
    .min(1, "Telefone é obrigatório")
    .regex(/^\(\d{2}\) \d{4,5}-\d{4}$/, "Telefone deve estar no formato (00) 00000-0000"),
  // Disciplinas
  disciplinaIds: z.array(z.number()).optional(),
  // Dados Bancários (opcional)
  nomeBanco: z.string().optional(),
  tipoConta: z.string().optional(),
  agencia: z.string().optional(),
  conta: z.string().optional(),
  chavePix: z.string().optional(),
  // Dependentes
  dependentes: z.array(dependenteSchema).optional(),
  // Informações Profissionais
  escolaridade: z.string().min(1, "Escolaridade é obrigatória"),
  enquadramentoHoraAula: z.string().min(1, "Enquadramento de hora aula é obrigatório"),
  exameAdmissionalRealizado: z.boolean().default(false),
  dataInicioFerias: z
    .string()
    .optional()
    .refine(
      (val) => !val || /^\d{2}\/\d{2}\/\d{4}$/.test(val),
      "Data deve estar no formato dd/mm/aaaa",
    ),
  dataFimFerias: z
    .string()
    .optional()
    .refine(
      (val) => !val || /^\d{2}\/\d{2}\/\d{4}$/.test(val),
      "Data deve estar no formato dd/mm/aaaa",
    ),
  observacoesFerias: z.string().optional(),
  // LGPD
  aceitoLgpd: z
    .boolean()
    .refine((val) => val === true, {
      message: "Você deve aceitar o termo de consentimento LGPD para continuar",
    }),
});

export type ProfessorFormData = z.infer<typeof professorSchema>;

export const professorDefaultValues: ProfessorFormData = {
  nomeCompleto: "",
  nomeSocial: "",
  email: "",
  dataNascimento: "",
  genero: "",
  corRaca: "",
  cidadeNaturalidade: "",
  cpf: "",
  rg: "",
  carteiraTrabalho: "",
  tituloEleitor: "",
  pisPasep: "",
  cep: "",
  logradouro: "",
  numero: "",
  complemento: "",
  bairro: "",
  cidade: "",
  uf: "",
  telefone: "",
  disciplinaIds: [],
  nomeBanco: "",
  tipoConta: "",
  agencia: "",
  conta: "",
  chavePix: "",
  dependentes: [],
  escolaridade: "",
  enquadramentoHoraAula: "",
  exameAdmissionalRealizado: false,
  dataInicioFerias: "",
  dataFimFerias: "",
  observacoesFerias: "",
  aceitoLgpd: false,
};
