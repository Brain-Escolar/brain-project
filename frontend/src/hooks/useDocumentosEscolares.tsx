"use client";

import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { QUERY_KEYS } from "@/constants/queryKeys";
import { documentoEscolarApi } from "@/services/api";
import { BoletimParams } from "@/services/domains/documento-escolar";

/** Boletim do aluno para emissão. Mantém a prévia anterior enquanto troca ano/período. */
export function useBoletim(alunoId: number | null, params: BoletimParams, enabled = true) {
  return useQuery({
    queryKey: QUERY_KEYS.documentosEscolares.boletim(alunoId ?? 0, params),
    queryFn: () => documentoEscolarApi.getBoletim(alunoId!, params),
    enabled: enabled && alunoId != null,
    placeholderData: keepPreviousData,
    refetchOnWindowFocus: false,
  });
}

export function useHistorico(alunoId: number | null, enabled = true) {
  return useQuery({
    queryKey: QUERY_KEYS.documentosEscolares.historico(alunoId ?? 0),
    queryFn: () => documentoEscolarApi.getHistorico(alunoId!),
    enabled: enabled && alunoId != null,
    refetchOnWindowFocus: false,
  });
}
