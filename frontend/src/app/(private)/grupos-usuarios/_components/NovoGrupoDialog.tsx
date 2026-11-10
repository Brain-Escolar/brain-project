"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Alert,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  MenuItem,
  TextField,
} from "@mui/material";
import { RoutesEnum } from "@/enums";
import { PerfilNomeEnum } from "@/enums/PerfilNomeEnum";
import { useGrupoUsuarioMutations } from "@/hooks/useGrupoUsuarioMutations";
import { PERFIS_COM_GRUPO, nomeDoPerfil } from "../perfisDeGrupo";

interface NovoGrupoDialogProps {
  open: boolean;
  onClose: () => void;
  /** Perfil já escolhido no filtro da lista, se houver. */
  perfilInicial: PerfilNomeEnum | null;
}

export default function NovoGrupoDialog({ open, onClose, perfilInicial }: NovoGrupoDialogProps) {
  const router = useRouter();
  const { criar } = useGrupoUsuarioMutations();
  const [perfil, setPerfil] = useState<PerfilNomeEnum | "">("");
  const [nome, setNome] = useState("");
  const [descricao, setDescricao] = useState("");

  useEffect(() => {
    if (!open) return;
    setPerfil(perfilInicial ?? "");
    setNome("");
    setDescricao("");
  }, [open, perfilInicial]);

  async function confirmar() {
    if (!perfil) return;
    try {
      const grupo = await criar.mutateAsync({
        perfil,
        nome: nome.trim(),
        descricao: descricao.trim() || undefined,
      });
      onClose();
      router.push(`${RoutesEnum.GRUPOS_USUARIOS}/${grupo.id}`);
    } catch {
      // O toast com o motivo já saiu no onError da mutação.
    }
  }

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Novo grupo de acesso</DialogTitle>
      <DialogContent sx={{ display: "flex", flexDirection: "column", gap: 2, pt: 1 }}>
        <Alert severity="info" sx={{ mt: 1 }}>
          O grupo nasce sem acessos. Depois de criar, marque as telas e adicione as pessoas.
        </Alert>
        <TextField
          select
          label="Perfil"
          value={perfil}
          onChange={(e) => setPerfil(e.target.value as PerfilNomeEnum)}
          helperText="Só pessoas com este perfil entram no grupo. Não muda depois de criado."
          required
        >
          {PERFIS_COM_GRUPO.map((opcao) => (
            <MenuItem key={opcao} value={opcao}>
              {nomeDoPerfil(opcao)}
            </MenuItem>
          ))}
        </TextField>
        <TextField
          label="Nome"
          value={nome}
          onChange={(e) => setNome(e.target.value)}
          placeholder="Ex.: Secretaria — só documentos"
          slotProps={{ htmlInput: { maxLength: 100 } }}
          required
        />
        <TextField
          label="Descrição"
          value={descricao}
          onChange={(e) => setDescricao(e.target.value)}
          multiline
          minRows={2}
          slotProps={{ htmlInput: { maxLength: 255 } }}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancelar</Button>
        <Button
          variant="contained"
          onClick={confirmar}
          disabled={!perfil || !nome.trim() || criar.isPending}
        >
          {criar.isPending ? "Criando..." : "Criar grupo"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
