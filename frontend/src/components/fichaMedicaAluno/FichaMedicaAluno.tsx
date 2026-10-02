"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Alert,
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
  MenuItem,
  Radio,
  RadioGroup,
  TextField,
  Tooltip,
  Typography,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import DownloadIcon from "@mui/icons-material/Download";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import DescriptionOutlinedIcon from "@mui/icons-material/DescriptionOutlined";
import MedicationOutlinedIcon from "@mui/icons-material/MedicationOutlined";
import ContainerSection from "@/components/containerSection/containerSection";
import FileUploadArea from "@/components/fileUploadArea";
import {
  chaveTipoSanguineo,
  TIPO_USO_CONTINUO,
  TIPO_USO_PERIODO,
  TIPOS_LAUDO,
  TIPOS_SANGUINEOS,
  TIPOS_USO_MEDICACAO,
} from "@/constants/fichaMedica";
import { useFichaMedicaAlunoMutations } from "@/hooks/useFichaMedicaAlunoMutations";
import {
  FichaMedicaAlunoResponse,
  LaudoMedicoResponse,
  MedicacaoResponse,
} from "@/services/domains/aluno/response";
import { MedicacaoRequest } from "@/services/domains/aluno/request";
import * as S from "./styles";

interface FichaMedicaAlunoProps {
  alunoId: string;
  fichaMedica: FichaMedicaAlunoResponse | null;
  loading: boolean;
  /** Quando falso, a aba é somente leitura (sem anexar, editar ou remover). */
  podeEditar: boolean;
}

interface DadosClinicos {
  tipoSanguineo: string;
  necessidadesEspeciais: string;
  doencasRespiratorias: string;
  alergiasAlimentares: string;
  alergiasMedicamentosas: string;
}

const DADOS_CLINICOS_VAZIO: DadosClinicos = {
  tipoSanguineo: "",
  necessidadesEspeciais: "",
  doencasRespiratorias: "",
  alergiasAlimentares: "",
  alergiasMedicamentosas: "",
};

function paraDadosClinicos(ficha: FichaMedicaAlunoResponse | null): DadosClinicos {
  if (!ficha) return DADOS_CLINICOS_VAZIO;
  return {
    tipoSanguineo: chaveTipoSanguineo(ficha.tipoSanguineo),
    necessidadesEspeciais: ficha.necessidadesEspeciais ?? "",
    doencasRespiratorias: ficha.doencasRespiratorias ?? "",
    alergiasAlimentares: ficha.alergiasAlimentares ?? "",
    alergiasMedicamentosas: ficha.alergiasMedicamentosas ?? "",
  };
}

function formatarData(iso?: string | null): string {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("pt-BR");
}

/** "12/03/2026 até 30/04/2026", "a partir de 12/03/2026" ou "Uso contínuo". */
function descreverPeriodo(medicacao: MedicacaoResponse): string {
  if (medicacao.tipoUso === TIPO_USO_CONTINUO) return "Uso contínuo";
  if (medicacao.dataInicio && medicacao.dataFim) {
    return `${formatarData(medicacao.dataInicio)} até ${formatarData(medicacao.dataFim)}`;
  }
  if (medicacao.dataInicio) return `a partir de ${formatarData(medicacao.dataInicio)}`;
  if (medicacao.dataFim) return `até ${formatarData(medicacao.dataFim)}`;
  return "Período não informado";
}

