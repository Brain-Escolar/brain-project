"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  TextField,
} from "@mui/material";
import { RoutesEnum } from "@/enums";
import { useGrupoUsuarioMutations } from "@/hooks/useGrupoUsuarioMutations";
import { GrupoUsuarioDetalheResponse } from "@/services/domains/grupo-usuario";

interface DuplicarGrupoDialogProps {
  open: boolean;
  onClose: () => void;
  grupo: GrupoUsuarioDetalheResponse;
}

/** Jeito rápido de montar um grupo restrito: duplicar o padrão e desmarcar o que sobra. */
export default function DuplicarGrupoDialog({ open, onClose, grupo }: DuplicarGrupoDialogProps) {
  const router = useRouter();
  const { duplicar } = useGrupoUsuarioMutations();
  const [nome, setNome] = useState("");

  useEffect(() => {
    if (open) setNome(`${grupo.nome} (cópia)`.slice(0, 100));
  }, [open, grupo.nome]);

  async function confirmar() {
    try {
      const copia = await duplicar.mutateAsync({ id: grupo.id, dados: { nome: nome.trim() } });
      onClose();
      router.push(`${RoutesEnum.GRUPOS_USUARIOS}/${copia.id}`);
    } catch {
      // O toast com o motivo já saiu no onError da mutação.
    }
  }

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Duplicar grupo</DialogTitle>
      <DialogContent sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
        <DialogContentText>
          O novo grupo copia as telas e os controles de {grupo.nome}. As pessoas não vão junto.
        </DialogContentText>
        <TextField
          label="Nome do novo grupo"
          value={nome}
          onChange={(e) => setNome(e.target.value)}
          slotProps={{ htmlInput: { maxLength: 100 } }}
          autoFocus
          required
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancelar</Button>
        <Button
          variant="contained"
          onClick={confirmar}
          disabled={!nome.trim() || duplicar.isPending}
        >
          {duplicar.isPending ? "Duplicando..." : "Duplicar"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
