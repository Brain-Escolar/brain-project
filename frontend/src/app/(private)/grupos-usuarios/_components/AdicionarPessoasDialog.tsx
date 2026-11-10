"use client";

import { useEffect, useState } from "react";
import {
  Alert,
  Box,
  Button,
  Checkbox,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  InputAdornment,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Skeleton,
  TablePagination,
  TextField,
  Typography,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import { useDebouncedValue } from "@/hooks/useDebouncedValue";
import { usePessoasDoGrupo } from "@/hooks/useGruposUsuarios";
import { useGrupoUsuarioMutations } from "@/hooks/useGrupoUsuarioMutations";
import { GrupoUsuarioDetalheResponse, PessoaGrupoResponse } from "@/services/domains/grupo-usuario";
import { nomeDoPerfil } from "../perfisDeGrupo";

const TAMANHO_PAGINA = 10;

interface AdicionarPessoasDialogProps {
  open: boolean;
  onClose: () => void;
  grupo: GrupoUsuarioDetalheResponse;
}

export default function AdicionarPessoasDialog({
  open,
  onClose,
  grupo,
}: AdicionarPessoasDialogProps) {
  const [busca, setBusca] = useState("");
  const buscaAplicada = useDebouncedValue(busca.trim(), 400);
  const [pagina, setPagina] = useState(0);
  // Map para a seleção sobreviver à troca de página e de busca.
  const [selecionadas, setSelecionadas] = useState<Map<number, PessoaGrupoResponse>>(new Map());
  const { adicionarMembros } = useGrupoUsuarioMutations();

  const { pessoas, total, loading, atualizando, error } = usePessoasDoGrupo({
    grupoId: grupo.id,
    tipo: "candidatos",
    busca: buscaAplicada,
    page: pagina,
    size: TAMANHO_PAGINA,
    enabled: open,
  });

  useEffect(() => {
    if (!open) return;
    setBusca("");
    setPagina(0);
    setSelecionadas(new Map());
  }, [open]);

  useEffect(() => setPagina(0), [buscaAplicada]);

  function alternar(pessoa: PessoaGrupoResponse) {
    setSelecionadas((atuais) => {
      const proximas = new Map(atuais);
      if (proximas.has(pessoa.dadosPessoaisId)) proximas.delete(pessoa.dadosPessoaisId);
      else proximas.set(pessoa.dadosPessoaisId, pessoa);
      return proximas;
    });
  }

  async function confirmar() {
    try {
      await adicionarMembros.mutateAsync({
        id: grupo.id,
        dadosPessoaisIds: [...selecionadas.keys()],
      });
      onClose();
    } catch {
      // O toast com o motivo já saiu no onError da mutação.
    }
  }

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Adicionar pessoas a {grupo.nome}</DialogTitle>
      <DialogContent sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
        <Typography variant="body2" color="text.secondary">
          Aparecem as pessoas com acesso ao sistema que têm o perfil {nomeDoPerfil(grupo.perfil)} e
          ainda não estão no grupo.
        </Typography>
        <TextField
          size="small"
          placeholder="Buscar por nome ou e-mail"
          value={busca}
          onChange={(e) => setBusca(e.target.value)}
          autoFocus
          slotProps={{
            input: {
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon fontSize="small" />
                </InputAdornment>
              ),
            },
            htmlInput: { "aria-label": "Buscar pessoas para adicionar" },
          }}
        />

        {error && <Alert severity="error">{error}</Alert>}

        {loading ? (
          <Skeleton variant="rounded" height={280} />
        ) : pessoas.length === 0 ? (
          <Typography variant="body2" color="text.secondary" sx={{ py: 2 }}>
            {buscaAplicada
              ? `Ninguém encontrado para "${buscaAplicada}".`
              : "Todas as pessoas com este perfil já estão no grupo."}
          </Typography>
        ) : (
          <Box>
            <List
              dense
              disablePadding
              aria-busy={atualizando}
              sx={{ opacity: atualizando ? 0.6 : 1, transition: "opacity 150ms" }}
            >
              {pessoas.map((pessoa) => {
                const marcada = selecionadas.has(pessoa.dadosPessoaisId);
                return (
                  <ListItemButton key={pessoa.dadosPessoaisId} onClick={() => alternar(pessoa)}>
                    <ListItemIcon sx={{ minWidth: 40 }}>
                      <Checkbox
                        edge="start"
                        checked={marcada}
                        tabIndex={-1}
                        disableRipple
                        slotProps={{ input: { "aria-label": pessoa.nome } }}
                      />
                    </ListItemIcon>
                    <ListItemText primary={pessoa.nome} secondary={pessoa.email} />
                  </ListItemButton>
                );
              })}
            </List>
            <TablePagination
              component="div"
              count={total}
              page={pagina}
              onPageChange={(_, nova) => setPagina(nova)}
              rowsPerPage={TAMANHO_PAGINA}
              rowsPerPageOptions={[]}
              labelDisplayedRows={({ from, to, count }) => `${from}–${to} de ${count}`}
            />
          </Box>
        )}
      </DialogContent>
      <DialogActions sx={{ justifyContent: "space-between", px: 3 }}>
        <Typography variant="body2" color="text.secondary">
          {selecionadas.size === 1 ? "1 selecionada" : `${selecionadas.size} selecionadas`}
        </Typography>
        <Box sx={{ display: "flex", gap: 1 }}>
          <Button onClick={onClose}>Cancelar</Button>
          <Button
            variant="contained"
            onClick={confirmar}
            disabled={selecionadas.size === 0 || adicionarMembros.isPending}
          >
            {adicionarMembros.isPending ? "Adicionando..." : "Adicionar"}
          </Button>
        </Box>
      </DialogActions>
    </Dialog>
  );
}
