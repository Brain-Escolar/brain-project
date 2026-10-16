"use client";

import { useMemo, useState } from "react";
import NextLink from "next/link";
import {
  Alert,
  Autocomplete,
  Box,
  Chip,
  Link,
  MenuItem,
  Paper,
  Skeleton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from "@mui/material";
import { RoutesEnum } from "@/enums";
import { useAcessoPorTela, useTelasCatalogo } from "@/hooks/useGruposUsuarios";
import { TelaResumoResponse } from "@/services/domains/grupo-usuario";
import { nomeDoPerfil } from "../perfisDeGrupo";

type FiltroSituacao = "ATIVOS" | "INATIVOS";

/**
 * Quem libera uma tela: busca a tela e lista, numa linha só, grupos e
 * acessos individuais que a concedem (docs/permissoes.md, seção 5). Só
 * visualização: para mudar algo, abre o grupo pelo link da linha.
 */
export default function AbaPorTela() {
  const { telas, loading: carregandoTelas, error: erroTelas } = useTelasCatalogo();
  const [tela, setTela] = useState<TelaResumoResponse | null>(null);
  const [situacao, setSituacao] = useState<FiltroSituacao>("ATIVOS");

  const { acessos, loading: carregandoAcessos, error: erroAcessos } = useAcessoPorTela(
    tela?.codigo ?? null,
  );

  const linhas = useMemo(
    () => acessos.filter((item) => (situacao === "ATIVOS" ? item.ativo : !item.ativo)),
    [acessos, situacao],
  );

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
      <Typography variant="body2" color="text.secondary">
        Escolha uma tela para ver quais grupos e quais acessos individuais a liberam hoje.
      </Typography>

      <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1.5 }}>
        <Autocomplete
          sx={{ minWidth: 320 }}
          options={telas}
          value={tela}
          onChange={(_, novaTela) => setTela(novaTela)}
          loading={carregandoTelas}
          getOptionLabel={(t) => t.nome}
          isOptionEqualToValue={(a, b) => a.codigo === b.codigo}
          renderOption={(props, t) => (
            <li {...props} key={t.codigo}>
              <Box>
                <Typography variant="body2">{t.nome}</Typography>
                <Typography variant="caption" color="text.secondary">
                  {t.rota}
                </Typography>
              </Box>
            </li>
          )}
          renderInput={(params) => (
            <TextField {...params} size="small" label="Tela" placeholder="Digite o nome da tela" />
          )}
        />

        <TextField
          select
          size="small"
          label="Situação"
          value={situacao}
          onChange={(e) => setSituacao(e.target.value as FiltroSituacao)}
          sx={{ minWidth: 160 }}
        >
          <MenuItem value="ATIVOS">Ativos</MenuItem>
          <MenuItem value="INATIVOS">Inativos</MenuItem>
        </TextField>
      </Box>

      {erroTelas && <Alert severity="error">{erroTelas}</Alert>}

      {!tela && !erroTelas && (
        <Alert severity="info">Escolha uma tela acima para ver quem tem acesso a ela.</Alert>
      )}

      {tela && erroAcessos && <Alert severity="error">{erroAcessos}</Alert>}

      {tela && carregandoAcessos && <Skeleton variant="rounded" height={200} />}

      {tela && !carregandoAcessos && !erroAcessos && (
        <TableContainer component={Paper} variant="outlined">
          <Table size="small" aria-label={`Quem tem acesso a ${tela.nome}`}>
            <TableHead>
              <TableRow>
                <TableCell>Grupo / pessoa</TableCell>
                <TableCell>Tipo</TableCell>
                <TableCell>Perfil</TableCell>
                <TableCell align="right">Pessoas</TableCell>
                <TableCell>Situação</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {linhas.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5}>
                    <Typography variant="body2" color="text.secondary" sx={{ py: 2 }}>
                      {situacao === "ATIVOS"
                        ? "Nenhum grupo ativo nem acesso individual libera esta tela."
                        : "Nenhum grupo inativo nem acesso individual inativo libera esta tela."}
                    </Typography>
                  </TableCell>
                </TableRow>
              )}
              {linhas.map((item) => (
                <TableRow key={`${item.individual ? "individual" : "grupo"}-${item.grupoId}`} hover>
                  <TableCell>
                    {item.individual ? (
                      item.nome
                    ) : (
                      <Link
                        component={NextLink}
                        href={`${RoutesEnum.GRUPOS_USUARIOS}/${item.grupoId}`}
                        underline="hover"
                        fontWeight={600}
                      >
                        {item.nome}
                      </Link>
                    )}
                  </TableCell>
                  <TableCell>
                    <Chip
                      size="small"
                      variant="outlined"
                      color={item.individual ? "secondary" : "default"}
                      label={item.individual ? "Individual" : "Grupo"}
                    />
                  </TableCell>
                  <TableCell>{nomeDoPerfil(item.perfil)}</TableCell>
                  <TableCell align="right">{item.quantidadeMembros}</TableCell>
                  <TableCell>
                    <Chip
                      size="small"
                      variant="outlined"
                      label={item.ativo ? "Ativo" : "Inativo"}
                      color={item.ativo ? "success" : "default"}
                    />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Box>
  );
}
