"use client";

import { useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  Avatar,
  Box,
  Button,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  MenuItem,
  Paper,
  Select,
  TextField,
  Typography,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import CallIcon from "@mui/icons-material/Call";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import SchoolIcon from "@mui/icons-material/School";
import FamilyRestroomIcon from "@mui/icons-material/FamilyRestroom";
import CampaignIcon from "@mui/icons-material/Campaign";
import PageScaffold from "@/components/pageScaffold/PageScaffold";
import { RoutesEnum } from "@/enums";
import { useCrmProcesso } from "@/hooks/useCrmProcesso";
import { useCrmEstagios } from "@/hooks/useCrmEstagios";
import { useCrmEquipe } from "@/hooks/useCrmEquipe";
import { useCrmMutations } from "@/hooks/useCrmMutations";
import RegistrarInteracaoDialog from "../_components/RegistrarInteracaoDialog";

function iniciais(nome: string): string {
  const partes = nome.trim().split(/\s+/);
  const primeira = partes[0]?.[0] ?? "";
  const ultima = partes.length > 1 ? partes[partes.length - 1][0] : "";
  return (primeira + ultima).toUpperCase();
}

function formatarData(iso?: string): string {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("pt-BR");
}

function formatarDataHora(iso?: string): string {
  if (!iso) return "—";
  return new Date(iso).toLocaleString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

const RESULTADO_COR: Record<string, "warning" | "error" | "success" | "info"> = {
  Reagendar: "warning",
  "Não atendeu": "error",
  "Sem interesse": "error",
  Atendeu: "success",
};

export default function DetalheLeadCrmPage() {
  const params = useParams<{ processoId: string }>();
  const router = useRouter();
  const processoId = params.processoId;

  const { processo, loading } = useCrmProcesso(processoId);
  const { estagios } = useCrmEstagios();
  const { equipe } = useCrmEquipe();
  const { avancarEstagio, marcarPerdido, reatribuir } = useCrmMutations(processoId);

  const [modalInteracao, setModalInteracao] = useState(false);
  const [modalPerdido, setModalPerdido] = useState(false);
  const [modalReatribuir, setModalReatribuir] = useState(false);
  const [motivoPerda, setMotivoPerda] = useState("");
  const [novoFuncionarioId, setNovoFuncionarioId] = useState<number | "">("");

  const estagiosOrdenados = useMemo(
    () => [...estagios].sort((a, b) => a.ordem - b.ordem),
    [estagios],
  );

  const ehUltimoEstagio =
    processo != null &&
    estagiosOrdenados.length > 0 &&
    processo.estagioAtualId === estagiosOrdenados[estagiosOrdenados.length - 1].id;

  if (loading || !processo) {
    return (
      <PageScaffold>
        <Box sx={{ display: "flex", justifyContent: "center", py: 6 }}>
          <CircularProgress />
        </Box>
      </PageScaffold>
    );
  }

  return (
    <PageScaffold>
      <Button
        startIcon={<ArrowBackIcon />}
        onClick={() => router.push(RoutesEnum.SECRETARIA_CRM)}
        sx={{ mb: 2 }}
      >
        Voltar para o CRM
      </Button>

      <Paper variant="outlined" sx={{ p: 3, display: "flex", flexDirection: "column", gap: 2, mb: 2.5 }}>
        <Box sx={{ display: "flex", alignItems: "flex-start", gap: 2, flexWrap: "wrap" }}>
          <Avatar sx={{ width: 60, height: 60, fontSize: 20 }}>{iniciais(processo.alunoNome)}</Avatar>
          <Box sx={{ flex: 1, minWidth: 200 }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1.2, flexWrap: "wrap" }}>
              <Typography variant="h5" fontWeight={600}>
                {processo.alunoNome}
              </Typography>
              <Chip
                size="small"
                label={processo.tipo === "NOVA" ? "Matrícula nova" : "Rematrícula"}
                color={processo.tipo === "NOVA" ? "primary" : "default"}
              />
              <Chip
                size="small"
                label={processo.status === "MATRICULADO" ? "Matriculado" : "Processo ativo"}
                color={processo.status === "MATRICULADO" ? "success" : "primary"}
                variant="outlined"
              />
            </Box>
            <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap", mt: 1 }}>
              <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                <SchoolIcon fontSize="small" color="action" />
                <Typography variant="body2" color="text.secondary">
                  {processo.serieNome}
                </Typography>
              </Box>
              <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                <FamilyRestroomIcon fontSize="small" color="action" />
                <Typography variant="body2" color="text.secondary">
                  {processo.responsavelNome ?? "—"} {processo.responsavelTelefone ? `· ${processo.responsavelTelefone}` : ""}
                </Typography>
              </Box>
              <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                <CampaignIcon fontSize="small" color="action" />
                <Typography variant="body2" color="text.secondary">
                  {processo.origemNome}
                </Typography>
              </Box>
            </Box>
          </Box>
          <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
            <Button
              variant="outlined"
              startIcon={<CallIcon />}
              onClick={() => setModalInteracao(true)}
            >
              Registrar interação
            </Button>
            {processo.status === "ATIVO" && !ehUltimoEstagio && (
              <Button
                variant="contained"
                startIcon={<ArrowForwardIcon />}
                onClick={() => avancarEstagio.mutate()}
                disabled={avancarEstagio.isPending}
              >
                Avançar estágio
              </Button>
            )}
          </Box>
        </Box>

        <Box sx={{ display: "flex", gap: 0.5 }}>
          {estagiosOrdenados.map((e) => {
            const atual = e.id === processo.estagioAtualId;
            const concluido = e.ordem < (estagiosOrdenados.find((x) => x.id === processo.estagioAtualId)?.ordem ?? 0);
            return (
              <Box key={e.id} sx={{ flex: 1, minWidth: 100 }}>
                <Box
                  sx={{
                    height: 5,
                    borderRadius: 3,
                    mb: 0.5,
                    bgcolor: concluido || atual ? "primary.main" : "action.disabledBackground",
                  }}
                />
                <Typography variant="caption" fontWeight={atual ? 600 : 400} color={atual ? "text.primary" : "text.secondary"}>
                  {e.nome}
                </Typography>
              </Box>
            );
          })}
        </Box>
      </Paper>

      <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", md: "2fr 1fr" }, gap: 2.5 }}>
        <Paper variant="outlined" sx={{ p: 2.5 }}>
          <Box sx={{ display: "flex", justifyContent: "space-between", mb: 1.5 }}>
            <Typography variant="h6" fontWeight={600}>
              Timeline de interações
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {processo.interacoes.length} registros
            </Typography>
          </Box>
          {processo.interacoes.map((i) => (
            <Box key={i.id} sx={{ display: "flex", gap: 1.5, pb: 2 }}>
              <Box
                sx={{
                  width: 30,
                  height: 30,
                  borderRadius: "50%",
                  bgcolor: "primary.light",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                }}
              >
                <CallIcon sx={{ fontSize: 16 }} />
              </Box>
              <Box sx={{ flex: 1, minWidth: 0 }}>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1, flexWrap: "wrap" }}>
                  <Typography variant="body2" fontWeight={600}>
                    {i.tipo === "SISTEMA" ? "Sistema" : i.tipo} {i.resultado ? `— ${i.resultado}` : ""}
                  </Typography>
                  {i.resultado && RESULTADO_COR[i.resultado] && (
                    <Chip size="small" label={i.resultado} color={RESULTADO_COR[i.resultado]} />
                  )}
                  <Typography variant="caption" color="text.secondary">
                    {formatarDataHora(i.criadoEm)}
                  </Typography>
                </Box>
                {i.observacoes && (
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                    {i.observacoes}
                  </Typography>
                )}
                <Typography variant="caption" color="text.secondary">
                  {i.autorNome}
                </Typography>
                {i.proximaAcao && (
                  <Chip
                    size="small"
                    color="primary"
                    variant="outlined"
                    label={`Próxima ação: ${formatarDataHora(i.proximaAcao)}`}
                    sx={{ display: "block", mt: 0.5, width: "fit-content" }}
                  />
                )}
              </Box>
            </Box>
          ))}
          {processo.interacoes.length === 0 && (
            <Typography variant="body2" color="text.secondary">
              Nenhuma interação registrada ainda.
            </Typography>
          )}
        </Paper>

        <Box sx={{ display: "flex", flexDirection: "column", gap: 2.5 }}>
          <Paper variant="outlined" sx={{ p: 2.5 }}>
            <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 1.5 }}>
              Próxima ação
            </Typography>
            {processo.proximaAcao ? (
              <Chip label={formatarDataHora(processo.proximaAcao)} color="primary" variant="outlined" />
            ) : (
              <Typography variant="body2" color="text.secondary">
                Nenhuma próxima ação agendada.
              </Typography>
            )}
            {processo.status === "ATIVO" && (
              <Box sx={{ mt: 1.5 }}>
                <Button size="small" color="error" onClick={() => setModalPerdido(true)}>
                  Marcar perdido
                </Button>
              </Box>
            )}
          </Paper>

          <Paper variant="outlined" sx={{ p: 2.5 }}>
            <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 1.5 }}>
              Dados do processo
            </Typography>
            {[
              ["Tipo de processo", processo.tipo],
              ["Status", processo.status],
              ["Estágio atual", processo.estagioAtualNome + (processo.subestagio ? ` · ${processo.subestagio}` : "")],
              ["Ciclo letivo", String(processo.anoLetivo)],
              ["Origem", processo.origemNome],
              ["Criado em", formatarData(processo.criadoEm)],
            ].map(([rot, val]) => (
              <Box
                key={rot}
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  py: 1,
                  borderBottom: "1px solid",
                  borderColor: "divider",
                }}
              >
                <Typography variant="caption" color="text.secondary">
                  {rot}
                </Typography>
                <Typography variant="body2" fontWeight={600}>
                  {val}
                </Typography>
              </Box>
            ))}
          </Paper>

          <Paper variant="outlined" sx={{ p: 2.5 }}>
            <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 1.5 }}>
              Responsável pelo atendimento
            </Typography>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1.2 }}>
              <Avatar sx={{ width: 36, height: 36, fontSize: 12 }}>
                {processo.funcionarioNome ? iniciais(processo.funcionarioNome) : "—"}
              </Avatar>
              <Box sx={{ flex: 1 }}>
                <Typography variant="body2" fontWeight={600}>
                  {processo.funcionarioNome ?? "Sem responsável"}
                </Typography>
              </Box>
              <Button
                size="small"
                onClick={() => {
                  setNovoFuncionarioId(processo.funcionarioId ?? "");
                  setModalReatribuir(true);
                }}
              >
                Reatribuir
              </Button>
            </Box>
          </Paper>
        </Box>
      </Box>

      <RegistrarInteracaoDialog
        open={modalInteracao}
        onClose={() => setModalInteracao(false)}
        processoId={processo.id}
        alunoNome={processo.alunoNome}
        responsavelNome={processo.responsavelNome}
        estagioAtualId={processo.estagioAtualId}
        estagios={estagiosOrdenados}
      />

      <Dialog open={modalPerdido} onClose={() => setModalPerdido(false)} maxWidth="xs" fullWidth>
        <DialogTitle>Marcar como perdido</DialogTitle>
        <DialogContent sx={{ display: "flex", flexDirection: "column", gap: 2, pt: 1 }}>
          <DialogContentText>
            Informe o motivo da perda de <strong>{processo.alunoNome}</strong>.
          </DialogContentText>
          <TextField
            label="Motivo"
            multiline
            minRows={2}
            value={motivoPerda}
            onChange={(e) => setMotivoPerda(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setModalPerdido(false)}>Cancelar</Button>
          <Button
            variant="contained"
            color="error"
            disabled={!motivoPerda.trim() || marcarPerdido.isPending}
            onClick={async () => {
              await marcarPerdido.mutateAsync({ motivo: motivoPerda });
              setModalPerdido(false);
              setMotivoPerda("");
            }}
          >
            Marcar perdido
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={modalReatribuir} onClose={() => setModalReatribuir(false)} maxWidth="xs" fullWidth>
        <DialogTitle>Reatribuir processo</DialogTitle>
        <DialogContent sx={{ pt: 1 }}>
          <Select<number | "">
            fullWidth
            displayEmpty
            value={novoFuncionarioId}
            onChange={(e) => setNovoFuncionarioId(e.target.value === "" ? "" : Number(e.target.value))}
          >
            <MenuItem value="">Selecione um atendente</MenuItem>
            {equipe.map((f) => (
              <MenuItem key={f.funcionarioId} value={f.funcionarioId}>
                {f.nome}
              </MenuItem>
            ))}
          </Select>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setModalReatribuir(false)}>Cancelar</Button>
          <Button
            variant="contained"
            disabled={!novoFuncionarioId || reatribuir.isPending}
            onClick={async () => {
              await reatribuir.mutateAsync({ funcionarioId: Number(novoFuncionarioId) });
              setModalReatribuir(false);
            }}
          >
            Reatribuir
          </Button>
        </DialogActions>
      </Dialog>
    </PageScaffold>
  );
}
