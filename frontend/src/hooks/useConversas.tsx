"use client";
import { useQuery } from "@tanstack/react-query";
import { conversaApi } from "@/services/api";
import { QUERY_KEYS } from "@/constants/queryKeys";
import { PerfilNomeEnum } from "@/enums/PerfilNomeEnum";

export function useConversasRemetente(page: number = 0) {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: QUERY_KEYS.conversas.remetente(page),
    queryFn: () => conversaApi.listarComoRemetente({ page, size: 20 }),
  });

  return {
    conversas: data?.content ?? [],
    totalPages: data?.totalPages ?? 0,
    totalElements: data?.totalElements ?? 0,
    isLoading,
    error: error?.message ?? null,
    refetch,
  };
}

export function useUnreadConversas() {
  const { data } = useQuery({
    queryKey: ["conversas", "nao-lidas"],
    queryFn: () => conversaApi.contarNaoLidas(),
    refetchInterval: 30_000,
  });
  return data ?? 0;
}

export function useConversasDestinatario(perfilNome: PerfilNomeEnum, page: number = 0) {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: QUERY_KEYS.conversas.destinatario(perfilNome, page),
    queryFn: () => conversaApi.listarComoDestinatario(perfilNome, { page, size: 20 }),
    enabled: !!perfilNome,
  });

  return {
    conversas: data?.content ?? [],
    totalPages: data?.totalPages ?? 0,
    totalElements: data?.totalElements ?? 0,
    isLoading,
    error: error?.message ?? null,
    refetch,
  };
}

export function useDestinatariosDisponiveis() {
  const { data, isLoading } = useQuery({
    queryKey: QUERY_KEYS.conversas.destinatariosDisponiveis(),
    queryFn: () => conversaApi.listarDestinatariosDisponiveis(),
  });

  return { destinatarios: data ?? [], isLoading };
}
