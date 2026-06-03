"use client";

import ContainerSection from "@/components/containerSection/containerSection";
import PageScaffold from "@/components/pageScaffold/PageScaffold";
import { useAluno } from "@/hooks/useAluno";
import { useAlunoFichaMedica } from "@/hooks/useAlunoFichaMedica";
import { useAlunoAnotacoesDisciplina } from "@/hooks/useAlunoAnotacoesDisciplina";
import { useNotasAlunoDisciplina } from "@/hooks/useNotasAlunoDisciplina";
import { useAlunoMatriculaMutations } from "@/hooks/useAlunoMatriculaMutations";
import { useDisciplinas } from "@/hooks/useDisciplinas";
import { useAuth } from "@/hooks/useAuth";
import { RoutesEnum } from "@/enums/RoutesEnum";
import { UserRoleEnum } from "@/enums/UserRoleEnum";
import { AlunoDetalheResponse, FichaMedicaAlunoResponse } from "@/services/domains/aluno/response";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import PersonIcon from "@mui/icons-material/Person";
import EditIcon from "@mui/icons-material/Edit";
import {
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  Divider,
  FormControl,
  IconButton,
  InputLabel,
  MenuItem,
  Select,
  Skeleton,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Tabs,
  Typography,
} from "@mui/material";
import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import * as S from "./styles";

// ─── Types ────────────────────────────────────────────────────────────────────

type TabKey = "dadosPessoais" | "fichaMedica" | "notas" | "anotacoes";
type SidebarKey = "cpf" | "rg" | "email" | "nascimento" | "serie" | "turma";

interface SidebarCampo {
  label: string;
  value?: string | null;
  skeletonWidth: number;
}

// ─── Configuração por perfil ──────────────────────────────────────────────────

const ABAS_POR_PERFIL: Record<UserRoleEnum, TabKey[]> = {
  [UserRoleEnum.PROFESSOR]: ["notas", "anotacoes"],
  [UserRoleEnum.ADMIN]: ["dadosPessoais", "fichaMedica", "notas", "anotacoes"],
  [UserRoleEnum.ESTUDANTE]: ["dadosPessoais", "fichaMedica", "notas", "anotacoes"],
};

const SIDEBAR_POR_PERFIL: Record<UserRoleEnum, SidebarKey[]> = {
  [UserRoleEnum.PROFESSOR]: ["serie", "turma"],
  [UserRoleEnum.ADMIN]: ["cpf", "rg", "email", "nascimento"],
  [UserRoleEnum.ESTUDANTE]: ["cpf", "rg", "email", "nascimento"],
};

const LABEL_ABA: Record<TabKey, string> = {
  dadosPessoais: "Dados Pessoais",
  fichaMedica: "Ficha Médica",
  notas: "Notas",
  anotacoes: "Anotações",
};

// ─── Componentes auxiliares ───────────────────────────────────────────────────

function TabPanel({ children, value, index }: { children?: React.ReactNode; index: number; value: number }) {
  return (
    <div role="tabpanel" hidden={value !== index} id={`aluno-tab-${index}`} aria-labelledby={`aluno-tab-${index}`}>
      {value === index && <Box sx={{ py: 2 }}>{children}</Box>}
    </div>
  );
}

function InfoField({ label, value }: { label: string; value?: string | null }) {
  return (
    <S.FieldItem>
      <div className="field-label">{label}</div>
      <div className="field-value">{value || "—"}</div>
    </S.FieldItem>
  );
}

function DisciplinaSelector({
  disciplinas, value, onChange,
}: {
  disciplinas: { id: number; nome: string }[];
  value: string | null;
  onChange: (v: string | null) => void;
}) {
  return (
    <FormControl size="small" sx={{ minWidth: 240, mb: 3 }}>
      <InputLabel id="disciplina-label">Disciplina</InputLabel>
      <Select
        labelId="disciplina-label"
        label="Disciplina"
        value={value ?? ""}
        onChange={(e) => onChange(e.target.value || null)}
      >
        <MenuItem value=""><em>Selecione uma disciplina</em></MenuItem>
        {disciplinas.map((d) => (
          <MenuItem key={d.id} value={String(d.id)}>{d.nome}</MenuItem>
        ))}
      </Select>
    </FormControl>
  );
}

