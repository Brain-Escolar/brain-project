"use client";

import { useMemo } from "react";
import { usePerfilAtivo } from "@/contexts/PerfilAtivoContext";
import { UserRoleEnum } from "@/enums";

/**
 * O que o usuario logado pode fazer.
 *
 * As telas devem perguntar "o que voce pode" e nao "quem voce e". Um
 * `if (role === RESPONSAVEL)` espalhado pelo corpo de uma tela obriga quem
 * adiciona um perfil a caçar condicional em arquivo por arquivo — foi assim
 * que /calendario acabou com tres pontos de criacao de evento e nenhum deles
 * gateado.
 */
export interface Permissoes {
  /** Cria, edita e exclui eventos no calendario. Sem ela, o calendario e so leitura. */
  criarEvento: boolean;
  /**
   * So cria eventos institucionais (reuniao, feriado, outro). Provas e
   * entregas nascem do fluxo de avaliacao do professor e ficam so leitura.
   */
  soEventosInstitucionais: boolean;
  /** Publica e remove materiais complementares. */
  gerenciarMateriais: boolean;
  /** Publica comunicados para a escola. */
  criarComunicado: boolean;
  /** Atua no contexto de um aluno vinculado (mostra o seletor no AppBar). */
  atuarPorAlunoVinculado: boolean;
  /** Inclui medicacao e anexa laudo na ficha medica do aluno. */
  incluirNaFichaMedica: boolean;
  /** Edita a ficha medica inteira — visao da escola. */
  editarFichaMedica: boolean;
}

/**
 * Quem pode cada coisa. Declarado como "capacidade -> perfis", nunca como
 * "perfil -> capacidades": assim um perfil novo nasce sem permissao alguma e
 * nao quebra a compilacao de um Record exaustivo.
 */
const QUEM_PODE: Record<keyof Permissoes, UserRoleEnum[]> = {
  // ATENCAO: o ESTUDANTE esta aqui porque e o comportamento de hoje — o botao
  // "Novo evento" sempre apareceu para ele. Provavelmente e bug; tirar e so
  // remover ESTUDANTE desta linha.
  criarEvento: [
    UserRoleEnum.PROFESSOR,
    UserRoleEnum.ADMIN,
    UserRoleEnum.DIRETOR,
    UserRoleEnum.SECRETARIO,
    UserRoleEnum.ESTUDANTE,
  ],
  soEventosInstitucionais: [UserRoleEnum.SECRETARIO, UserRoleEnum.DIRETOR],
  gerenciarMateriais: [UserRoleEnum.PROFESSOR, UserRoleEnum.ADMIN],
  criarComunicado: [UserRoleEnum.SECRETARIO, UserRoleEnum.ADMIN, UserRoleEnum.DIRETOR],
  atuarPorAlunoVinculado: [UserRoleEnum.RESPONSAVEL],
  incluirNaFichaMedica: [UserRoleEnum.RESPONSAVEL],
  editarFichaMedica: [UserRoleEnum.ADMIN, UserRoleEnum.SECRETARIO],
};

const NENHUMA: Permissoes = {
  criarEvento: false,
  soEventosInstitucionais: false,
  gerenciarMateriais: false,
  criarComunicado: false,
  atuarPorAlunoVinculado: false,
  incluirNaFichaMedica: false,
  editarFichaMedica: false,
};

export function usePermissoes(): Permissoes {
  const { perfilAtivo } = usePerfilAtivo();

  return useMemo(() => {
    if (!perfilAtivo) return NENHUMA;

    // Um perfil por vez. Quem acumula troca no seletor do AppBar — somar as
    // capacidades dos dois embaralharia dois mundos na mesma tela.
    const entradas = Object.entries(QUEM_PODE) as [keyof Permissoes, UserRoleEnum[]][];
    return entradas.reduce<Permissoes>(
      (acc, [capacidade, perfis]) => ({ ...acc, [capacidade]: perfis.includes(perfilAtivo) }),
      NENHUMA,
    );
  }, [perfilAtivo]);
}
