"use client";
import { Suspense, useEffect, useState } from "react";
import { Typography, Paper, CircularProgress, Box } from "@mui/material";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import ErrorIcon from "@mui/icons-material/Error";
import { usuarioApi } from "@/services/api";
import { useBrainSearchParams } from "@/hooks/useBrainSearchParams";

function VerificarContaContent() {
  const codigo = useBrainSearchParams("codigo");
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [mensagem, setMensagem] = useState("");

  useEffect(() => {
    const verificarConta = async () => {
      try {
        if (!codigo) {
          setStatus("error");
          setMensagem("Código de verificação é obrigatório");
          return;
        }

        // Chama o service que fará a requisição para o backend
        const response = await usuarioApi.verificarConta({ codigo });

        if (response.sucesso) {
          setStatus("success");
          setMensagem(response.mensagem || "Conta verificada com sucesso!");
        } else {
          setStatus("error");
          setMensagem(response.mensagem || "Erro na verificação de conta");
        }
      } catch (error) {
        console.error("Erro na verificação de conta:", error);
        setStatus("error");

        // Trata diferentes tipos de erro
        if (error && typeof error === "object" && "response" in error) {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const apiError = error as any;
          const message = apiError.response?.data?.mensagem || "Erro na verificação de conta";
          setMensagem(message);
        } else {
          setMensagem(`Erro interno do servidor ${error}`);
        }
      }
    };

    verificarConta();
  }, [codigo]);

  const renderContent = () => {
    switch (status) {
      case "loading":
        return (
          <Box display="flex" flexDirection="column" alignItems="center" gap={2}>
            <CircularProgress size={60} />
            <Typography variant="h6" color="textSecondary">
              Verificando sua conta...
            </Typography>
          </Box>
        );

      case "success":
        return (
          <Box display="flex" flexDirection="column" alignItems="center" gap={2}>
            <CheckCircleIcon sx={{ fontSize: 80, color: "success.main" }} />
            <Typography variant="h5" color="success.main" textAlign="center">
              Conta Verificada!
            </Typography>
            <Typography variant="body1" color="textSecondary" textAlign="center">
              {mensagem}
            </Typography>
            <Typography variant="body2" color="textSecondary" textAlign="center">
              Você pode fechar esta janela e fazer login na sua conta.
            </Typography>
          </Box>
        );

      case "error":
        return (
          <Box display="flex" flexDirection="column" alignItems="center" gap={2}>
            <ErrorIcon sx={{ fontSize: 80, color: "error.main" }} />
            <Typography variant="h5" color="error.main" textAlign="center">
              Erro na Verificação
            </Typography>
            <Typography variant="body2" color="textSecondary" textAlign="center">
              {mensagem}
            </Typography>
          </Box>
        );

      default:
        return null;
    }
  };

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
      <Paper
        elevation={3}
        sx={{
          padding: 4,
          maxWidth: 500,
          width: "100%",
          textAlign: "center",
        }}
      >
        {renderContent()}
      </Paper>
    </Box>
  );
}

export default function VerificarContaPage() {
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
          <CircularProgress size={60} />
        </Box>
      }
    >
      <VerificarContaContent />
    </Suspense>
  );
}
