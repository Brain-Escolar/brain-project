import { SecretarioFormData } from "@/app/(private)/secretario/schema";
import { SecretarioPostRequest } from "@/services/domains/secretario/request";
import { convertDateStringToISO } from "../../../utils/utilsDate";
import { unmaskCEP, unmaskCPF, unmaskPhone, unmaskRG } from "../../../utils/utils";

export function mapFormDataToSecretarioPostRequest(
  formData: SecretarioFormData,
): SecretarioPostRequest {
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
    telefones: formData.telefone ? [unmaskPhone(formData.telefone)] : [],
    genero: formData.genero,
    corRaca: formData.corRaca,
    cidadeNaturalidade: formData.cidadeNaturalidade,
    carteiraDeTrabalho: formData.carteiraTrabalho,
  };
}
