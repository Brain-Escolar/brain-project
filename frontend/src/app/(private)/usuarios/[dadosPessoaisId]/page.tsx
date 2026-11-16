"use client";

import { useState } from "react";
import NextLink from "next/link";
import { useParams } from "next/navigation";
import {
  Alert,
  Box,
  Button,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Divider,
  Paper,
  Skeleton,
  Typography,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import LockResetIcon from "@mui/icons-material/LockReset";
import MarkEmailReadOutlinedIcon from "@mui/icons-material/MarkEmailReadOutlined";
import PersonOffOutlinedIcon from "@mui/icons-material/PersonOffOutlined";
import HowToRegOutlinedIcon from "@mui/icons-material/HowToRegOutlined";
import PageScaffold from "@/components/pageScaffold/PageScaffold";
import { useBreadcrumbOverride } from "@/contexts/BreadcrumbContext";
import { RoutesEnum } from "@/enums";
import { useUsuario, useUsuarioMutations } from "@/hooks/useUsuarios";
import { OrigemCadastroResponse, UsuarioDetalheResponse } from "@/services/domains/usuario";
import { nomeDoPerfil } from "../../grupos-usuarios/perfisDeGrupo";
import { ChipSituacao, NOME_MOTIVO } from "../situacaoLogin";

type Acao = "desativar" | "reativar" | "reenviarVerificacao" | "enviarRedefinicao";

/**
 * Página da pessoa na tela de Usuários (docs/permissoes.md, seção 9.8). Nesta
 * entrega: cabeçalho e login. Perfis, acesso efetivo, grupos e acessos
 * individuais entram nas próximas.
 */
export default function UsuarioDetalhePage() {
  const params = useParams<{ dadosPessoaisId: string }>();
  const dadosPessoaisId = Number(params.dadosPessoaisId);
  const { usuario, loading, error } = useUsuario(
    Number.isNaN(dadosPessoaisId) ? null : dadosPessoaisId,
  );
  useBreadcrumbOverride(usuario ? usuario.nomeSocial?.trim() || usuario.nome : undefined);

  const voltar = (
    <Button
      component={NextLink}
      href={RoutesEnum.USUARIOS}
      size="small"
      startIcon={<ArrowBackIcon />}
    >
      Voltar a Usuários
    </Button>
  );

  if (loading) {
    return (
      <PageScaffold title="Carregando...">
        <Skeleton variant="rounded" height={280} />
      </PageScaffold>
    );
  }

  if (error || !usuario) {
    return (
      <PageScaffold title="Usuário">
        <Alert severity="error" action={voltar}>
          {error ?? "Usuário não encontrado."}
        </Alert>
      </PageScaffold>
    );
  }

  return (
    <PageScaffold title={usuario.nomeSocial?.trim() || usuario.nome} actions={voltar}>
      <Box sx={{ display: "flex", flexDirection: "column", gap: 3, maxWidth: 880 }}>
        <Cabecalho usuario={usuario} />
        <SecaoLogin usuario={usuario} />
      </Box>
    </PageScaffold>
  );
}

function Cabecalho({ usuario }: { usuario: UsuarioDetalheResponse }) {
  return (
    <Paper variant="outlined" sx={{ p: { xs: 2, sm: 3 } }}>
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: { xs: "1fr", sm: "180px 1fr" },
          rowGap: 1.5,
          columnGap: 2,
        }}
      >
        {usuario.nomeSocial?.trim() && (
          <Campo rotulo="Nome civil">
            <Typography variant="body2">{usuario.nome}</Typography>
          </Campo>
        )}
        <Campo rotulo="E-mail de login">
          <Typography variant="body2" sx={{ wordBreak: "break-all" }}>
            {usuario.email}
          </Typography>
        </Campo>
        <Campo rotulo="E-mail pessoal">
          <Typography
            variant="body2"
            color={usuario.emailPessoalMascarado ? undefined : "text.secondary"}
          >
            {usuario.emailPessoalMascarado ?? "Não cadastrado"}
          </Typography>
        </Campo>
        <Campo rotulo="Perfis">
          <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
            {usuario.perfis.map((p) => (
              <Chip key={p} size="small" label={nomeDoPerfil(p)} />
            ))}
          </Box>
        </Campo>
        <Campo rotulo="Situação do login">
          <Box>
            <ChipSituacao situacao={usuario.situacao} motivo={usuario.motivoDesativacao} />
            {usuario.situacao === "DESATIVADO" && usuario.motivoDesativacao && (
              <Typography variant="caption" color="text.secondary" component="div" sx={{ mt: 0.5 }}>
                Desativado: {NOME_MOTIVO[usuario.motivoDesativacao]}.
              </Typography>
            )}
          </Box>
        </Campo>
        {usuario.origens.length > 0 && (
          <Campo rotulo="Cadastro de origem">
            <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
              {usuario.origens.map((origem) => (
                <LinkOrigem key={`${origem.tipo}-${origem.id}`} origem={origem} />
              ))}
            </Box>
          </Campo>
        )}
      </Box>
    </Paper>
  );
}