export default function FichaMedicaAluno({
  alunoId,
  fichaMedica,
  loading,
  podeEditar,
}: FichaMedicaAlunoProps) {
  const {
    salvarDadosClinicos,
    anexarLaudo,
    removerLaudo,
    anexarMedicacao,
    atualizarMedicacao,
    desativarMedicacao,
  } = useFichaMedicaAlunoMutations(alunoId);

  const [dados, setDados] = useState<DadosClinicos>(() => paraDadosClinicos(fichaMedica));
  const [dialogLaudo, setDialogLaudo] = useState(false);
  const [medicacaoEmEdicao, setMedicacaoEmEdicao] = useState<MedicacaoResponse | null>(null);
  const [dialogMedicacao, setDialogMedicacao] = useState(false);

  // A ficha chega depois do primeiro render (e muda a cada salvamento); o form
  // acompanha, mas sem sobrescrever o que o usuário está digitando não é
  // problema aqui porque toda escrita passa pelo botão Salvar.
  useEffect(() => {
    setDados(paraDadosClinicos(fichaMedica));
  }, [fichaMedica]);

  const original = useMemo(() => paraDadosClinicos(fichaMedica), [fichaMedica]);
  const alterado = useMemo(
    () => (Object.keys(original) as (keyof DadosClinicos)[]).some((k) => original[k] !== dados[k]),
    [original, dados],
  );

  const laudos = fichaMedica?.laudos ?? [];
  const medicacoes = fichaMedica?.medicacoes ?? [];

  function campo(key: keyof DadosClinicos) {
    return {
      value: dados[key],
      onChange: (e: React.ChangeEvent<HTMLInputElement>) =>
        setDados((atual) => ({ ...atual, [key]: e.target.value })),
      disabled: !podeEditar,
      size: "small" as const,
      fullWidth: true,
    };
  }

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", py: 6 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <S.Stack>
      {!fichaMedica && (
        <Alert severity="info">
          Este aluno ainda não tem ficha médica.{" "}
          {podeEditar
            ? "Preencha os dados abaixo ou anexe um laudo para criá-la."
            : "Procure a secretaria para o preenchimento."}
        </Alert>
      )}

      <ContainerSection
        title="Dados clínicos"
        description="Informações gerais de saúde e alergias do aluno."
        actions={
          podeEditar && (
            <Button
              size="small"
              variant="contained"
              disabled={!alterado || salvarDadosClinicos.isPending}
              onClick={() => salvarDadosClinicos.mutate(dados)}
            >
              {salvarDadosClinicos.isPending ? "Salvando..." : "Salvar alterações"}
            </Button>
          )
        }
      >
        <S.CampoGrid>
          <TextField select label="Tipo sanguíneo" {...campo("tipoSanguineo")}>
            <MenuItem value="">Não informado</MenuItem>
            {TIPOS_SANGUINEOS.map((opcao) => (
              <MenuItem key={opcao.key} value={opcao.key}>
                {opcao.label}
              </MenuItem>
            ))}
          </TextField>
          <TextField label="Necessidades especiais" {...campo("necessidadesEspeciais")} />
          <TextField label="Doenças respiratórias" {...campo("doencasRespiratorias")} />
          <TextField label="Alergias alimentares" {...campo("alergiasAlimentares")} />
          <TextField
            label="Alergias medicamentosas"
            multiline
            minRows={2}
            {...campo("alergiasMedicamentosas")}
          />
        </S.CampoGrid>
      </ContainerSection>

      <ContainerSection
        title="Laudos"
        description="Documentos clínicos enviados pela família ou pelo profissional."
        actions={
          podeEditar && (
            <Button size="small" startIcon={<AddIcon />} onClick={() => setDialogLaudo(true)}>
              Anexar laudo
            </Button>
          )
        }
      >
        {laudos.length === 0 ? (
          <S.Vazio>Nenhum laudo anexado.</S.Vazio>
        ) : (
          <S.ItemList>
            {laudos.map((laudo) => (
              <LinhaLaudo
                key={laudo.id}
                laudo={laudo}
                podeEditar={podeEditar}
                removendo={removerLaudo.isPending}
                onRemover={() => removerLaudo.mutate(laudo.id)}
              />
            ))}
          </S.ItemList>
        )}
      </ContainerSection>

      <ContainerSection
        title="Medicações"
        description="Remédios em uso, inclusive os informados pela família no portal, com receita e período."
        actions={
          podeEditar && (
            <Button
              size="small"
              startIcon={<AddIcon />}
              onClick={() => {
                setMedicacaoEmEdicao(null);
                setDialogMedicacao(true);
              }}
            >
              Registrar medicação
            </Button>
          )
        }
      >
        {medicacoes.length === 0 ? (
          <S.Vazio>Nenhuma medicação registrada.</S.Vazio>
        ) : (
          <S.ItemList>
            {medicacoes.map((medicacao) => (
              <LinhaMedicacao
                key={medicacao.id}
                medicacao={medicacao}
                podeEditar={podeEditar}
                desativando={desativarMedicacao.isPending}
                onEditar={() => {
                  setMedicacaoEmEdicao(medicacao);
                  setDialogMedicacao(true);
                }}
                onDesativar={() => desativarMedicacao.mutate(medicacao.id)}
              />
            ))}
          </S.ItemList>
        )}
      </ContainerSection>

      <DialogLaudo
        aberto={dialogLaudo}
        salvando={anexarLaudo.isPending}
        onFechar={() => setDialogLaudo(false)}
        onSalvar={(dadosLaudo) =>
          anexarLaudo.mutate(dadosLaudo, { onSuccess: () => setDialogLaudo(false) })
        }
      />

      <DialogMedicacao
        aberto={dialogMedicacao}
        medicacao={medicacaoEmEdicao}
        salvando={anexarMedicacao.isPending || atualizarMedicacao.isPending}
        onFechar={() => setDialogMedicacao(false)}
        onSalvar={(dadosMedicacao) => {
          const fechar = { onSuccess: () => setDialogMedicacao(false) };
          if (medicacaoEmEdicao) {
            atualizarMedicacao.mutate(
              { id: medicacaoEmEdicao.id, dados: dadosMedicacao },
              fechar,
            );
          } else {
            anexarMedicacao.mutate(dadosMedicacao, fechar);
          }
        }}
      />
    </S.Stack>
  );
}

