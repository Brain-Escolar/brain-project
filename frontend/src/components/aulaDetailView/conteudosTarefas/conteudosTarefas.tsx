import React, { useRef, useState } from "react";
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Chip,
  Divider,
  IconButton,
  Paper,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { AttachFile, Close, InsertInvitation } from "@mui/icons-material";
import { format } from "date-fns";
import { DatePicker, LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { ptBR } from "date-fns/locale";
import DateSelector from "@/components/dateSelector";
import { useTarefasAula } from "@/hooks/useTarefasAula";
import { useTarefasDatas } from "@/hooks/useTarefasDatas";
import { useCriarTarefa } from "@/hooks/useCriarTarefa";
import { toast } from "react-toastify";

interface ConteudosTarefasProps {
  aulaId: string;
  turmaId?: number;
}

function ConteudosTarefas({ aulaId, turmaId }: ConteudosTarefasProps) {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const dataFormatada = format(selectedDate, "yyyy-MM-dd");

  const [titulo, setTitulo] = useState("");
  const [conteudo, setConteudo] = useState("");
  const [prazo, setPrazo] = useState<Date | null>(null);
  const [arquivo, setArquivo] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { tarefas, loading, error } = useTarefasAula(aulaId, dataFormatada);
  const { datas: datasDisponiveis } = useTarefasDatas(aulaId);
  const { criarTarefa, salvando } = useCriarTarefa(aulaId);

  const hasTasksOnDate = datasDisponiveis.includes(dataFormatada);

  const handleSalvar = async () => {
    if (!titulo.trim()) {
      toast.error("Informe o título da tarefa.");
      return;
    }
    if (!prazo) {
      toast.error("Informe o prazo da tarefa.");
      return;
    }
    if (!turmaId) {
      toast.error("Informações da aula ainda carregando.");
      return;
    }

    try {
      await criarTarefa({
        dados: {
          titulo: titulo.trim(),
          conteudo: conteudo.trim() || undefined,
          turmaId,
          prazo: format(prazo, "yyyy-MM-dd"),
        },
        arquivo: arquivo ?? undefined,
      });
      toast.success("Tarefa criada com sucesso!");
      setTitulo("");
      setConteudo("");
      setPrazo(null);
      setArquivo(null);
    } catch {
      toast.error("Erro ao criar tarefa. Tente novamente.");
    }
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={ptBR}>
      <Box>
        {/* Formulário de nova tarefa */}
        <Paper variant="outlined" sx={{ p: 2, mb: 3 }}>
          <Typography variant="subtitle2" sx={{ mb: 2, fontWeight: 600 }}>
            Nova tarefa
          </Typography>

          <Stack spacing={2}>
            <TextField
              label="Título"
              size="small"
              fullWidth
              value={titulo}
              onChange={(e) => setTitulo(e.target.value)}
            />

            <TextField
              label="Descrição (opcional)"
              size="small"
              fullWidth
              multiline
              rows={3}
              value={conteudo}
              onChange={(e) => setConteudo(e.target.value)}
            />

            <DatePicker
              label="Prazo"
              value={prazo}
              onChange={(v) => setPrazo(v as Date | null)}
              slotProps={{ textField: { size: "small", fullWidth: true } }}
            />

            {/* Upload de arquivo */}
            <Box>
              <input
                ref={fileInputRef}
                type="file"
                hidden
                onChange={(e) => setArquivo(e.target.files?.[0] ?? null)}
              />
              {arquivo ? (
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 1,
                    p: 1,
                    border: "1px solid",
                    borderColor: "divider",
                    borderRadius: 1,
                  }}
                >
                  <AttachFile fontSize="small" color="action" />
                  <Typography variant="body2" sx={{ flex: 1 }} noWrap>
                    {arquivo.name}
                  </Typography>
                  <IconButton size="small" onClick={() => setArquivo(null)}>
                    <Close fontSize="small" />
                  </IconButton>
                </Box>
              ) : (
                <Button
                  variant="outlined"
                  size="small"
                  startIcon={<AttachFile />}
                  onClick={() => fileInputRef.current?.click()}
                >
                  Anexar arquivo
                </Button>
              )}
            </Box>

            <Box sx={{ display: "flex", justifyContent: "flex-end" }}>
              <Button
                variant="contained"
                size="small"
                onClick={handleSalvar}
                disabled={salvando || !titulo.trim() || !prazo || !turmaId}
              >
                {salvando ? <CircularProgress size={18} color="inherit" /> : "SALVAR"}
              </Button>
            </Box>
          </Stack>
        </Paper>

        <Divider sx={{ mb: 3 }} />

        {/* Filtro por data */}
        <Box sx={{ mb: 3 }}>
          <DateSelector selectedDate={selectedDate} onDateChange={setSelectedDate} />
          {datasDisponiveis.length > 0 && !hasTasksOnDate && (
            <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: "block" }}>
              Nenhuma tarefa nesta data. Datas com tarefas: {datasDisponiveis.join(", ")}
            </Typography>
          )}
        </Box>

        {/* Lista de tarefas */}
        {loading && (
          <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
            <CircularProgress />
          </Box>
        )}

        {error && <Alert severity="error">{error}</Alert>}

        {!loading && !error && (
          <Stack spacing={2}>
            {tarefas.map((tarefa) => (
              <Paper key={tarefa.id} variant="outlined" sx={{ px: 2, py: 1.5 }}>
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "flex-start",
                    mb: 1,
                  }}
                >
                  <Typography variant="subtitle2" fontWeight="bold">
                    {tarefa.titulo}
                  </Typography>
                  <Chip label={tarefa.turma} size="small" variant="outlined" />
                </Box>

                {tarefa.documentoUrl && (
                  <Box
                    component="a"
                    href={tarefa.documentoUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      gap: 1,
                      p: 1,
                      mb: 1,
                      bgcolor: "grey.50",
                      borderRadius: 1,
                      textDecoration: "none",
                      "&:hover": { bgcolor: "grey.100" },
                    }}
                  >
                    <AttachFile fontSize="small" color="action" />
                    <Typography variant="body2" color="primary">
                      Baixar anexo
                    </Typography>
                  </Box>
                )}

                {tarefa.conteudo && (
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                    {tarefa.conteudo}
                  </Typography>
                )}

                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <InsertInvitation fontSize="small" color="action" />
                  <Typography variant="caption" color="text.secondary">
                    Prazo: {tarefa.prazo}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    · Prof. {tarefa.professor}
                  </Typography>
                </Box>
              </Paper>
            ))}
            {tarefas.length === 0 && (
              <Paper variant="outlined" sx={{ p: 3, textAlign: "center" }}>
                <Typography variant="body2" color="text.secondary">
                  Nenhuma tarefa para esta data.
                </Typography>
              </Paper>
            )}
          </Stack>
        )}
      </Box>
    </LocalizationProvider>
  );
}

export default ConteudosTarefas;
