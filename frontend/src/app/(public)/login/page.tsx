"use client";
import { GoogleIcon } from "@/components/GoogleIcon";
import { useGoogleLogin } from "@/hooks/useGoogleLogin";
import { loginApi } from "@/services/api";
import { setAccessToken } from "@/utils/auth";
import {
  Button,
  Checkbox,
  CircularProgress,
  Divider,
  FormControlLabel,
  InputAdornment,
  TextField,
} from "@mui/material";
import ArrowForwardRounded from "@mui/icons-material/ArrowForwardRounded";
import LockOutlined from "@mui/icons-material/LockOutlined";
import MailOutlineRounded from "@mui/icons-material/MailOutlineRounded";
import Cookies from "js-cookie";
import { useTheme } from "next-themes";
import { useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import { toast } from "react-toastify";
import * as S from "./styles";

/** Painel da marca (esquerda) — wordmark, pitch e mascote Brainy. */
function BrandAside() {
  return (
    <S.Aside>
      <S.AsideLogo src="/brand/logo/brain-wordmark-branco.svg" alt="Brain" />
      <S.Pitch>
        <h2>A gestão escolar inteligente da sua instituição.</h2>
        <p>
          Acompanhe desempenho, frequência e comunicação — tudo em um só lugar,
          todos os dias.
        </p>
      </S.Pitch>
      <S.AsideFoot>© 2026 Brain · Gestão Escolar</S.AsideFoot>
      <S.Mascot src="/brand/brainy/brainy-front-rgb.png" alt="" aria-hidden />
    </S.Aside>
  );
}

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

  async function onSubmitLogin(e: React.FormEvent) {
    e.preventDefault();
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
            redirectPath = "/aluno";
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

  const disabled = isLoading || googleLoading;

  return (
    <S.LoginWrapper>
      <BrandAside />

      <S.Main>
        <S.FormBox>
          <div>
            <h1>Bem-vindo de volta</h1>
            <p className="lede">Entre com sua conta institucional para continuar.</p>
          </div>

          <form onSubmit={onSubmitLogin}>
            <TextField
              fullWidth
              label="E-mail"
              type="email"
              margin="normal"
              variant="outlined"
              placeholder="seu.email@escola.edu.br"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={disabled}
              slotProps={{
                input: {
                  startAdornment: (
                    <InputAdornment position="start">
                      <MailOutlineRounded fontSize="small" />
                    </InputAdornment>
                  ),
                },
              }}
            />
            <TextField
              fullWidth
              label="Senha"
              type="password"
              margin="normal"
              variant="outlined"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={disabled}
              slotProps={{
                input: {
                  startAdornment: (
                    <InputAdornment position="start">
                      <LockOutlined fontSize="small" />
                    </InputAdornment>
                  ),
                },
              }}
            />

            <S.Row>
              <FormControlLabel
                control={<Checkbox size="small" defaultChecked disabled={disabled} />}
                label="Manter conectada"
                slotProps={{ typography: { fontSize: "0.833rem" } }}
              />
              <S.MiniLink type="button">Esqueci a senha</S.MiniLink>
            </S.Row>

            <Button
              type="submit"
              variant="contained"
              fullWidth
              size="large"
              endIcon={!disabled && <ArrowForwardRounded />}
              sx={{ borderRadius: "10px", py: 1.25 }}
              disabled={disabled}
            >
              {isLoading ? <CircularProgress size={22} color="inherit" /> : "Entrar"}
            </Button>
          </form>

          <Divider sx={{ fontSize: "0.833rem", color: "text.secondary" }}>ou</Divider>

          <Button
            onClick={onGoogleLogin}
            variant="outlined"
            fullWidth
            size="large"
            sx={{
              borderRadius: "10px",
              border: "1px solid #dadce0",
              color: "#3c4043",
              backgroundColor: "transparent",
              textTransform: "none",
              fontSize: ".9rem",
              gap: 1,
              "&:hover": {
                backgroundColor: "#f7f8f8",
                border: "1px solid #dadce0",
              },
            }}
            disabled={disabled}
          >
            <GoogleIcon size={20} />
            Continuar com Google
          </Button>
        </S.FormBox>
      </S.Main>
    </S.LoginWrapper>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <S.LoginWrapper>
          <BrandAside />
          <S.Main>
            <CircularProgress />
          </S.Main>
        </S.LoginWrapper>
      }
    >
      <LoginContent />
    </Suspense>
  );
}
