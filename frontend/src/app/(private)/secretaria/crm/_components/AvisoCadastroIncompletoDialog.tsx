"use client";

import { useState } from "react";
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
} from "@mui/material";
import { useRouter } from "next/navigation";
import DocumentacaoAlunoDialog from "@/components/documentacao/DocumentacaoAlunoDialog";
import { RoutesEnum } from "@/enums";

interface AvisoCadastroIncompletoDialogProps {
  open: boolean;
  onClose: () => void;
  alunoId: number;
  alunoNome?: string;
  dadosCompletos: boolean;
  documentacaoCompleta: boolean;
}

export default function AvisoCadastroIncompletoDialog({
  open,
  onClose,
  alunoId,
  alunoNome,
  dadosCompletos,
  documentacaoCompleta,
}: AvisoCadastroIncompletoDialogProps) {
  const router = useRouter();
  const [documentosAbertos, setDocumentosAbertos] = useState(false);

  return (
    <>
      <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
        <DialogTitle>Cadastro incompleto</DialogTitle>
        <DialogContent>
          <DialogContentText component="div">
            Este aluno foi movido para matriculado, mas ainda há pendências:
            <Box component="ul" sx={{ my: 1, pl: 2.5 }}>
              {!dadosCompletos && (
                <li>
                  dados do cadastro (CPF, data de nascimento, endereço, telefone ou responsável
                  financeiro);
                </li>
              )}
              {!documentacaoCompleta && (
                <li>documentos obrigatórios do aluno ou do responsável financeiro.</li>
              )}
            </Box>
            Você pode resolver agora ou seguir sem preencher.
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ flexWrap: "wrap", gap: 1 }}>
          <Button onClick={onClose}>Seguir sem preencher</Button>
          {!documentacaoCompleta && (
            <Button
              variant={dadosCompletos ? "contained" : "outlined"}
              onClick={() => setDocumentosAbertos(true)}
            >
              Ver documentos
            </Button>
          )}
          {!dadosCompletos && (
            <Button
              variant="contained"
              onClick={() => {
                onClose();
                router.push(`${RoutesEnum.ALUNO_CADASTRO}?id=${alunoId}`);
              }}
            >
              Completar cadastro agora
            </Button>
          )}
        </DialogActions>
      </Dialog>

      <DocumentacaoAlunoDialog
        open={documentosAbertos}
        alunoId={alunoId}
        alunoNome={alunoNome}
        onClose={() => {
          setDocumentosAbertos(false);
          onClose();
        }}
      />
    </>
  );
}
