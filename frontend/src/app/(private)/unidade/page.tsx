"use client";
import {
  mapFormDataToUnidadePostRequest,
  mapFormDataToUnidadePutRequest,
  mapUnidadeResponseToFormData,
} from "@/app/(private)/unidade/unidadeUtils";
import { useUnidadeMutations } from "@/app/(private)/unidade/useUnidadeMutations";
import { UserRoleEnum } from "@/enums";
import BrainButtonPrimary from "@/components/brainButtons/brainButtonPrimary/brainButtonPrimary";
import BrainButtonSecondary from "@/components/brainButtons/brainButtonSecondary/brainButtonSecondary";
import { BrainTextFieldControlled } from "@/components/brainForms/brainTextFieldControlled";
import BrainFormProvider from "@/components/brainForms/brainFormProvider/brainFormProvider";
import ContainerSection from "@/components/containerSection/containerSection";
import PageTitle from "@/components/pageTitle/pageTitle";
import { ProtectedRoute } from "@/components/ProtectedRoute/ProtectedRoute";
import { useBrainForm } from "@/hooks/useBrainForm";
import { useUnidade } from "@/hooks/useUnidade";
import { Alert, Box, CircularProgress, Container } from "@mui/material";
import { useRouter } from "next/navigation";
import { useBrainSearchParams } from "@/hooks/useBrainSearchParams";
import { Suspense, useEffect } from "react";
import { unidadeDefaultValues, UnidadeFormData, unidadeSchema } from "./schema";

function UnidadePageContent() {
  const router = useRouter();
  const unidadeId = useBrainSearchParams("id");

  const { unidade, loading: loadingUnidade, error: errorUnidade } = useUnidade(unidadeId);
  const { createUnidade, updateUnidade } = useUnidadeMutations();

  const isEditMode = !!unidadeId;

  const { control, handleSubmit, onFormSubmit, isSubmitting, reset, methodsHookForm } =
    useBrainForm<UnidadeFormData>({
      schema: unidadeSchema,
      defaultValues: unidadeDefaultValues,
      onSubmit: onSubmit,
      mode: "all",
    });

  useEffect(() => {
    if (unidade && isEditMode) {
      const formData = mapUnidadeResponseToFormData(unidade);
      reset(formData);
    }
  }, [unidade, isEditMode, reset]);

  async function onSubmit(data: UnidadeFormData) {
    try {
      if (isEditMode && unidadeId && unidade) {
        const unidadeData = mapFormDataToUnidadePutRequest(data, unidade.id);
        await updateUnidade.mutateAsync(unidadeData);
      } else {
        const unidadeData = mapFormDataToUnidadePostRequest(data);
        await createUnidade.mutateAsync(unidadeData);
      }

      router.push("/unidade/lista");
    } catch (error) {
      console.error("Erro ao salvar unidade:", error);
    }
  }

  function handleCancel() {
    router.push("/unidade/lista");
  }

  const QUANTITY_COLLUMNS_DEFAULT = 3;

  return (
    <ProtectedRoute allowedRoles={[UserRoleEnum.ADMIN, UserRoleEnum.PROFESSOR]}>
      <Container maxWidth="lg" sx={{ py: 4 }}>
        {loadingUnidade && isEditMode ? (
          <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
            <CircularProgress />
          </Box>
        ) : errorUnidade && isEditMode ? (
          <Alert severity="error" sx={{ mb: 2 }}>
            {errorUnidade}
          </Alert>
        ) : (
          <>
            <PageTitle
              title={isEditMode ? "Editar Unidade" : "Cadastro de Unidade"}
              description="Preencha os dados abaixo para completar o cadastro no sistema"
            />
            <BrainFormProvider
              methodsHookForm={methodsHookForm}
              onSubmit={handleSubmit(onFormSubmit)}
            >
              {/* Seção Informações da Unidade */}
              <ContainerSection
                title="Informações da Unidade"
                description="Dados básicos da unidade"
                numberOfCollumns={QUANTITY_COLLUMNS_DEFAULT}
              >
                <BrainTextFieldControlled
                  name="nome"
                  control={control}
                  label="Nome da Unidade"
                  placeholder="Digite o nome da unidade"
                  required
                />
              </ContainerSection>

              <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 2, mt: 4 }}>
                <BrainButtonSecondary onClick={handleCancel}>Cancelar</BrainButtonSecondary>
                <BrainButtonPrimary
                  type="submit"
                  disabled={isSubmitting || createUnidade.isPending || updateUnidade.isPending}
                >
                  {createUnidade.isPending || updateUnidade.isPending ? "Salvando..." : "Salvar"}
                </BrainButtonPrimary>
              </Box>
            </BrainFormProvider>
          </>
        )}
      </Container>
    </ProtectedRoute>
  );
}

export default function UnidadePage() {
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
      <UnidadePageContent />
    </Suspense>
  );
}
