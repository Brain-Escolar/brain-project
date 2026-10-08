"use client";

import { useState } from "react";
import NextLink from "next/link";
import { useParams } from "next/navigation";
import { Alert, Box, Button, Chip, Skeleton, Tab, Tabs } from "@mui/material";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import EditIcon from "@mui/icons-material/Edit";
import PageScaffold from "@/components/pageScaffold/PageScaffold";
import { useBreadcrumbOverride } from "@/contexts/BreadcrumbContext";
import { RoutesEnum } from "@/enums";
import { useGrupoUsuario } from "@/hooks/useGruposUsuarios";
import AbaAcessos from "../_components/AbaAcessos";
import AbaPessoas from "../_components/AbaPessoas";
import AvisoPermissoesInativas from "../_components/AvisoPermissoesInativas";
import DuplicarGrupoDialog from "../_components/DuplicarGrupoDialog";
import EditarGrupoDialog from "../_components/EditarGrupoDialog";
import ExcluirGrupoDialog from "../_components/ExcluirGrupoDialog";
import { nomeDoPerfil } from "../perfisDeGrupo";

type Dialogo = "editar" | "duplicar" | "excluir" | null;

export default function GrupoUsuarioPage() {
  const params = useParams<{ id: string }>();
  const id = Number(params.id);
  const { grupo, loading, error } = useGrupoUsuario(Number.isNaN(id) ? null : id);
  const [aba, setAba] = useState(0);
  const [dialogo, setDialogo] = useState<Dialogo>(null);
  useBreadcrumbOverride(grupo?.nome);

  if (loading) {
    return (
      <PageScaffold title="Carregando...">
        <Skeleton variant="rounded" height={320} />
      </PageScaffold>
    );
  }

  if (error || !grupo) {
    return (
      <PageScaffold title="Grupo de acesso">
        <Alert
          severity="error"
          action={
            <Button component={NextLink} href={RoutesEnum.GRUPOS_USUARIOS} size="small">
              Voltar
            </Button>
          }
        >
          {error ?? "Grupo não encontrado."}
        </Alert>
      </PageScaffold>
    );
  }

  return (
    <PageScaffold
      title={grupo.nome}
      description={grupo.descricao ?? undefined}
      actions={
        <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
          <Button
            variant="outlined"
            size="small"
            startIcon={<EditIcon />}
            onClick={() => setDialogo("editar")}
          >
            Editar
          </Button>
          <Button
            variant="outlined"
            size="small"
            startIcon={<ContentCopyIcon />}
            onClick={() => setDialogo("duplicar")}
          >
            Duplicar
          </Button>
          {!grupo.padrao && (
            <Button
              variant="outlined"
              size="small"
              color="error"
              startIcon={<DeleteOutlineIcon />}
              onClick={() => setDialogo("excluir")}
            >
              Excluir
            </Button>
          )}
        </Box>
      }
    >
      <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap", mb: 2 }}>
        <Chip size="small" label={`Perfil: ${nomeDoPerfil(grupo.perfil)}`} />
        {grupo.padrao && <Chip size="small" label="Padrão" color="primary" variant="outlined" />}
        {!grupo.ativo && <Chip size="small" label="Inativo" />}
      </Box>

      <AvisoPermissoesInativas />

      {grupo.padrao && (
        <Alert severity="info" sx={{ mb: 3 }}>
          Grupo padrão do perfil {nomeDoPerfil(grupo.perfil)}. Na implantação, recebeu todas as
          pessoas com esse perfil e tudo o que ele já acessava. Não pode ser excluído nem
          desativado.
        </Alert>
      )}
      {!grupo.ativo && (
        <Alert severity="info" sx={{ mb: 3 }}>
          Grupo inativo: as pessoas dele não recebem estes acessos.
        </Alert>
      )}

      <Tabs
        value={aba}
        onChange={(_, nova) => setAba(nova)}
        sx={{ borderBottom: 1, borderColor: "divider" }}
      >
        <Tab label="Acessos" id="grupo-aba-0" aria-controls="grupo-painel-0" />
        <Tab
          label={`Pessoas (${grupo.quantidadeMembros})`}
          id="grupo-aba-1"
          aria-controls="grupo-painel-1"
        />
      </Tabs>
      {/* As duas abas ficam montadas: trocar de aba não perde marcações ainda não salvas. */}
      <Box
        role="tabpanel"
        id="grupo-painel-0"
        aria-labelledby="grupo-aba-0"
        hidden={aba !== 0}
        sx={{ pt: 3 }}
      >
        <AbaAcessos grupo={grupo} />
      </Box>
      <Box
        role="tabpanel"
        id="grupo-painel-1"
        aria-labelledby="grupo-aba-1"
        hidden={aba !== 1}
        sx={{ pt: 3 }}
      >
        <AbaPessoas grupo={grupo} />
      </Box>

      <EditarGrupoDialog
        open={dialogo === "editar"}
        onClose={() => setDialogo(null)}
        grupo={grupo}
      />
      <DuplicarGrupoDialog
        open={dialogo === "duplicar"}
        onClose={() => setDialogo(null)}
        grupo={grupo}
      />
      <ExcluirGrupoDialog
        open={dialogo === "excluir"}
        onClose={() => setDialogo(null)}
        grupo={grupo}
      />
    </PageScaffold>
  );
}