// ─── Linhas ───────────────────────────────────────────────────────────────────

function BotaoDownload({ url, nome }: { url?: string; nome?: string }) {
  if (!url) return null;
  return (
    <Tooltip title={nome ? `Baixar ${nome}` : "Baixar arquivo"}>
      <IconButton size="small" component="a" href={url} target="_blank" rel="noopener noreferrer">
        <DownloadIcon fontSize="small" />
      </IconButton>
    </Tooltip>
  );
}

function LinhaLaudo({
  laudo,
  podeEditar,
  removendo,
  onRemover,
}: {
  laudo: LaudoMedicoResponse;
  podeEditar: boolean;
  removendo: boolean;
  onRemover: () => void;
}) {
  return (
    <S.ItemRow>
      <DescriptionOutlinedIcon fontSize="small" color="action" sx={{ mt: 0.4 }} />
      <S.ItemBody>
        <S.ItemTitulo>
          {laudo.arquivo?.nome ?? "Laudo"}
          {laudo.tipoDescricao && (
            <Chip size="small" label={laudo.tipoDescricao} variant="outlined" />
          )}
        </S.ItemTitulo>
        {laudo.observacao && <S.ItemObservacao>{laudo.observacao}</S.ItemObservacao>}
      </S.ItemBody>
      <S.ItemAcoes>
        <BotaoDownload url={laudo.arquivo?.downloadUrl} nome={laudo.arquivo?.nome} />
        {podeEditar && (
          <Tooltip title="Remover laudo">
            <IconButton size="small" color="error" disabled={removendo} onClick={onRemover}>
              <DeleteOutlineIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        )}
      </S.ItemAcoes>
    </S.ItemRow>
  );
}

