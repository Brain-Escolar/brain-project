"use client";

import { useEffect, useState } from "react";
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  MenuItem,
  Select,
  TextField,
  Typography,
  Box,
  Chip,
  Alert,
} from "@mui/material";
import CheckIcon from "@mui/icons-material/Check";
import { useCrmMutations } from "@/hooks/useCrmMutations";
import { CadastroInteracaoRequest } from "@/services/domains/crm";
import { FunilEstagioResponse } from "@/services/domains/crm";

const TIPOS: { value: CadastroInteracaoRequest["tipo"]; label: string }[] = [
  { value: "LIGACAO", label: "Ligação" },
  { value: "WHATSAPP", label: "WhatsApp" },
  { value: "EMAIL", label: "E-mail" },
  { value: "ANOTACAO", label: "Anotação" },
];

const RESULTADOS = ["Atendeu", "Não atendeu", "Reagendar", "Sem interesse"];

interface RegistrarInteracaoDialogProps {
  open: boolean;
  onClose: () => void;
  processoId: number;
  alunoNome: string;
  responsavelNome?: string;
  estagioAtualId: number;
  estagios: FunilEstagioResponse[];
  onSuccess?: () => void;
}

export default function RegistrarInteracaoDialog({
  open,
  onClose,
  processoId,
  alunoNome,
  responsavelNome,
  estagioAtualId,
  estagios,
  onSuccess,
}: RegistrarInteracaoDialogProps) {
  const { registrarInteracao } = useCrmMutations(processoId);

  const [tipo, setTipo] = useState<CadastroInteracaoRequest["tipo"]>("LIGACAO");
  const [resultado, setResultado] = useState("Atendeu");
  const [observacoes, setObservacoes] = useState("");
  const [proximaAcao, setProximaAcao] = useState("");
  const [novoEstagioId, setNovoEstagioId] = useState<number | "">(estagioAtualId);
  const [subestagio, setSubestagio] = useState("");

  useEffect(() => {
    if (open) {
      setTipo("LIGACAO");
      setResultado("Atendeu");
      setObservacoes("");
      setProximaAcao("");
      setNovoEstagioId(estagioAtualId);
      setSubestagio("");
    }
  }, [open, estagioAtualId]);

  async function confirmar() {
    const dados: CadastroInteracaoRequest = {
      tipo,
      resultado,
      observacoes: observacoes || undefined,
      proximaAcao: proximaAcao ? new Date(proximaAcao).toISOString() : undefined,
      moverParaEstagioId: novoEstagioId !== estagioAtualId ? Number(novoEstagioId) : undefined,
      subestagio: subestagio || undefined,
    };
    await registrarInteracao.mutateAsync(dados);
    onSuccess?.();
    onClose();
  }

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Registrar interação</DialogTitle>
      <DialogContent sx={{ display: "flex", flexDirection: "column", gap: 2, pt: 1 }}>
        <Typography variant="body2" color="text.secondary">
          Contato com <strong>{responsavelNome ?? "responsável"}</strong> sobre{" "}
          <strong>{alunoNome}</strong>.
        </Typography>

        <Box>
          <Typography variant="caption" fontWeight={600} color="text.secondary">
            Tipo de interação
          </Typography>
          <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap", mt: 0.5 }}>
            {TIPOS.map((t) => (
              <Chip
                key={t.value}
                label={t.label}
                color={tipo === t.value ? "primary" : "default"}
                onClick={() => setTipo(t.value)}
              />
            ))}
          </Box>
        </Box>

        <Box>
          <Typography variant="caption" fontWeight={600} color="text.secondary">
            Resultado
          </Typography>
          <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap", mt: 0.5 }}>
            {RESULTADOS.map((r) => (
              <Chip
                key={r}
                label={r}
                color={resultado === r ? "primary" : "default"}
                onClick={() => setResultado(r)}
              />
            ))}
          </Box>
        </Box>

        <TextField
          label="Observações"
          multiline
          minRows={3}
          value={observacoes}
          onChange={(e) => setObservacoes(e.target.value)}
          placeholder="Ex.: mãe pediu para ligar depois das 18h..."
        />

        <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap" }}>
          <TextField
            label="Próxima ação"
            type="datetime-local"
            value={proximaAcao}
            onChange={(e) => setProximaAcao(e.target.value)}
            slotProps={{ inputLabel: { shrink: true } }}
            sx={{ flex: 1, minWidth: 220 }}
          />
          <Select
            value={novoEstagioId}
            onChange={(e) => setNovoEstagioId(Number(e.target.value))}
            sx={{ flex: 1, minWidth: 220 }}
          >
            {estagios.map((e) => (
              <MenuItem key={e.id} value={e.id}>
                {e.nome}
              </MenuItem>
            ))}
          </Select>
        </Box>

        <TextField
          label="Sub-estágio (opcional)"
          value={subestagio}
          onChange={(e) => setSubestagio(e.target.value)}
          placeholder="Ex.: 2ª tentativa, docs pendentes..."
        />

        <Alert severity="info" variant="outlined">
          A próxima ação alimenta a lista de follow-ups do dia. Mover de estágio grava entrada e
          saída no histórico.
        </Alert>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={registrarInteracao.isPending}>
          Cancelar
        </Button>
        <Button
          variant="contained"
          startIcon={<CheckIcon />}
          onClick={confirmar}
          disabled={registrarInteracao.isPending}
        >
          Salvar interação
        </Button>
      </DialogActions>
    </Dialog>
  );
}
