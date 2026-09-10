"use client";

import { useQuery } from "@tanstack/react-query";
import { QUERY_KEYS } from "@/constants/queryKeys";
import { responsavelPortalApi } from "@/services/api";
import { useAlunoSelecionado } from "@/contexts/AlunoSelecionadoContext";
import { FichaMedicaPortalResponse } from "@/services/domains/responsavel-portal";

/**
 * Ficha medica do aluno vinculado, na visao do responsavel.
 *
 * 404 vira `null`, nao erro: `buscarPorAluno` no backend so encontra a ficha se
 * ela ja tiver sido criada, e um aluno sem nenhum dado de saude cadastrado nao
 * tem linha nenhuma. Isso e ficha vazia, nao falha — tanto que `incluirMedicacao`
 * e `anexarLaudo` chamam `recuperarOuCriarPorAluno` e criam a ficha na primeira
 * escrita. Tratar o 404 como erro esconderia justamente as duas acoes que
 * resolvem o caso. Mesmo padrao de useDiarioDaAula.
 */
export function useFichaMedicaAluno() {
  const { alunoId } = useAlunoSelecionado();

  const {
    data: ficha,
    isLoading,
    error,
  } = useQuery<FichaMedicaPortalResponse | null>({
    queryKey: QUERY_KEYS.responsavel.fichaMedica(alunoId ?? 0),
    queryFn: () =>
      responsavelPortalApi.getFichaMedica(alunoId as number).catch((err) => {
        if (err?.status === 404 || err?.response?.status === 404) return null;
        throw err;
      }),
    enabled: alunoId !== null,
    retry: false,
    refetchOnWindowFocus: false,
  });

  return {
    /** `null` = aluno ainda sem ficha criada. `undefined` = ainda carregando. */
    ficha,
    loading: isLoading,
    error: error ? "Erro ao carregar a ficha médica. Tente novamente." : null,
  };
}