// ─── Painéis das abas ─────────────────────────────────────────────────────────

function DadosPessoaisPanel({
  aluno, loading, formatDate,
}: {
  aluno: AlunoDetalheResponse | null | undefined;
  loading: boolean;
  formatDate: (d?: string | null) => string;
}) {
  if (loading) return <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}><CircularProgress /></Box>;
  return (
    <>
      <S.FieldGrid>
        <InfoField label="Nome completo"       value={aluno?.nome} />
        <InfoField label="Nome social"         value={aluno?.nomeSocial} />
        <InfoField label="Data de nascimento"  value={formatDate(aluno?.dataDeNascimento)} />
        <InfoField label="CPF"                 value={aluno?.cpf} />
        <InfoField label="RG"                  value={aluno?.rg} />
        <InfoField label="Cor/Raça"            value={aluno?.corRaca} />
        <InfoField label="Gênero"              value={aluno?.genero} />
        <InfoField label="E-mail"              value={aluno?.email} />
        <InfoField label="Cidade/Naturalidade" value={aluno?.cidadeNaturalidade} />
      </S.FieldGrid>

      {aluno?.endereco && (
        <>
          <Divider sx={{ my: 3 }} />
          <Typography
            variant="caption" fontWeight={600} color="text.secondary"
            sx={{ textTransform: "uppercase", letterSpacing: 0.5, display: "block", mb: 2 }}
          >
            Endereço
          </Typography>
          <S.FieldGrid>
            <InfoField label="CEP"         value={aluno.endereco.cep} />
            <InfoField label="Logradouro"  value={aluno.endereco.logradouro} />
            <InfoField label="Número"      value={aluno.endereco.numero} />
            <InfoField label="Complemento" value={aluno.endereco.complemento} />
            <InfoField label="Bairro"      value={aluno.endereco.bairro} />
            <InfoField label="Cidade"      value={aluno.endereco.cidade} />
            <InfoField label="UF"          value={aluno.endereco.uf} />
          </S.FieldGrid>
        </>
      )}
    </>
  );
}

function FichaMedicaPanel({
  fichaMedica, loading,
}: {
  fichaMedica: FichaMedicaAlunoResponse | null | undefined;
  loading: boolean;
}) {
  if (loading) return <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}><CircularProgress /></Box>;
  if (!fichaMedica) return <Typography variant="body2" color="text.secondary">Nenhuma ficha médica cadastrada para este aluno.</Typography>;
  return (
    <S.FieldGrid>
      <InfoField label="Tipo sanguíneo"         value={fichaMedica.tipoSanguineo} />
      <InfoField label="Necessidades especiais"  value={fichaMedica.necessidadesEspeciais} />
      <InfoField label="Doenças respiratórias"   value={fichaMedica.doencasRespiratorias} />
      <InfoField label="Alergias alimentares"    value={fichaMedica.alergiasAlimentares} />
      <InfoField label="Alergias medicamentosas" value={fichaMedica.alergiasMedicamentosas} />
    </S.FieldGrid>
  );
}

