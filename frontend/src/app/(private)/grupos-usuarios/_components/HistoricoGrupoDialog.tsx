"use client";

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
  Skeleton,
  Stack,
  Typography,
} from "@mui/material";
import { useHistoricoGrupoUsuario } from "@/hooks/useGruposUsuarios";
import {
  CampoAlteradoResponse,
  GrupoUsuarioDetalheResponse,
  RevisaoGrupoUsuarioResponse,
} from "@/services/domains/grupo-usuario";

interface HistoricoGrupoDialogProps {
  open: boolean;
  onClose: () => void;
  grupo: GrupoUsuarioDetalheResponse;
}

const NOME_DO_CAMPO: Record<CampoAlteradoResponse["campo"], string> = {
  nome: "Nome",
  descricao: "Descrição",
  ativo: "Situação",
};

const formatoData = new Intl.DateTimeFormat("pt-BR", { dateStyle: "short", timeStyle: "short" });

/** Alterações do grupo, da mais recente para a mais antiga (docs/permissoes.md, seção 9.5). */
export default function HistoricoGrupoDialog({ open, onClose, grupo }: HistoricoGrupoDialogProps) {
  const { revisoes, loading, carregandoMais, temMais, carregarMais, error } =
    useHistoricoGrupoUsuario(grupo.id, open);

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth scroll="paper">
      <DialogTitle>Histórico de {grupo.nome}</DialogTitle>
      <DialogContent dividers>
        {loading ? (
          <Stack spacing={2}>
            {[0, 1, 2].map((i) => (
              <Skeleton key={i} variant="rounded" height={72} />
            ))}
          </Stack>
        ) : error ? (
          <Alert severity="error">{error}</Alert>
        ) : revisoes.length === 0 ? (
          <Typography color="text.secondary">
            Nenhuma alteração registrada ainda. O histórico começa na primeira alteração feita pela
            tela de grupos; o que veio da implantação não aparece aqui.
          </Typography>
        ) : (
          <Stack divider={<Divider flexItem />} spacing={2}>
            {revisoes.map((revisao) => (
              <Revisao key={revisao.revisao} revisao={revisao} />
            ))}
          </Stack>
        )}
        {temMais && !loading && (
          <Box sx={{ display: "flex", justifyContent: "center", mt: 2 }}>
            <Button onClick={() => carregarMais()} disabled={carregandoMais}>
              {carregandoMais ? "Carregando..." : "Carregar mais"}
            </Button>
          </Box>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Fechar</Button>
      </DialogActions>
    </Dialog>
  );
}

function Revisao({ revisao }: { revisao: RevisaoGrupoUsuarioResponse }) {
  return (
    <Box>
      <Typography variant="body2" color="text.secondary">
        {formatoData.format(new Date(revisao.data))} · {revisao.autor?.nome ?? "Sistema"}
      </Typography>
      <Stack spacing={1} sx={{ mt: 1 }}>
        {revisao.criacao && <Typography variant="body2">Criou o grupo.</Typography>}
        {revisao.campos.map((campo) => (
          <Campo key={campo.campo} campo={campo} criacao={revisao.criacao} />
        ))}
        <Itens titulo="Telas liberadas" nomes={revisao.telasConcedidas.map((t) => t.nome)} />
        <Itens
          titulo="Telas retiradas"
          nomes={revisao.telasRetiradas.map((t) => t.nome)}
          retirado
        />
        <Itens titulo="Ações liberadas" nomes={revisao.controlesConcedidos.map((c) => c.nome)} />
        <Itens
          titulo="Ações retiradas"
          nomes={revisao.controlesRetirados.map((c) => c.nome)}
          retirado
        />
        <Itens titulo="Pessoas adicionadas" nomes={revisao.pessoasAdicionadas.map((p) => p.nome)} />
        <Itens
          titulo="Pessoas removidas"
          nomes={revisao.pessoasRemovidas.map((p) => p.nome)}
          retirado
        />
      </Stack>
    </Box>
  );
}

function valorDoCampo(campo: CampoAlteradoResponse["campo"], valor: string | null) {
  if (campo === "ativo") return valor === "true" ? "Ativo" : "Inativo";
  return valor ?? "(vazio)";
}

function Campo({ campo, criacao }: { campo: CampoAlteradoResponse; criacao: boolean }) {
  const nome = NOME_DO_CAMPO[campo.campo];
  if (criacao) {
    return (
      <Typography variant="body2">
        {nome}: {valorDoCampo(campo.campo, campo.depois)}
      </Typography>
    );
  }
  return (
    <Typography variant="body2">
      {nome}:{" "}
      <Box component="span" sx={{ textDecoration: "line-through", color: "text.secondary" }}>
        {valorDoCampo(campo.campo, campo.antes)}
      </Box>{" "}
      → {valorDoCampo(campo.campo, campo.depois)}
    </Typography>
  );
}

function Itens({
  titulo,
  nomes,
  retirado = false,
}: {
  titulo: string;
  nomes: string[];
  retirado?: boolean;
}) {
  if (nomes.length === 0) return null;
  return (
    <Box>
      <Typography variant="body2">
        {titulo} ({nomes.length}):
      </Typography>
      <Box sx={{ display: "flex", gap: 0.5, flexWrap: "wrap", mt: 0.5 }}>
        {nomes.map((nome, i) => (
          <Chip
            key={`${i}-${nome}`}
            size="small"
            variant="outlined"
            color={retirado ? "error" : "success"}
            label={nome}
          />
        ))}
      </Box>
    </Box>
  );
}
