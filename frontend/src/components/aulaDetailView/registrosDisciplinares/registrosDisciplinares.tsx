import React, { useState } from "react";
import {
  Alert,
  Box,
  Button,
  Checkbox,
  Chip,
  CircularProgress,
  Divider,
  FormControl,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from "@mui/material";
import { useAnotacoesAula } from "@/hooks/useAnotacoesAula";
import { useAula } from "@/hooks/useAula";
import { useCriarAnotacao } from "@/hooks/useCriarAnotacao";
import { TIPOS_ANOTACAO, TipoAnotacao } from "@/services/domains/anotacao";
import { toast } from "react-toastify";

interface RegistrosDisciplinaresProps {
  aulaId: string;
  data: string;
}

function RegistrosDisciplinares({ aulaId, data }: RegistrosDisciplinaresProps) {
  const dataFormatada = data;

  const [alunosSelecionados, setAlunosSelecionados] = useState<number[]>([]);
  const [tipoAnotacao, setTipoAnotacao] = useState<TipoAnotacao | "">("");
  const [observacao, setObservacao] = useState("");

  const { anotacoes, loading: loadingAnotacoes, error } = useAnotacoesAula(aulaId, dataFormatada);
  const { alunos } = useAula({ idAula: aulaId });
  const { criarAnotacao, salvando } = useCriarAnotacao(aulaId, dataFormatada);

  const handleCheckboxChange = (alunoId: number) => {
    setAlunosSelecionados((prev) =>
      prev.includes(alunoId) ? prev.filter((id) => id !== alunoId) : [...prev, alunoId],
    );
  };

  const handleSelectAll = () => {
    setAlunosSelecionados(
      alunosSelecionados.length === alunos.length ? [] : alunos.map((a) => a.id),
    );
  };

  const handleSalvar = async () => {
    if (alunosSelecionados.length === 0) {
      toast.error("Selecione ao menos um aluno.");
      return;
    }
    if (!tipoAnotacao) {
      toast.error("Selecione o tipo de anotação.");
      return;
    }
    try {
      await criarAnotacao({
        alunoIds: alunosSelecionados,
        aulaId: Number(aulaId),
        tipoAnotacao,
        data: dataFormatada,
        observacao: observacao.trim() || undefined,
      });
      toast.success("Registros salvos com sucesso!");
      setAlunosSelecionados([]);
      setTipoAnotacao("");
      setObservacao("");
    } catch {
      toast.error("Erro ao salvar registros. Tente novamente.");
    }
  };

  return (
    <Box>
      {/* Seleção de alunos */}
      <TableContainer component={Paper} variant="outlined" sx={{ boxShadow: "none", mb: 2 }}>
        <Table size="small">
          <colgroup>
            <col style={{ width: "15%" }} />
            <col style={{ width: "85%" }} />
          </colgroup>
          <TableHead>
            <TableRow>
              <TableCell sx={{ py: 1.5 }}>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <Checkbox
                    size="small"
                    checked={alunosSelecionados.length === alunos.length && alunos.length > 0}
                    indeterminate={
                      alunosSelecionados.length > 0 && alunosSelecionados.length < alunos.length
                    }
                    onChange={handleSelectAll}
                    sx={{ p: 0 }}
                  />
                  <Typography variant="body2" color="text.secondary">
                    Selecionar
                  </Typography>
                </Box>
              </TableCell>
              <TableCell sx={{ py: 1.5 }}>
                <Typography variant="body2" color="text.secondary">
                  Nome
                </Typography>
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {alunos.map((aluno) => {
              const selecionado = alunosSelecionados.includes(aluno.id);
              return (
                <TableRow
                  key={aluno.id}
                  sx={{
                    bgcolor: selecionado ? "warning.50" : "inherit",
                    "&:hover": { bgcolor: selecionado ? "warning.50" : "action.hover" },
                    cursor: "pointer",
                  }}
                  onClick={() => handleCheckboxChange(aluno.id)}
                >
                  <TableCell sx={{ py: 1 }}>
                    <Checkbox
                      size="small"
                      checked={selecionado}
                      onChange={() => handleCheckboxChange(aluno.id)}
                      color="warning"
                      sx={{ p: 0 }}
                      onClick={(e) => e.stopPropagation()}
                    />
                  </TableCell>
                  <TableCell sx={{ py: 1 }}>
                    <Typography variant="body2">{aluno.nome}</Typography>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Tipo e observação */}
      <Stack spacing={2} sx={{ mb: 2 }}>
        <FormControl size="small" fullWidth>
          <InputLabel>Tipo de anotação</InputLabel>
          <Select
            value={tipoAnotacao}
            label="Tipo de anotação"
            onChange={(e) => setTipoAnotacao(e.target.value as TipoAnotacao)}
          >
            {TIPOS_ANOTACAO.map((tipo) => (
              <MenuItem key={tipo.value} value={tipo.value}>
                {tipo.label}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <TextField
          label="Observação (opcional)"
          size="small"
          fullWidth
          multiline
          rows={2}
          value={observacao}
          onChange={(e) => setObservacao(e.target.value)}
        />
      </Stack>

      <Box sx={{ display: "flex", justifyContent: "flex-end", mb: 3 }}>
        <Button
          variant="contained"
          color="warning"
          onClick={handleSalvar}
          disabled={salvando || alunosSelecionados.length === 0 || !tipoAnotacao}
        >
          {salvando ? (
            <CircularProgress size={18} color="inherit" />
          ) : (
            `SALVAR${alunosSelecionados.length > 0 ? ` (${alunosSelecionados.length})` : ""}`
          )}
        </Button>
      </Box>

      <Divider sx={{ mb: 3 }} />

      {/* Registros do dia */}
      <Typography variant="subtitle2" sx={{ mb: 2, fontWeight: 600 }}>
        Registros do dia
      </Typography>

      {loadingAnotacoes && (
        <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
          <CircularProgress />
        </Box>
      )}

      {error && <Alert severity="error">{error}</Alert>}

      {!loadingAnotacoes && !error && (
        <Stack spacing={2}>
          {anotacoes.map((anotacao) => (
            <Paper key={anotacao.anotacaoId} variant="outlined" sx={{ p: 2 }}>
              <Box
                sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", mb: anotacao.observacao ? 1 : 0 }}
              >
                <Typography variant="body2" fontWeight={600}>
                  {anotacao.nomeAluno}
                </Typography>
                <Chip label={anotacao.anotacao} size="small" color="warning" variant="outlined" />
              </Box>
              {anotacao.observacao && (
                <Typography variant="body2" color="text.secondary">
                  {anotacao.observacao}
                </Typography>
              )}
            </Paper>
          ))}
          {anotacoes.length === 0 && (
            <Paper variant="outlined" sx={{ p: 3, textAlign: "center" }}>
              <Typography variant="body2" color="text.secondary">
                Nenhum registro disciplinar para esta data.
              </Typography>
            </Paper>
          )}
        </Stack>
      )}
    </Box>
  );
}

export default RegistrosDisciplinares;
