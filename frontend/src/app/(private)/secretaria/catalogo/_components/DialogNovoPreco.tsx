"use client";

import { useEffect, useState } from "react";
import {
  Alert,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControlLabel,
  MenuItem,
  Stack,
  Switch,
  TextField,
  Typography,
} from "@mui/material";
import { useCatalogoMutations } from "@/hooks/useCatalogoMutations";
import { useSeries } from "@/hooks/useSeries";
import { useUnidades } from "@/hooks/useUnidades";

const TURNOS = ["MATUTINO", "VESPERTINO", "NOTURNO", "INTEGRAL"];

function hojeISO(): string {
  const agora = new Date();
  const mes = String(agora.getMonth() + 1).padStart(2, "0");
  const dia = String(agora.getDate()).padStart(2, "0");
  return `${agora.getFullYear()}-${mes}-${dia}`;
}

interface Props {
  modalidadeId: number | null;
  modalidadeNome?: string;
  onClose: () => void;
}

/**
 * Cadastro de preco por dimensao e vigencia.
 *
 * As quatro dimensoes em branco significam "vale para qualquer". A escola
 * cadastra um preco geral e so as excecoes em cima dele -- a linha mais
 * especifica vence. Sem isso seria uma linha por combinacao de ano, unidade,
 * serie e turno, que e trabalho de digitacao e fonte de divergencia.
 */
export default function DialogNovoPreco({ modalidadeId, modalidadeNome, onClose }: Props) {
  const { criarPreco } = useCatalogoMutations();
  const { unidades } = useUnidades();
  const { series } = useSeries();

  const [anoLetivo, setAnoLetivo] = useState("");
  const [unidadeId, setUnidadeId] = useState("");
  const [serieId, setSerieId] = useState("");
  const [turno, setTurno] = useState("");
  const [valor, setValor] = useState("");
  const [vigenciaInicio, setVigenciaInicio] = useState(hojeISO());
  const [encerrarAnterior, setEncerrarAnterior] = useState(false);

  useEffect(() => {
    if (modalidadeId !== null) {
      setAnoLetivo("");
      setUnidadeId("");
      setSerieId("");
      setTurno("");
      setValor("");
      setVigenciaInicio(hojeISO());
      setEncerrarAnterior(false);
    }
  }, [modalidadeId]);

  if (modalidadeId === null) return null;

  const valorNumero = valor.trim() === "" ? null : Number(valor.replace(",", "."));
  const valorInvalido = valorNumero === null || Number.isNaN(valorNumero) || valorNumero < 0;

  function salvar() {
    criarPreco.mutate(
      {
        modalidadeId: modalidadeId!,
        dados: {
          anoLetivo: anoLetivo.trim() === "" ? undefined : Number(anoLetivo),
          unidadeId: unidadeId === "" ? undefined : Number(unidadeId),
          serieId: serieId === "" ? undefined : Number(serieId),
          turno: turno === "" ? undefined : turno,
          valor: valorNumero!,
          vigenciaInicio,
          encerrarAnterior,
        },
      },
      { onSuccess: onClose },
    );
  }

  return (
    <Dialog open onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Novo preço{modalidadeNome ? ` · ${modalidadeNome}` : ""}</DialogTitle>
      <DialogContent>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Deixe em branco o que vale para todos. Um preço sem série vale para todas as séries; se
          existir também um preço do 6º ano, o do 6º ano ganha.
        </Typography>

        <Stack spacing={2}>
          <TextField
            label="Valor"
            value={valor}
            onChange={(e) => setValor(e.target.value)}
            placeholder="1350.00"
            error={valor.trim() !== "" && valorInvalido}
            fullWidth
          />

          <TextField
            label="Vigente a partir de"
            type="date"
            value={vigenciaInicio}
            onChange={(e) => setVigenciaInicio(e.target.value)}
            slotProps={{ inputLabel: { shrink: true } }}
            fullWidth
          />

          <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
            <TextField
              label="Ano letivo"
              value={anoLetivo}
              onChange={(e) => setAnoLetivo(e.target.value)}
              placeholder="todos"
              sx={{ flex: 1 }}
            />
            <TextField
              select
              label="Unidade"
              value={unidadeId}
              onChange={(e) => setUnidadeId(e.target.value)}
              sx={{ flex: 1 }}
            >
              <MenuItem value="">Todas</MenuItem>
              {unidades.map((u) => (
                <MenuItem key={u.id} value={String(u.id)}>
                  {u.nome}
                </MenuItem>
              ))}
            </TextField>
          </Stack>

          <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
            <TextField
              select
              label="Série"
              value={serieId}
              onChange={(e) => setSerieId(e.target.value)}
              sx={{ flex: 1 }}
            >
              <MenuItem value="">Todas</MenuItem>
              {series.map((s) => (
                <MenuItem key={s.id} value={String(s.id)}>
                  {s.nome}
                </MenuItem>
              ))}
            </TextField>
            <TextField
              select
              label="Turno"
              value={turno}
              onChange={(e) => setTurno(e.target.value)}
              sx={{ flex: 1 }}
            >
              <MenuItem value="">Todos</MenuItem>
              {TURNOS.map((t) => (
                <MenuItem key={t} value={t}>
                  {t.charAt(0) + t.slice(1).toLowerCase()}
                </MenuItem>
              ))}
            </TextField>
          </Stack>

          <FormControlLabel
            control={
              <Switch
                checked={encerrarAnterior}
                onChange={(e) => setEncerrarAnterior(e.target.checked)}
              />
            }
            label="É um reajuste: encerrar o preço anterior deste mesmo escopo"
          />

          <Alert severity={encerrarAnterior ? "info" : "warning"}>
            {encerrarAnterior
              ? "O preço que vale hoje para este mesmo escopo será encerrado na véspera, sem deixar um dia sem preço."
              : "Sem isto, se já existir preço valendo para este mesmo escopo, o cadastro será recusado — dois preços ao mesmo tempo deixariam a cobrança indefinida."}
          </Alert>
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={criarPreco.isPending}>
          Cancelar
        </Button>
        <Button
          variant="contained"
          onClick={salvar}
          disabled={valorInvalido || criarPreco.isPending}
        >
          {criarPreco.isPending ? "Salvando..." : "Cadastrar preço"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
