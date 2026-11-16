"use client";

import { useState } from "react";
import { Alert, Box, Chip, Divider, Paper, Skeleton, Tab, Tabs, Typography } from "@mui/material";
import { useAcessoEfetivo } from "@/hooks/useUsuarios";
import { AcessoDoPerfilResponse } from "@/services/domains/usuario";
import { nomeDoPerfil } from "../../../grupos-usuarios/perfisDeGrupo";
import { ListaDeAcessos, ListaServidor } from "./ListaDeAcessos";

/**
 * O que a pessoa abre em cada perfil, com a origem de cada item, e o que o
 * perfil abre direto no servidor (USUARIO.ACESSOS.VER).
 */
export function SecaoAcessoEfetivo({ dadosPessoaisId }: { dadosPessoaisId: number }) {
  const { acesso, loading, error } = useAcessoEfetivo(dadosPessoaisId, true);
  const [aba, setAba] = useState(0);

  return (
    <Paper
      variant="outlined"
      sx={{ p: { xs: 2, sm: 3 } }}
      component="section"
      aria-labelledby="secao-acesso-efetivo"
    >
      <Typography variant="h6" component="h2" id="secao-acesso-efetivo" sx={{ mb: 1 }}>
        Acesso efetivo
      </Typography>
      <Divider sx={{ mb: 2 }} />

      {loading && <Skeleton variant="rounded" height={160} />}
      {error && <Alert severity="error">{error}</Alert>}
      {acesso && acesso.perfis.length === 0 && (
        <Typography variant="body2" color="text.secondary">
          A pessoa está sem nenhum perfil e não abre nada.
        </Typography>
      )}

      {acesso && acesso.perfis.length > 0 && (
        <>
          {acesso.perfis.length > 1 && (
            <Tabs
              value={Math.min(aba, acesso.perfis.length - 1)}
              onChange={(_, valor) => setAba(valor)}
              variant="scrollable"
              allowScrollButtonsMobile
              sx={{ mb: 2 }}
            >
              {acesso.perfis.map((bloco) => (
                <Tab key={bloco.perfil} label={nomeDoPerfil(bloco.perfil)} />
              ))}
            </Tabs>
          )}
          <BlocoDoPerfil bloco={acesso.perfis[Math.min(aba, acesso.perfis.length - 1)]} />
        </>
      )}

      {acesso && acesso.gruposGuardados.length > 0 && (
        <Alert severity="info" sx={{ mt: 2 }}>
          Grupos guardados de perfis que a pessoa não tem mais:{" "}
          {acesso.gruposGuardados.map((g) => `${g.nome} (${nomeDoPerfil(g.perfil)})`).join(", ")}.
          Eles não dão nada agora e voltam a valer se o perfil voltar.
        </Alert>
      )}
    </Paper>
  );
}

function BlocoDoPerfil({ bloco }: { bloco: AcessoDoPerfilResponse }) {
  const gruposAtivos = bloco.grupos.filter((g) => g.ativo);
  const semAcesso = !bloco.tetoDoAdmin && bloco.telas.length === 0 && bloco.controles.length === 0;

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
      <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.75, alignItems: "center" }}>
        {bloco.tetoDoAdmin ? (
          <Typography variant="body2" color="text.secondary">
            O administrador não passa por grupo: recebe tudo o que o perfil permite.
          </Typography>
        ) : (
          <>
            <Typography variant="body2" color="text.secondary" sx={{ mr: 0.5 }}>
              Grupos:
            </Typography>
            {bloco.grupos.length === 0 && (
              <Typography variant="body2" color="text.secondary">
                nenhum
              </Typography>
            )}
            {bloco.grupos.map((grupo) => (
              <Chip
                key={grupo.id}
                size="small"
                variant={grupo.ativo ? "filled" : "outlined"}
                label={grupo.ativo ? grupo.nome : `${grupo.nome} (inativo)`}
              />
            ))}
            {bloco.acessoIndividual && (
              <Chip size="small" variant="outlined" color="primary" label="Acesso individual" />
            )}
          </>
        )}
      </Box>

      {semAcesso && (
        <Alert severity="warning">
          {gruposAtivos.length === 0
            ? "Sem grupo ativo nem acesso individual neste perfil: a pessoa não abre nenhuma tela dele."
            : "Os grupos ativos da pessoa não liberam nenhuma tela neste perfil."}
        </Alert>
      )}

      <ListaDeAcessos telas={bloco.telas} controles={bloco.controles} vazio="Nenhuma tela." />

      <Box>
        <Typography variant="subtitle2" sx={{ mb: 0.5 }}>
          Direto no servidor, pelo perfil
        </Typography>
        <Typography variant="caption" color="text.secondary" component="div" sx={{ mb: 1 }}>
          Áreas que o perfil abre sem depender de grupo. Mudam só no código.
        </Typography>
        <ListaServidor areas={bloco.servidor} />
      </Box>
    </Box>
  );
}
