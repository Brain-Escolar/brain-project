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

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel({ children, value, index }: TabPanelProps) {
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`aluno-tab-${index}`}
      aria-labelledby={`aluno-tab-${index}`}
    >
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
  disciplinas,
  value,
  onChange,
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
        <MenuItem value="">
          <em>Selecione uma disciplina</em>
        </MenuItem>
        {disciplinas.map((d) => (
          <MenuItem key={d.id} value={String(d.id)}>
            {d.nome}
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );
}

export default function AlunoDetalhePage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();

  const alunoId = params.id as string;
  const { aluno, loading, error } = useAluno(alunoId);
  const { fichaMedica, loading: loadingFicha } = useAlunoFichaMedica(alunoId);
  const { disciplinas } = useDisciplinas();
  const { matricular, desmatricular } = useAlunoMatriculaMutations(alunoId);

  const [activeTab, setActiveTab] = useState(0);
  const [notasDisciplinaId, setNotasDisciplinaId] = useState<string | null>(null);
  const [anotacoesDisciplinaId, setAnotacoesDisciplinaId] = useState<string | null>(null);

  const { notasAluno, loading: loadingNotas } = useNotasAlunoDisciplina(alunoId, notasDisciplinaId);
  const { anotacoes, loading: loadingAnotacoes } = useAlunoAnotacoesDisciplina(alunoId, anotacoesDisciplinaId);

  const isAdmin = user?.role === UserRoleEnum.ADMIN;

  const handleGoBack = () => router.back();
  const handleEdit = () => router.push(`${RoutesEnum.ALUNO_CADASTRO}?id=${alunoId}`);
  const handleMatricular = () => matricular.mutate();
  const handleDesmatricular = () => desmatricular.mutate();

  const formatDate = (date?: string | null) => {
    if (!date) return "—";
    try {
      return new Date(date).toLocaleDateString("pt-BR");
    } catch {
      return date;
    }
  };

  return (
    <PageScaffold
      title={loading ? "Carregando..." : aluno?.nome ?? "Detalhe do Aluno"}
      description="Informações completas do aluno"
      actions={
        isAdmin && !loading && aluno ? (
          <Box sx={{ display: "flex", gap: 1 }}>
            <Button variant="outlined" startIcon={<EditIcon />} onClick={handleEdit} size="small">
              Editar
            </Button>
            {aluno.matriculado ? (
              <Button
                variant="outlined"
                color="error"
                size="small"
                onClick={handleDesmatricular}
                disabled={desmatricular.isPending}
              >
                {desmatricular.isPending ? "Desmatriculando..." : "Desmatricular"}
              </Button>
            ) : (
              <Button
                variant="contained"
                color="success"
                size="small"
                onClick={handleMatricular}
                disabled={matricular.isPending}
              >
                {matricular.isPending ? "Matriculando..." : "Matricular"}
              </Button>
            )}
          </Box>
        ) : undefined
      }
    >
      {/* Navegação */}
      <Box sx={{ mb: 2, display: "flex", alignItems: "center", gap: 1 }}>
        <IconButton onClick={handleGoBack} size="small">
          <ArrowBackIcon fontSize="small" />
        </IconButton>
        <Typography variant="body2" color="text.secondary">
          Voltar
        </Typography>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      <S.PageLayout>
        {/* ─── Conteúdo principal com abas ─── */}
        <ContainerSection title="Informações do Aluno">
          <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
            <Tabs value={activeTab} onChange={(_e, v) => setActiveTab(v)} variant="fullWidth">
              <Tab label="Dados Pessoais" id="aluno-tab-0" />
              <Tab label="Ficha Médica" id="aluno-tab-1" />
              <Tab label="Notas" id="aluno-tab-2" />
              <Tab label="Anotações" id="aluno-tab-3" />
            </Tabs>
          </Box>

          {/* Aba: Dados Pessoais */}
          <TabPanel value={activeTab} index={0}>
            {loading ? (
              <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
                <CircularProgress />
              </Box>
            ) : (
              <>
                <S.FieldGrid>
                  <InfoField label="Nome completo" value={aluno?.nome} />
                  <InfoField label="Nome social" value={aluno?.nomeSocial} />
                  <InfoField label="Data de nascimento" value={formatDate(aluno?.dataDeNascimento)} />
                  <InfoField label="CPF" value={aluno?.cpf} />
                  <InfoField label="RG" value={aluno?.rg} />
                  <InfoField label="Cor/Raça" value={aluno?.corRaca} />
                  <InfoField label="Gênero" value={aluno?.genero} />
                  <InfoField label="E-mail" value={aluno?.email} />
                  <InfoField label="Cidade/Naturalidade" value={aluno?.cidadeNaturalidade} />
                </S.FieldGrid>

                {aluno?.endereco && (
                  <>
                    <Divider sx={{ my: 3 }} />
                    <Typography
                      variant="caption"
                      fontWeight={600}
                      color="text.secondary"
                      sx={{ textTransform: "uppercase", letterSpacing: 0.5, display: "block", mb: 2 }}
                    >
                      Endereço
                    </Typography>
                    <S.FieldGrid>
                      <InfoField label="CEP" value={aluno.endereco.cep} />
                      <InfoField label="Logradouro" value={aluno.endereco.logradouro} />
                      <InfoField label="Número" value={aluno.endereco.numero} />
                      <InfoField label="Complemento" value={aluno.endereco.complemento} />
                      <InfoField label="Bairro" value={aluno.endereco.bairro} />
                      <InfoField label="Cidade" value={aluno.endereco.cidade} />
                      <InfoField label="UF" value={aluno.endereco.uf} />
                    </S.FieldGrid>
                  </>
                )}
              </>
            )}
          </TabPanel>

          {/* Aba: Ficha Médica */}
          <TabPanel value={activeTab} index={1}>
            {loadingFicha ? (
              <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
                <CircularProgress />
              </Box>
            ) : fichaMedica ? (
              <S.FieldGrid>
                <InfoField label="Tipo sanguíneo" value={fichaMedica.tipoSanguineo} />
                <InfoField label="Necessidades especiais" value={fichaMedica.necessidadesEspeciais} />
                <InfoField label="Doenças respiratórias" value={fichaMedica.doencasRespiratorias} />
                <InfoField label="Alergias alimentares" value={fichaMedica.alergiasAlimentares} />
                <InfoField label="Alergias medicamentosas" value={fichaMedica.alergiasMedicamentosas} />
              </S.FieldGrid>
            ) : (
              <Typography variant="body2" color="text.secondary">
                Nenhuma ficha médica cadastrada para este aluno.
              </Typography>
            )}
          </TabPanel>

          {/* Aba: Notas */}
          <TabPanel value={activeTab} index={2}>
            <DisciplinaSelector
              disciplinas={disciplinas}
              value={notasDisciplinaId}
              onChange={setNotasDisciplinaId}
            />
            {!notasDisciplinaId ? (
              <Typography variant="body2" color="text.secondary">
                Selecione uma disciplina para visualizar as notas.
              </Typography>
            ) : loadingNotas ? (
              <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
                <CircularProgress size={24} />
              </Box>
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
                      <TableCell>
                        {nota.dataAplicacao
                          ? new Date(nota.dataAplicacao).toLocaleDateString("pt-BR")
                          : "—"}
                      </TableCell>
                      <TableCell align="right">{nota.pontuacao}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <Typography variant="body2" color="text.secondary">
                Nenhuma nota registrada para esta disciplina.
              </Typography>
            )}
          </TabPanel>

          {/* Aba: Anotações */}
          <TabPanel value={activeTab} index={3}>
            <DisciplinaSelector
              disciplinas={disciplinas}
              value={anotacoesDisciplinaId}
              onChange={setAnotacoesDisciplinaId}
            />
            {!anotacoesDisciplinaId ? (
              <Typography variant="body2" color="text.secondary">
                Selecione uma disciplina para visualizar as anotações.
              </Typography>
            ) : loadingAnotacoes ? (
              <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
                <CircularProgress size={24} />
              </Box>
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
                      <TableCell>
                        {anotacao.data
                          ? new Date(anotacao.data).toLocaleDateString("pt-BR")
                          : "—"}
                      </TableCell>
                      <TableCell>{anotacao.observacao || "—"}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <Typography variant="body2" color="text.secondary">
                Nenhuma anotação registrada para esta disciplina.
              </Typography>
            )}
          </TabPanel>
        </ContainerSection>

        {/* ─── Sidebar: Perfil ─── */}
        <S.SidebarCard>
          <S.SidebarHeader>
            <S.AvatarWrapper>
              <PersonIcon />
            </S.AvatarWrapper>

            <S.SidebarProfileInfo>
              {loading ? (
                <>
                  <Skeleton variant="text" width={140} />
                  <Skeleton variant="text" width={100} />
                </>
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

          <S.SidebarItem>
            <span className="label">CPF</span>
            <span className="value">
              {loading ? <Skeleton variant="text" width={90} /> : (aluno?.cpf ?? "—")}
            </span>
          </S.SidebarItem>

          <S.SidebarItem>
            <span className="label">RG</span>
            <span className="value">
              {loading ? <Skeleton variant="text" width={80} /> : (aluno?.rg ?? "—")}
            </span>
          </S.SidebarItem>

          <S.SidebarItem>
            <span className="label">E-mail</span>
            <span className="value">
              {loading ? <Skeleton variant="text" width={120} /> : (aluno?.email ?? "—")}
            </span>
          </S.SidebarItem>

          <S.SidebarItem>
            <span className="label">Nascimento</span>
            <span className="value">
              {loading ? (
                <Skeleton variant="text" width={90} />
              ) : (
                formatDate(aluno?.dataDeNascimento)
              )}
            </span>
          </S.SidebarItem>
        </S.SidebarCard>
      </S.PageLayout>
    </PageScaffold>
  );
}
