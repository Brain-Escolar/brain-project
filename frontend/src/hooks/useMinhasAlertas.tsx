"use client";

import { QUERY_KEYS } from "@/constants/queryKeys";
import { alertaApi } from "@/services/api";
import { AlertaUsuarioResponse } from "@/services/domains/alerta";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

interface UseMinhasAlertasReturn {
  alertas: AlertaUsuarioResponse[];
  loading: boolean;
  unreadCount: number;
  marcarComoLido: (id: number) => void;
  marcarTodosComoLido: () => void;
}

export function useMinhasAlertas(): UseMinhasAlertasReturn {
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: QUERY_KEYS.alertas.meus(),
    queryFn: async () => {
      const response = await alertaApi.listarMeusAlertas();
      return response.content;
    },
    staleTime: 2 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    retry: 2,
    refetchOnWindowFocus: false,
  });

  const alertas = data ?? [];

  const { mutate: marcarLido } = useMutation({
    mutationFn: (id: number) => alertaApi.marcarComoLido(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.alertas.meus() });
    },
  });

  function marcarTodosComoLido() {
    const naoLidos = alertas.filter((a) => !a.lido);
    naoLidos.forEach((a) => marcarLido(a.id));
  }

  return {
    alertas,
    loading: isLoading,
    unreadCount: alertas.filter((a) => !a.lido).length,
    marcarComoLido: marcarLido,
    marcarTodosComoLido,
  };
}
