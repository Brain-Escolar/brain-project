"use client";
import {
  mapFormDataToAulaPostRequest,
  mapFormDataToAulaPutRequest,
  mapAulaResponseToFormData,
} from "@/app/(private)/aula/aulaUtils";
import { useAulaMutations } from "@/app/(private)/aula/useAulaMutations";
import { UserRoleEnum } from "@/enums";
import BrainButtonPrimary from "@/components/brainButtons/brainButtonPrimary/brainButtonPrimary";
import BrainButtonSecondary from "@/components/brainButtons/brainButtonSecondary/brainButtonSecondary";
import BrainFormProvider from "@/components/brainForms/brainFormProvider/brainFormProvider";
import { BrainDropdownControlled } from "@/components/brainForms/brainDropdownControlled";
import { BrainTextFieldControlled } from "@/components/brainForms/brainTextFieldControlled";
import ContainerSection from "@/components/containerSection/containerSection";
import PageTitle from "@/components/pageTitle/pageTitle";
import { ProtectedRoute } from "@/components/ProtectedRoute/ProtectedRoute";
import { useBrainForm } from "@/hooks/useBrainForm";
import { useAulaDetalhe } from "@/hooks/useAulaDetalhe";
import { useDisciplinas } from "@/hooks/useDisciplinas";
import { useTurmas } from "@/hooks/useTurmas";
import { useProfessores } from "@/hooks/useProfessores";
import { useHorariosDropdown } from "@/hooks/useHorarios";
import { Alert, Box, CircularProgress, Container } from "@mui/material";
import { useRouter } from "next/navigation";
import { Suspense, useEffect, useMemo } from "react";
import { aulaDefaultValues, AulaFormData, aulaSchema } from "./schema";
import { KeyValue } from "@/services/models/keyValue";
import { useBrainSearchParams } from "@/hooks/useBrainSearchParams";

