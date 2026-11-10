"use client";

import { useEffect, useState } from "react";
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControlLabel,
  FormHelperText,
  Switch,
  TextField,
} from "@mui/material";
import { useGrupoUsuarioMutations } from "@/hooks/useGrupoUsuarioMutations";
import { GrupoUsuarioDetalheResponse } from "@/services/domains/grupo-usuario";
import { nomeDoPerfil } from "../perfisDeGrupo";

interface EditarGrupoDialogProps {
  open: boolean;
  onClose: () => void;
  grupo: GrupoUsuarioDetalheResponse;
}

export default function EditarGrupoDialog({ open, onClose, grupo }: EditarGrupoDialogProps) {
  const { atualizar } = useGrupoUsuarioMutations();
  const [nome, setNome] = useState(grupo.nome);
  const [descricao, setDescricao] = useState(grupo.descricao ?? "");
  const [ativo, setAtivo] = useState(grupo.ativo);

  useEffect(() => {
    if (!open) return;
    setNome(grupo.nome);
    setDescricao(grupo.descricao ?? "");
    setAtivo(grupo.ativo);
  }, [open, grupo]);

  async function confirmar() {
    try {
      await atualizar.mutateAsync({
        id: grupo.id,
        dados: { nome: nome.trim(), descricao: descricao.trim() || null, ativo },
      });
      onClose();
    } catch {
      // O toast com o motivo já saiu no onError da mutação.
    }
  }

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Editar grupo</DialogTitle>
      <DialogContent sx={{ display: "flex", flexDirection: "column", gap: 2, pt: 1 }}>
        <TextField
          label="Perfil"
          value={nomeDoPerfil(grupo.perfil)}
          disabled
          helperText="O perfil não muda depois que o grupo é criado."
          sx={{ mt: 1 }}
        />
        <TextField
          label="Nome"
          value={nome}
          onChange={(e) => setNome(e.target.value)}
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
        <div>
          <FormControlLabel
            control={
              <Switch
                checked={ativo}
                onChange={(e) => setAtivo(e.target.checked)}
                disabled={grupo.padrao}
              />
            }
            label="Grupo ativo"
          />
          <FormHelperText>
            {grupo.padrao
              ? "O grupo padrão fica sempre ativo."
              : "Num grupo inativo, as pessoas deixam de receber estes acessos."}
          </FormHelperText>
        </div>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancelar</Button>
        <Button
          variant="contained"
          onClick={confirmar}
          disabled={!nome.trim() || atualizar.isPending}
        >
          {atualizar.isPending ? "Salvando..." : "Salvar"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
