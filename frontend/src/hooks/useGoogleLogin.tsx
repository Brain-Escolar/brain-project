import { useState } from "react";
import { loginGoogleApi } from "@/services/api";
import { toast } from "react-toastify";
import { setAccessToken } from "@/utils/auth";
import Cookies from "js-cookie";

interface UseGoogleLoginReturn {
  isLoading: boolean;
  loginWithGoogle: () => Promise<void>;
  handleGoogleCallback: (code: string, scope?: string) => Promise<string>; // Retorna a rota de redirecionamento
}

export function useGoogleLogin(): UseGoogleLoginReturn {
  const [isLoading, setIsLoading] = useState(false);

  const loginWithGoogle = async (): Promise<void> => {
    try {
      setIsLoading(true);
      await loginGoogleApi.loginGoogle();
    } catch (error) {
      console.error("Erro ao iniciar login com Google:", error);
      toast.error("Erro ao conectar com Google");
      setIsLoading(false);
    }
  };

  const handleGoogleCallback = async (code: string, scope?: string): Promise<string> => {
    try {
      setIsLoading(true);

      const response = await loginGoogleApi.loginGoogleAutorizado({ code, scope });

      if (!response || !response.tokenAcesso || !response.refreshToken) {
        throw new Error("Resposta inválida do servidor");
      }

      // Salva os tokens
      Cookies.set("token", response.tokenAcesso);
      Cookies.set("refreshToken", response.refreshToken);
      setAccessToken(response.tokenAcesso);

      try {
        // Decodifica o token para obter o role
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

        toast.success("Login com Google realizado com sucesso!");
        return redirectPath;
      } catch (decodeError) {
        console.error("Erro ao decodificar token:", decodeError);
        toast.success("Login com Google realizado com sucesso!");
        return "/";
      }
    } catch (error) {
      console.error("Erro no login com Google:", error);
      const messageError =
        error instanceof Error ? error.message : "Erro desconhecido no login com Google";
      toast.error(messageError);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    isLoading,
    loginWithGoogle,
    handleGoogleCallback,
  };
}
