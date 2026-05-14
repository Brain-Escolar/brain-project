import { QUERY_KEYS } from "@/constants/queryKeys";
import { aulaApi } from "@/services/api";
import { TarefaAulaResponse } from "@/services/domains/aula/response";
import { useQuery } from "@tanstack/react-query";

interface UseAulaTarefaReturn {
  tarefas: TarefaAulaResponse[];
  datasComTarefas: string[];
  loading: boolean;
  loadingDatas: boolean;
  error: string | null;
  refetch: () => void;
}

/**
 * Hook para buscar tarefas de uma aula filtradas por data (prazo)
 * e as datas disponíveis com tarefas para o seletor de calendário.
 * Usa AulaApi: GET /aula/{id}/tarefas e GET /aula/{id}/tarefas/datas
 */
export function useAulaTarefa(
  aulaId: string | null,
  data: string,
): UseAulaTarefaReturn {
  const {
    data: tarefasData,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: QUERY_KEYS.aulas.tarefas(aulaId ?? "", data),
    queryFn: () => aulaApi.getTarefasByAula(aulaId!, data),
    enabled: !!aulaId && !!data,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    refetchOnWindowFocus: false,
  });

  const { data: datasData, isLoading: loadingDatas } = useQuery({
    queryKey: QUERY_KEYS.aulas.tarefasDatas(aulaId ?? ""),
    queryFn: () => aulaApi.getTarefasDatas(aulaId!),
    enabled: !!aulaId,
    staleTime: 10 * 60 * 1000,
    gcTime: 15 * 60 * 1000,
    refetchOnWindowFocus: false,
  });

  return {
    tarefas: tarefasData ?? [],
    datasComTarefas: datasData ?? [],
    loading: isLoading,
    loadingDatas,
    error: error ? "Erro ao carregar tarefas. Tente novamente." : null,
    refetch: () => refetch(),
  };
}
