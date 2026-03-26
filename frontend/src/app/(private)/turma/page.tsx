"use client";
import {
  mapFormDataToTurmaPostRequest,
  mapFormDataToTurmaPutRequest,
  mapTurmaResponseToFormData,
} from "@/app/(private)/turma/turmaUtils";
import { useTurmaMutations } from "@/app/(private)/turma/useTurmaMutations";
import { UserRoleEnum } from "@/enums";
import BrainButtonPrimary from "@/components/brainButtons/brainButtonPrimary/brainButtonPrimary";
import BrainButtonSecondary from "@/components/brainButtons/brainButtonSecondary/brainButtonSecondary";
import { BrainDropdownControlled } from "@/components/brainForms/brainDropdownControlled";
import BrainFormProvider from "@/components/brainForms/brainFormProvider/brainFormProvider";
import { BrainTextFieldControlled } from "@/components/brainForms/brainTextFieldControlled";
import ContainerSection from "@/components/containerSection/containerSection";
import PageTitle from "@/components/pageTitle/pageTitle";
import { ProtectedRoute } from "@/components/ProtectedRoute/ProtectedRoute";
import { useBrainForm } from "@/hooks/useBrainForm";
import { useGradesCurriculares } from "@/hooks/useGradesCurriculares";
import { useGradeCurricular } from "@/hooks/useGradeCurricular";
import { useSeries } from "@/hooks/useSeries";
import { useTurma } from "@/hooks/useTurma";
import { useUnidades } from "@/hooks/useUnidades";
import { KeyValue } from "@/services/models/keyValue";
import {
  Alert,
  Box,
  CircularProgress,
  Button,
  Container,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  InputAdornment,
  List,
  ListItemButton,
  ListItemText,
  TextField,
  Typography,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import AddIcon from "@mui/icons-material/Add";
import GroupsIcon from "@mui/icons-material/Groups";
import MenuBookIcon from "@mui/icons-material/MenuBook";
import AccessTimeIcon from "@mui/icons-material/AccessTime";

import { useRouter } from "next/navigation";
import { useBrainSearchParams } from "@/hooks/useBrainSearchParams";
import { useTurmas } from "@/hooks/useTurmas";
import { turmaApi } from "@/services/api";
import { Suspense, useEffect, useMemo, useState } from "react";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import { Controller } from "react-hook-form";
import { turmaDefaultValues, TurmaFormData, turmaSchema } from "./schema";
import * as S from "./styles";

function TurmaPageContent() {
  const router = useRouter();
  const turmaId = useBrainSearchParams("id");

  const { turma, loading: loadingTurma, error: errorTurma } = useTurma(turmaId);
  const { createTurma, updateTurma } = useTurmaMutations();
  const { series } = useSeries();
  const { unidades } = useUnidades();
  const { gradesCurriculares } = useGradesCurriculares();

  const isEditMode = !!turmaId;

  const { control, handleSubmit, onFormSubmit, isSubmitting, reset, methodsHookForm, watch } =
    useBrainForm<TurmaFormData>({
      schema: turmaSchema,
      defaultValues: turmaDefaultValues,
      onSubmit: onSubmit,
      mode: "all",
    });

  const [gradeSearch, setGradeSearch] = useState("");
  const [importDialogOpen, setImportDialogOpen] = useState(false);
  const [importLoading, setImportLoading] = useState(false);
  const { turmas } = useTurmas();

  async function handleImportarModelo(turmaOrigemId: number) {
    try {
      setImportLoading(true);
      const turmaOrigem = await turmaApi.getTurmaById(String(turmaOrigemId));
      const formData = mapTurmaResponseToFormData(turmaOrigem);
      reset({ ...formData, nome: "" });
      setImportDialogOpen(false);
    } catch (error) {
      console.error("Erro ao importar turma:", error);
    } finally {
      setImportLoading(false);
    }
  }

  const watchNome = watch("nome");
  const watchAnoLetivo = watch("anoLetivo");
  const watchSerieId = watch("serieId");
  const watchTurno = watch("turno");
  const watchUnidadeId = watch("unidadeId");
  const watchVagasTotais = watch("vagasTotais");
  const watchGradeCurricularId = watch("gradeCurricularId");

  const selectedGradeId = watchGradeCurricularId || null;
  const { gradeCurricular: selectedGradeDetail } = useGradeCurricular(selectedGradeId);

  useEffect(() => {
    if (turma && isEditMode) {
      const formData = mapTurmaResponseToFormData(turma);
      reset(formData);
    }
  }, [turma, isEditMode, reset]);

  async function onSubmit(data: TurmaFormData) {
    try {
      if (isEditMode && turmaId) {
        const turmaData = mapFormDataToTurmaPutRequest(data, turmaId);
        await updateTurma.mutateAsync(turmaData);
        router.push("/turma/lista");
      } else {
        const turmaData = mapFormDataToTurmaPostRequest(data);
        await createTurma.mutateAsync(turmaData);
        // Não redireciona após salvar nova turma, mantém formulário preenchido
        // para facilitar criação de outra turma similar
      }
    } catch (error) {
      console.error("Erro ao salvar turma:", error);
    }
  }

  async function handleSaveAndAddAlunos(data: TurmaFormData) {
    try {
      if (isEditMode && turmaId) {
        const turmaData = mapFormDataToTurmaPutRequest(data, turmaId);
        await updateTurma.mutateAsync(turmaData);
        router.push(`/turma/vincular-alunos?turmaId=${turmaId}`);
      } else {
        const turmaData = mapFormDataToTurmaPostRequest(data);
        await createTurma.mutateAsync(turmaData);
        // Idealmente redireciona com o ID da turma criada
        router.push("/turma/lista");
      }
    } catch (error) {
      console.error("Erro ao salvar turma:", error);
    }
  }

  async function handleSaveAndDefineHorarios(data: TurmaFormData) {
    try {
      if (isEditMode && turmaId) {
        const turmaData = mapFormDataToTurmaPutRequest(data, turmaId);
        await updateTurma.mutateAsync(turmaData);
        router.push(`/turma/definir-horarios?turmaId=${turmaId}`);
      } else {
        const turmaData = mapFormDataToTurmaPostRequest(data);
        await createTurma.mutateAsync(turmaData);
        router.push("/turma/lista");
      }
    } catch (error) {
      console.error("Erro ao salvar turma:", error);
    }
  }

  function handleCancel() {
    router.push("/turma/lista");
  }

  const seriesOptions: KeyValue[] = series.map((s) => ({
    key: String(s.id),
    value: s.nome,
  }));

  const unidadesOptions: KeyValue[] = unidades.map((u) => ({
    key: String(u.id),
    value: u.nome,
  }));

  const currentYear = new Date().getFullYear();
  const OPTIONS_ANO_LETIVO: KeyValue[] = [
    { key: String(currentYear - 1), value: String(currentYear - 1) },
    { key: String(currentYear), value: String(currentYear) },
    { key: String(currentYear + 1), value: String(currentYear + 1) },
  ];

  const TURNO_OPTIONS = [
    { key: "manha", label: "Matutino" },
    { key: "tarde", label: "Vespertino" },
    { key: "noite", label: "Noturno" },
    { key: "integral", label: "Integral" },
  ];

  const filteredGrades = useMemo(() => {
    if (!gradeSearch) return gradesCurriculares;
    const search = gradeSearch.toLowerCase();
    return gradesCurriculares.filter((g) => g.nome.toLowerCase().includes(search));
  }, [gradesCurriculares, gradeSearch]);

  const serieName = seriesOptions.find((s) => s.key === watchSerieId)?.value || "—";
  const turnoLabel =
    TURNO_OPTIONS.find((t) => t.key === watchTurno)?.label || "—";
  const unidadeName = unidadesOptions.find((u) => u.key === watchUnidadeId)?.value || "—";

  return (
    <ProtectedRoute allowedRoles={[UserRoleEnum.PROFESSOR]}>
      <Container maxWidth="lg" sx={{ py: 4 }}>
        {loadingTurma && isEditMode ? (
          <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
            <CircularProgress />
          </Box>
        ) : errorTurma && isEditMode ? (
          <Alert severity="error" sx={{ mb: 2 }}>
            {errorTurma}
          </Alert>
        ) : (
          <>
            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", mb: 2 }}>
              <PageTitle
                title={isEditMode ? "Editar Turma" : "Cadastro de Turma"}
                description="Registro uma nova turma vinculando-a a uma grade curricular e suas regras acadêmicas."
              />
              {!isEditMode && (
                <Button
                  variant="outlined"
                  startIcon={<ContentCopyIcon />}
                  onClick={() => setImportDialogOpen(true)}
                  sx={{ mt: 1, whiteSpace: "nowrap" }}
                >
                  Importar Modelo
                </Button>
              )}
            </Box>

            {/* Dialog Importar Modelo */}
            <Dialog open={importDialogOpen} onClose={() => setImportDialogOpen(false)} maxWidth="sm" fullWidth>
              <DialogTitle>Importar Modelo de Turma</DialogTitle>
              <DialogContent dividers>
                <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
                  Selecione uma turma para importar as configurações (sem alunos). O nome será apagado para você definir um novo.
                </Typography>
                {turmas.length === 0 ? (
                  <Typography variant="body2" color="textSecondary" sx={{ textAlign: "center", py: 2 }}>
                    Nenhuma turma disponível para importar.
                  </Typography>
                ) : (
                  <List disablePadding>
                    {turmas.map((t) => (
                      <ListItemButton
                        key={t.id}
                        onClick={() => handleImportarModelo(t.id)}
                        disabled={importLoading}
                        divider
                      >
                        <ListItemText
                          primary={t.nome}
                          secondary={`${t.serie} · ${t.turno} · ${t.anoLetivo}`}
                        />
                      </ListItemButton>
                    ))}
                  </List>
                )}
                {importLoading && (
                  <Box sx={{ display: "flex", justifyContent: "center", pt: 2 }}>
                    <CircularProgress size={24} />
                  </Box>
                )}
              </DialogContent>
              <DialogActions>
                <Button onClick={() => setImportDialogOpen(false)}>Cancelar</Button>
              </DialogActions>
            </Dialog>

            <BrainFormProvider
              methodsHookForm={methodsHookForm}
              onSubmit={handleSubmit(onFormSubmit)}
            >
              <S.PageLayout>
                {/* Coluna Principal */}
                <div>
                  {/* Seção Identificação da Turma */}
                  <ContainerSection
                    title="Identificação da Turma"
                    numberOfCollumns={2}
                  >
                    <BrainTextFieldControlled
                      name="nome"
                      control={control}
                      label="Nome da Turma"
                      placeholder="Ex: 3o Ano B"
                      required
                    />

                    <BrainDropdownControlled
                      name="anoLetivo"
                      control={control}
                      label="Ano Letivo"
                      options={OPTIONS_ANO_LETIVO}
                      placeholder="Selecione o ano"
                      required
                    />

                    <BrainDropdownControlled
                      name="serieId"
                      control={control}
                      label="Série / Etapa"
                      options={seriesOptions}
                      placeholder="Selecione a série"
                      required
                    />

                    <Controller
                      name="turno"
                      control={control}
                      render={({ field, fieldState: { error } }) => (
                        <Box>
                          <Typography
                            variant="body2"
                            sx={{ mb: 1, fontWeight: 500 }}
                          >
                            Turno <span style={{ color: "#ef4444" }}>*</span>
                          </Typography>
                          <S.TurnoGroup>
                            {TURNO_OPTIONS.map((option) => (
                              <S.TurnoOption
                                key={option.key}
                                type="button"
                                $active={field.value === option.key}
                                onClick={() => field.onChange(option.key)}
                              >
                                {option.label}
                              </S.TurnoOption>
                            ))}
                          </S.TurnoGroup>
                          {error && (
                            <Typography
                              variant="caption"
                              color="error"
                              sx={{ mt: 0.5, display: "block" }}
                            >
                              {error.message}
                            </Typography>
                          )}
                        </Box>
                      )}
                    />
                  </ContainerSection>

                  {/* Seção Unidade e Capacidade */}
                  <ContainerSection
                    title="Unidade e Capacidade"
                    numberOfCollumns={2}
                  >
                    <BrainDropdownControlled
                      name="unidadeId"
                      control={control}
                      label="Unidade Escolar"
                      options={unidadesOptions}
                      placeholder="Selecione a unidade"
                      required
                    />

                    <BrainTextFieldControlled
                      name="salaFisica"
                      control={control}
                      label="Sala Física"
                      placeholder="Selecione a unidade primeiro"
                    />

                    <Box>
                      <BrainTextFieldControlled
                        name="vagasTotais"
                        control={control}
                        label="Vagas Totais"
                        placeholder="Ex: 35"
                        required
                        type="number"
                      />
                      <Typography
                        variant="caption"
                        color="textSecondary"
                        sx={{ mt: 0.5, display: "block" }}
                      >
                        Define o limite máximo de alunos para esta turma.
                      </Typography>
                    </Box>
                  </ContainerSection>

                  {/* Seção Grade Curricular */}
                  <ContainerSection
                    title="Grade Curricular"
                    numberOfCollumns={1}
                  >
                    <Box>
                      <TextField
                        fullWidth
                        size="small"
                        label="Grade Curricular"
                        placeholder="Buscar grade curricular..."
                        value={gradeSearch}
                        onChange={(e) => setGradeSearch(e.target.value)}
                        required
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <SearchIcon fontSize="small" />
                            </InputAdornment>
                          ),
                        }}
                      />
                    </Box>

                    <Controller
                      name="gradeCurricularId"
                      control={control}
                      render={({ field, fieldState: { error } }) => (
                        <Box>
                          <Box
                            sx={{
                              display: "flex",
                              flexDirection: "column",
                              gap: 1,
                              mt: 1,
                            }}
                          >
                            {filteredGrades.length === 0 ? (
                              <Box sx={{ py: 3, textAlign: "center" }}>
                                <Typography
                                  variant="body2"
                                  color="textSecondary"
                                  sx={{ mb: 1 }}
                                >
                                  Nenhuma grade curricular encontrada.
                                </Typography>
                                {gradesCurriculares.length === 0 && (
                                  <Button
                                    variant="outlined"
                                    size="small"
                                    startIcon={<AddIcon />}
                                    onClick={() => router.push("/grade-curricular")}
                                  >
                                    Cadastrar Grade Curricular
                                  </Button>
                                )}
                              </Box>
                            ) : (
                              filteredGrades.map((grade) => (
                                <S.GradeCard
                                  key={grade.id}
                                  $active={field.value === String(grade.id)}
                                  onClick={() =>
                                    field.onChange(String(grade.id))
                                  }
                                >
                                  <div className="grade-info">
                                    <span className="grade-nome">
                                      <MenuBookIcon
                                        sx={{
                                          fontSize: 16,
                                          mr: 0.5,
                                          verticalAlign: "text-bottom",
                                        }}
                                      />
                                      {grade.nome}
                                    </span>
                                    <span className="grade-meta">
                                      <AccessTimeIcon
                                        sx={{
                                          fontSize: 12,
                                          mr: 0.3,
                                          verticalAlign: "text-bottom",
                                        }}
                                      />
                                      {grade.cargaHorariaTotal} hora/aula semanais
                                      {"  ·  "}
                                      {grade.quantidadeDisciplinas} disciplinas
                                    </span>
                                  </div>
                                  <span className="grade-versao">
                                    v{grade.versao}
                                  </span>
                                </S.GradeCard>
                              ))
                            )}
                          </Box>
                          {error && (
                            <Typography
                              variant="caption"
                              color="error"
                              sx={{ mt: 0.5, display: "block" }}
                            >
                              {error.message}
                            </Typography>
                          )}
                        </Box>
                      )}
                    />
                  </ContainerSection>
                </div>

                {/* Sidebar */}
                <S.SidebarCard>
                  <S.SidebarHeader>
                    <h4>
                      <GroupsIcon
                        sx={{
                          fontSize: 16,
                          mr: 0.5,
                          verticalAlign: "text-bottom",
                        }}
                      />
                      Status de Ocupação
                    </h4>
                  </S.SidebarHeader>
                  <S.OcupacaoContainer>
                    <div className="ocupacao-numero">
                      0
                      <span style={{ fontSize: "1.2rem", fontWeight: 400 }}>
                        {" "}
                        / {watchVagasTotais || "—"}
                      </span>
                    </div>
                    <div className="ocupacao-label">
                      {watchVagasTotais
                        ? "Defina o número de vagas"
                        : "Defina o número de vagas"}
                    </div>
                  </S.OcupacaoContainer>

                  <S.SidebarHeader>
                    <h4>Resumo da Turma</h4>
                  </S.SidebarHeader>
                  <S.ResumoItem>
                    <span className="resumo-label">Turma</span>
                    <span className="resumo-value">{watchNome || "—"}</span>
                  </S.ResumoItem>
                  <S.ResumoItem>
                    <span className="resumo-label">Ano Letivo</span>
                    <span className="resumo-value">
                      {watchAnoLetivo || "—"}
                    </span>
                  </S.ResumoItem>
                  <S.ResumoItem>
                    <span className="resumo-label">Série</span>
                    <span className="resumo-value">{serieName}</span>
                  </S.ResumoItem>
                  <S.ResumoItem>
                    <span className="resumo-label">Turno</span>
                    <span className="resumo-value">{turnoLabel}</span>
                  </S.ResumoItem>
                  <S.ResumoItem>
                    <span className="resumo-label">Unidade</span>
                    <span className="resumo-value">{unidadeName}</span>
                  </S.ResumoItem>

                  {selectedGradeDetail && (
                    <>
                      <S.SidebarHeader>
                        <h4>Disciplinas da Grade</h4>
                      </S.SidebarHeader>
                      {selectedGradeDetail.disciplinas.map((disc) => (
                        <S.ResumoItem key={disc.id}>
                          <span className="resumo-label">{disc.nome}</span>
                          <span className="resumo-value">
                            {disc.cargaHorariaSemanal} hora/aula
                          </span>
                        </S.ResumoItem>
                      ))}
                    </>
                  )}
                </S.SidebarCard>
              </S.PageLayout>

              {/* Botões de ação */}
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "flex-end",
                  gap: 2,
                  mt: 4,
                  flexWrap: "wrap",
                }}
              >
                <BrainButtonSecondary onClick={handleCancel}>
                  Cancelar
                </BrainButtonSecondary>

                <BrainButtonSecondary
                  onClick={handleSubmit((data) => handleSaveAndAddAlunos(data))}
                  disabled={
                    isSubmitting ||
                    createTurma.isPending ||
                    updateTurma.isPending
                  }
                >
                  Salvar e Adicionar Alunos
                </BrainButtonSecondary>

                <BrainButtonPrimary
                  onClick={handleSubmit((data) => handleSaveAndDefineHorarios(data))}
                  disabled={
                    isSubmitting ||
                    createTurma.isPending ||
                    updateTurma.isPending
                  }
                >
                  {createTurma.isPending || updateTurma.isPending
                    ? "Salvando..."
                    : "Salvar e Definir Horários"}
                </BrainButtonPrimary>
              </Box>
            </BrainFormProvider>
          </>
        )}
      </Container>
    </ProtectedRoute>
  );
}

export default function TurmaPage() {
  return (
    <Suspense
      fallback={
        <Container maxWidth="lg" sx={{ py: 4 }}>
          <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
            <CircularProgress />
          </Box>
        </Container>
      }
    >
      <TurmaPageContent />
    </Suspense>
  );
}