function LinhaMedicacao({
  medicacao,
  podeEditar,
  desativando,
  onEditar,
  onDesativar,
}: {
  medicacao: MedicacaoResponse;
  podeEditar: boolean;
  desativando: boolean;
  onEditar: () => void;
  onDesativar: () => void;
}) {
  const posologia = [medicacao.dosagem, medicacao.horario].filter(Boolean).join(" · ");

  return (
    <S.ItemRow>
      <MedicationOutlinedIcon fontSize="small" color="action" sx={{ mt: 0.4 }} />
      <S.ItemBody>
        <S.ItemTitulo>
          {medicacao.nome}
          {medicacao.tipoUsoDescricao && (
            <Chip
              size="small"
              label={medicacao.tipoUsoDescricao}
              color={medicacao.tipoUso === TIPO_USO_CONTINUO ? "warning" : "default"}
              variant="outlined"
            />
          )}
        </S.ItemTitulo>
        {posologia && <S.ItemMeta>{posologia}</S.ItemMeta>}
        {/* O que veio do portal chega sem tipo de uso: não há período a descrever. */}
        {medicacao.tipoUso && <S.ItemMeta>{descreverPeriodo(medicacao)}</S.ItemMeta>}
        {medicacao.receita && <S.ItemMeta>Receita: {medicacao.receita.nome}</S.ItemMeta>}
        {medicacao.observacao && <S.ItemObservacao>{medicacao.observacao}</S.ItemObservacao>}
      </S.ItemBody>
      <S.ItemAcoes>
        <BotaoDownload url={medicacao.receita?.downloadUrl} nome={medicacao.receita?.nome} />
        {podeEditar && (
          <>
            <Tooltip title="Editar medicação">
              <IconButton size="small" onClick={onEditar}>
                <EditOutlinedIcon fontSize="small" />
              </IconButton>
            </Tooltip>
            <Tooltip title="Desativar medicação (sai da ficha, fica no histórico)">
              <IconButton size="small" color="error" disabled={desativando} onClick={onDesativar}>
                <DeleteOutlineIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          </>
        )}
      </S.ItemAcoes>
    </S.ItemRow>
  );
}

// ─── Diálogos ─────────────────────────────────────────────────────────────────

