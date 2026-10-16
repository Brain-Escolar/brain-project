"use client";

import { useAlunoSelecionado } from "@/contexts/AlunoSelecionadoContext";
import { usePerfilAtivo } from "@/contexts/PerfilAtivoContext";
import { UserRoleEnum } from "@/enums";

/**
 * Resolve de qual aluno uma tela compartilhada deve falar.
 *
 * Telas como /relatorios, /calendario e /materiais-complementares servem o
 * estudante (que é o próprio aluno) e o responsável (que escolheu um aluno no
 * seletor). Este hook centraliza essa decisão para os dois casos não ficarem
 * espalhados em `if (role === ...)` por toda tela.
 *
 * Cuidado que ele resolve: enquanto o responsável ainda não tem aluno
 * resolvido, `pronto` é false. Sem isso a tela dispararia a query do estudante
 * — que para um responsável devolve vazio ou erro.
 */
export function useContextoAluno() {
  const { alunoAtual, alunoId, isLoading } = useAlunoSelecionado();
  // Identidade, nao permissao: quem acumula professor + responsavel atua por um
  // aluno vinculado quando navega como responsavel.
  const { perfilAtivo } = usePerfilAtivo();
  const ehResponsavel = perfilAtivo === UserRoleEnum.RESPONSAVEL;

  return {
    ehResponsavel,
    /** alunoId quando responsável; undefined nos demais perfis (usa o token). */
    alunoId: ehResponsavel ? alunoId : undefined,
    /** turmaId do aluno em foco — usado para escopar o calendário. */
    turmaId: ehResponsavel ? (alunoAtual?.turmaId ?? undefined) : undefined,
    /** Nome do aluno em foco, para títulos. */
    nomeAluno: ehResponsavel ? (alunoAtual?.nomeSocial || alunoAtual?.nome || null) : null,
    /** false enquanto o responsável ainda não tem um aluno definido. */
    pronto: !ehResponsavel || alunoId != null,
    carregando: ehResponsavel && isLoading,
  };
}
