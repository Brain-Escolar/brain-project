"use client";
import {
  mapFormDataToGrupoDisciplinaPostRequest,
  mapFormDataToGrupoDisciplinaPutRequest,
  mapGrupoDisciplinaResponseToFormData,
} from "@/app/(private)/grupo-disciplina/grupoDisciplinaUtils";
import { useGrupoDisciplinaMutations } from "@/app/(private)/grupo-disciplina/useGrupoDisciplinaMutations";
import { UserRoleEnum } from "@/enums";
import BrainButtonPrimary from "@/components/brainButtons/brainButtonPrimary/brainButtonPrimary";
import BrainButtonSecondary from "@/components/brainButtons/brainButtonSecondary/brainButtonSecondary";
import BrainFormProvider from "@/components/brainForms/brainFormProvider/brainFormProvider";
import { BrainTextFieldControlled } from "@/components/brainForms/brainTextFieldControlled";
import ContainerSection from "@/components/containerSection/containerSection";
import PageTitle from "@/components/pageTitle/pageTitle";
import { ProtectedRoute } from "@/components/ProtectedRoute/ProtectedRoute";
import { useBrainForm } from "@/hooks/useBrainForm";
import { useGrupoDisciplina } from "@/hooks/useGrupoDisciplina";
import { Alert, Box, CircularProgress, Container } from "@mui/material";
import { useRouter } from "next/navigation";
import { useBrainSearchParams } from "@/hooks/useBrainSearchParams";
import { Suspense, useEffect } from "react";
import {
  grupoDisciplinaDefaultValues,
  GrupoDisciplinaFormData,
  grupoDisciplinaSchema,
} from "./schema";

function GrupoDisciplinaPageContent() {
  const router = useRouter();
  const grupoDisciplinaId = useBrainSearchParams("id");

  const {
    grupoDisciplina,
    loading: loadingGrupoDisciplina,
    error: errorGrupoDisciplina,
  } = useGrupoDisciplina(grupoDisciplinaId);
  const { createGrupoDisciplina, updateGrupoDisciplina } = useGrupoDisciplinaMutations();

  const isEditMode = !!grupoDisciplinaId;

  const { control, handleSubmit, onFormSubmit, isSubmitting, reset, methodsHookForm } =
    useBrainForm<GrupoDisciplinaFormData>({
      schema: grupoDisciplinaSchema,
      defaultValues: grupoDisciplinaDefaultValues,
      onSubmit: onSubmit,
      mode: "all",
    });

  useEffect(() => {
    if (grupoDisciplina && isEditMode) {
      const formData = mapGrupoDisciplinaResponseToFormData(grupoDisciplina);
      reset(formData);
    }
  }, [grupoDisciplina, isEditMode, reset]);

  async function onSubmit(data: GrupoDisciplinaFormData) {
    try {
      if (isEditMode && grupoDisciplinaId) {
        const grupoDisciplinaData = mapFormDataToGrupoDisciplinaPutRequest(data, grupoDisciplinaId);
        await updateGrupoDisciplina.mutateAsync(grupoDisciplinaData);
      } else {
        const grupoDisciplinaData = mapFormDataToGrupoDisciplinaPostRequest(data);
        await createGrupoDisciplina.mutateAsync(grupoDisciplinaData);
      }

      router.push("/grupo-disciplina/lista");
    } catch (error) {
      console.error("Erro ao salvar grupo de disciplina:", error);
    }
  }

  function handleCancel() {
    router.push("/grupo-disciplina/lista");
  }

  const QUANTITY_COLLUMNS_DEFAULT = 2;

  return (
    <ProtectedRoute allowedRoles={[UserRoleEnum.PROFESSOR]}>
      <Container maxWidth="lg" sx={{ py: 4 }}>
        {loadingGrupoDisciplina && isEditMode ? (
          <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
            <CircularProgress />
          </Box>
        ) : errorGrupoDisciplina && isEditMode ? (
          <Alert severity="error" sx={{ mb: 2 }}>
            {errorGrupoDisciplina}
          </Alert>
        ) : (
          <>
            <PageTitle
              title={isEditMode ? "Editar Grupo de Disciplina" : "Cadastro de Grupo de Disciplina"}
              description="Preencha os dados abaixo para completar o cadastro no sistema"
            />
            <BrainFormProvider
              methodsHookForm={methodsHookForm}
              onSubmit={handleSubmit(onFormSubmit)}
            >
              {/* Seção Informações Básicas */}
              <ContainerSection
                title="Informações Básicas"
                description="Dados principais do grupo de disciplina"
                numberOfCollumns={QUANTITY_COLLUMNS_DEFAULT}
              >
                <BrainTextFieldControlled
                  name="nome"
                  control={control}
                  label="Nome do Grupo"
                  placeholder="Digite o nome do grupo de disciplina"
                  required
                />

                <BrainTextFieldControlled
                  name="area"
                  control={control}
                  label="Área"
                  placeholder="Digite a área do grupo"
                  required
                />
              </ContainerSection>

              <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 2, mt: 4 }}>
                <BrainButtonSecondary onClick={handleCancel}>Cancelar</BrainButtonSecondary>
                <BrainButtonPrimary
                  type="submit"
                  disabled={
                    isSubmitting ||
                    createGrupoDisciplina.isPending ||
                    updateGrupoDisciplina.isPending
                  }
                >
                  {createGrupoDisciplina.isPending || updateGrupoDisciplina.isPending
                    ? "Salvando..."
                    : "Salvar"}
                </BrainButtonPrimary>
              </Box>
            </BrainFormProvider>
          </>
        )}
      </Container>
    </ProtectedRoute>
  );
}

export default function GrupoDisciplinaPage() {
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
      <GrupoDisciplinaPageContent />
    </Suspense>
  );
}