function DialogLaudo({
  aberto,
  salvando,
  onFechar,
  onSalvar,
}: {
  aberto: boolean;
  salvando: boolean;
  onFechar: () => void;
  onSalvar: (dados: { arquivo: File; tipo: string; observacao?: string }) => void;
}) {
  const [arquivos, setArquivos] = useState<File[]>([]);
  const [tipo, setTipo] = useState("NEUROPSICOLOGICO");
  const [observacao, setObservacao] = useState("");

  useEffect(() => {
    if (aberto) {
      setArquivos([]);
      setTipo("NEUROPSICOLOGICO");
      setObservacao("");
    }
  }, [aberto]);

  const arquivo = arquivos[0];

  return (
    <Dialog open={aberto} onClose={onFechar} fullWidth maxWidth="sm">
      <DialogTitle>Anexar laudo</DialogTitle>
      <DialogContent>
        <Box sx={{ display: "flex", flexDirection: "column", gap: 2, pt: 1 }}>
          <FileUploadArea
            files={arquivos}
            onChange={setArquivos}
            multiple={false}
            label="Clique para selecionar o laudo"
          />
          <TextField
            select
            size="small"
            fullWidth
            label="Tipo de laudo"
            value={tipo}
            onChange={(e) => setTipo(e.target.value)}
          >
            {TIPOS_LAUDO.map((opcao) => (
              <MenuItem key={opcao.key} value={opcao.key}>
                {opcao.label}
              </MenuItem>
            ))}
          </TextField>
          <TextField
            size="small"
            fullWidth
            multiline
            minRows={3}
            label="Observação"
            value={observacao}
            onChange={(e) => setObservacao(e.target.value)}
          />
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onFechar} color="inherit" disabled={salvando}>
          Cancelar
        </Button>
        <Button
          variant="contained"
          disabled={!arquivo || salvando}
          onClick={() => arquivo && onSalvar({ arquivo, tipo, observacao })}
        >
          {salvando ? "Anexando..." : "Anexar"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

function DialogMedicacao({
  aberto,
  medicacao,
  salvando,
  onFechar,
  onSalvar,
}: {
  aberto: boolean;
  medicacao: MedicacaoResponse | null;
  salvando: boolean;
  onFechar: () => void;
  onSalvar: (dados: MedicacaoRequest) => void;
}) {
  const [arquivos, setArquivos] = useState<File[]>([]);
  const [nome, setNome] = useState("");
  const [dosagem, setDosagem] = useState("");
  const [horario, setHorario] = useState("");
  const [tipoUso, setTipoUso] = useState(TIPO_USO_PERIODO);
  const [dataInicio, setDataInicio] = useState("");
  const [dataFim, setDataFim] = useState("");
  const [observacao, setObservacao] = useState("");

  useEffect(() => {
    if (!aberto) return;
    setArquivos([]);
    setNome(medicacao?.nome ?? "");
    setDosagem(medicacao?.dosagem ?? "");
    setHorario(medicacao?.horario ?? "");
    // O que a família incluiu pelo portal chega sem tipo de uso; editar é classificar.
    setTipoUso(medicacao?.tipoUso ?? TIPO_USO_PERIODO);
    setDataInicio(medicacao?.dataInicio ?? "");
    setDataFim(medicacao?.dataFim ?? "");
    setObservacao(medicacao?.observacao ?? "");
  }, [aberto, medicacao]);

  const porPeriodo = tipoUso === TIPO_USO_PERIODO;
  // Na edição a receita já anexada não é substituída — o PUT não leva arquivo.
  const emEdicao = medicacao !== null;

  return (
    <Dialog open={aberto} onClose={onFechar} fullWidth maxWidth="sm">
      <DialogTitle>{emEdicao ? "Editar medicação" : "Registrar medicação"}</DialogTitle>
      <DialogContent>
        <Box sx={{ display: "flex", flexDirection: "column", gap: 2, pt: 1 }}>
          {!emEdicao && (
            <FileUploadArea
              files={arquivos}
              onChange={setArquivos}
              multiple={false}
              label="Clique para anexar a receita (opcional)"
            />
          )}

          <TextField
            size="small"
            fullWidth
            required
            label="Medicação"
            placeholder="Ex.: Ritalina LA"
            value={nome}
            onChange={(e) => setNome(e.target.value)}
            inputProps={{ maxLength: 255 }}
          />
          <Box sx={{ display: "flex", gap: 2 }}>
            <TextField
              size="small"
              fullWidth
              label="Dosagem"
              placeholder="Ex.: 20 mg"
              value={dosagem}
              onChange={(e) => setDosagem(e.target.value)}
              inputProps={{ maxLength: 255 }}
            />
            <TextField
              size="small"
              fullWidth
              label="Horário"
              placeholder="Ex.: 07h, antes da aula"
              value={horario}
              onChange={(e) => setHorario(e.target.value)}
              inputProps={{ maxLength: 255 }}
            />
          </Box>

          <Box>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              Período de administração
            </Typography>
            <RadioGroup row value={tipoUso} onChange={(e) => setTipoUso(e.target.value)}>
              {TIPOS_USO_MEDICACAO.map((opcao) => (
                <FormControlLabel
                  key={opcao.key}
                  value={opcao.key}
                  control={<Radio size="small" />}
                  label={opcao.label}
                />
              ))}
            </RadioGroup>
          </Box>

          {porPeriodo && (
            <Box sx={{ display: "flex", gap: 2 }}>
              <TextField
                size="small"
                fullWidth
                type="date"
                label="Início"
                InputLabelProps={{ shrink: true }}
                value={dataInicio}
                onChange={(e) => setDataInicio(e.target.value)}
              />
              <TextField
                size="small"
                fullWidth
                type="date"
                label="Fim"
                InputLabelProps={{ shrink: true }}
                value={dataFim}
                onChange={(e) => setDataFim(e.target.value)}
              />
            </Box>
          )}

          <TextField
            size="small"
            fullWidth
            multiline
            minRows={2}
            label="Observação"
            value={observacao}
            onChange={(e) => setObservacao(e.target.value)}
            inputProps={{ maxLength: 500 }}
          />
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onFechar} color="inherit" disabled={salvando}>
          Cancelar
        </Button>
        <Button
          variant="contained"
          disabled={salvando || !nome.trim()}
          onClick={() =>
            onSalvar({
              arquivo: arquivos[0] ?? null,
              nome: nome.trim(),
              dosagem,
              horario,
              tipoUso,
              dataInicio: porPeriodo ? dataInicio : null,
              dataFim: porPeriodo ? dataFim : null,
              observacao,
            })
          }
        >
          {salvando ? "Salvando..." : "Salvar"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
