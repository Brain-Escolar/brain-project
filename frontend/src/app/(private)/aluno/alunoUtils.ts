import { AlunoFormData } from "@/app/(private)/aluno/schema";
import { AlunoPostRequest, AlunoPutRequest } from "@/services/domains/aluno/request";
import { AlunoDetalheResponse } from "@/services/domains/aluno/response";
import { convertDateStringToISO } from "../../../utils/utilsDate";
import { unmaskCEP, unmaskCPF, unmaskRG, unmaskPhone } from "../../../utils/utils";

export function mapFormDataToAlunoPostRequest(formData: AlunoFormData): AlunoPostRequest {
  return {
    cpf: unmaskCPF(formData.cpf),
    rg: unmaskRG(formData.rg),
    nome: formData.nomeCompleto,
    nomeSocial: formData.nomeSocial || "",
    email: formData.email,
    dataDeNascimento: convertDateStringToISO(formData.dataNascimento),
    endereco: {
      logradouro: formData.logradouro,
      bairro: formData.bairro,
      cep: unmaskCEP(formData.cep),
      cidade: formData.cidade,
      uf: formData.uf,
      complemento: formData.complemento || "",
      numero: formData.numero,
    },
    genero: formData.genero,
    corRaca: formData.corRaca,
    cidadeNaturalidade: formData.cidadeNaturalidade,
    telefones: [unmaskPhone(formData.telefone)],
    responsaveis:
      formData.responsaveis && formData.responsaveis.length > 0
        ? formData.responsaveis.map((responsavel) => ({
            cpf: unmaskCPF(responsavel.cpfResponsavel),
            nome: responsavel.nomeResponsavel,
            email: responsavel.emailResponsavel,
            dataDeNascimento: convertDateStringToISO(responsavel.dataNascimentoResponsavel),
            endereco: {
              logradouro: responsavel.logradouro,
              bairro: responsavel.bairro,
              cep: unmaskCEP(responsavel.cep),
              cidade: responsavel.cidade,
              uf: responsavel.uf,
              complemento: responsavel.complemento || "",
              numero: responsavel.numero,
            },
            financeiro: responsavel.financeiro ?? false,
            telefones: [unmaskPhone(responsavel.telefoneResponsavel)],
          }))
        : undefined,
  };
}

export function mapFormDataToAlunoPutRequest(formData: AlunoFormData, id: string): AlunoPutRequest {
  return {
    id,
    cpf: unmaskCPF(formData.cpf),
    rg: unmaskRG(formData.rg),
    nome: formData.nomeCompleto,
    nomeSocial: formData.nomeSocial || "",
    email: formData.email,
    dataDeNascimento: convertDateStringToISO(formData.dataNascimento),
    endereco: {
      logradouro: formData.logradouro,
      bairro: formData.bairro,
      cep: unmaskCEP(formData.cep),
      cidade: formData.cidade,
      uf: formData.uf,
      complemento: formData.complemento || "",
      numero: formData.numero,
    },
    genero: formData.genero,
    corRaca: formData.corRaca,
    cidadeNaturalidade: formData.cidadeNaturalidade,
    telefones: [unmaskPhone(formData.telefone)],
    responsaveis:
      formData.responsaveis && formData.responsaveis.length > 0
        ? formData.responsaveis.map((responsavel) => ({
            cpf: unmaskCPF(responsavel.cpfResponsavel),
            nome: responsavel.nomeResponsavel,
            email: responsavel.emailResponsavel,
            dataDeNascimento: convertDateStringToISO(responsavel.dataNascimentoResponsavel),
            endereco: {
              logradouro: responsavel.logradouro,
              bairro: responsavel.bairro,
              cep: unmaskCEP(responsavel.cep),
              cidade: responsavel.cidade,
              uf: responsavel.uf,
              complemento: responsavel.complemento || "",
              numero: responsavel.numero,
            },
            financeiro: responsavel.financeiro ?? false,
            telefones: [unmaskPhone(responsavel.telefoneResponsavel)],
          }))
        : undefined,
  };
}

/**
 * Formata o CPF para o padrão 000.000.000-00
 */
function formatCPF(cpf: string): string {
  const cleaned = cpf.replace(/\D/g, "");
  return cleaned.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, "$1.$2.$3-$4");
}

/**
 * Formata o CEP para o padrão 00000-000
 */
function formatCEP(cep: string): string {
  const cleaned = cep.replace(/\D/g, "");
  return cleaned.replace(/(\d{5})(\d{3})/, "$1-$2");
}

/**
 * Formata o telefone para o padrão (00) 00000-0000
 */
function formatPhone(phone: string): string {
  const cleaned = phone.replace(/\D/g, "");
  if (cleaned.length === 11) {
    return cleaned.replace(/(\d{2})(\d{5})(\d{4})/, "($1) $2-$3");
  } else if (cleaned.length === 10) {
    return cleaned.replace(/(\d{2})(\d{4})(\d{4})/, "($1) $2-$3");
  }
  return phone;
}

/**
 * Converte uma data ISO para o formato dd/mm/yyyy
 */
function convertISOToDateString(isoDate: string): string {
  const date = new Date(isoDate);
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = date.getFullYear();
  return `${day}/${month}/${year}`;
}

/**
 * Mapeia os dados do aluno da API para o formato do formulário
 */
export function mapAlunoResponseToFormData(aluno: AlunoDetalheResponse): AlunoFormData {
  return {
    nomeCompleto: aluno.nome || "",
    nomeSocial: aluno.nomeSocial || "",
    email: aluno.email || "",
    dataNascimento: aluno.dataDeNascimento ? convertISOToDateString(aluno.dataDeNascimento) : "",
    genero: aluno.genero || "",
    corRaca: aluno.corRaca || "",
    cidadeNaturalidade: aluno.cidadeNaturalidade || "",
    cpf: aluno.cpf ? formatCPF(aluno.cpf) : "",
    rg: aluno.rg || "",
    // Backend retorna um array de telefones, pegamos o primeiro
    telefone: aluno.telefones && aluno.telefones.length > 0 ? formatPhone(aluno.telefones[0]) : "",
    cep: aluno.endereco?.cep ? formatCEP(aluno.endereco.cep) : "",
    logradouro: aluno.endereco?.logradouro || "",
    numero: aluno.endereco?.numero || "",
    complemento: aluno.endereco?.complemento || "",
    bairro: aluno.endereco?.bairro || "",
    cidade: aluno.endereco?.cidade || "",
    uf: aluno.endereco?.uf || "",
    responsaveis: [],
  };
}
