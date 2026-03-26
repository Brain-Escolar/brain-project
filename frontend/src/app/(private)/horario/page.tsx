"use client";
import {
  mapFormDataToHorarioPostRequest,
  mapFormDataToHorarioPutRequest,
  mapHorarioResponseToFormData,
} from "@/app/(private)/horario/horarioUtils";
import { useHorarioMutations } from "@/app/(private)/horario/useHorarioMutations";
import { UserRoleEnum } from "@/enums";
import BrainButtonPrimary from "@/components/brainButtons/brainButtonPrimary/brainButtonPrimary";
import BrainButtonSecondary from "@/components/brainButtons/brainButtonSecondary/brainButtonSecondary";
import BrainFormProvider from "@/components/brainForms/brainFormProvider/brainFormProvider";
import { BrainTextFieldControlled } from "@/components/brainForms/brainTextFieldControlled";
import { BrainTextHorarioControlled } from "@/components/brainForms/brainTextHorarioControlled";
import ContainerSection from "@/components/containerSection/containerSection";
import PageTitle from "@/components/pageTitle/pageTitle";
import { ProtectedRoute } from "@/components/ProtectedRoute/ProtectedRoute";
import { useBrainForm } from "@/hooks/useBrainForm";
import { useHorario } from "@/hooks/useHorario";
import { Alert, Box, CircularProgress, Container } from "@mui/material";
import { useRouter } from "next/navigation";
import { useBrainSearchParams } from "@/hooks/useBrainSearchParams";
import { Suspense, useEffect } from "react";
import { horarioDefaultValues, HorarioFormData, horarioSchema } from "./schema";

function HorarioPageContent() {
  const router = useRouter();
  const horarioId = useBrainSearchParams("id");

  const { horario, loading: loadingHorario, error: errorHorario } = useHorario(horarioId);
  const { createHorario, updateHorario } = useHorarioMutations();

  const isEditMode = !!horarioId;

  const { control, handleSubmit, onFormSubmit, isSubmitting, reset, methodsHookForm } =
    useBrainForm<HorarioFormData>({
      schema: horarioSchema,
      defaultValues: horarioDefaultValues,
      onSubmit: onSubmit,
      mode: "all",
    });

  useEffect(() => {
    if (horario && isEditMode) {
      const formData = mapHorarioResponseToFormData(horario);
      reset(formData);
    }
  }, [horario, isEditMode, reset]);

  async function onSubmit(data: HorarioFormData) {
    try {
      if (isEditMode && horarioId) {
        const horarioData = mapFormDataToHorarioPutRequest(data, horarioId);
        await updateHorario.mutateAsync(horarioData);
      } else {
        const horarioData = mapFormDataToHorarioPostRequest(data);
        await createHorario.mutateAsync(horarioData);
      }

      router.push("/horario/lista");
    } catch (error) {
      console.error("Erro ao salvar horário:", error);
    }
  }

  function handleCancel() {
    router.push("/horario/lista");
  }

  const QUANTITY_COLLUMNS_DEFAULT = 2;

  return (
    <ProtectedRoute allowedRoles={[UserRoleEnum.PROFESSOR]}>
      <Container maxWidth="lg" sx={{ py: 4 }}>
        {loadingHorario && isEditMode ? (
          <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
            <CircularProgress />
          </Box>
        ) : errorHorario && isEditMode ? (
          <Alert severity="error" sx={{ mb: 2 }}>
            {errorHorario}
          </Alert>
        ) : (
          <>
            <PageTitle
              title={isEditMode ? "Editar Horário" : "Cadastro de Horário"}
              description="Preencha os dados abaixo para completar o cadastro no sistema"
            />
            <BrainFormProvider
              methodsHookForm={methodsHookForm}
              onSubmit={handleSubmit(onFormSubmit)}
            >
              {/* Seção Informações Básicas */}
              <ContainerSection
                title="Informações do Horário"
                description="Dados do período de aula"
                numberOfCollumns={QUANTITY_COLLUMNS_DEFAULT}
              >
                <BrainTextFieldControlled
                  name="nome"
                  control={control}
                  label="Nome do Horário"
                  placeholder="Ex: 1º Horário, Manhã, etc."
                  required
                />

                <Box />

                <BrainTextHorarioControlled
                  name="horarioInicio"
                  control={control}
                  label="Horário de Início"
                  placeholder="08:00"
                  required
                />

                <BrainTextHorarioControlled
                  name="horarioFim"
                  control={control}
                  label="Horário de Fim"
                  placeholder="18:00"
                  required
                />
              </ContainerSection>

              <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 2, mt: 4 }}>
                <BrainButtonSecondary onClick={handleCancel}>Cancelar</BrainButtonSecondary>
                <BrainButtonPrimary
                  type="submit"
                  disabled={isSubmitting || createHorario.isPending || updateHorario.isPending}
                >
                  {createHorario.isPending || updateHorario.isPending ? "Salvando..." : "Salvar"}
                </BrainButtonPrimary>
              </Box>
            </BrainFormProvider>
          </>
        )}
      </Container>
    </ProtectedRoute>
  );
}

export default function HorarioPage() {
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
      <HorarioPageContent />
    </Suspense>
  );
}
