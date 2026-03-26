"use client";
import {
  mapFormDataToAlertaPostRequest,
  mapFormDataToAlertaPutRequest,
  mapAlertaResponseToFormData,
} from "@/app/(private)/alerta/alertaUtils";
import { useAlertaMutations } from "@/app/(private)/alerta/useAlertaMutations";
import { RoutesEnum, UserRoleEnum } from "@/enums";
import BrainButtonPrimary from "@/components/brainButtons/brainButtonPrimary/brainButtonPrimary";
import BrainButtonSecondary from "@/components/brainButtons/brainButtonSecondary/brainButtonSecondary";
import { BrainDateTextControlled } from "@/components/brainForms/brainDateTextControlled";
import { BrainTextFieldControlled } from "@/components/brainForms/brainTextFieldControlled";
import BrainFormProvider from "@/components/brainForms/brainFormProvider/brainFormProvider";
import ContainerSection from "@/components/containerSection/containerSection";
import PageTitle from "@/components/pageTitle/pageTitle";
import { ProtectedRoute } from "@/components/ProtectedRoute/ProtectedRoute";
import { useBrainForm } from "@/hooks/useBrainForm";
import { useAlerta } from "@/hooks/useAlerta";
import { Alert, Box, CircularProgress, Container } from "@mui/material";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect } from "react";
import { alertaDefaultValues, AlertaFormData, alertaSchema } from "./schema";

function AlertaPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const alertaId = searchParams.get("id");

  const { alerta, loading: loadingAlerta, error: errorAlerta } = useAlerta(alertaId);
  const { createAlerta, updateAlerta } = useAlertaMutations();

  const isEditMode = !!alertaId;

  const { control, handleSubmit, onFormSubmit, isSubmitting, reset, methodsHookForm } =
    useBrainForm<AlertaFormData>({
      schema: alertaSchema,
      defaultValues: alertaDefaultValues,
      onSubmit: onSubmit,
      mode: "all",
    });

  // Buscar alerta se estiver em modo de edição
  useEffect(() => {
    if (alerta && isEditMode) {
      const formData = mapAlertaResponseToFormData(alerta);
      reset(formData);
    }
  }, [alerta, isEditMode, reset]);

  async function onSubmit(data: AlertaFormData) {
    try {
      if (isEditMode && alertaId) {
        const alertaData = mapFormDataToAlertaPutRequest(data, alertaId);
        await updateAlerta.mutateAsync(alertaData);
      } else {
        const alertaData = mapFormDataToAlertaPostRequest(data);
        await createAlerta.mutateAsync(alertaData);
      }

      router.push(RoutesEnum.ALERTA_LISTA);
    } catch (error) {
      console.error("Erro ao salvar alerta:", error);
    }
  }

  function handleCancel() {
    router.push(RoutesEnum.ALERTA_LISTA);
  }

  const QUANTITY_COLLUMNS_DEFAULT = 3;

  return (
    <ProtectedRoute allowedRoles={[UserRoleEnum.ADMIN, UserRoleEnum.PROFESSOR]}>
      <Container maxWidth="lg" sx={{ py: 4 }}>
        {loadingAlerta && isEditMode ? (
          <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
            <CircularProgress />
          </Box>
        ) : errorAlerta && isEditMode ? (
          <Alert severity="error" sx={{ mb: 2 }}>
            {errorAlerta}
          </Alert>
        ) : (
          <>
            <PageTitle
              title={isEditMode ? "Editar Alerta" : "Cadastro de Alerta"}
              description="Preencha os dados abaixo para completar o cadastro no sistema"
            />
            <BrainFormProvider
              methodsHookForm={methodsHookForm}
              onSubmit={handleSubmit(onFormSubmit)}
            >
              {/* Seção Informações do Alerta */}
              <ContainerSection
                title="Informações do Alerta"
                description="Dados básicos do alerta"
                numberOfCollumns={QUANTITY_COLLUMNS_DEFAULT}
              >
                <BrainTextFieldControlled
                  name="titulo"
                  control={control}
                  label="Título"
                  placeholder="Digite o título do alerta"
                  required
                />

                <BrainDateTextControlled
                  name="data"
                  control={control}
                  label="Data de Publicação"
                  required
                />
              </ContainerSection>

              {/* Seção Conteúdo */}
              <ContainerSection
                title="Conteúdo"
                description="Descrição detalhada do alerta"
                numberOfCollumns={1}
              >
                <BrainTextFieldControlled
                  name="conteudo"
                  control={control}
                  label="Conteúdo"
                  placeholder="Digite o conteúdo do alerta"
                  required
                  multiline
                  rows={6}
                />
              </ContainerSection>

              <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 2, mt: 4 }}>
                <BrainButtonSecondary onClick={handleCancel}>Cancelar</BrainButtonSecondary>
                <BrainButtonPrimary
                  type="submit"
                  disabled={isSubmitting || createAlerta.isPending || updateAlerta.isPending}
                >
                  {createAlerta.isPending || updateAlerta.isPending ? "Salvando..." : "Salvar"}
                </BrainButtonPrimary>
              </Box>
            </BrainFormProvider>
          </>
        )}
      </Container>
    </ProtectedRoute>
  );
}

export default function AlertaPage() {
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
      <AlertaPageContent />
    </Suspense>
  );
}
