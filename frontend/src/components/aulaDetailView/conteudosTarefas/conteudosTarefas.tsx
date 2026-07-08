import React, { useEffect, useMemo, useRef, useState } from "react";
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
import { Add, AttachFile, Close, InsertInvitation } from "@mui/icons-material";
import { format, parseISO } from "date-fns";
import { DatePicker, LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { ptBR } from "date-fns/locale";
import { useTarefasAula } from "@/hooks/useTarefasAula";
import { useCriarDiario } from "@/hooks/useCriarDiario";
import { useDiarioDaAula } from "@/hooks/useDiarioDaAula";
import { useProximaAula } from "@/hooks/useProximaAula";
import { toast } from "react-toastify";

interface ConteudosTarefasProps {
  aulaId: string;
  turmaId?: number;
  data: string;
}

function ConteudosTarefas({ aulaId, turmaId, data }: ConteudosTarefasProps) {
  const [conteudo, setConteudo] = useState("");
  const [descricaoTarefa, setDescricaoTarefa] = useState("");
  const [prazo, setPrazo] = useState<Date | null>(null);
  const [arquivo, setArquivo] = useState<File | null>(null);
  const [mostrarFormTarefa, setMostrarFormTarefa] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Valores originais carregados do banco — para detectar mudanças
  const [originalConteudo, setOriginalConteudo] = useState("");
  const [originalDescricaoTarefa, setOriginalDescricaoTarefa] = useState("");
  const [originalPrazo, setOriginalPrazo] = useState<string | null>(null);

  const { tarefas, loading: loadingTarefas, error: errorTarefas } = useTarefasAula(aulaId, data);
  const { diario, carregando: carregandoDiario } = useDiarioDaAula(aulaId, data);
  const { criarDiario, salvando } = useCriarDiario(aulaId);
  const { proximaAula, loading: loadingProxima } = useProximaAula(aulaId, data);

  const diarioExiste = !!(diario.conteudo || diario.tarefa);

  // Ref para inicializar campos de texto apenas uma vez por aula/data
  const initialized = useRef(false);
  useEffect(() => {
    initialized.current = false;
    setMostrarFormTarefa(false);
  }, [aulaId, data]);

  // Inicializa os campos quando o diário carrega.
  // Também re-executa quando proximaAula?.data muda, para garantir que o prazo
  // padrão seja aplicado mesmo que a query de próxima aula resolva depois do diário.
  useEffect(() => {
    if (carregandoDiario || loadingProxima) return;

    const prazoDb = diario.tarefa?.prazo ?? null;

    if (!initialized.current) {
      const c = diario.conteudo?.conteudo ?? "";
      const d = diario.tarefa?.conteudo ?? "";
      setConteudo(c);
      setDescricaoTarefa(d);
      setOriginalConteudo(c);
      setOriginalDescricaoTarefa(d);
      setOriginalPrazo(prazoDb);
      if (prazoDb) setPrazo(parseISO(prazoDb));
      setMostrarFormTarefa(!!diario.tarefa);
      initialized.current = true;
    }

    // Aplica prazo padrão da próxima aula quando não há prazo salvo no banco
    if (!prazoDb && proximaAula?.data) {
      setPrazo(parseISO(proximaAula.data));
    }
  }, [carregandoDiario, loadingProxima, proximaAula?.data]); // eslint-disable-line react-hooks/exhaustive-deps

  const hasChanges = useMemo(() => {
    if (!diarioExiste) return true;
    if (conteudo.trim() !== originalConteudo.trim()) return true;
    if (!mostrarFormTarefa) return false;
    const prazoStr = prazo ? format(prazo, "yyyy-MM-dd") : null;
    return (
      descricaoTarefa.trim() !== originalDescricaoTarefa.trim() ||
      prazoStr !== originalPrazo ||
      arquivo !== null
    );
  }, [
    conteudo,
    descricaoTarefa,
    prazo,
    arquivo,
    originalConteudo,
    originalDescricaoTarefa,
    originalPrazo,
    diarioExiste,
    mostrarFormTarefa,
  ]);

  const handleCancelarTarefa = () => {
    setMostrarFormTarefa(false);
    setDescricaoTarefa("");
    setArquivo(null);
    setPrazo(proximaAula?.data ? parseISO(proximaAula.data) : null);
  };

  const handleSalvarDiario = async () => {
    if (!conteudo.trim()) {
      toast.error("Informe o conteúdo da aula.");
      return;
    }
    if (mostrarFormTarefa && !descricaoTarefa.trim()) {
      toast.error("Informe a descrição da tarefa.");
      return;
    }
    if (mostrarFormTarefa && !prazo) {
      toast.error("Informe o prazo da tarefa.");
      return;
    }
    if (!turmaId) {
      toast.error("Informações da aula ainda carregando.");
      return;
    }

    const prazoFormatado = prazo ? format(prazo, "yyyy-MM-dd") : undefined;

    try {
      await criarDiario({
        conteudo: conteudo.trim(),
        descricaoTarefa: mostrarFormTarefa ? descricaoTarefa.trim() : undefined,
        prazo: mostrarFormTarefa ? prazoFormatado : undefined,
        aulaId: Number(aulaId),
        turmaId,
        data,
        arquivo: mostrarFormTarefa ? arquivo ?? undefined : undefined,
        conteudoId: diario.conteudo?.id,
        tarefaId: diario.tarefa?.id,
      });
      toast.success(diarioExiste ? "Diário atualizado com sucesso!" : "Diário registrado com sucesso!");
      setArquivo(null);
      // Atualiza os originais para refletir o novo estado salvo
      setOriginalConteudo(conteudo.trim());
      if (mostrarFormTarefa) {
        setOriginalDescricaoTarefa(descricaoTarefa.trim());
        setOriginalPrazo(prazoFormatado ?? null);
      }
    } catch {
      toast.error("Erro ao salvar diário. Tente novamente.");
    }
  };

  const canSave =
    !!conteudo.trim() &&
    !!turmaId &&
    (!mostrarFormTarefa || (!!descricaoTarefa.trim() && !!prazo));

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={ptBR}>
      <Box>
        {/* Seção 1: Tarefa do dia */}
        <Typography variant="subtitle2" fontWeight={600} sx={{ mb: 1.5 }}>
          Tarefa do dia
        </Typography>

        {loadingTarefas && (
          <Box sx={{ display: "flex", justifyContent: "center", py: 3 }}>
            <CircularProgress size={24} />
          </Box>
        )}

        {errorTarefas && <Alert severity="error" sx={{ mb: 2 }}>{errorTarefas}</Alert>}

        {!loadingTarefas && !errorTarefas && (
          <Stack spacing={1.5} sx={{ mb: 3 }}>
            {tarefas.length === 0 ? (
              <Paper variant="outlined" sx={{ p: 2, textAlign: "center" }}>
                <Typography variant="body2" color="text.secondary">
                  Nenhuma tarefa para esta data.
                </Typography>
              </Paper>
            ) : (
              tarefas.map((tarefa) => (
                <Paper key={tarefa.id} variant="outlined" sx={{ px: 2, py: 1.5 }}>
                  <Typography variant="subtitle2" fontWeight="bold" sx={{ mb: tarefa.documentoUrl ? 1 : 0 }}>
                    {tarefa.conteudo}
                  </Typography>

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

                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <InsertInvitation fontSize="small" color="action" />
                    <Typography variant="caption" color="text.secondary">
                      Prazo: {format(parseISO(tarefa.prazo), "dd/MM/yyyy")}
                    </Typography>
                  </Box>
                </Paper>
              ))
            )}
          </Stack>
        )}

        <Divider sx={{ mb: 3 }} />

        {/* Seção 2: Diário */}
        <Paper variant="outlined" sx={{ p: 2 }}>
          <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
            <Typography variant="subtitle2" fontWeight={600}>
              Diário da aula
            </Typography>
            {carregandoDiario && <CircularProgress size={16} />}
            {!carregandoDiario && diarioExiste && (
              <Chip label="Já registrado" size="small" color="success" variant="outlined" />
            )}
          </Box>

          <Stack spacing={2}>
            <TextField
              label="Conteúdo da aula"
              size="small"
              fullWidth
              multiline
              rows={3}
              value={conteudo}
              onChange={(e) => setConteudo(e.target.value)}
              disabled={carregandoDiario}
            />

            {mostrarFormTarefa ? (
              <>
                <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <Typography variant="body2" fontWeight={600} color="text.secondary">
                    Tarefa
                  </Typography>
                  {!diario.tarefa && (
                    <IconButton size="small" onClick={handleCancelarTarefa} disabled={carregandoDiario}>
                      <Close fontSize="small" />
                    </IconButton>
                  )}
                </Box>

                <TextField
                  label="Descrição da tarefa"
                  size="small"
                  fullWidth
                  multiline
                  rows={2}
                  value={descricaoTarefa}
                  onChange={(e) => setDescricaoTarefa(e.target.value)}
                  disabled={carregandoDiario}
                />

                <DatePicker
                  label="Prazo da tarefa"
                  value={prazo}
                  onChange={(v) => setPrazo(v as Date | null)}
                  slotProps={{ textField: { size: "small", fullWidth: true } }}
                  disabled={carregandoDiario}
                />

                {/* Anexo: mostra arquivo existente ou input para novo */}
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
                  ) : diario.tarefa?.documentoUrl ? (
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                      <Box
                        component="a"
                        href={diario.tarefa.documentoUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          gap: 1,
                          p: 1,
                          flex: 1,
                          bgcolor: "grey.50",
                          borderRadius: 1,
                          textDecoration: "none",
                          "&:hover": { bgcolor: "grey.100" },
                        }}
                      >
                        <AttachFile fontSize="small" color="action" />
                        <Typography variant="body2" color="primary">
                          Anexo atual
                        </Typography>
                      </Box>
                      <Button
                        size="small"
                        variant="outlined"
                        startIcon={<AttachFile />}
                        onClick={() => fileInputRef.current?.click()}
                      >
                        Substituir
                      </Button>
                    </Box>
                  ) : (
                    <Button
                      variant="outlined"
                      size="small"
                      startIcon={<AttachFile />}
                      onClick={() => fileInputRef.current?.click()}
                      disabled={carregandoDiario}
                    >
                      Anexar arquivo
                    </Button>
                  )}
                </Box>
              </>
            ) : (
              <Button
                variant="outlined"
                fullWidth
                startIcon={<Add />}
                onClick={() => setMostrarFormTarefa(true)}
                disabled={carregandoDiario}
              >
                Adicionar tarefa
              </Button>
            )}

            <Box sx={{ display: "flex", justifyContent: "flex-end" }}>
              <Button
                variant="contained"
                size="small"
                onClick={handleSalvarDiario}
                disabled={salvando || !canSave || carregandoDiario || !hasChanges}
              >
                {salvando ? (
                  <CircularProgress size={18} color="inherit" />
                ) : diarioExiste ? (
                  "ATUALIZAR"
                ) : (
                  "SALVAR"
                )}
              </Button>
            </Box>
          </Stack>
        </Paper>
      </Box>
    </LocalizationProvider>
  );
}

export default ConteudosTarefas;