function Campo({ rotulo, children }: { rotulo: string; children: React.ReactNode }) {
  return (
    <>
      <Typography variant="body2" color="text.secondary" sx={{ pt: { sm: 0.25 } }}>
        {rotulo}
      </Typography>
      {children}
    </>
  );
}

const ORIGEM: Record<
  OrigemCadastroResponse["tipo"],
  { rotulo: string; href?: (id: number) => string }
> = {
  ALUNO: { rotulo: "Aluno", href: (id) => `${RoutesEnum.ALUNO_DETALHE}/${id}` },
  PROFESSOR: { rotulo: "Professor", href: (id) => `${RoutesEnum.PROFESSOR_CADASTRO}?id=${id}` },
  SECRETARIO: { rotulo: "Secretário", href: () => RoutesEnum.SECRETARIO_LISTA },
  RESPONSAVEL: { rotulo: "Responsável" },
};

function LinkOrigem({ origem }: { origem: OrigemCadastroResponse }) {
  const config = ORIGEM[origem.tipo];
  if (!config.href) return <Chip size="small" variant="outlined" label={config.rotulo} />;
  return (
    <Button component={NextLink} href={config.href(origem.id)} size="small" variant="outlined">
      {config.rotulo}
    </Button>
  );
}

const CONFIRMACAO: Record<
  Acao,
  { titulo: string; texto: (nome: string) => string; botao: string; cor?: "error" }
> = {
  desativar: {
    titulo: "Desativar o login?",
    texto: (nome) =>
      `${nome} deixa de entrar no sistema. Os perfis, grupos e cadastros continuam como estão, e o login pode ser reativado aqui depois. Uma rematrícula ou novo cadastro na área de origem não reativa um login desativado pela gestão.`,
    botao: "Desativar",
    cor: "error",
  },
  reativar: {
    titulo: "Reativar o login?",
    texto: (nome) => `${nome} volta a entrar no sistema com os mesmos perfis e grupos de antes.`,
    botao: "Reativar",
  },
  reenviarVerificacao: {
    titulo: "Reenviar a verificação?",
    texto: () =>
      "Vai para o e-mail pessoal um link de primeiro acesso, válido por 72 horas, em que a pessoa define a senha. Ao definir, o login fica verificado. Um link enviado antes deixa de valer.",
    botao: "Enviar",
  },
  enviarRedefinicao: {
    titulo: "Enviar redefinição de senha?",
    texto: () =>
      "Vai para o e-mail pessoal um link, válido por 1 hora, para a pessoa criar uma senha nova. A senha atual continua valendo até ela trocar.",
    botao: "Enviar",
  },
};

