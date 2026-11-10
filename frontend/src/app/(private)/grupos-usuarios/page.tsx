"use client";

import { useMemo, useState } from "react";
import NextLink from "next/link";
import { useRouter } from "next/navigation";
import {
  Alert,
  Box,
  Button,
  Chip,
  Link,
  MenuItem,
  Paper,
  Skeleton,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tabs,
  TextField,
  Typography,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import PageScaffold from "@/components/pageScaffold/PageScaffold";
import { RoutesEnum } from "@/enums";
import { PerfilNomeEnum } from "@/enums/PerfilNomeEnum";
import { useGruposUsuarios } from "@/hooks/useGruposUsuarios";
import AbaPorTela from "./_components/AbaPorTela";
import AvisoPermissoes from "./_components/AvisoPermissoes";
import NovoGrupoDialog from "./_components/NovoGrupoDialog";
import { PERFIS_COM_GRUPO, nomeDoPerfil } from "./perfisDeGrupo";

type FiltroPerfil = PerfilNomeEnum | "TODOS";

export default function GruposUsuariosPage() {
  const router = useRouter();
  const { grupos, loading, error } = useGruposUsuarios();
  const [filtro, setFiltro] = useState<FiltroPerfil>("TODOS");
  const [novoAberto, setNovoAberto] = useState(false);
  const [aba, setAba] = useState(0);

  const secoes = useMemo(
    () =>
      PERFIS_COM_GRUPO.filter((perfil) => filtro === "TODOS" || perfil === filtro)
        .map((perfil) => ({ perfil, grupos: grupos.filter((grupo) => grupo.perfil === perfil) }))
        .filter((secao) => secao.grupos.length > 0),
    [grupos, filtro],
  );

  const abrir = (id: number) => router.push(`${RoutesEnum.GRUPOS_USUARIOS}/${id}`);

  return (
    <PageScaffold
      title="Grupos de acesso"
      description="Defina quais telas e ações cada grupo de pessoas pode usar, dentro do que o perfil permite."
      actions={
        aba === 0 ? (
          <Button variant="contained" startIcon={<AddIcon />} onClick={() => setNovoAberto(true)}>
            Novo grupo
          </Button>
        ) : undefined
      }
    >
      <AvisoPermissoes />

      <Tabs
        value={aba}
        onChange={(_, nova) => setAba(nova)}
        sx={{ borderBottom: 1, borderColor: "divider", mb: 3 }}
      >
        <Tab label="Por grupo" id="grupos-usuarios-aba-0" aria-controls="grupos-usuarios-painel-0" />
        <Tab label="Por tela" id="grupos-usuarios-aba-1" aria-controls="grupos-usuarios-painel-1" />
      </Tabs>

      <Box role="tabpanel" id="grupos-usuarios-painel-0" aria-labelledby="grupos-usuarios-aba-0" hidden={aba !== 0}>
        <TextField
          select
          size="small"
          label="Perfil"
          value={filtro}
          onChange={(e) => setFiltro(e.target.value as FiltroPerfil)}
          sx={{ minWidth: 260, mb: 3 }}
        >
          <MenuItem value="TODOS">Todos os perfis</MenuItem>
          {PERFIS_COM_GRUPO.map((perfil) => (
            <MenuItem key={perfil} value={perfil}>
              {nomeDoPerfil(perfil)}
            </MenuItem>
          ))}
        </TextField>

        {loading && (
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
            {[0, 1, 2].map((i) => (
              <Skeleton key={i} variant="rounded" height={120} />
            ))}
          </Box>
        )}

        {error && <Alert severity="error">{error}</Alert>}

        {!loading && !error && secoes.length === 0 && (
          <Alert severity="info">Nenhum grupo para este perfil.</Alert>
        )}

        {secoes.map(({ perfil, grupos: gruposDoPerfil }) => (
          <Box key={perfil} component="section" sx={{ mb: 4 }}>
            <Typography variant="h6" component="h2" sx={{ mb: 1.5 }}>
              {nomeDoPerfil(perfil)}
            </Typography>
            <TableContainer component={Paper} variant="outlined">
              <Table size="small" aria-label={`Grupos do perfil ${nomeDoPerfil(perfil)}`}>
                <TableHead>
                  <TableRow>
                    <TableCell>Grupo</TableCell>
                    <TableCell align="right">Pessoas</TableCell>
                    <TableCell align="right">Telas</TableCell>
                    <TableCell align="right">Controles</TableCell>
                    <TableCell>Situação</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {gruposDoPerfil.map((grupo) => (
                    <TableRow
                      key={grupo.id}
                      hover
                      onClick={() => abrir(grupo.id)}
                      sx={{ cursor: "pointer" }}
                    >
                      <TableCell>
                        <Box sx={{ display: "flex", alignItems: "center", gap: 1, flexWrap: "wrap" }}>
                          <Link
                            component={NextLink}
                            href={`${RoutesEnum.GRUPOS_USUARIOS}/${grupo.id}`}
                            underline="hover"
                            fontWeight={600}
                            onClick={(e) => e.stopPropagation()}
                          >
                            {grupo.nome}
                          </Link>
                          {grupo.padrao && (
                            <Chip label="Padrão" size="small" color="primary" variant="outlined" />
                          )}
                        </Box>
                        {grupo.descricao && (
                          <Typography variant="caption" color="text.secondary" component="p">
                            {grupo.descricao}
                          </Typography>
                        )}
                      </TableCell>
                      <TableCell align="right">{grupo.quantidadeMembros}</TableCell>
                      <TableCell align="right">{grupo.quantidadeTelas}</TableCell>
                      <TableCell align="right">{grupo.quantidadeControles}</TableCell>
                      <TableCell>
                        <Chip
                          size="small"
                          variant="outlined"
                          label={grupo.ativo ? "Ativo" : "Inativo"}
                          color={grupo.ativo ? "success" : "default"}
                        />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Box>
        ))}
      </Box>

      <Box role="tabpanel" id="grupos-usuarios-painel-1" aria-labelledby="grupos-usuarios-aba-1" hidden={aba !== 1}>
        <AbaPorTela />
      </Box>

      <NovoGrupoDialog
        open={novoAberto}
        onClose={() => setNovoAberto(false)}
        perfilInicial={filtro === "TODOS" ? null : filtro}
      />
    </PageScaffold>
  );
}
