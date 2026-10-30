"use client";

import { useEffect, useState } from "react";
import {
  Alert,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  MenuItem,
  Skeleton,
  Stack,
  TextField,
} from "@mui/material";
import { useAnoLetivoMutations } from "@/hooks/useAnosLetivos";
import { useSeries } from "@/hooks/useSeries";

/** Valor do select para "série final": os aprovados concluem e não rematriculam. */
const FINAL = "final";
/** Valor do select para "não rematricular aprovados desta série agora". */
const PULAR = "pular";

interface Props {
  /** Ano de destino; os alunos vêm de `ano - 1`, que precisa estar encerrado. */
  ano: number | null;
  onClose: () => void;
}

/**
 * O sistema não sabe a ordem das séries, então a direção diz para onde vai quem
 * foi aprovado em cada uma. Reprovado repete a série sem precisar de nada aqui.
 * O resultado são pré-matrículas sem turma: enturmar e efetivar continuam com a
 * secretaria.
 */
export default function DialogRematricula({ ano, onClose }: Props) {
  const { series, loading } = useSeries();
  const { rematricular } = useAnoLetivoMutations();
  const [destinos, setDestinos] = useState<Record<number, string>>({});

  useEffect(() => {
    // Sugestão: a próxima série na lista; a última, como final.
    const sugestao: Record<number, string> = {};
    series.forEach((s, i) => {
      sugestao[s.id] = i < series.length - 1 ? String(series[i + 1].id) : FINAL;
    });
    setDestinos(sugestao);
  }, [series]);

  if (ano == null) return null;

  function confirmar() {
    const promocoes = Object.entries(destinos)
      .filter(([, destino]) => destino !== PULAR)
      .map(([origem, destino]) => ({
        serieOrigemId: Number(origem),
        serieDestinoId: destino === FINAL ? null : Number(destino),
      }));
    rematricular.mutate({ ano: ano as number, dados: { promocoes } }, { onSuccess: onClose });
  }

  return (
    <Dialog open onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        Rematricular alunos de {ano - 1} em {ano}
      </DialogTitle>
      <DialogContent>
        <Stack spacing={2} sx={{ pt: 1 }}>
          <Alert severity="info">
            Para cada série, escolha para onde vão os aprovados. Reprovados repetem a série. São
            criadas pré-matrículas sem turma; alunos que já têm matrícula em {ano} não são tocados.
          </Alert>
          {loading ? (
            <Skeleton variant="rounded" height={180} />
          ) : (
            series.map((s) => (
              <TextField
                key={s.id}
                select
                size="small"
                label={`Aprovados em ${s.nome}`}
                value={destinos[s.id] ?? PULAR}
                onChange={(e) => setDestinos((atual) => ({ ...atual, [s.id]: e.target.value }))}
              >
                {series
                  .filter((destino) => destino.id !== s.id)
                  .map((destino) => (
                    <MenuItem key={destino.id} value={String(destino.id)}>
                      vão para {destino.nome}
                    </MenuItem>
                  ))}
                <MenuItem value={FINAL}>concluem (série final)</MenuItem>
                <MenuItem value={PULAR}>não rematricular agora</MenuItem>
              </TextField>
            ))
          )}
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancelar</Button>
        <Button
          variant="contained"
          disabled={loading || rematricular.isPending}
          onClick={confirmar}
        >
          {rematricular.isPending ? "Rematriculando…" : "Criar pré-matrículas"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
