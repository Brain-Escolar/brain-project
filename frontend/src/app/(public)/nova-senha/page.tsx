"use client";

import { Suspense, useEffect, useState } from "react";
import NextLink from "next/link";
import { Alert, Box, Button, CircularProgress, Paper, TextField, Typography } from "@mui/material";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import { usuarioApi } from "@/services/api";
import { useBrainSearchParams } from "@/hooks/useBrainSearchParams";
import { mensagemDeErro } from "@/hooks/useDocumentoMutations";
import { InformacaoLinkSenhaResponse } from "@/services/domains/usuario";

const TAMANHO_MINIMO = 8;

/**
 * Página pública do link de senha (docs/permissoes.md, D48): primeiro acesso
 * ou redefinição. A escola vem dentro do token, então o link funciona sem
 * mais nada na URL.
 */
function NovaSenhaContent() {
  const token = useBrainSearchParams("token");
  const [info, setInfo] = useState<InformacaoLinkSenhaResponse | null>(null);
  const [carregando, setCarregando] = useState(true);
  const [linkInvalido, setLinkInvalido] = useState<string | null>(null);
  const [senha, setSenha] = useState("");
  const [confirmacao, setConfirmacao] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const [concluido, setConcluido] = useState(false);

  useEffect(() => {
    if (!token) {
      setLinkInvalido("Link incompleto. Abra o link do e-mail de novo.");
      setCarregando(false);
      return;
    }
    usuarioApi
      .informacaoLinkSenha(token)
      .then(setInfo)
      .catch((error) =>
        setLinkInvalido(mensagemDeErro(error, "Este link é inválido ou expirou. Peça um novo.")),
      )
      .finally(() => setCarregando(false));
  }, [token]);

  const curta = senha.length > 0 && senha.length < TAMANHO_MINIMO;
  const diferentes = confirmacao.length > 0 && senha !== confirmacao;

  async function salvar(e: React.FormEvent) {
    e.preventDefault();
    if (!token || curta || diferentes) return;
    setErro(null);
    try {
      setEnviando(true);
      await usuarioApi.definirSenha({ token, novaSenha: senha, novaSenhaConfirmacao: confirmacao });
      setConcluido(true);
    } catch (error) {
      setErro(mensagemDeErro(error, "Não foi possível salvar a senha."));
    } finally {
      setEnviando(false);
    }
  }

  const primeiroAcesso = info?.finalidade === "DEFINIR";

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 2,
        backgroundColor: "#f5f5f5",
      }}
    >
      <Paper elevation={3} sx={{ padding: { xs: 3, sm: 4 }, maxWidth: 440, width: "100%" }}>
        {carregando && (
          <Box display="flex" justifyContent="center" py={4}>
            <CircularProgress />
          </Box>
        )}

        {!carregando && linkInvalido && (
          <Box display="flex" flexDirection="column" gap={2}>
            <Typography variant="h5" component="h1">
              Link indisponível
            </Typography>
            <Alert severity="error">{linkInvalido}</Alert>
            <Typography variant="body2" color="text.secondary">
              Na tela de login, use &quot;Esqueci a senha&quot; para receber um link novo, ou peça à
              secretaria.
            </Typography>
            <Button component={NextLink} href="/login" variant="contained">
              Ir para o login
            </Button>
          </Box>
        )}

        {!carregando && info && concluido && (
          <Box display="flex" flexDirection="column" alignItems="center" gap={2} textAlign="center">
            <CheckCircleIcon sx={{ fontSize: 64, color: "success.main" }} />
            <Typography variant="h5" component="h1">
              Senha salva
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Agora é só entrar com o login <strong>{info.login}</strong> e a senha nova.
            </Typography>
            <Button component={NextLink} href="/login" variant="contained" fullWidth>
              Ir para o login
            </Button>
          </Box>
        )}

        {!carregando && info && !concluido && (
          <form onSubmit={salvar}>
            <Typography variant="h5" component="h1" gutterBottom>
              {primeiroAcesso ? "Defina sua senha" : "Crie uma senha nova"}
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Olá, {info.nome}. Seu login é <strong>{info.login}</strong>.
            </Typography>
            <TextField
              fullWidth
              margin="normal"
              type="password"
              label="Senha nova"
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
              error={curta}
              helperText={`Pelo menos ${TAMANHO_MINIMO} caracteres.`}
              autoComplete="new-password"
              required
              autoFocus
            />
            <TextField
              fullWidth
              margin="normal"
              type="password"
              label="Repita a senha"
              value={confirmacao}
              onChange={(e) => setConfirmacao(e.target.value)}
              error={diferentes}
              helperText={diferentes ? "As senhas não coincidem." : " "}
              autoComplete="new-password"
              required
            />
            {erro && (
              <Alert severity="error" sx={{ mt: 1 }}>
                {erro}
              </Alert>
            )}
            <Button
              type="submit"
              variant="contained"
              fullWidth
              size="large"
              sx={{ mt: 2 }}
              disabled={enviando || !senha || !confirmacao || curta || diferentes}
            >
              {enviando ? "Salvando..." : "Salvar senha"}
            </Button>
          </form>
        )}
      </Paper>
    </Box>
  );
}

export default function NovaSenhaPage() {
  return (
    <Suspense
      fallback={
        <Box
          sx={{
            minHeight: "100vh",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <CircularProgress />
        </Box>
      }
    >
      <NovaSenhaContent />
    </Suspense>
  );
}