function SecaoLogin({ usuario }: { usuario: UsuarioDetalheResponse }) {
  const mutacoes = useUsuarioMutations();
  const [confirmando, setConfirmando] = useState<Acao | null>(null);
  const { acoes } = usuario;
  const nome = usuario.nomeSocial?.trim() || usuario.nome;
  const algumaAcao =
    acoes.desativar || acoes.reativar || acoes.reenviarVerificacao || acoes.enviarRedefinicao;
  const pendente = Object.values(mutacoes).some((m) => m.isPending);

  async function confirmar() {
    if (!confirmando) return;
    try {
      await mutacoes[confirmando].mutateAsync(usuario.dadosPessoaisId);
      setConfirmando(null);
    } catch {
      // O toast com o motivo já saiu no onError da mutação.
    }
  }

  const semEmailPessoal =
    !usuario.emailPessoalMascarado && !acoes.bloqueio && usuario.situacao !== "DESATIVADO";

  return (
    <Paper
      variant="outlined"
      sx={{ p: { xs: 2, sm: 3 } }}
      component="section"
      aria-labelledby="secao-login"
    >
      <Typography variant="h6" component="h2" id="secao-login" sx={{ mb: 1 }}>
        Login
      </Typography>
      <Divider sx={{ mb: 2 }} />

      {acoes.bloqueio && (
        <Alert severity="info" sx={{ mb: algumaAcao ? 2 : 0 }}>
          {acoes.bloqueio}
        </Alert>
      )}

      {semEmailPessoal && (
        <Alert severity="warning" sx={{ mb: 2 }}>
          Sem e-mail pessoal no cadastro, não há para onde mandar os links de senha. Cadastre um
          e-mail na tela de origem da pessoa.
        </Alert>
      )}

      {usuario.motivoDesativacao === "SEM_PERFIL" && !acoes.bloqueio && (
        <Alert severity="info" sx={{ mb: 2 }}>
          Este login foi desligado porque a pessoa ficou sem nenhum perfil. Ele volta sozinho quando
          ela for cadastrada de novo na área de origem.
        </Alert>
      )}

      {!acoes.bloqueio && (
        <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
          {acoes.reativar && (
            <Button
              variant="contained"
              startIcon={<HowToRegOutlinedIcon />}
              onClick={() => setConfirmando("reativar")}
            >
              Reativar login
            </Button>
          )}
          {acoes.reenviarVerificacao && (
            <Button
              variant="outlined"
              startIcon={<MarkEmailReadOutlinedIcon />}
              onClick={() => setConfirmando("reenviarVerificacao")}
            >
              Reenviar verificação
            </Button>
          )}
          {acoes.enviarRedefinicao && (
            <Button
              variant="outlined"
              startIcon={<LockResetIcon />}
              onClick={() => setConfirmando("enviarRedefinicao")}
            >
              Enviar redefinição de senha
            </Button>
          )}
          {acoes.desativar && (
            <Button
              variant="outlined"
              color="error"
              startIcon={<PersonOffOutlinedIcon />}
              onClick={() => setConfirmando("desativar")}
            >
              Desativar login
            </Button>
          )}
        </Box>
      )}

      <Dialog
        open={confirmando !== null}
        onClose={() => setConfirmando(null)}
        maxWidth="xs"
        fullWidth
      >
        {confirmando && (
          <>
            <DialogTitle>{CONFIRMACAO[confirmando].titulo}</DialogTitle>
            <DialogContent>
              <DialogContentText>{CONFIRMACAO[confirmando].texto(nome)}</DialogContentText>
              {(confirmando === "reenviarVerificacao" || confirmando === "enviarRedefinicao") && (
                <DialogContentText sx={{ mt: 1.5 }}>
                  Destino: <strong>{usuario.emailPessoalMascarado}</strong>
                </DialogContentText>
              )}
            </DialogContent>
            <DialogActions>
              <Button variant="outlined" onClick={() => setConfirmando(null)}>
                Cancelar
              </Button>
              <Button
                variant="contained"
                color={CONFIRMACAO[confirmando].cor}
                onClick={confirmar}
                disabled={pendente}
              >
                {pendente ? "Aguarde..." : CONFIRMACAO[confirmando].botao}
              </Button>
            </DialogActions>
          </>
        )}
      </Dialog>
    </Paper>
  );
}
