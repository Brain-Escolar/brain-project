"use client";

import { useRouter } from "next/navigation";
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
} from "@mui/material";
import { RoutesEnum } from "@/enums";
import { useGrupoUsuarioMutations } from "@/hooks/useGrupoUsuarioMutations";
import { GrupoUsuarioDetalheResponse } from "@/services/domains/grupo-usuario";
import { nomeDoPerfil } from "../perfisDeGrupo";

interface ExcluirGrupoDialogProps {
  open: boolean;
  onClose: () => void;
  grupo: GrupoUsuarioDetalheResponse;
}

export default function ExcluirGrupoDialog({ open, onClose, grupo }: ExcluirGrupoDialogProps) {
  const router = useRouter();
  const { excluir } = useGrupoUsuarioMutations();
  const saida =
    grupo.quantidadeMembros === 1
      ? "A única pessoa do grupo deixa de fazer parte dele."
      : `As ${grupo.quantidadeMembros} pessoas do grupo deixam de fazer parte dele.`;

  async function confirmar() {
    try {
      await excluir.mutateAsync(grupo.id);
      onClose();
      router.push(RoutesEnum.GRUPOS_USUARIOS);
    } catch {
      // O toast com o motivo já saiu no onError da mutação.
    }
  }

  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
      <DialogTitle>Excluir {grupo.nome}?</DialogTitle>
      <DialogContent>
        <DialogContentText>
          {grupo.quantidadeMembros > 0 && (
            <>
              {saida} Quem não estiver em outro grupo do perfil {nomeDoPerfil(grupo.perfil)} ficará
              sem as telas desse perfil quando os acessos entrarem em vigor.{" "}
            </>
          )}
          A exclusão fica registrada no histórico.
        </DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancelar</Button>
        <Button color="error" variant="contained" onClick={confirmar} disabled={excluir.isPending}>
          {excluir.isPending ? "Excluindo..." : "Excluir"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
