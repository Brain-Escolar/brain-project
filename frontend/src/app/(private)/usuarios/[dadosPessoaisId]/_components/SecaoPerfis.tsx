"use client";

import { useState } from "react";
import {
  Alert,
  Box,
  Button,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  Paper,
  Skeleton,
  Tooltip,
  Typography,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import RemoveCircleOutlineIcon from "@mui/icons-material/RemoveCircleOutline";
import { PerfilNomeEnum } from "@/enums/PerfilNomeEnum";
import { usePerfilMutations, usePreviaPerfil } from "@/hooks/useUsuarios";
import { PreviaPerfilResponse, UsuarioDetalheResponse } from "@/services/domains/usuario";
import { nomeDoPerfil } from "../../../grupos-usuarios/perfisDeGrupo";
import { ListaDeAcessos, ListaServidor } from "./ListaDeAcessos";

/**
 * Conceder e remover os perfis de função (USUARIO.PERFIS.GERENCIAR). Os perfis
 * que vêm do cadastro de origem aparecem sem ação. Cada ação abre um diálogo
 * que mostra o que muda antes de confirmar (RU3, RU9, RU10).
 */
export function SecaoPerfis({ usuario }: { usuario: UsuarioDetalheResponse }) {
  const [alterando, setAlterando] = useState<PerfilNomeEnum | null>(null);

  return (
    <Paper
      variant="outlined"
      sx={{ p: { xs: 2, sm: 3 } }}
      component="section"
      aria-labelledby="secao-perfis"
    >
      <Typography variant="h6" component="h2" id="secao-perfis" sx={{ mb: 1 }}>
        Perfis
      </Typography>
      <Divider sx={{ mb: 2 }} />

      <Box component="ul" sx={{ listStyle: "none", m: 0, p: 0 }}>
        {usuario.perfisDeFuncao.map((linha) => (
          <Box
            component="li"
            key={linha.perfil}
            sx={{
              display: "flex",
              flexWrap: "wrap",
              alignItems: "center",
              justifyContent: "space-between",
              gap: 1,
              py: 1,
              borderBottom: 1,
              borderColor: "divider",
            }}
          >
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <Typography variant="body2">{nomeDoPerfil(linha.perfil)}</Typography>
              {linha.tem && <Chip size="small" color="success" variant="outlined" label="Tem" />}
            </Box>
            <AcaoDaLinha
              tem={linha.tem}
              podeAlterar={linha.podeAlterar}
              bloqueio={linha.bloqueio}
              onClick={() => setAlterando(linha.perfil)}
            />
          </Box>
        ))}
      </Box>

      <Typography variant="caption" color="text.secondary" component="div" sx={{ mt: 1.5 }}>
        A mudança vale na hora no servidor. O menu da pessoa só muda no próximo login.
      </Typography>

      {alterando && (
        <DialogoPerfil
          dadosPessoaisId={usuario.dadosPessoaisId}
          nome={usuario.nomeSocial?.trim() || usuario.nome}
          perfil={alterando}
          onClose={() => setAlterando(null)}
        />
      )}
    </Paper>
  );
}

function AcaoDaLinha({
  tem,
  podeAlterar,
  bloqueio,
  onClick,
}: {
  tem: boolean;
  podeAlterar: boolean;
  bloqueio: string | null;
  onClick: () => void;
}) {
  const botao = (
    <Button
      size="small"
      variant="outlined"
      color={tem ? "error" : "primary"}
      startIcon={tem ? <RemoveCircleOutlineIcon /> : <AddIcon />}
      onClick={onClick}
      disabled={!podeAlterar}
    >
      {tem ? "Remover" : "Conceder"}
    </Button>
  );
  if (podeAlterar || !bloqueio) return botao;
  // Botão desabilitado não dispara o tooltip: o span recebe o hover.
  return (
    <Tooltip title={bloqueio}>
      <span>{botao}</span>
    </Tooltip>
  );
}

function DialogoPerfil({
  dadosPessoaisId,
  nome,
  perfil,
  onClose,
}: {
  dadosPessoaisId: number;
  nome: string;
  perfil: PerfilNomeEnum;
  onClose: () => void;
}) {
  const { previa, loading, error } = usePreviaPerfil(dadosPessoaisId, perfil);
  const { conceder, remover } = usePerfilMutations();
  const pendente = conceder.isPending || remover.isPending;
  const nomePerfil = nomeDoPerfil(perfil);

  async function confirmar() {
    if (!previa) return;
    const mutacao = previa.concessao ? conceder : remover;
    try {
      await mutacao.mutateAsync({ dadosPessoaisId, perfil });
      onClose();
    } catch {
      // O toast com o motivo já saiu no onError da mutação.
    }
  }

  return (
    <Dialog open onClose={onClose} maxWidth="sm" fullWidth scroll="paper">
      <DialogTitle>
        {previa && !previa.concessao
          ? `Remover o perfil ${nomePerfil}?`
          : `Conceder o perfil ${nomePerfil}?`}
      </DialogTitle>
      <DialogContent dividers>
        {loading && <Skeleton variant="rounded" height={200} />}
        {error && <Alert severity="error">{error}</Alert>}
        {previa && <ConteudoPrevia previa={previa} nome={nome} />}
      </DialogContent>
      <DialogActions>
        <Button variant="outlined" onClick={onClose}>
          Cancelar
        </Button>
        <Button
          variant="contained"
          color={previa && !previa.concessao ? "error" : "primary"}
          onClick={confirmar}
          disabled={!previa || !!previa.bloqueio || pendente}
        >
          {pendente ? "Aguarde..." : previa && !previa.concessao ? "Remover" : "Conceder"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

function ConteudoPrevia({ previa, nome }: { previa: PreviaPerfilResponse; nome: string }) {
  const temSensivel =
    previa.controles.some((c) => c.sensivel) || previa.servidor.some((a) => a.sensivel);

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
      {previa.bloqueio && <Alert severity="info">{previa.bloqueio}</Alert>}

      {previa.concessao ? (
        <>
          {previa.tetoDoAdmin && (
            <Alert severity="warning">
              O administrador não passa por grupo: {nome} vai abrir tudo o que o perfil permite,
              inclusive a gestão de acessos de todo mundo.
            </Alert>
          )}
          {previa.gruposQueVoltam.length > 0 && (
            <Alert severity="info">
              {nome} já teve este perfil e volta aos grupos de antes:{" "}
              <strong>{previa.gruposQueVoltam.map((g) => g.nome).join(", ")}</strong>. Não entra no
              grupo padrão, para a restrição de antes não se perder.
              {previa.acessoIndividualVolta && " O acesso individual antigo também volta a valer."}
            </Alert>
          )}
          {previa.gruposQueVoltam.length === 0 && previa.grupoPadrao && (
            <Typography variant="body2">
              {nome} entra no grupo <strong>{previa.grupoPadrao.nome}</strong>
              {previa.grupoPadrao.ativo ? "." : ", que está inativo e não dá nada por enquanto."}
              {previa.acessoIndividualVolta && " O acesso individual antigo volta a valer."}
            </Typography>
          )}
          {!previa.tetoDoAdmin && previa.gruposQueVoltam.length === 0 && !previa.grupoPadrao && (
            <Alert severity="warning">
              O perfil não tem grupo padrão: {nome} fica sem nenhuma tela dele até entrar num grupo.
            </Alert>
          )}
          {previa.criaCadastroSecretario && (
            <Typography variant="body2">
              {nome} passa a fazer parte da equipe do CRM e pode receber leads na distribuição da
              fila.
            </Typography>
          )}
          {temSensivel && (
            <Alert severity="warning">
              Este perfil dá acesso a dado sensível de alunos ou famílias (itens marcados abaixo).
            </Alert>
          )}
          <Typography variant="subtitle2">O que vai abrir</Typography>
        </>
      ) : (
        <>
          <Typography variant="body2">
            Os grupos de {nome} neste perfil ficam guardados e voltam se o perfil for concedido de
            novo. Os outros perfis dela continuam como estão.
          </Typography>
          {previa.ultimaComPerfil && (
            <Alert severity="warning">
              Ninguém mais com login ativo fica com este perfil. Conversas e alertas endereçados ao
              perfil ficam sem quem os leia.
            </Alert>
          )}
          {previa.leadsAtivos != null && previa.leadsAtivos > 0 && (
            <Alert severity="warning">
              {previa.leadsAtivos === 1
                ? "1 lead ativo do CRM está com a pessoa."
                : `${previa.leadsAtivos} leads ativos do CRM estão com a pessoa.`}{" "}
              Ela sai da distribuição da fila, mas os leads continuam com ela até serem
              reatribuídos.
            </Alert>
          )}
          <Typography variant="subtitle2">O que deixa de abrir</Typography>
        </>
      )}

      <ListaDeAcessos
        telas={previa.telas}
        controles={previa.controles}
        vazio={previa.concessao ? "Nenhuma tela pelos grupos." : "Nada pelos grupos."}
      />
      <Box>
        <Typography variant="subtitle2" sx={{ mb: 1 }}>
          Direto no servidor, pelo perfil
        </Typography>
        <ListaServidor areas={previa.servidor} />
      </Box>
    </Box>
  );
}
