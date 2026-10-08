"use client";

import { useEffect, useState } from "react";
import {
  Alert,
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  IconButton,
  InputAdornment,
  Paper,
  Skeleton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
  TextField,
  Tooltip,
  Typography,
} from "@mui/material";
import PersonAddIcon from "@mui/icons-material/PersonAdd";
import PersonRemoveOutlinedIcon from "@mui/icons-material/PersonRemoveOutlined";
import SearchIcon from "@mui/icons-material/Search";
import { useDebouncedValue } from "@/hooks/useDebouncedValue";
import { usePessoasDoGrupo } from "@/hooks/useGruposUsuarios";
import { useGrupoUsuarioMutations } from "@/hooks/useGrupoUsuarioMutations";
import { GrupoUsuarioDetalheResponse, PessoaGrupoResponse } from "@/services/domains/grupo-usuario";
import { nomeDoPerfil } from "../perfisDeGrupo";
import AdicionarPessoasDialog from "./AdicionarPessoasDialog";

const TAMANHO_PAGINA = 20;

interface AbaPessoasProps {
  grupo: GrupoUsuarioDetalheResponse;
}

export default function AbaPessoas({ grupo }: AbaPessoasProps) {
  const [busca, setBusca] = useState("");
  const buscaAplicada = useDebouncedValue(busca.trim(), 400);
  const [pagina, setPagina] = useState(0);
  const [adicionarAberto, setAdicionarAberto] = useState(false);
  const [paraRemover, setParaRemover] = useState<PessoaGrupoResponse | null>(null);
  const { removerMembro } = useGrupoUsuarioMutations();

  const { pessoas, total, loading, atualizando, error } = usePessoasDoGrupo({
    grupoId: grupo.id,
    tipo: "membros",
    busca: buscaAplicada,
    page: pagina,
    size: TAMANHO_PAGINA,
  });

  useEffect(() => setPagina(0), [buscaAplicada]);

  // Removeu o último da última página: volta uma página.
  useEffect(() => {
    if (!loading && pagina > 0 && pessoas.length === 0) setPagina((atual) => atual - 1);
  }, [loading, pagina, pessoas.length]);

  async function confirmarRemocao() {
    if (!paraRemover) return;
    try {
      await removerMembro.mutateAsync({
        id: grupo.id,
        dadosPessoaisId: paraRemover.dadosPessoaisId,
      });
      setParaRemover(null);
    } catch {
      // O toast com o motivo já saiu no onError da mutação.
    }
  }

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
      <Box
        sx={{
          display: "flex",
          flexDirection: { xs: "column", sm: "row" },
          justifyContent: "space-between",
          gap: 1.5,
        }}
      >
        <TextField
          size="small"
          placeholder="Buscar por nome ou e-mail"
          value={busca}
          onChange={(e) => setBusca(e.target.value)}
          sx={{ minWidth: { sm: 320 } }}
          slotProps={{
            input: {
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon fontSize="small" />
                </InputAdornment>
              ),
            },
            htmlInput: { "aria-label": "Buscar pessoas do grupo" },
          }}
        />
        <Button
          variant="contained"
          startIcon={<PersonAddIcon />}
          onClick={() => setAdicionarAberto(true)}
        >
          Adicionar pessoas
        </Button>
      </Box>

      {error && <Alert severity="error">{error}</Alert>}

      {loading ? (
        <Skeleton variant="rounded" height={240} />
      ) : (
        <TableContainer
          component={Paper}
          variant="outlined"
          aria-busy={atualizando}
          sx={{ opacity: atualizando ? 0.6 : 1, transition: "opacity 150ms" }}
        >
          <Table size="small" aria-label="Pessoas do grupo">
            <TableHead>
              <TableRow>
                <TableCell>Nome</TableCell>
                <TableCell>E-mail de acesso</TableCell>
                <TableCell align="right" sx={{ width: 64 }}>
                  <Box component="span" sx={visualmenteOculto}>
                    Ações
                  </Box>
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {pessoas.length === 0 && (
                <TableRow>
                  <TableCell colSpan={3}>
                    <Typography variant="body2" color="text.secondary" sx={{ py: 2 }}>
                      {buscaAplicada
                        ? `Ninguém no grupo encontrado para "${buscaAplicada}".`
                        : "Ninguém neste grupo ainda."}
                    </Typography>
                  </TableCell>
                </TableRow>
              )}
              {pessoas.map((pessoa) => (
                <TableRow key={pessoa.dadosPessoaisId}>
                  <TableCell>{pessoa.nome}</TableCell>
                  <TableCell>
                    {pessoa.email ?? (
                      <Typography variant="caption" color="text.secondary">
                        Sem acesso ao sistema
                      </Typography>
                    )}
                  </TableCell>
                  <TableCell align="right">
                    <Tooltip title="Remover do grupo">
                      <IconButton
                        size="small"
                        aria-label={`Remover ${pessoa.nome} do grupo`}
                        onClick={() => setParaRemover(pessoa)}
                      >
                        <PersonRemoveOutlinedIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          <TablePagination
            component="div"
            count={total}
            page={pagina}
            onPageChange={(_, nova) => setPagina(nova)}
            rowsPerPage={TAMANHO_PAGINA}
            rowsPerPageOptions={[]}
            labelDisplayedRows={({ from, to, count }) => `${from}–${to} de ${count}`}
          />
        </TableContainer>
      )}

      <AdicionarPessoasDialog
        open={adicionarAberto}
        onClose={() => setAdicionarAberto(false)}
        grupo={grupo}
      />

      <Dialog
        open={paraRemover !== null}
        onClose={() => setParaRemover(null)}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle>Remover do grupo?</DialogTitle>
        <DialogContent>
          <DialogContentText>
            {paraRemover?.nome} sai do grupo {grupo.nome}. Se não estiver em outro grupo do perfil{" "}
            {nomeDoPerfil(grupo.perfil)}, ficará sem as telas desse perfil quando os acessos
            entrarem em vigor.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setParaRemover(null)}>Cancelar</Button>
          <Button
            color="error"
            variant="contained"
            onClick={confirmarRemocao}
            disabled={removerMembro.isPending}
          >
            {removerMembro.isPending ? "Removendo..." : "Remover"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

const visualmenteOculto = {
  position: "absolute",
  width: 1,
  height: 1,
  overflow: "hidden",
  clip: "rect(0 0 0 0)",
  whiteSpace: "nowrap",
} as const;
