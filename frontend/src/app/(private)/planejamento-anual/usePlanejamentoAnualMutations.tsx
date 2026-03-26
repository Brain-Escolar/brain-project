import { useMutation, useQueryClient } from "@tanstack/react-query";
import { planejamentoAnualApi } from "@/services/api";
import { PlanejamentoAnualRequest } from "@/services/domains/planejamento-anual";
import { toast } from "react-toastify";

export function usePlanejamentoAnualMutations() {
  const queryClient = useQueryClient();

  const createPlanejamentoAnual = useMutation({
    mutationFn: (data: PlanejamentoAnualRequest) => planejamentoAnualApi.cadastrar(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["planejamento-anual"] });
      toast.success("Planejamento anual cadastrado com sucesso!");
    },
    onError: (error: Error) => {
      toast.error(`Erro ao cadastrar planejamento anual: ${error.message}`);
    },
  });

  return {
    createPlanejamentoAnual,
  };
}
