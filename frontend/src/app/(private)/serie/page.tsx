"use client";
import {
  mapFormDataToSeriePostRequest,
  mapFormDataToSeriePutRequest,
  mapSerieResponseToFormData,
} from "@/app/(private)/serie/serieUtils";
import { useSerieMutations } from "@/app/(private)/serie/useSerieMutations";
import { UserRoleEnum } from "@/enums";
import BrainButtonPrimary from "@/components/brainButtons/brainButtonPrimary/brainButtonPrimary";
import BrainButtonSecondary from "@/components/brainButtons/brainButtonSecondary/brainButtonSecondary";
import BrainFormProvider from "@/components/brainForms/brainFormProvider/brainFormProvider";
import { BrainTextFieldControlled } from "@/components/brainForms/brainTextFieldControlled";
import ContainerSection from "@/components/containerSection/containerSection";
import PageTitle from "@/components/pageTitle/pageTitle";
import { ProtectedRoute } from "@/components/ProtectedRoute/ProtectedRoute";
import { useBrainForm } from "@/hooks/useBrainForm";
import { useSerie } from "@/hooks/useSerie";
import { Alert, Box, CircularProgress, Container } from "@mui/material";
import { useRouter } from "next/navigation";
import { useBrainSearchParams } from "@/hooks/useBrainSearchParams";
import { Suspense, useEffect } from "react";
import { serieDefaultValues, SerieFormData, serieSchema } from "./schema";

function SeriePageContent() {
  const router = useRouter();
  const serieId = useBrainSearchParams("id");

  const { serie, loading: loadingSerie, error: errorSerie } = useSerie(serieId);
  const { createSerie, updateSerie } = useSerieMutations();

  const isEditMode = !!serieId;

  const { control, handleSubmit, onFormSubmit, isSubmitting, reset, methodsHookForm } =
    useBrainForm<SerieFormData>({
      schema: serieSchema,
      defaultValues: serieDefaultValues,
      onSubmit: onSubmit,
      mode: "all",
    });

  useEffect(() => {
    if (serie && isEditMode) {
      const formData = mapSerieResponseToFormData(serie);
      reset(formData);
    }
  }, [serie, isEditMode, reset]);

  async function onSubmit(data: SerieFormData) {
    try {
      if (isEditMode && serieId) {
        const serieData = mapFormDataToSeriePutRequest(data, serieId);
        await updateSerie.mutateAsync(serieData);
      } else {
        const serieData = mapFormDataToSeriePostRequest(data);
        await createSerie.mutateAsync(serieData);
      }

      router.push("/serie/lista");
    } catch (error) {
      console.error("Erro ao salvar série:", error);
    }
  }

  function handleCancel() {
    router.push("/serie/lista");
  }

  const QUANTITY_COLLUMNS_DEFAULT = 1;

  return (
    <ProtectedRoute allowedRoles={[UserRoleEnum.PROFESSOR]}>
      <Container maxWidth="lg" sx={{ py: 4 }}>
        {loadingSerie && isEditMode ? (
          <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
            <CircularProgress />
          </Box>
        ) : errorSerie && isEditMode ? (
          <Alert severity="error" sx={{ mb: 2 }}>
            {errorSerie}
          </Alert>
        ) : (
          <>
            <PageTitle
              title={isEditMode ? "Editar Série" : "Cadastro de Série"}
              description="Preencha os dados abaixo para completar o cadastro no sistema"
            />
            <BrainFormProvider
              methodsHookForm={methodsHookForm}
              onSubmit={handleSubmit(onFormSubmit)}
            >
              {/* Seção Informações Básicas */}
              <ContainerSection
                title="Informações Básicas"
                description="Dados principais da série"
                numberOfCollumns={QUANTITY_COLLUMNS_DEFAULT}
              >
                <BrainTextFieldControlled
                  name="nome"
                  control={control}
                  label="Nome da Série"
                  placeholder="Digite o nome da série"
                  required
                />
              </ContainerSection>

              <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 2, mt: 4 }}>
                <BrainButtonSecondary onClick={handleCancel}>Cancelar</BrainButtonSecondary>
                <BrainButtonPrimary
                  type="submit"
                  disabled={isSubmitting || createSerie.isPending || updateSerie.isPending}
                >
                  {createSerie.isPending || updateSerie.isPending ? "Salvando..." : "Salvar"}
                </BrainButtonPrimary>
              </Box>
            </BrainFormProvider>
          </>
        )}
      </Container>
    </ProtectedRoute>
  );
}

export default function SeriePage() {
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
      <SeriePageContent />
    </Suspense>
  );
}
