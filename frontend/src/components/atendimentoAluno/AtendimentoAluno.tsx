"use client";

import { useEffect, useState } from "react";
import {
  Box,
  Button,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControlLabel,
  IconButton,
  Radio,
  RadioGroup,
  TextField,
  Tooltip,
  Typography,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import DownloadIcon from "@mui/icons-material/Download";
import AttachFileIcon from "@mui/icons-material/AttachFile";
import CloseIcon from "@mui/icons-material/Close";
import ContainerSection from "@/components/containerSection/containerSection";
import { useAtendimentosPsicologicos } from "@/hooks/useAtendimentosPsicologicos";
import {
  AtendimentoPsicologicoResponse,
  LaudoMedicoResponse,
} from "@/services/domains/aluno/response";
import * as S from "./styles";

interface AtendimentoAlunoProps {
  alunoId: string;
  /** Laudos da ficha médica do aluno, oferecidos no popup de vínculo. */
  laudos: LaudoMedicoResponse[];
  loadingLaudos: boolean;
  /** Quando falso, a aba é somente leitura. */
  podeEditar: boolean;
}

function formatarData(iso?: string | null): string {
  if (!iso) return "—";
  // A data vem como "AAAA-MM-DD"; montar com T00:00 evita o recuo de um dia
  // que o parse ISO puro causa em fusos negativos.
  return new Date(`${iso}T00:00:00`).toLocaleDateString("pt-BR");
}

function hojeISO(): string {
  const agora = new Date();
  const mes = String(agora.getMonth() + 1).padStart(2, "0");
  const dia = String(agora.getDate()).padStart(2, "0");
  return `${agora.getFullYear()}-${mes}-${dia}`;
}

export default function AtendimentoAluno({
  alunoId,
  laudos,
  loadingLaudos,
  podeEditar,
}: AtendimentoAlunoProps) {
  const { atendimentos, loading, error, registrar } = useAtendimentosPsicologicos(alunoId);
  const [dialogAberto, setDialogAberto] = useState(false);

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", py: 6 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <S.Stack>
      <ContainerSection
        title="Atendimentos"
        description="Histórico de atendimentos do aluno com o psicólogo."
        actions={
          podeEditar && (
            <Button size="small" startIcon={<AddIcon />} onClick={() => setDialogAberto(true)}>
              Novo atendimento
            </Button>
          )
        }
      >
        {error ? (
          <S.Vazio>{error}</S.Vazio>
        ) : atendimentos.length === 0 ? (
          <S.Vazio>Nenhum atendimento registrado.</S.Vazio>
        ) : (
          <S.Lista>
            {atendimentos.map((atendimento) => (
              <LinhaAtendimento key={atendimento.id} atendimento={atendimento} />
            ))}
          </S.Lista>
        )}
      </ContainerSection>

      <DialogAtendimento
        aberto={dialogAberto}
        salvando={registrar.isPending}
        laudos={laudos}
        loadingLaudos={loadingLaudos}
        onFechar={() => setDialogAberto(false)}
        onSalvar={(dados) =>
          registrar.mutate(dados, { onSuccess: () => setDialogAberto(false) })
        }
      />
    </S.Stack>
  );
}

function LinhaAtendimento({ atendimento }: { atendimento: AtendimentoPsicologicoResponse }) {
  return (
    <S.Linha>
      <S.Data dateTime={atendimento.data}>{formatarData(atendimento.data)}</S.Data>
      <S.Corpo>
        {atendimento.profissional && (
          <S.Profissional>Profissional: {atendimento.profissional}</S.Profissional>
        )}
        <S.Descricao>{atendimento.descricao}</S.Descricao>
        {atendimento.laudo && (
          <S.LaudoBox>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1, minWidth: 0 }}>
              <AttachFileIcon fontSize="small" />
              <span>{atendimento.laudo.arquivo?.nome ?? "Laudo"}</span>
              {atendimento.laudo.tipoDescricao && (
                <Chip size="small" label={atendimento.laudo.tipoDescricao} variant="outlined" />
              )}
            </Box>
            {atendimento.laudo.arquivo?.downloadUrl && (
              <Tooltip title="Baixar laudo">
                <IconButton
                  size="small"
                  component="a"
                  href={atendimento.laudo.arquivo.downloadUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <DownloadIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            )}
          </S.LaudoBox>
        )}
      </S.Corpo>
    </S.Linha>
  );
}

// ─── Diálogos ─────────────────────────────────────────────────────────────────

