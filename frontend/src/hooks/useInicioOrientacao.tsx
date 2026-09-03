"use client";
import { QUERY_KEYS } from "@/constants/queryKeys";
import { orientacaoApi } from "@/services/api";
import { InicioOrientacaoResponse } from "@/services/domains/orientacao";
import { useQuery } from "@tanstack/react-query";

interface UseInicioOrientacaoReturn {
  inicio: InicioOrientacaoResponse | undefined;
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

/** Carrega indicadores, atendimentos e comunicados da tela inicial da Orientação. */
export function useInicioOrientacao(): UseInicioOrientacaoReturn {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: QUERY_KEYS.orientacao.inicio(),
    queryFn: () => orientacaoApi.getInicio(),
    staleTime: 2 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    retry: 2,
    refetchOnWindowFocus: false,
  });

  return {
    inicio: data,
    loading: isLoading,
    error: error ? "Não foi possível carregar os dados da orientação." : null,
    refetch: () => {
      refetch();
    },
  };
}
