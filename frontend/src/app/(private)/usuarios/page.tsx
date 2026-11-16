"use client";

import { useEffect, useMemo, useState } from "react";
import NextLink from "next/link";
import {
  Alert,
  Box,
  Chip,
  FormControlLabel,
  InputAdornment,
  Link,
  MenuItem,
  Paper,
  Skeleton,
  Switch,
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
import SearchIcon from "@mui/icons-material/Search";
import WarningAmberIcon from "@mui/icons-material/WarningAmber";
import PageScaffold from "@/components/pageScaffold/PageScaffold";
import { RoutesEnum } from "@/enums";
import { PerfilNomeEnum } from "@/enums/PerfilNomeEnum";
import { useDebouncedValue } from "@/hooks/useDebouncedValue";
import { useGruposParaFiltro, useUsuarios } from "@/hooks/useUsuarios";
import { SituacaoLogin, UsuarioListaResponse } from "@/services/domains/usuario";
import { PERFIS_COM_GRUPO, nomeDoPerfil } from "../grupos-usuarios/perfisDeGrupo";
import { ChipSituacao, NOME_SITUACAO } from "./situacaoLogin";

const TAMANHO_PAGINA = 20;
const PERFIS_DO_FILTRO: PerfilNomeEnum[] = [PerfilNomeEnum.ADMIN, ...PERFIS_COM_GRUPO];
const SITUACOES: SituacaoLogin[] = ["ATIVO", "AGUARDANDO_VERIFICACAO", "DESATIVADO"];

/**
 * Tela de Usuários (docs/permissoes.md, seção 9.8): uma linha por pessoa com
 * login, com perfis, grupos e situação do login. Responde quem está em qual
 * grupo, quem ficou sem acesso num perfil e quem tem acesso individual.
 */
export default function UsuariosPage() {
  const [busca, setBusca] = useState("");
  const buscaAplicada = useDebouncedValue(busca.trim(), 400);
  const [perfil, setPerfil] = useState<PerfilNomeEnum | "">("");
  const [grupoId, setGrupoId] = useState<number | "">("");
  const [situacao, setSituacao] = useState<SituacaoLogin | "">("");
  const [semAcesso, setSemAcesso] = useState(false);
  const [comAcessoIndividual, setComAcessoIndividual] = useState(false);
  const [pagina, setPagina] = useState(0);
  const grupos = useGruposParaFiltro();

  const gruposDoFiltro = useMemo(
    () => (perfil ? grupos.filter((g) => g.perfil === perfil) : grupos),
    [grupos, perfil],
  );

  const { usuarios, total, loading, atualizando, error } = useUsuarios({
    busca: buscaAplicada || undefined,
    perfil: perfil || undefined,
    grupoId: grupoId === "" ? undefined : grupoId,
    situacao: situacao || undefined,
    semAcesso: semAcesso || undefined,
    comAcessoIndividual: comAcessoIndividual || undefined,
    page: pagina,
    size: TAMANHO_PAGINA,
  });

  useEffect(
    () => setPagina(0),
    [buscaAplicada, perfil, grupoId, situacao, semAcesso, comAcessoIndividual],
  );

  // Trocar o perfil tira o grupo de outro perfil do filtro.
  useEffect(() => {
    if (grupoId !== "" && !gruposDoFiltro.some((g) => g.id === grupoId)) setGrupoId("");
  }, [gruposDoFiltro, grupoId]);

  const filtrando =
    !!buscaAplicada || !!perfil || grupoId !== "" || !!situacao || semAcesso || comAcessoIndividual;

  return (
    <PageScaffold
      title="Usuários"
      description="Quem tem login na escola, com os perfis, os grupos e a situação de cada um. Pessoas são cadastradas nas telas de cada área."
    >
      <Box
        sx={{
          display: "flex",
          flexWrap: "wrap",
          gap: 1.5,
          mb: 2,
          alignItems: "center",
        }}
      >
        <TextField
          size="small"
          placeholder="Buscar por nome, nome social ou e-mail"
          value={busca}
          onChange={(e) => setBusca(e.target.value)}
          sx={{ minWidth: { xs: "100%", sm: 320 } }}
          slotProps={{
            input: {
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon fontSize="small" />
                </InputAdornment>
              ),
            },
            htmlInput: { "aria-label": "Buscar usuários" },
          }}
        />
        <TextField
          select
          size="small"
          label="Perfil"
          value={perfil}
          onChange={(e) => setPerfil(e.target.value as PerfilNomeEnum | "")}
          sx={{ minWidth: 200 }}
        >
          <MenuItem value="">Todos os perfis</MenuItem>
          {PERFIS_DO_FILTRO.map((p) => (
            <MenuItem key={p} value={p}>
              {nomeDoPerfil(p)}
            </MenuItem>
          ))}
        </TextField>
        <TextField
          select
          size="small"
          label="Grupo"
          value={grupoId}
          onChange={(e) => setGrupoId(e.target.value === "" ? "" : Number(e.target.value))}
          sx={{ minWidth: 220 }}
        >
          <MenuItem value="">Todos os grupos</MenuItem>
          {gruposDoFiltro.map((g) => (
            <MenuItem key={g.id} value={g.id}>
              {g.nome}
              {!perfil && ` · ${nomeDoPerfil(g.perfil)}`}
              {!g.ativo && " (inativo)"}
            </MenuItem>
          ))}
        </TextField>
        <TextField
          select
          size="small"
          label="Situação do login"
          value={situacao}
          onChange={(e) => setSituacao(e.target.value as SituacaoLogin | "")}
          sx={{ minWidth: 200 }}
        >
          <MenuItem value="">Todas</MenuItem>
          {SITUACOES.map((s) => (
            <MenuItem key={s} value={s}>
              {NOME_SITUACAO[s]}
            </MenuItem>
          ))}
        </TextField>
        <FormControlLabel
          control={
            <Switch
              size="small"
              checked={semAcesso}
              onChange={(e) => setSemAcesso(e.target.checked)}
            />
          }
          label="Sem acesso em algum perfil"
        />
        <FormControlLabel
          control={
            <Switch
              size="small"
              checked={comAcessoIndividual}
              onChange={(e) => setComAcessoIndividual(e.target.checked)}
            />
          }
          label="Com acesso individual"
        />
      </Box>

      {error && <Alert severity="error">{error}</Alert>}

      {loading ? (
        <Skeleton variant="rounded" height={320} />
      ) : (
        <TableContainer
          component={Paper}
          variant="outlined"
          aria-busy={atualizando}
          sx={{ opacity: atualizando ? 0.6 : 1, transition: "opacity 150ms" }}
        >
          <Table size="small" aria-label="Usuários">
            <TableHead>
              <TableRow>
                <TableCell>Nome</TableCell>
                <TableCell>Perfis</TableCell>
                <TableCell>Grupos</TableCell>
                <TableCell>Login</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {usuarios.length === 0 && (
                <TableRow>
                  <TableCell colSpan={4}>
                    <Typography variant="body2" color="text.secondary" sx={{ py: 2 }}>
                      {filtrando
                        ? "Ninguém encontrado com esses filtros."
                        : "Nenhuma pessoa com login ainda."}
                    </Typography>
                  </TableCell>
                </TableRow>
              )}
              {usuarios.map((usuario) => (
                <LinhaUsuario key={usuario.dadosPessoaisId} usuario={usuario} />
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
    </PageScaffold>
  );
}

function LinhaUsuario({ usuario }: { usuario: UsuarioListaResponse }) {
  const nomeExibido = usuario.nomeSocial?.trim() || usuario.nome;
  return (
    <TableRow hover>
      <TableCell>
        <Link
          component={NextLink}
          href={`${RoutesEnum.USUARIOS}/${usuario.dadosPessoaisId}`}
          underline="hover"
          sx={{ fontWeight: 500 }}
        >
          {nomeExibido}
        </Link>
        {usuario.nomeSocial?.trim() && (
          <Typography variant="caption" color="text.secondary" component="div">
            {usuario.nome}
          </Typography>
        )}
        <Typography variant="caption" color="text.secondary" component="div">
          {usuario.email}
        </Typography>
      </TableCell>
      <TableCell>
        <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
          {usuario.perfis.map((p) => (
            <Chip key={p} size="small" label={nomeDoPerfil(p)} />
          ))}
        </Box>
        {usuario.perfisSemAcesso.map((p) => (
          <Tooltip
            key={p}
            title="Não está em nenhum grupo ativo nem tem acesso individual neste perfil, então não abre nenhuma tela dele."
          >
            <Typography
              variant="caption"
              color="warning.main"
              sx={{ display: "flex", alignItems: "center", gap: 0.5, mt: 0.5 }}
            >
              <WarningAmberIcon sx={{ fontSize: 14 }} />
              Sem acesso em {nomeDoPerfil(p)}
            </Typography>
          </Tooltip>
        ))}
      </TableCell>
      <TableCell>
        <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
          {usuario.grupos.map((g) => (
            <Chip
              key={g.id}
              size="small"
              variant="outlined"
              label={g.ativo ? g.nome : `${g.nome} (inativo)`}
              sx={g.ativo ? undefined : { color: "text.disabled", borderStyle: "dashed" }}
              title={`${nomeDoPerfil(g.perfil)}${g.ativo ? "" : ": grupo inativo, não dá acesso"}`}
            />
          ))}
          {usuario.perfisComAcessoIndividual.length > 0 && (
            <Chip
              size="small"
              color="primary"
              variant="outlined"
              label="Acesso individual"
              title={usuario.perfisComAcessoIndividual.map(nomeDoPerfil).join(", ")}
            />
          )}
          {usuario.grupos.length === 0 && usuario.perfisComAcessoIndividual.length === 0 && (
            <Typography variant="caption" color="text.secondary">
              Nenhum
            </Typography>
          )}
        </Box>
      </TableCell>
      <TableCell>
        <ChipSituacao situacao={usuario.situacao} motivo={usuario.motivoDesativacao} />
      </TableCell>
    </TableRow>
  );
}
