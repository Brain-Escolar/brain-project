"use client";

import NextLink from "next/link";
import { useParams } from "next/navigation";
import { Alert, Box, Button, Chip, Link, Skeleton, Typography } from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import PageScaffold from "@/components/pageScaffold/PageScaffold";
import { useBreadcrumbOverride } from "@/contexts/BreadcrumbContext";
import { RoutesEnum } from "@/enums";
import { useAcessosIndividuais, useGrupoUsuario } from "@/hooks/useGruposUsuarios";
import { useGrupoUsuarioMutations } from "@/hooks/useGrupoUsuarioMutations";
import AvisoPermissoes from "../../../_components/AvisoPermissoes";
import EditorAcessos from "../../../_components/EditorAcessos";
import { nomeDoPerfil } from "../../../perfisDeGrupo";

/**
 * Acessos individuais de uma pessoa (docs/permissoes.md, D18–D21): telas e
 * ações além dos grupos dela, no perfil do grupo de onde se chegou aqui.
 * Valem pelo perfil, e não pelo grupo: abrir pela aba Pessoas de outro grupo
 * do mesmo perfil mostra a mesma coisa.
 */
export default function AcessosIndividuaisPage() {
  const params = useParams<{ id: string; dadosPessoaisId: string }>();
  const grupoId = Number(params.id);
  const dadosPessoaisId = Number(params.dadosPessoaisId);
  const {
    grupo,
    loading: carregandoGrupo,
    error: erroGrupo,
  } = useGrupoUsuario(Number.isNaN(grupoId) ? null : grupoId);
  const { acessos, loading, error } = useAcessosIndividuais(
    Number.isNaN(dadosPessoaisId) ? null : dadosPessoaisId,
    grupo?.perfil ?? null,
  );
  const { salvarAcessosIndividuais } = useGrupoUsuarioMutations();
  useBreadcrumbOverride(acessos?.nome);

  const voltar = (
    <Button
      component={NextLink}
      href={`${RoutesEnum.GRUPOS_USUARIOS}/${grupoId}`}
      size="small"
      startIcon={<ArrowBackIcon />}
    >
      {grupo ? `Voltar a ${grupo.nome}` : "Voltar ao grupo"}
    </Button>
  );

  if (carregandoGrupo || loading) {
    return (
      <PageScaffold title="Carregando...">
        <Skeleton variant="rounded" height={320} />
      </PageScaffold>
    );
  }

  if (erroGrupo || error || !grupo || !acessos) {
    return (
      <PageScaffold title="Acessos individuais">
        <Alert severity="error" action={voltar}>
          {erroGrupo ?? error ?? "Pessoa não encontrada."}
        </Alert>
      </PageScaffold>
    );
  }

  const perfil = nomeDoPerfil(acessos.perfil);
  const gruposAtivos = acessos.grupos.filter((g) => g.ativo);

  return (
    <PageScaffold
      title={acessos.nome}
      description={`Acessos individuais no perfil ${perfil}: o que esta pessoa pode usar além dos grupos dela.`}
      actions={voltar}
    >
      <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap", mb: 2 }}>
        <Chip size="small" label={`Perfil: ${perfil}`} />
        <Chip size="small" variant="outlined" label={acessos.email ?? "Sem acesso ao sistema"} />
      </Box>

      <AvisoPermissoes />

      <Box sx={{ mb: 3 }}>
        <Typography variant="subtitle2" component="h2" sx={{ mb: 0.5 }}>
          Grupos neste perfil
        </Typography>
        {acessos.grupos.length > 0 ? (
          <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
            {acessos.grupos.map((g) => (
              <Chip
                key={g.id}
                size="small"
                clickable
                component={NextLink}
                href={`${RoutesEnum.GRUPOS_USUARIOS}/${g.id}`}
                label={g.ativo ? g.nome : `${g.nome} (inativo)`}
                variant={g.ativo ? "filled" : "outlined"}
              />
            ))}
          </Box>
        ) : (
          <Typography variant="body2" color="text.secondary">
            Nenhum.{" "}
            <Link component={NextLink} href={`${RoutesEnum.GRUPOS_USUARIOS}/${grupoId}`}>
              Adicionar a um grupo
            </Link>
          </Typography>
        )}
      </Box>

      <Alert severity="info" sx={{ mb: 3 }}>
        {gruposAtivos.length > 0
          ? "Os acessos individuais somam aos dos grupos. O que já vem de um grupo aparece marcado e travado; para mudar, edite o grupo."
          : `Sem nenhum grupo ativo no perfil ${perfil}, só os acessos individuais valem para esta pessoa.`}
      </Alert>

      <EditorAcessos
        perfil={acessos.perfil}
        salvos={[...acessos.telas, ...acessos.controles]}
        herdados={acessos.herdados}
        salvando={salvarAcessosIndividuais.isPending}
        onSalvar={(dados) =>
          salvarAcessosIndividuais.mutate({ dadosPessoaisId, perfil: acessos.perfil, dados })
        }
      />
    </PageScaffold>
  );
}
