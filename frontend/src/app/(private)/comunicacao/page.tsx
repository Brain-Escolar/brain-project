"use client";
import { useState, useRef, useEffect } from "react";
import {
  Box,
  Typography,
  TextField,
  InputAdornment,
  Button,
  IconButton,
  Paper,
  Stack,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  CircularProgress,
  Divider,
  Avatar,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  FormHelperText,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import AddIcon from "@mui/icons-material/Add";
import ChatBubbleOutlineIcon from "@mui/icons-material/ChatBubbleOutline";
import BusinessIcon from "@mui/icons-material/Business";
import PeopleIcon from "@mui/icons-material/People";
import SendIcon from "@mui/icons-material/Send";
import LockIcon from "@mui/icons-material/Lock";
import PageScaffold from "@/components/pageScaffold/PageScaffold";
import { useConversasRemetente, useDestinatariosDisponiveis } from "@/hooks/useConversas";
import { useMensagens } from "@/hooks/useMensagens";
import { useConversaMutations } from "@/hooks/useConversaMutations";
import { useBrainForm } from "@/hooks/useBrainForm";
import { BrainTextFieldControlled } from "@/components/brainForms/brainTextFieldControlled";
import { ConversaResponse } from "@/services/domains/conversa/response";
import {
  PERFIL_DISPLAY_NAME,
  PerfilNomeEnum,
} from "@/enums/PerfilNomeEnum";
import { z } from "zod";

const novaConversaSchema = z.object({
  titulo: z.string().min(1, "Assunto é obrigatório"),
  primeiraMensagem: z.string().min(1, "Mensagem é obrigatória"),
});
type NovaConversaForm = z.infer<typeof novaConversaSchema>;

function getDestinatarioIcon(perfilNome: string) {
  if (perfilNome === "COORDENADOR") return <PeopleIcon fontSize="small" />;
  return <BusinessIcon fontSize="small" />;
}

function formatDate(isoString: string): string {
  if (!isoString) return "";
  const date = new Date(isoString);
  return date.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" });
}

function formatDateTime(isoString: string): string {
  if (!isoString) return "";
  const date = new Date(isoString);
  return date.toLocaleString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function ComunicacaoPage() {
  const [page] = useState(0);
  const [search, setSearch] = useState("");
  const [selectedConversa, setSelectedConversa] = useState<ConversaResponse | null>(null);
  const [novaConversaOpen, setNovaConversaOpen] = useState(false);
  const [destinatario, setDestinatario] = useState<PerfilNomeEnum | "">("");
  const [destinatarioError, setDestinatarioError] = useState("");
  const [novaMensagem, setNovaMensagem] = useState("");
  const mensagensEndRef = useRef<HTMLDivElement>(null);

  const { conversas, isLoading } = useConversasRemetente(page);
  const { destinatarios, isLoading: loadingDestinatarios } = useDestinatariosDisponiveis();
  const { mensagens, isLoading: loadingMensagens } = useMensagens(selectedConversa?.id ?? null);
  const { criarConversa, enviarMensagem, fecharConversa, marcarTodasComoLida } =
    useConversaMutations();

  const { control, handleSubmit, reset } = useBrainForm<NovaConversaForm>({
    schema: novaConversaSchema,
    defaultValues: { titulo: "", primeiraMensagem: "" },
  });

  const conversasFiltradas = conversas.filter(
    (c) =>
      c.titulo.toLowerCase().includes(search.toLowerCase()) ||
      PERFIL_DISPLAY_NAME[c.destinatarioPerfilNome]?.toLowerCase().includes(search.toLowerCase()),
  );

  useEffect(() => {
    mensagensEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [mensagens]);

  useEffect(() => {
    if (selectedConversa?.id && mensagens.length > 0 && !loadingMensagens) {
      marcarTodasComoLida.mutate(selectedConversa.id);
    }
  }, [selectedConversa, mensagens.length, loadingMensagens, marcarTodasComoLida]);

  function handleOpenNovaConversa() {
    reset({ titulo: "", primeiraMensagem: "" });
    setDestinatario("");
    setDestinatarioError("");
    setNovaConversaOpen(true);
  }

  function handleCloseNovaConversa() {
    setNovaConversaOpen(false);
  }

  const onSubmitNovaConversa = handleSubmit(async (data: NovaConversaForm) => {
    if (!destinatario) {
      setDestinatarioError("Selecione o destinatário");
      return;
    }
    const novaConversa = await criarConversa.mutateAsync({
      titulo: data.titulo,
      destinatarioPerfilNome: destinatario as PerfilNomeEnum,
      primeiraMensagem: data.primeiraMensagem,
    });
    setNovaConversaOpen(false);
    setSelectedConversa(novaConversa);
  });

  async function handleEnviarMensagem() {
    if (!novaMensagem.trim() || !selectedConversa) return;
    await enviarMensagem.mutateAsync({
      conversaId: selectedConversa.id,
      data: { conteudo: novaMensagem.trim() },
    });
    setNovaMensagem("");
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleEnviarMensagem();
    }
  }

  return (
    <PageScaffold
      title="Comunicação com a Escola"
      description="Entre em contato com os departamentos da escola"
      actions={
        <Button variant="contained" startIcon={<AddIcon />} onClick={handleOpenNovaConversa}>
          Nova Mensagem
        </Button>
      }
    >

      <Box sx={{ display: "flex", gap: 2, mt: 3, height: "calc(100vh - 220px)", minHeight: 500 }}>
        {/* Painel esquerdo — lista de conversas */}
        <Paper
          variant="outlined"
          sx={{
            width: 360,
            flexShrink: 0,
            display: "flex",
            flexDirection: "column",
            overflow: "hidden",
          }}
        >
          <Box sx={{ p: 2 }}>
            <TextField
              fullWidth
              size="small"
              placeholder="Buscar conversas..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon fontSize="small" color="action" />
                  </InputAdornment>
                ),
              }}
            />
          </Box>

          <Box sx={{ flex: 1, overflowY: "auto" }}>
            {isLoading && (
              <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
                <CircularProgress size={28} />
              </Box>
            )}

            {!isLoading && conversasFiltradas.length === 0 && (
              <Box sx={{ textAlign: "center", py: 6, px: 2 }}>
                <ChatBubbleOutlineIcon sx={{ fontSize: 40, color: "text.disabled", mb: 1 }} />
                <Typography variant="body2" color="text.secondary">
                  Nenhuma conversa encontrada
                </Typography>
              </Box>
            )}

            {conversasFiltradas.map((conversa) => (
              <Box key={conversa.id}>
                <Box
                  onClick={() => setSelectedConversa(conversa)}
                  sx={{
                    px: 2,
                    py: 1.5,
                    cursor: "pointer",
                    bgcolor:
                      selectedConversa?.id === conversa.id ? "action.selected" : "transparent",
                    "&:hover": { bgcolor: "action.hover" },
                    display: "flex",
                    gap: 1.5,
                    alignItems: "flex-start",
                  }}
                >
                  <Avatar sx={{ width: 36, height: 36, bgcolor: "primary.light", mt: 0.3 }}>
                    {getDestinatarioIcon(conversa.destinatarioPerfilNome)}
                  </Avatar>
                  <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Box
                      sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                      }}
                    >
                      <Typography
                        variant="body2"
                        fontWeight={conversa.mensagensNaoLidas > 0 ? 700 : 600}
                        noWrap
                        sx={{ flex: 1 }}
                      >
                        {conversa.titulo}
                      </Typography>
                      <Box
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          gap: 0.75,
                          ml: 1,
                          flexShrink: 0,
                        }}
                      >
                        {conversa.mensagensNaoLidas > 0 && (
                          <Box
                            sx={{
                              bgcolor: "primary.main",
                              color: "primary.contrastText",
                              borderRadius: "50%",
                              minWidth: 20,
                              height: 20,
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              fontSize: "0.65rem",
                              fontWeight: 700,
                              px: 0.5,
                            }}
                          >
                            {conversa.mensagensNaoLidas > 99 ? "99+" : conversa.mensagensNaoLidas}
                          </Box>
                        )}
                        <Typography variant="caption" color="text.secondary">
                          {formatDate(conversa.criadoEm)}
                        </Typography>
                      </Box>
                    </Box>
                    <Typography variant="caption" color="text.secondary">
                      {PERFIL_DISPLAY_NAME[conversa.destinatarioPerfilNome] ??
                        conversa.destinatarioPerfilNome}
                    </Typography>
                    <Box sx={{ mt: 0.5 }}>
                      <Chip
                        size="small"
                        label={conversa.status === "ABERTA" ? "Aberto" : "Encerrado"}
                        icon={
                          conversa.status === "FECHADA" ? (
                            <LockIcon sx={{ fontSize: "12px !important" }} />
                          ) : undefined
                        }
                        color={conversa.status === "ABERTA" ? "success" : "default"}
                        variant="outlined"
                        sx={{ height: 20, fontSize: "0.65rem" }}
                      />
                    </Box>
                  </Box>
                </Box>
                <Divider />
              </Box>
            ))}
          </Box>
        </Paper>

        {/* Painel direito — detalhe da conversa */}
        <Paper
          variant="outlined"
          sx={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}
        >
          {!selectedConversa ? (
            <Box
              sx={{
                flex: 1,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                gap: 2,
              }}
            >
              <ChatBubbleOutlineIcon sx={{ fontSize: 64, color: "text.disabled" }} />
              <Typography variant="h6" color="text.secondary">
                Selecione uma conversa
              </Typography>
              <Typography variant="body2" color="text.disabled">
                Escolha uma conversa existente ou inicie uma nova mensagem
              </Typography>
              <Button variant="contained" startIcon={<AddIcon />} onClick={handleOpenNovaConversa}>
                Nova Mensagem
              </Button>
            </Box>
          ) : (
            <>
              {/* Cabeçalho da conversa */}
              <Box
                sx={{
                  px: 3,
                  py: 2,
                  borderBottom: 1,
                  borderColor: "divider",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <Box>
                  <Typography variant="subtitle1" fontWeight={600}>
                    {selectedConversa.titulo}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {PERFIL_DISPLAY_NAME[selectedConversa.destinatarioPerfilNome] ??
                      selectedConversa.destinatarioPerfilNome}
                  </Typography>
                </Box>
                <Stack direction="row" spacing={1} alignItems="center">
                  <Chip
                    size="small"
                    label={selectedConversa.status === "ABERTA" ? "Aberto" : "Encerrado"}
                    color={selectedConversa.status === "ABERTA" ? "success" : "default"}
                    variant="outlined"
                  />
                  {selectedConversa.status === "ABERTA" && (
                    <Button
                      size="small"
                      variant="outlined"
                      color="error"
                      startIcon={<LockIcon />}
                      onClick={() =>
                        fecharConversa
                          .mutateAsync(selectedConversa.id)
                          .then(() =>
                            setSelectedConversa((prev) =>
                              prev ? { ...prev, status: "FECHADA" } : null,
                            ),
                          )
                      }
                    >
                      Encerrar
                    </Button>
                  )}
                </Stack>
              </Box>

              {/* Área de mensagens */}
              <Box sx={{ flex: 1, overflowY: "auto", px: 3, py: 2 }}>
                {loadingMensagens ? (
                  <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
                    <CircularProgress size={28} />
                  </Box>
                ) : (
                  <Stack spacing={2}>
                    {mensagens.map((msg) => {
                      const isOwn = msg.remetenteId === selectedConversa.remetenteId;
                      return (
                        <Box
                          key={msg.id}
                          sx={{
                            display: "flex",
                            justifyContent: isOwn ? "flex-end" : "flex-start",
                          }}
                        >
                          <Box
                            sx={{
                              maxWidth: "70%",
                              bgcolor: isOwn ? "primary.main" : "grey.100",
                              color: isOwn ? "primary.contrastText" : "text.primary",
                              borderRadius: 2,
                              px: 2,
                              py: 1,
                            }}
                          >
                            {!isOwn && (
                              <Typography
                                variant="caption"
                                fontWeight={600}
                                display="block"
                                sx={{ mb: 0.5, color: "text.secondary" }}
                              >
                                {msg.remetenteNome}
                              </Typography>
                            )}
                            <Typography
                              variant="body2"
                              sx={{ color: isOwn ? "#fff" : "text.primary" }}
                            >
                              {msg.conteudo}
                            </Typography>
                            <Typography
                              variant="caption"
                              display="block"
                              textAlign="right"
                              sx={{
                                mt: 0.5,
                                color: isOwn ? "rgba(255,255,255,0.7)" : "text.secondary",
                              }}
                            >
                              {formatDateTime(msg.criadoEm)}
                            </Typography>
                          </Box>
                        </Box>
                      );
                    })}
                    <div ref={mensagensEndRef} />
                  </Stack>
                )}
              </Box>

              {/* Input de resposta */}
              {selectedConversa.status === "ABERTA" && (
                <Box
                  sx={{
                    px: 3,
                    py: 2,
                    borderTop: 1,
                    borderColor: "divider",
                    display: "flex",
                    gap: 1,
                    alignItems: "flex-end",
                  }}
                >
                  <TextField
                    fullWidth
                    size="small"
                    multiline
                    maxRows={4}
                    placeholder="Digite sua mensagem..."
                    value={novaMensagem}
                    onChange={(e) => setNovaMensagem(e.target.value)}
                    onKeyDown={handleKeyDown}
                    disabled={enviarMensagem.isPending}
                  />
                  <IconButton
                    color="primary"
                    onClick={handleEnviarMensagem}
                    disabled={!novaMensagem.trim() || enviarMensagem.isPending}
                    sx={{ mb: 0.5 }}
                  >
                    <SendIcon />
                  </IconButton>
                </Box>
              )}

              {selectedConversa.status === "FECHADA" && (
                <Box
                  sx={{
                    px: 3,
                    py: 2,
                    borderTop: 1,
                    borderColor: "divider",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 1,
                    bgcolor: "grey.50",
                  }}
                >
                  <LockIcon fontSize="small" color="disabled" />
                  <Typography variant="body2" color="text.secondary">
                    Esta conversa foi encerrada
                  </Typography>
                </Box>
              )}
            </>
          )}
        </Paper>
      </Box>

      {/* Dialog — Nova Mensagem */}
      <Dialog open={novaConversaOpen} onClose={handleCloseNovaConversa} maxWidth="sm" fullWidth>
        <form onSubmit={onSubmitNovaConversa}>
          <DialogTitle>Nova Mensagem</DialogTitle>
          <DialogContent>
            <Stack spacing={3} sx={{ mt: 1 }}>
              <BrainTextFieldControlled name="titulo" control={control} label="Assunto" required />
              <FormControl fullWidth error={!!destinatarioError} disabled={loadingDestinatarios}>
                <InputLabel>Destinatário</InputLabel>
                <Select
                  value={destinatario}
                  label="Destinatário"
                  onChange={(e) => {
                    setDestinatario(e.target.value as PerfilNomeEnum);
                    setDestinatarioError("");
                  }}
                >
                  {destinatarios.map((perfil) => (
                    <MenuItem key={perfil} value={perfil}>
                      {PERFIL_DISPLAY_NAME[perfil] ?? perfil}
                    </MenuItem>
                  ))}
                </Select>
                {destinatarioError && <FormHelperText>{destinatarioError}</FormHelperText>}
              </FormControl>
              <BrainTextFieldControlled
                name="primeiraMensagem"
                control={control}
                label="Mensagem"
                required
                multiline
                rows={4}
              />
            </Stack>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseNovaConversa}>Cancelar</Button>
            <Button
              type="submit"
              variant="contained"
              disabled={criarConversa.isPending}
              startIcon={<SendIcon />}
            >
              Enviar
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </PageScaffold>
  );
}
