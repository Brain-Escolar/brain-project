"use client";

import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
} from "@mui/material";
import { useRouter } from "next/navigation";
import { RoutesEnum } from "@/enums";

interface AvisoCadastroIncompletoDialogProps {
  open: boolean;
  onClose: () => void;
  alunoId: number;
}

export default function AvisoCadastroIncompletoDialog({
  open,
  onClose,
  alunoId,
}: AvisoCadastroIncompletoDialogProps) {
  const router = useRouter();

  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
      <DialogTitle>Cadastro incompleto</DialogTitle>
      <DialogContent>
        <DialogContentText>
          Este aluno foi movido para matriculado, mas o cadastro ainda está com dados
          pendentes (CPF, data de nascimento, endereço, telefone ou responsável financeiro).
          Você pode completar agora ou seguir sem preencher.
        </DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Seguir sem preencher</Button>
        <Button
          variant="contained"
          onClick={() => {
            onClose();
            router.push(`${RoutesEnum.ALUNO_CADASTRO}?id=${alunoId}`);
          }}
        >
          Completar cadastro agora
        </Button>
      </DialogActions>
    </Dialog>
  );
}
