"use client";
import { useEffect, useMemo, useRef, useState } from "react";
import { useQuery } from "@tanstack/react-query";
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
  CircularProgress,
  Divider,
  Avatar,
  useMediaQuery,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import SearchIcon from "@mui/icons-material/Search";
import ArrowBackRounded from "@mui/icons-material/ArrowBackRounded";
import ChatBubbleOutlineIcon from "@mui/icons-material/ChatBubbleOutline";
import SendIcon from "@mui/icons-material/Send";
import LockIcon from "@mui/icons-material/Lock";
import SchoolIcon from "@mui/icons-material/School";
import PersonIcon from "@mui/icons-material/Person";
import PageScaffold from "@/components/pageScaffold/PageScaffold";
import SegmentedControl from "@/components/segmentedControl/segmentedControl";
import { useAuth } from "@/hooks/useAuth";
import { useMensagens } from "@/hooks/useMensagens";
import { useConversaMutations } from "@/hooks/useConversaMutations";
import { conversaApi } from "@/services/api";
import { QUERY_KEYS } from "@/constants/queryKeys";
import { ConversaResponse } from "@/services/domains/conversa/response";
import { PERFIL_DISPLAY_NAME, PerfilNomeEnum } from "@/enums/PerfilNomeEnum";

type StatusTab = "ABERTA" | "FECHADA";

function getRemetenteIcon(perfilNome: string) {
  if (perfilNome === "PROFESSOR") return <SchoolIcon fontSize="small" />;
  return <PersonIcon fontSize="small" />;
}

function formatDate(isoString: string): string {
  if (!isoString) return "";
  return new Date(isoString).toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" });
}

