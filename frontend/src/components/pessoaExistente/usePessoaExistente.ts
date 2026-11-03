"use client";

import { QUERY_KEYS } from "@/constants/queryKeys";
import { dadosPessoaisApi } from "@/services/api";
import { PessoaExistenteResponse, TipoVinculo } from "@/services/domains/dados-pessoais";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useRef } from "react";
import { FieldValues, Path, PathValue, UseFormGetValues, UseFormSetValue } from "react-hook-form";

interface Opcoes {
  /** false na edição: lá a pessoa já é ela mesma. */
  enabled?: boolean;
  /** Chamado uma vez por pessoa achada, para o formulário se preencher. */
  onEncontrada?: (pessoa: PessoaExistenteResponse) => void;
  /**
   * Responsável de dois filhos: já ter o papel não é conflito, é o mesmo
   * cadastro ganhando mais um aluno.
   */
  papelAcumula?: boolean;
}

/**
 * Uma pessoa tem um só cadastro, seja qual for o papel: o professor que
 * também é responsável é a mesma linha em dados_pessoais. Este hook consulta
 * o CPF assim que ele está completo e diz se a pessoa já existe — e se já tem
 * justamente o papel que está sendo cadastrado (conflito: não dá pra salvar).
 */
export function usePessoaExistente(
  cpf: string | undefined,
  papel: TipoVinculo,
  opcoes: Opcoes = {},
) {
  const { enabled = true, onEncontrada, papelAcumula = false } = opcoes;
  const cpfLimpo = (cpf ?? "").replace(/\D/g, "");
  const completo = cpfLimpo.length === 11;

  const { data: pessoa, isFetching } = useQuery({
    queryKey: QUERY_KEYS.dadosPessoais.existente(cpfLimpo),
    queryFn: () => dadosPessoaisApi.buscarExistente(cpfLimpo),
    enabled: enabled && completo,
    staleTime: 60_000,
  });

  const encontrada = enabled && completo ? (pessoa ?? null) : null;
  const vinculoNoPapel = encontrada?.vinculos.find((v) => v.tipo === papel) ?? null;
  const conflito = vinculoNoPapel !== null && !papelAcumula;

  // Ref para não depender da identidade do callback (a página recria a cada render).
  const onEncontradaRef = useRef(onEncontrada);
  onEncontradaRef.current = onEncontrada;
  const ultimaPreenchida = useRef<number | null>(null);

  useEffect(() => {
    if (!encontrada || conflito || ultimaPreenchida.current === encontrada.id) return;
    ultimaPreenchida.current = encontrada.id;
    onEncontradaRef.current?.(encontrada);
  }, [encontrada, conflito]);

  return {
    pessoa: encontrada,
    papel,
    vinculoNoPapel,
    /** Já tem este papel: o backend vai recusar, então o formulário bloqueia antes. */
    conflito,
    buscando: isFetching,
  };
}

export type PessoaExistenteEstado = ReturnType<typeof usePessoaExistente>;

// ─── Conversão para os campos (mascarados) dos formulários ───────────────────

function mascararCPF(cpf: string) {
  return cpf.replace(/\D/g, "").replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, "$1.$2.$3-$4");
}

function mascararCEP(cep: string) {
  return cep.replace(/\D/g, "").replace(/(\d{5})(\d{3})/, "$1-$2");
}

function mascararTelefone(telefone: string) {
  const digitos = telefone.replace(/\D/g, "");
  return digitos.length <= 10
    ? digitos.replace(/(\d{2})(\d{4})(\d{4})/, "($1) $2-$3")
    : digitos.replace(/(\d{2})(\d{5})(\d{4})/, "($1) $2-$3");
}

/** "1980-01-31" -> "31/01/1980", sem passar por Date (fuso deslocaria o dia). */
function isoParaBR(iso: string) {
  const [ano, mes, dia] = iso.slice(0, 10).split("-");
  return `${dia}/${mes}/${ano}`;
}

/** Valores da pessoa achada já no formato dos campos BrainForms. */
export function pessoaParaCampos(pessoa: PessoaExistenteResponse) {
  return {
    nome: pessoa.nome ?? "",
    nomeSocial: pessoa.nomeSocial ?? "",
    email: pessoa.email ?? "",
    cpf: pessoa.cpf ? mascararCPF(pessoa.cpf) : "",
    rg: pessoa.rg ?? "",
    dataNascimento: pessoa.dataDeNascimento ? isoParaBR(pessoa.dataDeNascimento) : "",
    genero: pessoa.genero ?? "",
    corRaca: pessoa.corRaca ?? "",
    cidadeNaturalidade: pessoa.cidadeNaturalidade ?? "",
    carteiraTrabalho: pessoa.carteiraDeTrabalho ?? "",
    cep: pessoa.endereco?.cep ? mascararCEP(pessoa.endereco.cep) : "",
    logradouro: pessoa.endereco?.logradouro ?? "",
    numero: pessoa.endereco?.numero ?? "",
    complemento: pessoa.endereco?.complemento ?? "",
    bairro: pessoa.endereco?.bairro ?? "",
    cidade: pessoa.endereco?.cidade ?? "",
    uf: pessoa.endereco?.uf ?? "",
    telefones: pessoa.telefones.map(mascararTelefone),
  };
}

/** Campos com os nomes usados nos formulários de funcionário (professor, secretário). */
export function camposDeFuncionario(pessoa: PessoaExistenteResponse) {
  const c = pessoaParaCampos(pessoa);
  return {
    nomeCompleto: c.nome,
    nomeSocial: c.nomeSocial,
    email: c.email,
    dataNascimento: c.dataNascimento,
    genero: c.genero,
    corRaca: c.corRaca,
    cidadeNaturalidade: c.cidadeNaturalidade,
    rg: c.rg,
    carteiraTrabalho: c.carteiraTrabalho,
    cep: c.cep,
    logradouro: c.logradouro,
    numero: c.numero,
    complemento: c.complemento,
    bairro: c.bairro,
    cidade: c.cidade,
    uf: c.uf,
    telefone: c.telefones[0] ?? "",
  };
}

/**
 * Preenche só os campos vazios: se quem cadastra já digitou algo, prevalece.
 * (O backend também só completa o que falta no cadastro existente.)
 */
export function preencherVazios<T extends FieldValues>(
  campos: Partial<Record<Path<T>, string>>,
  getValues: UseFormGetValues<T>,
  setValue: UseFormSetValue<T>,
) {
  (Object.entries(campos) as [Path<T>, string | undefined][]).forEach(([campo, valor]) => {
    if (valor && !getValues(campo)) {
      setValue(campo, valor as PathValue<T, Path<T>>, { shouldValidate: true });
    }
  });
}