function NotasPanel({
  disciplinas, disciplinaId, onDisciplinaChange, notasAluno, loading,
}: {
  disciplinas: { id: number; nome: string }[];
  disciplinaId: string | null;
  onDisciplinaChange: (v: string | null) => void;
  notasAluno: { notas: { nomeAvaliacao: string; dataAplicacao?: string; pontuacao: number }[] } | null | undefined;
  loading: boolean;
}) {
  return (
    <>
      <DisciplinaSelector disciplinas={disciplinas} value={disciplinaId} onChange={onDisciplinaChange} />
      {!disciplinaId ? (
        <Typography variant="body2" color="text.secondary">Selecione uma disciplina para visualizar as notas.</Typography>
      ) : loading ? (
        <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}><CircularProgress size={24} /></Box>
      ) : notasAluno && notasAluno.notas.length > 0 ? (
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Avaliação</TableCell>
              <TableCell>Data</TableCell>
              <TableCell align="right">Pontuação</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {notasAluno.notas.map((nota, idx) => (
              <TableRow key={idx}>
                <TableCell>{nota.nomeAvaliacao}</TableCell>
                <TableCell>{nota.dataAplicacao ? new Date(nota.dataAplicacao).toLocaleDateString("pt-BR") : "—"}</TableCell>
                <TableCell align="right">{nota.pontuacao}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      ) : (
        <Typography variant="body2" color="text.secondary">Nenhuma nota registrada para esta disciplina.</Typography>
      )}
    </>
  );
}

function AnotacoesPanel({
  disciplinas, disciplinaId, onDisciplinaChange, anotacoes, loading,
}: {
  disciplinas: { id: number; nome: string }[];
  disciplinaId: string | null;
  onDisciplinaChange: (v: string | null) => void;
  anotacoes: { tipoAnotacao: string; data: string; observacao: string }[];
  loading: boolean;
}) {
  return (
    <>
      <DisciplinaSelector disciplinas={disciplinas} value={disciplinaId} onChange={onDisciplinaChange} />
      {!disciplinaId ? (
        <Typography variant="body2" color="text.secondary">Selecione uma disciplina para visualizar as anotações.</Typography>
      ) : loading ? (
        <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}><CircularProgress size={24} /></Box>
      ) : anotacoes.length > 0 ? (
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Tipo</TableCell>
              <TableCell>Data</TableCell>
              <TableCell>Observação</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {anotacoes.map((anotacao, idx) => (
              <TableRow key={idx}>
                <TableCell>{anotacao.tipoAnotacao}</TableCell>
                <TableCell>{anotacao.data ? new Date(anotacao.data).toLocaleDateString("pt-BR") : "—"}</TableCell>
                <TableCell>{anotacao.observacao || "—"}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      ) : (
        <Typography variant="body2" color="text.secondary">Nenhuma anotação registrada para esta disciplina.</Typography>
      )}
    </>
  );
}

// ─── Página ───────────────────────────────────────────────────────────────────

export default function AlunoDetalhePage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();

  const alunoId = params.id as string;
  const role = user?.role ?? UserRoleEnum.ADMIN;
  const isAdmin = role === UserRoleEnum.ADMIN;
  const abasDoRole = ABAS_POR_PERFIL[role] ?? ABAS_POR_PERFIL[UserRoleEnum.ADMIN];

  const { aluno, loading, error } = useAluno(alunoId);
  const { fichaMedica, loading: loadingFicha } = useAlunoFichaMedica(alunoId, !!user && abasDoRole.includes("fichaMedica"));
  const { disciplinas } = useDisciplinas();
  const { matricular, desmatricular } = useAlunoMatriculaMutations(alunoId);

  const [activeTab, setActiveTab] = useState(0);
  const [notasDisciplinaId, setNotasDisciplinaId] = useState<string | null>(null);
  const [anotacoesDisciplinaId, setAnotacoesDisciplinaId] = useState<string | null>(null);

  const { notasAluno, loading: loadingNotas } = useNotasAlunoDisciplina(alunoId, notasDisciplinaId);
  const { anotacoes, loading: loadingAnotacoes } = useAlunoAnotacoesDisciplina(alunoId, anotacoesDisciplinaId);

  const formatDate = (date?: string | null) => {
    if (!date) return "—";
    try { return new Date(date).toLocaleDateString("pt-BR"); } catch { return date; }
  };

  const PAINEL_MAP: Record<TabKey, React.ReactNode> = {
    dadosPessoais: <DadosPessoaisPanel aluno={aluno} loading={loading} formatDate={formatDate} />,
    fichaMedica: <FichaMedicaPanel fichaMedica={fichaMedica} loading={loadingFicha} />,
    notas: <NotasPanel disciplinas={disciplinas} disciplinaId={notasDisciplinaId} onDisciplinaChange={setNotasDisciplinaId} notasAluno={notasAluno} loading={loadingNotas} />,
    anotacoes: <AnotacoesPanel disciplinas={disciplinas} disciplinaId={anotacoesDisciplinaId} onDisciplinaChange={setAnotacoesDisciplinaId} anotacoes={anotacoes} loading={loadingAnotacoes} />,
  };

  const SIDEBAR_CAMPO_MAP: Record<SidebarKey, SidebarCampo> = {
    cpf: { label: "CPF", value: aluno?.cpf, skeletonWidth: 90 },
    rg: { label: "RG", value: aluno?.rg, skeletonWidth: 80 },
    email: { label: "E-mail", value: aluno?.email, skeletonWidth: 120 },
    nascimento: { label: "Nascimento", value: formatDate(aluno?.dataDeNascimento), skeletonWidth: 90 },
    serie: { label: "Série", value: aluno?.serieNome, skeletonWidth: 100 },
    turma: { label: "Turma", value: aluno?.turmaNome, skeletonWidth: 80 },
  };

  const abas = (ABAS_POR_PERFIL[role] ?? ABAS_POR_PERFIL[UserRoleEnum.ADMIN]).map((key) => ({
    label: LABEL_ABA[key],
    content: PAINEL_MAP[key],
  }));

  const sidebarCampos = (SIDEBAR_POR_PERFIL[role] ?? SIDEBAR_POR_PERFIL[UserRoleEnum.ADMIN]).map(
    (key) => SIDEBAR_CAMPO_MAP[key],
  );

  return (
    <PageScaffold
      title={loading ? "Carregando..." : aluno?.nome ?? "Detalhe do Aluno"}
      description="Informações completas do aluno"
      actions={
        isAdmin && !loading && aluno ? (
          <Box sx={{ display: "flex", gap: 1 }}>
            <Button variant="outlined" startIcon={<EditIcon />} onClick={() => router.push(`${RoutesEnum.ALUNO_CADASTRO}?id=${alunoId}`)} size="small">
              Editar
            </Button>
            {aluno.matriculado ? (
              <Button variant="outlined" color="error" size="small" onClick={() => desmatricular.mutate()} disabled={desmatricular.isPending}>
                {desmatricular.isPending ? "Desmatriculando..." : "Desmatricular"}
              </Button>
            ) : (
              <Button variant="contained" color="success" size="small" onClick={() => matricular.mutate()} disabled={matricular.isPending}>
                {matricular.isPending ? "Matriculando..." : "Matricular"}
              </Button>
            )}
          </Box>
        ) : undefined
      }
    >
      <Box sx={{ mb: 2, display: "flex", alignItems: "center", gap: 1 }}>
        <IconButton onClick={() => router.back()} size="small">
          <ArrowBackIcon fontSize="small" />
        </IconButton>
        <Typography variant="body2" color="text.secondary">Voltar</Typography>
      </Box>

      {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}

      <S.PageLayout>
        <ContainerSection title="Informações do Aluno">
          <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
            <Tabs value={activeTab} onChange={(_e, v) => setActiveTab(v)} variant="fullWidth">
              {abas.map((aba, i) => (
                <Tab key={aba.label} label={aba.label} id={`aluno-tab-${i}`} />
              ))}
            </Tabs>
          </Box>

          {abas.map((aba, i) => (
            <TabPanel key={aba.label} value={activeTab} index={i}>
              {aba.content}
            </TabPanel>
          ))}
        </ContainerSection>

        <S.SidebarCard>
          <S.SidebarHeader>
            <S.AvatarWrapper>
              <PersonIcon />
            </S.AvatarWrapper>

            <S.SidebarProfileInfo>
              {loading ? (
                <><Skeleton variant="text" width={140} /><Skeleton variant="text" width={100} /></>
              ) : (
                <>
                  <div className="nome">{aluno?.nomeSocial || aluno?.nome || "—"}</div>
                  <div className="matricula">RA: {aluno?.matricula ?? "—"}</div>
                </>
              )}
            </S.SidebarProfileInfo>

            {loading ? (
              <Skeleton variant="rounded" width={90} height={24} />
            ) : (
              <Chip
                label={aluno?.matriculado ? "Matriculado" : "Não matriculado"}
                color={aluno?.matriculado ? "success" : "default"}
                size="small"
              />
            )}
          </S.SidebarHeader>

          {sidebarCampos.map((campo) => (
            <S.SidebarItem key={campo.label}>
              <span className="label">{campo.label}</span>
              <span className="value">
                {loading ? <Skeleton variant="text" width={campo.skeletonWidth} /> : (campo.value ?? "—")}
              </span>
            </S.SidebarItem>
          ))}
        </S.SidebarCard>
      </S.PageLayout>
    </PageScaffold>
  );
}