function DialogAtendimento({
  aberto,
  salvando,
  laudos,
  loadingLaudos,
  onFechar,
  onSalvar,
}: {
  aberto: boolean;
  salvando: boolean;
  laudos: LaudoMedicoResponse[];
  loadingLaudos: boolean;
  onFechar: () => void;
  onSalvar: (dados: {
    data: string;
    profissional?: string;
    descricao: string;
    laudoId?: number | null;
  }) => void;
}) {
  const [data, setData] = useState(hojeISO());
  const [profissional, setProfissional] = useState("");
  const [descricao, setDescricao] = useState("");
  const [laudoId, setLaudoId] = useState<number | null>(null);
  const [popupLaudo, setPopupLaudo] = useState(false);

  useEffect(() => {
    if (!aberto) return;
    setData(hojeISO());
    setProfissional("");
    setDescricao("");
    setLaudoId(null);
  }, [aberto]);

  const laudoSelecionado = laudos.find((laudo) => laudo.id === laudoId) ?? null;

  return (
    <>
      <Dialog open={aberto} onClose={onFechar} fullWidth maxWidth="sm">
        <DialogTitle>Novo atendimento</DialogTitle>
        <DialogContent>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2, pt: 1 }}>
            <Box sx={{ display: "flex", gap: 2 }}>
              <TextField
                size="small"
                fullWidth
                type="date"
                label="Data"
                InputLabelProps={{ shrink: true }}
                value={data}
                onChange={(e) => setData(e.target.value)}
              />
              <TextField
                size="small"
                fullWidth
                label="Profissional"
                placeholder="Nome do psicólogo"
                value={profissional}
                onChange={(e) => setProfissional(e.target.value)}
              />
            </Box>

            <TextField
              size="small"
              fullWidth
              multiline
              minRows={6}
              label="Descrição do atendimento"
              placeholder="Relato da sessão, encaminhamentos, combinados..."
              value={descricao}
              onChange={(e) => setDescricao(e.target.value)}
            />

            {laudoSelecionado ? (
              <S.LaudoBox>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1, minWidth: 0 }}>
                  <AttachFileIcon fontSize="small" />
                  <span>{laudoSelecionado.arquivo?.nome ?? "Laudo"}</span>
                  {laudoSelecionado.tipoDescricao && (
                    <Chip size="small" label={laudoSelecionado.tipoDescricao} variant="outlined" />
                  )}
                </Box>
                <Tooltip title="Desvincular laudo">
                  <IconButton size="small" onClick={() => setLaudoId(null)}>
                    <CloseIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
              </S.LaudoBox>
            ) : (
              <Button
                size="small"
                startIcon={<AttachFileIcon />}
                onClick={() => setPopupLaudo(true)}
                sx={{ alignSelf: "flex-start" }}
              >
                Vincular laudo
              </Button>
            )}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={onFechar} color="inherit" disabled={salvando}>
            Cancelar
          </Button>
          <Button
            variant="contained"
            disabled={!data || !descricao.trim() || salvando}
            onClick={() =>
              onSalvar({ data, profissional: profissional || undefined, descricao, laudoId })
            }
          >
            {salvando ? "Registrando..." : "Registrar"}
          </Button>
        </DialogActions>
      </Dialog>

      <DialogSelecionarLaudo
        aberto={popupLaudo}
        laudos={laudos}
        loading={loadingLaudos}
        selecionado={laudoId}
        onFechar={() => setPopupLaudo(false)}
        onSelecionar={(id) => {
          setLaudoId(id);
          setPopupLaudo(false);
        }}
      />
    </>
  );
}

function DialogSelecionarLaudo({
  aberto,
  laudos,
  loading,
  selecionado,
  onFechar,
  onSelecionar,
}: {
  aberto: boolean;
  laudos: LaudoMedicoResponse[];
  loading: boolean;
  selecionado: number | null;
  onFechar: () => void;
  onSelecionar: (id: number) => void;
}) {
  const [escolhido, setEscolhido] = useState<number | null>(selecionado);

  useEffect(() => {
    if (aberto) setEscolhido(selecionado);
  }, [aberto, selecionado]);

  return (
    <Dialog open={aberto} onClose={onFechar} fullWidth maxWidth="sm">
      <DialogTitle>Vincular laudo</DialogTitle>
      <DialogContent>
        {loading ? (
          <Box sx={{ display: "flex", justifyContent: "center", py: 3 }}>
            <CircularProgress size={24} />
          </Box>
        ) : laudos.length === 0 ? (
          <Typography variant="body2" color="text.secondary" sx={{ py: 2 }}>
            Este aluno não tem laudos anexados. Adicione um na aba Ficha médica para poder
            vinculá-lo aqui.
          </Typography>
        ) : (
          <RadioGroup
            value={escolhido ?? ""}
            onChange={(e) => setEscolhido(Number(e.target.value))}
          >
            {laudos.map((laudo) => (
              <FormControlLabel
                key={laudo.id}
                value={laudo.id}
                control={<Radio size="small" />}
                label={
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <span>{laudo.arquivo?.nome ?? "Laudo"}</span>
                    {laudo.tipoDescricao && (
                      <Chip size="small" label={laudo.tipoDescricao} variant="outlined" />
                    )}
                  </Box>
                }
              />
            ))}
          </RadioGroup>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onFechar} color="inherit">
          Cancelar
        </Button>
        <Button
          variant="contained"
          disabled={escolhido == null}
          onClick={() => escolhido != null && onSelecionar(escolhido)}
        >
          Vincular
        </Button>
      </DialogActions>
    </Dialog>
  );
}