function formatDateTime(isoString: string): string {
  if (!isoString) return "";
  return new Date(isoString).toLocaleString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function FilaAtendimento() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const { user } = useAuth();

  const [statusTab, setStatusTab] = useState<StatusTab>("ABERTA");
  const [search, setSearch] = useState("");
  const [selectedConversa, setSelectedConversa] = useState<ConversaResponse | null>(null);
  const [novaMensagem, setNovaMensagem] = useState("");
  const mensagensEndRef = useRef<HTMLDivElement>(null);

  const { data, isLoading } = useQuery({
    queryKey: QUERY_KEYS.conversas.destinatario(PerfilNomeEnum.SECRETARIO, 0),
    queryFn: () => conversaApi.listarComoDestinatario(PerfilNomeEnum.SECRETARIO, { page: 0, size: 100 }),
  });
  const conversas = useMemo(() => data?.content ?? [], [data]);

  const { mensagens, isLoading: loadingMensagens } = useMensagens(selectedConversa?.id ?? null);
  const { enviarMensagem, fecharConversa, reabrirConversa, marcarTodasComoLida } = useConversaMutations();

  const conversasFiltradas = useMemo(() => {
    const q = search.trim().toLowerCase();
    return conversas
      .filter((c) => c.status === statusTab)
      .filter(
        (c) =>
          !q ||
          c.titulo.toLowerCase().includes(q) ||
          c.remetenteNome.toLowerCase().includes(q),
      )
      .slice()
      .sort((a, b) => {
        const naoLidaDiff = (b.mensagensNaoLidas > 0 ? 1 : 0) - (a.mensagensNaoLidas > 0 ? 1 : 0);
        if (naoLidaDiff !== 0) return naoLidaDiff;
        return new Date(a.criadoEm).getTime() - new Date(b.criadoEm).getTime();
      });
  }, [conversas, statusTab, search]);

  const nAbertas = conversas.filter((c) => c.status === "ABERTA").length;
  const nFechadas = conversas.filter((c) => c.status === "FECHADA").length;

  useEffect(() => {
    mensagensEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [mensagens]);

  const marcarTodasComoLidaRef = useRef(marcarTodasComoLida.mutate);
  marcarTodasComoLidaRef.current = marcarTodasComoLida.mutate;

  const conversaId = selectedConversa?.id;
  useEffect(() => {
    if (conversaId && mensagens.length > 0 && !loadingMensagens) {
      marcarTodasComoLidaRef.current(conversaId);
    }
  }, [conversaId, mensagens.length, loadingMensagens]);

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
      title="Fale conosco"
      description="Fila de atendimento — responda as conversas de alunos e professores dirigidas à Secretaria."
    >
      <Box sx={{ mb: 2 }}>
        <SegmentedControl
          ariaLabel="Filtrar por status do atendimento"
          value={statusTab}
          onChange={setStatusTab}
          options={[
            { value: "ABERTA", label: `Abertas · ${nAbertas}` },
            { value: "FECHADA", label: `Fechadas · ${nFechadas}` },
          ]}
        />
      </Box>

      <Box
        sx={{
          display: "flex",
          gap: 2,
          height: { xs: "calc(100dvh - 260px)", md: "calc(100vh - 280px)" },
          minHeight: { xs: 420, md: 500 },
        }}
      >
        {/* Painel esquerdo — fila */}
        <Paper
          variant="outlined"
          sx={{
            width: { xs: "100%", md: 360 },
            flexShrink: 0,
            display: { xs: selectedConversa ? "none" : "flex", md: "flex" },
            flexDirection: "column",
            overflow: "hidden",
          }}
        >
          <Box sx={{ p: 2 }}>
            <TextField
              fullWidth
              size="small"
              placeholder="Buscar por assunto ou remetente..."
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
                  {statusTab === "ABERTA" ? "Nenhum atendimento pendente" : "Nenhuma conversa fechada"}
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
                    bgcolor: selectedConversa?.id === conversa.id ? "action.selected" : "transparent",
                    "&:hover": { bgcolor: "action.hover" },
                    display: "flex",
                    gap: 1.5,
                    alignItems: "flex-start",
                  }}
                >
                  <Avatar sx={{ width: 36, height: 36, bgcolor: "primary.light", mt: 0.3 }}>
                    {getRemetenteIcon(conversa.remetentePerfilNome)}
                  </Avatar>
                  <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <Typography
                        variant="body2"
                        fontWeight={conversa.mensagensNaoLidas > 0 ? 700 : 600}
                        noWrap
                        sx={{ flex: 1 }}
                      >
                        {conversa.titulo}
                      </Typography>
                      <Box sx={{ display: "flex", alignItems: "center", gap: 0.75, ml: 1, flexShrink: 0 }}>
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
                      {conversa.remetenteNome} ·{" "}
                      {PERFIL_DISPLAY_NAME[conversa.remetentePerfilNome] ?? conversa.remetentePerfilNome}
                    </Typography>
                  </Box>
                </Box>
                <Divider />
              </Box>
            ))}
          </Box>
        </Paper>

        {/* Painel direito — thread */}
        <Paper
          variant="outlined"
          sx={{
            flex: 1,
            display: { xs: selectedConversa ? "flex" : "none", md: "flex" },
            flexDirection: "column",
            overflow: "hidden",
            minWidth: 0,
          }}
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
                Escolha um atendimento na fila ao lado para responder.
              </Typography>
            </Box>
          ) : (
            <>
              <Box
                sx={{
                  px: { xs: 2, sm: 3 },
                  py: 2,
                  borderBottom: 1,
                  borderColor: "divider",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  gap: 1,
                }}
              >
                <Box sx={{ display: "flex", alignItems: "center", gap: 1, minWidth: 0 }}>
                  {isMobile && (
                    <IconButton
                      size="small"
                      aria-label="Voltar para a fila"
                      onClick={() => setSelectedConversa(null)}
                    >
                      <ArrowBackRounded fontSize="small" />
                    </IconButton>
                  )}
                  <Box sx={{ minWidth: 0 }}>
                    <Typography variant="subtitle1" fontWeight={600} noWrap>
                      {selectedConversa.titulo}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {selectedConversa.remetenteNome} ·{" "}
                      {PERFIL_DISPLAY_NAME[selectedConversa.remetentePerfilNome] ??
                        selectedConversa.remetentePerfilNome}
                    </Typography>
                  </Box>
                </Box>
                <Stack direction="row" spacing={1} alignItems="center">
                  <Chip
                    size="small"
                    label={selectedConversa.status === "ABERTA" ? "Aberta" : "Fechada"}
                    color={selectedConversa.status === "ABERTA" ? "success" : "default"}
                    variant="outlined"
                  />
                  {selectedConversa.status === "ABERTA" ? (
                    <Button
                      size="small"
                      variant="outlined"
                      color="error"
                      startIcon={<LockIcon />}
                      disabled={fecharConversa.isPending}
                      onClick={() =>
                        fecharConversa
                          .mutateAsync(selectedConversa.id)
                          .then(() =>
                            setSelectedConversa((prev) => (prev ? { ...prev, status: "FECHADA" } : null)),
                          )
                      }
                    >
                      Fechar
                    </Button>
                  ) : (
                    <Button
                      size="small"
                      variant="outlined"
                      color="primary"
                      disabled={reabrirConversa.isPending}
                      onClick={() =>
                        reabrirConversa
                          .mutateAsync(selectedConversa.id)
                          .then(() =>
                            setSelectedConversa((prev) => (prev ? { ...prev, status: "ABERTA" } : null)),
                          )
                      }
                    >
                      Reabrir
                    </Button>
                  )}
                </Stack>
              </Box>

              <Box sx={{ flex: 1, overflowY: "auto", px: { xs: 2, sm: 3 }, py: 2 }}>
                {loadingMensagens ? (
                  <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
                    <CircularProgress size={28} />
                  </Box>
                ) : (
                  <Stack spacing={2}>
                    {mensagens.map((msg) => {
                      const isOwn = msg.remetenteId === user?.dadosPessoaisId;
                      return (
                        <Box
                          key={msg.id}
                          sx={{ display: "flex", justifyContent: isOwn ? "flex-end" : "flex-start" }}
                        >
                          <Box
                            sx={{
                              maxWidth: { xs: "85%", sm: "70%" },
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
                            <Typography variant="body2" sx={{ color: isOwn ? "#fff" : "text.primary" }}>
                              {msg.conteudo}
                            </Typography>
                            <Typography
                              variant="caption"
                              display="block"
                              textAlign="right"
                              sx={{ mt: 0.5, color: isOwn ? "rgba(255,255,255,0.7)" : "text.secondary" }}
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

              {selectedConversa.status === "ABERTA" ? (
                <Box
                  sx={{
                    px: { xs: 2, sm: 3 },
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
                    placeholder="Digite sua resposta..."
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
              ) : (
                <Box
                  sx={{
                    px: { xs: 2, sm: 3 },
                    py: 2,
                    borderTop: 1,
                    borderColor: "divider",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 1.5,
                    bgcolor: "grey.50",
                  }}
                >
                  <LockIcon fontSize="small" color="disabled" />
                  <Typography variant="body2" color="text.secondary">
                    Esta conversa foi fechada
                  </Typography>
                  <Button
                    size="small"
                    variant="text"
                    disabled={reabrirConversa.isPending}
                    onClick={() =>
                      reabrirConversa
                        .mutateAsync(selectedConversa.id)
                        .then(() =>
                          setSelectedConversa((prev) => (prev ? { ...prev, status: "ABERTA" } : null)),
                        )
                    }
                  >
                    Reabrir
                  </Button>
                </Box>
              )}
            </>
          )}
        </Paper>
      </Box>
    </PageScaffold>
  );
}
