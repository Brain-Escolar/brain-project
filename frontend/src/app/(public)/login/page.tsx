"use client";
import { GoogleIcon } from "@/components/GoogleIcon";
import { useGoogleLogin } from "@/hooks/useGoogleLogin";
import { loginApi } from "@/services/api";
import { setAccessToken } from "@/utils/auth";
import { Button, CircularProgress, Divider, Paper, TextField, Typography } from "@mui/material";
import Cookies from "js-cookie";
import { useTheme } from "next-themes";
import { useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import { toast } from "react-toastify";
import * as S from "./styles";

function LoginContent() {
  const { setTheme } = useTheme();
  const searchParams = useSearchParams();
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { loginWithGoogle, isLoading: googleLoading } = useGoogleLogin();

  const codigoEscola = searchParams.get("codigoEscola") || "sigma";

  useEffect(() => {
    setTheme("light");
  }, [setTheme]);

  async function onSubmitLogin() {
    try {
      setIsLoading(true);
      const response = await loginApi.login({
        email,
        senha: password,
        codigoEscola,
      });

      if (!response || !response.tokenAcesso || !response.refreshToken) {
        throw new Error("Credenciais inválidas");
      }

      Cookies.set("token", response.tokenAcesso);
      Cookies.set("refreshToken", response.refreshToken);

      // Salva também no localStorage para as requisições automáticas
      setAccessToken(response.tokenAcesso);

      try {
        const base64Url = response.tokenAcesso.split(".")[1];
        const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
        const jsonPayload = decodeURIComponent(
          atob(base64)
            .split("")
            .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
            .join(""),
        );

        const payload = JSON.parse(jsonPayload);
        const role = payload.role.replace(/[\[\]]/g, ""); // Remove os colchetes

        let redirectPath = "/";
        switch (role) {
          case "ESTUDANTE":
            redirectPath = "/aluno";
            break;
          case "PROFESSOR":
            redirectPath = "/";
            break;
          case "ADMIN":
            redirectPath = "/admin";
            break;
        }

        toast.success("Login realizado com sucesso!");

        window.location.href = redirectPath;
      } catch (decodeError) {
        console.log("Erro ao decodificar token:", decodeError);
        toast.success("Login realizado com sucesso!");
        window.location.href = "/";
      }
    } catch (error) {
      if (error instanceof Error) {
        console.log("message", error.message);
        toast.error(error.message);
        return;
      }

      console.log("Erro ao realizar login:", error);
      const messageError = "Credenciais inválidas";
      toast.error(messageError);
    } finally {
      setIsLoading(false);
    }
  }

  async function onGoogleLogin() {
    await loginWithGoogle();
  }

  return (
    <S.LoginWrapper>
      <Paper elevation={6}>
        <S.FormBox>
          <Typography variant="h5" component="h1" gutterBottom>
            Brain
          </Typography>

          <TextField
            fullWidth
            label="Email"
            type="email"
            margin="normal"
            variant="outlined"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={isLoading || googleLoading}
          />
          <TextField
            fullWidth
            label="Password"
            type="password"
            margin="normal"
            variant="outlined"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={isLoading || googleLoading}
          />

          <Button
            onClick={onSubmitLogin}
            variant="contained"
            fullWidth
            size="large"
            sx={{ mt: 2, borderRadius: "8px" }}
            disabled={isLoading || googleLoading}
          >
            Login
          </Button>

          <Divider sx={{ my: 2 }}>ou</Divider>

          <Button
            onClick={onGoogleLogin}
            variant="outlined"
            fullWidth
            size="large"
            sx={{
              borderRadius: "20px",
              border: " 1px solid #dadce0",
              color: "#3c4043",
              backgroundColor: "transparent",
              textTransform: "none",
              fontSize: ".8rem",
              gap: 1,
              "&:hover": {
                backgroundColor: "#f7f8f8",
              },
            }}
            disabled={isLoading || googleLoading}
          >
            <GoogleIcon size={20} />
            Continuar com Google
          </Button>
        </S.FormBox>
      </Paper>
    </S.LoginWrapper>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <S.LoginWrapper>
          <Paper elevation={6}>
            <S.FormBox>
              <CircularProgress />
            </S.FormBox>
          </Paper>
        </S.LoginWrapper>
      }
    >
      <LoginContent />
    </Suspense>
  );
}
