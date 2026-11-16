"use client";

import { useEffect, useState } from "react";
import {
  Alert,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  MenuItem,
  TextField,
} from "@mui/material";
import { usuarioApi } from "@/services/api";
import { EscolaLoginResponse } from "@/services/domains/escola/response";

interface EsqueciSenhaDialogProps {
  open: boolean;
  onClose: () => void;
  emailInicial: string;
  codigoEscola: string;
  escolas: EscolaLoginResponse[];
}

/**
 * "Esqueci a senha" (docs/permissoes.md, D48). O link vai para o e-mail
 * pessoal do cadastro, e a resposta é a mesma exista ou não o login, para a
 * tela não revelar quem tem conta.
 */
export default function EsqueciSenhaDialog({
  open,
  onClose,
  emailInicial,
  codigoEscola,
  escolas,
}: EsqueciSenhaDialogProps) {
  const [email, setEmail] = useState(emailInicial);
  const [escola, setEscola] = useState(codigoEscola);
  const [enviando, setEnviando] = useState(false);
  const [enviado, setEnviado] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  useEffect(() => {
    if (open) {
      setEmail(emailInicial);
      setEscola(codigoEscola);
      setEnviado(false);
      setErro(null);
    }
  }, [open, emailInicial, codigoEscola]);

  async function enviar(e: React.FormEvent) {
    e.preventDefault();
    setErro(null);
    try {
      setEnviando(true);
      await usuarioApi.esqueciSenha({ email: email.trim(), codigoEscola: escola });
      setEnviado(true);
    } catch {
      setErro("Não foi possível enviar agora. Confira a escola e tente de novo.");
    } finally {
      setEnviando(false);
    }
  }

  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
      <form onSubmit={enviar}>
        <DialogTitle>Esqueci a senha</DialogTitle>
        <DialogContent>
          {enviado ? (
            <Alert severity="success">
              Se houver um login com esse e-mail nesta escola, enviamos um link para o e-mail
              pessoal cadastrado. O link vale por 1 hora. Se não chegar, confira a caixa de spam ou
              fale com a secretaria.
            </Alert>
          ) : (
            <>
              <DialogContentText sx={{ mb: 2 }}>
                Informe o e-mail que você usa para entrar. Enviaremos um link para criar uma senha
                nova.
              </DialogContentText>
              <TextField
                select
                fullWidth
                margin="dense"
                label="Escola"
                value={escola}
                onChange={(e) => setEscola(e.target.value)}
                required
              >
                {escolas.map((item) => (
                  <MenuItem key={item.codigo} value={item.codigo}>
                    {item.nome}
                  </MenuItem>
                ))}
              </TextField>
              <TextField
                fullWidth
                margin="dense"
                label="E-mail de login"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoFocus
              />
              {erro && (
                <Alert severity="error" sx={{ mt: 2 }}>
                  {erro}
                </Alert>
              )}
            </>
          )}
        </DialogContent>
        <DialogActions>
          {enviado ? (
            <Button variant="contained" onClick={onClose}>
              Voltar ao login
            </Button>
          ) : (
            <>
              <Button variant="outlined" onClick={onClose}>
                Cancelar
              </Button>
              <Button
                type="submit"
                variant="contained"
                disabled={enviando || !email.trim() || !escola}
              >
                {enviando ? "Enviando..." : "Enviar link"}
              </Button>
            </>
          )}
        </DialogActions>
      </form>
    </Dialog>
  );
}
