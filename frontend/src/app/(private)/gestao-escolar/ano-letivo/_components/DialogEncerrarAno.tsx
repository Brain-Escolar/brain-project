"use client";

import {
  Alert,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Skeleton,
  Stack,
} from "@mui/material";
import { useAnoLetivoMutations, usePreviaEncerramento } from "@/hooks/useAnosLetivos";

interface Props {
  ano: number | null;
  onClose: () => void;
}

/**
 * Encerrar o ano é a única operação aqui que não volta atrás: o resultado de
 * cada aluno é congelado e o ano vira somente leitura. Por isso a prévia vem
 * antes do botão.
 */
export default function DialogEncerrarAno({ ano, onClose }: Props) {
  const { previa, loading, error } = usePreviaEncerramento(ano);
  const { encerrar } = useAnoLetivoMutations();

  if (ano == null) return null;

  return (
    <Dialog open onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Encerrar o ano letivo de {ano}</DialogTitle>
      <DialogContent>
        {error ? (
          <Alert severity="error">{error}</Alert>
        ) : loading || !previa ? (
          <Skeleton variant="rounded" height={140} />
        ) : (
          <Stack spacing={2}>
            <Alert severity="warning">
              Não dá para desfazer. Depois de encerrado, notas, chamadas e turmas de {ano} ficam
              somente leitura e o histórico escolar passa a usar o resultado gravado agora.
            </Alert>
            <ul style={{ margin: 0, paddingLeft: 20, lineHeight: 1.7 }}>
              <li>
                <strong>{previa.matriculasAConcluir}</strong> matrículas recebem o resultado final
                (aprovado ou reprovado) e são concluídas.
              </li>
              {previa.matriculasSemTurma > 0 && (
                <li>
                  <strong>{previa.matriculasSemTurma}</strong> matrículas sem turma são concluídas
                  sem resultado.
                </li>
              )}
              {previa.preMatriculas > 0 && (
                <li>
                  <strong>{previa.preMatriculas}</strong> pré-matrículas nunca efetivadas são
                  canceladas.
                </li>
              )}
              {previa.periodosAbertos > 0 && (
                <li>
                  <strong>{previa.periodosAbertos}</strong> períodos ainda abertos são fechados.
                </li>
              )}
            </ul>
          </Stack>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancelar</Button>
        <Button
          variant="contained"
          color="warning"
          disabled={!previa || encerrar.isPending}
          onClick={() => encerrar.mutate(ano, { onSuccess: onClose })}
        >
          {encerrar.isPending ? "Encerrando…" : `Encerrar ${ano}`}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
