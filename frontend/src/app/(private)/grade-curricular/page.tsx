"use client";
import {
  mapFormDataToGradeCurricularPostRequest,
  mapFormDataToGradeCurricularPutRequest,
  mapGradeCurricularResponseToFormData,
} from "@/app/(private)/grade-curricular/gradeCurricularUtils";
import { useGradeCurricularMutations } from "@/app/(private)/grade-curricular/useGradeCurricularMutations";
import { UserRoleEnum } from "@/enums";
import BrainButtonPrimary from "@/components/brainButtons/brainButtonPrimary/brainButtonPrimary";
import BrainButtonSecondary from "@/components/brainButtons/brainButtonSecondary/brainButtonSecondary";
import { BrainTextFieldControlled } from "@/components/brainForms/brainTextFieldControlled";
import BrainFormProvider from "@/components/brainForms/brainFormProvider/brainFormProvider";
import ContainerSection from "@/components/containerSection/containerSection";
import PageTitle from "@/components/pageTitle/pageTitle";
import { ProtectedRoute } from "@/components/ProtectedRoute/ProtectedRoute";
import { useBrainForm } from "@/hooks/useBrainForm";
import { useGradeCurricular } from "@/hooks/useGradeCurricular";
import { useDisciplinas } from "@/hooks/useDisciplinas";
import {
  Alert,
  Box,
  Checkbox,
  Button,
  CircularProgress,
  Container,
  InputAdornment,
  TextField,
  Typography,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import AddIcon from "@mui/icons-material/Add";
import MenuBookIcon from "@mui/icons-material/MenuBook";
import { useRouter } from "next/navigation";
import { useBrainSearchParams } from "@/hooks/useBrainSearchParams";
import { Suspense, useEffect, useMemo, useState } from "react";
import { Controller } from "react-hook-form";
import {
  gradeCurricularDefaultValues,
  GradeCurricularFormData,
  gradeCurricularSchema,
} from "./schema";
import * as S from "./styles";

function GradeCurricularPageContent() {
  const router = useRouter();
  const gradeId = useBrainSearchParams("id");

  const {
    gradeCurricular,
    loading: loadingGrade,
    error: errorGrade,
  } = useGradeCurricular(gradeId);
  const { createGradeCurricular, updateGradeCurricular } =
    useGradeCurricularMutations();
  const { disciplinas } = useDisciplinas();

  const isEditMode = !!gradeId;

  const { control, handleSubmit, onFormSubmit, isSubmitting, reset, methodsHookForm, watch } =
    useBrainForm<GradeCurricularFormData>({
      schema: gradeCurricularSchema,
      defaultValues: gradeCurricularDefaultValues,
      onSubmit: onSubmit,
      mode: "all",
    });

  const [disciplinaSearch, setDisciplinaSearch] = useState("");

  const watchNome = watch("nome");
  const watchVersao = watch("versao");
  const watchDisciplinaIds = watch("disciplinaIds");

  useEffect(() => {
    if (gradeCurricular && isEditMode) {
      const formData = mapGradeCurricularResponseToFormData(gradeCurricular);
      reset(formData);
    }
  }, [gradeCurricular, isEditMode, reset]);

  async function onSubmit(data: GradeCurricularFormData) {
    try {
      if (isEditMode && gradeId) {
        const gradeData = mapFormDataToGradeCurricularPutRequest(data, gradeId);
        await updateGradeCurricular.mutateAsync(gradeData);
      } else {
        const gradeData = mapFormDataToGradeCurricularPostRequest(data);
        await createGradeCurricular.mutateAsync(gradeData);
      }
      router.push("/grade-curricular/lista");
    } catch (error) {
      console.error("Erro ao salvar grade curricular:", error);
    }
  }

  function handleCancel() {
    router.push("/grade-curricular/lista");
  }

  const filteredDisciplinas = useMemo(() => {
    if (!disciplinaSearch) return disciplinas;
    const search = disciplinaSearch.toLowerCase();
    return disciplinas.filter((d) => d.nome.toLowerCase().includes(search));
  }, [disciplinas, disciplinaSearch]);

  const selectedCount = watchDisciplinaIds?.length || 0;
  const totalCargaHoraria = useMemo(() => {
    return disciplinas
      .filter((d) => watchDisciplinaIds?.includes(d.id))
      .reduce((acc, d) => acc + Number(d.cargaHoraria || 0), 0);
  }, [disciplinas, watchDisciplinaIds]);

  return (
    <ProtectedRoute allowedRoles={[UserRoleEnum.PROFESSOR]}>
      <Container maxWidth="lg" sx={{ py: 4 }}>
        {loadingGrade && isEditMode ? (
          <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
            <CircularProgress />
          </Box>
        ) : errorGrade && isEditMode ? (
          <Alert severity="error" sx={{ mb: 2 }}>
            {errorGrade}
          </Alert>
        ) : (
          <>
            <PageTitle
              title={
                isEditMode
                  ? "Editar Grade Curricular"
                  : "Cadastro de Grade Curricular"
              }
              description="Defina as disciplinas que compõem a grade curricular e suas cargas horárias."
            />
            <BrainFormProvider
              methodsHookForm={methodsHookForm}
              onSubmit={handleSubmit(onFormSubmit)}
            >
              <S.PageLayout>
                {/* Coluna Principal */}
                <div>
                  <ContainerSection
                    title="Identificação da Grade"
                    numberOfCollumns={2}
                  >
                    <BrainTextFieldControlled
                      name="nome"
                      control={control}
                      label="Nome da Grade"
                      placeholder="Ex: Grade Fundamental I — 2025"
                      required
                    />
                    <BrainTextFieldControlled
                      name="versao"
                      control={control}
                      label="Versão"
                      placeholder="Ex: 1.0"
                      required
                    />
                  </ContainerSection>

                  <ContainerSection
                    title="Disciplinas"
                    numberOfCollumns={1}
                  >
                    <Box>
                      <TextField
                        fullWidth
                        size="small"
                        placeholder="Buscar disciplina..."
                        value={disciplinaSearch}
                        onChange={(e) => setDisciplinaSearch(e.target.value)}
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
                      name="disciplinaIds"
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
                            {filteredDisciplinas.length === 0 ? (
                              <Box sx={{ py: 3, textAlign: "center" }}>
                                <Typography
                                  variant="body2"
                                  color="textSecondary"
                                  sx={{ mb: 1 }}
                                >
                                  Nenhuma disciplina encontrada.
                                </Typography>
                                {disciplinas.length === 0 && (
                                  <Button
                                    variant="outlined"
                                    size="small"
                                    startIcon={<AddIcon />}
                                    onClick={() => router.push("/disciplina")}
                                  >
                                    Cadastrar Disciplina
                                  </Button>
                                )}
                              </Box>
                            ) : (
                              filteredDisciplinas.map((disc) => {
                                const isChecked = field.value?.includes(disc.id);
                                return (
                                  <S.DisciplinaCheckItem
                                    key={disc.id}
                                    $checked={isChecked}
                                    onClick={() => {
                                      const newValue = isChecked
                                        ? field.value.filter((id: number) => id !== disc.id)
                                        : [...(field.value || []), disc.id];
                                      field.onChange(newValue);
                                    }}
                                  >
                                    <Checkbox
                                      checked={isChecked}
                                      size="small"
                                      sx={{ p: 0 }}
                                    />
                                    <div className="disc-info">
                                      <span className="disc-nome">
                                        <MenuBookIcon
                                          sx={{
                                            fontSize: 14,
                                            mr: 0.5,
                                            verticalAlign: "text-bottom",
                                          }}
                                        />
                                        {disc.nome}
                                      </span>
                                      <span className="disc-meta">
                                        {disc.cargaHoraria}h semanais · {disc.grupo}
                                      </span>
                                    </div>
                                  </S.DisciplinaCheckItem>
                                );
                              })
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
                    <h4>Resumo da Grade</h4>
                  </S.SidebarHeader>
                  <S.StatsContainer>
                    <div className="stats-number">{selectedCount}</div>
                    <div className="stats-label">disciplinas selecionadas</div>
                  </S.StatsContainer>
                  <S.ResumoItem>
                    <span className="resumo-label">Nome</span>
                    <span className="resumo-value">{watchNome || "—"}</span>
                  </S.ResumoItem>
                  <S.ResumoItem>
                    <span className="resumo-label">Versão</span>
                    <span className="resumo-value">{watchVersao || "—"}</span>
                  </S.ResumoItem>
                  <S.ResumoItem>
                    <span className="resumo-label">Carga Horária Total</span>
                    <span className="resumo-value">{totalCargaHoraria}h</span>
                  </S.ResumoItem>

                  {selectedCount > 0 && (
                    <>
                      <S.SidebarHeader>
                        <h4>Disciplinas Selecionadas</h4>
                      </S.SidebarHeader>
                      {disciplinas
                        .filter((d) => watchDisciplinaIds?.includes(d.id))
                        .map((disc) => (
                          <S.ResumoItem key={disc.id}>
                            <span className="resumo-label">{disc.nome}</span>
                            <span className="resumo-value">
                              {disc.cargaHoraria}h
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
                }}
              >
                <BrainButtonSecondary onClick={handleCancel}>
                  Cancelar
                </BrainButtonSecondary>
                <BrainButtonPrimary
                  type="submit"
                  disabled={
                    isSubmitting ||
                    createGradeCurricular.isPending ||
                    updateGradeCurricular.isPending
                  }
                >
                  {createGradeCurricular.isPending ||
                  updateGradeCurricular.isPending
                    ? "Salvando..."
                    : isEditMode
                      ? "Atualizar Grade"
                      : "Criar Grade"}
                </BrainButtonPrimary>
              </Box>
            </BrainFormProvider>
          </>
        )}
      </Container>
    </ProtectedRoute>
  );
}

export default function GradeCurricularPage() {
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
      <GradeCurricularPageContent />
    </Suspense>
  );
}