function AulaPageContent() {
  const router = useRouter();
  const aulaId = useBrainSearchParams("id");

  const { aula, loading: loadingAula, error: errorAula } = useAulaDetalhe(aulaId);
  const { createAula, updateAula } = useAulaMutations();

  // Buscar dados para os dropdowns
  const { disciplinas, loading: loadingDisciplinas } = useDisciplinas();
  const { turmas, loading: loadingTurmas } = useTurmas();
  const { professores, loading: loadingProfessores } = useProfessores();
  const { horarios, loading: loadingHorarios } = useHorariosDropdown();

  const isEditMode = !!aulaId;

  const { control, handleSubmit, onFormSubmit, isSubmitting, reset, methodsHookForm } =
    useBrainForm<AulaFormData>({
      schema: aulaSchema,
      defaultValues: aulaDefaultValues,
      onSubmit: onSubmit,
      mode: "all",
    });

  useEffect(() => {
    if (aula && isEditMode) {
      const formData = mapAulaResponseToFormData(aula);
      reset(formData);
    }
  }, [aula, isEditMode, reset]);

  async function onSubmit(data: AulaFormData) {
    try {
      if (isEditMode && aulaId) {
        const aulaData = mapFormDataToAulaPutRequest(data, aulaId);
        await updateAula.mutateAsync(aulaData);
      } else {
        const aulaData = mapFormDataToAulaPostRequest(data);
        await createAula.mutateAsync(aulaData);
      }

      router.push("/aula/lista");
    } catch (error) {
      console.error("Erro ao salvar aula:", error);
    }
  }

  function handleCancel() {
    router.push("/aula/lista");
  }

  // Opções para os dropdowns
  const disciplinasOptions: KeyValue[] = useMemo(
    () =>
      disciplinas.map((d) => ({
        value: d.nome,
        key: d.id.toString(),
      })) as KeyValue[],
    [disciplinas],
  );

  const turmasOptions: KeyValue[] = useMemo(
    () =>
      turmas.map((t) => ({
        value: t.nome,
        key: t.id.toString(),
      })) as KeyValue[],
    [turmas],
  );

  const professoresOptions: KeyValue[] = useMemo(
    () =>
      professores.map((p) => ({
        value: p.nome,
        key: p.id.toString(),
      })) as KeyValue[],
    [professores],
  );

  const horariosOptions: KeyValue[] = useMemo(
    () =>
      horarios.map((h) => ({
        value: `${h.nome} (${h.horarioInicio} - ${h.horarioFim})`,
        key: h.id.toString(),
      })) as KeyValue[],
    [horarios],
  );

  const diasSemanaOptions = [
    { key: "MONDAY", value: "Segunda-feira" },
    { key: "TUESDAY", value: "Terça-feira" },
    { key: "WEDNESDAY", value: "Quarta-feira" },
    { key: "THURSDAY", value: "Quinta-feira" },
    { key: "FRIDAY", value: "Sexta-feira" },
    { key: "SATURDAY", value: "Sábado" },
    { key: "SUNDAY", value: "Domingo" },
  ];

  const QUANTITY_COLLUMNS_DEFAULT = 2;
  const isLoading = loadingDisciplinas || loadingTurmas || loadingProfessores || loadingHorarios;

  return (
    <ProtectedRoute allowedRoles={[UserRoleEnum.PROFESSOR]}>
      <Container maxWidth="lg" sx={{ py: 4 }}>
        {loadingAula && isEditMode ? (
          <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
            <CircularProgress />
          </Box>
        ) : errorAula && isEditMode ? (
          <Alert severity="error" sx={{ mb: 2 }}>
            {errorAula}
          </Alert>
        ) : (
          <>
            <PageTitle
              title={isEditMode ? "Editar Aula" : "Cadastro de Aula"}
              description="Preencha os dados abaixo para completar o cadastro no sistema"
            />
            <BrainFormProvider
              methodsHookForm={methodsHookForm}
              onSubmit={handleSubmit(onFormSubmit)}
            >
              {/* Seção Informações Básicas */}
              <ContainerSection
                title="Informações da Aula"
                description="Dados principais da aula"
                numberOfCollumns={QUANTITY_COLLUMNS_DEFAULT}
              >
                <BrainDropdownControlled
                  name="disciplinaId"
                  control={control}
                  label="Disciplina"
                  placeholder="Selecione a disciplina"
                  options={disciplinasOptions}
                  required
                  disabled={isLoading}
                />

                <BrainDropdownControlled
                  name="turmaId"
                  control={control}
                  label="Turma"
                  placeholder="Selecione a turma"
                  options={turmasOptions}
                  required
                  disabled={isLoading}
                />

                <BrainDropdownControlled
                  name="professorId"
                  control={control}
                  label="Professor"
                  placeholder="Selecione o professor"
                  options={professoresOptions}
                  required
                  disabled={isLoading}
                />

                <BrainDropdownControlled
                  name="diaSemana"
                  control={control}
                  label="Dia da Semana"
                  placeholder="Selecione o dia da semana"
                  options={diasSemanaOptions}
                  required
                />

                <BrainTextFieldControlled
                  name="sala"
                  control={control}
                  label="Sala"
                  placeholder="Digite a sala"
                  required
                />

                <BrainDropdownControlled
                  name="horarioId"
                  control={control}
                  label="Horário"
                  placeholder="Selecione o horário"
                  options={horariosOptions}
                  required
                  disabled={isLoading}
                />
              </ContainerSection>

              <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 2, mt: 4 }}>
                <BrainButtonSecondary onClick={handleCancel}>Cancelar</BrainButtonSecondary>
                <BrainButtonPrimary
                  type="submit"
                  disabled={
                    isSubmitting || createAula.isPending || updateAula.isPending || isLoading
                  }
                >
                  {createAula.isPending || updateAula.isPending ? "Salvando..." : "Salvar"}
                </BrainButtonPrimary>
              </Box>
            </BrainFormProvider>
          </>
        )}
      </Container>
    </ProtectedRoute>
  );
}

export default function AulaPage() {
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
      <AulaPageContent />
    </Suspense>
  );
}
