"use client";
import {
  mapFormDataToTarefaPostRequest,
  mapFormDataToTarefaPutRequest,
  mapTarefaResponseToFormData,
} from "@/app/(private)/tarefa/tarefaUtils";
import { useTarefaMutations } from "@/app/(private)/tarefa/useTarefaMutations";
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
import { useTarefa } from "@/hooks/useTarefa";
import { Alert, Box, CircularProgress, Container } from "@mui/material";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect } from "react";
import { tarefaDefaultValues, TarefaFormData, tarefaSchema } from "./schema";

function TarefaPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const tarefaId = searchParams.get("id");

  const { tarefa, loading: loadingTarefa, error: errorTarefa } = useTarefa(tarefaId);
  const { createTarefa, updateTarefa } = useTarefaMutations();

  const isEditMode = !!tarefaId;

  const { control, handleSubmit, onFormSubmit, isSubmitting, reset, methodsHookForm } =
    useBrainForm<TarefaFormData>({
      schema: tarefaSchema,
      defaultValues: tarefaDefaultValues,
      onSubmit: onSubmit,
      mode: "all",
    });

  // Buscar tarefa se estiver em modo de edição
  useEffect(() => {
    if (tarefa && isEditMode) {
      const formData = mapTarefaResponseToFormData(tarefa);
      reset(formData);
    }
  }, [tarefa, isEditMode, reset]);

  async function onSubmit(data: TarefaFormData) {
    try {
      if (isEditMode && tarefaId) {
        const tarefaData = mapFormDataToTarefaPutRequest(data, tarefaId);
        await updateTarefa.mutateAsync(tarefaData);
      } else {
        const tarefaData = mapFormDataToTarefaPostRequest(data);
        await createTarefa.mutateAsync(tarefaData);
      }

      router.push(RoutesEnum.TAREFA_LISTA);
    } catch (error) {
      console.error("Erro ao salvar tarefa:", error);
    }
  }

  function handleCancel() {
    router.push(RoutesEnum.TAREFA_LISTA);
  }

  const QUANTITY_COLLUMNS_DEFAULT = 3;

  return (
    <ProtectedRoute allowedRoles={[UserRoleEnum.ADMIN, UserRoleEnum.PROFESSOR]}>
      <Container maxWidth="lg" sx={{ py: 4 }}>
        {loadingTarefa && isEditMode ? (
          <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
            <CircularProgress />
          </Box>
        ) : errorTarefa && isEditMode ? (
          <Alert severity="error" sx={{ mb: 2 }}>
            {errorTarefa}
          </Alert>
        ) : (
          <>
            <PageTitle
              title={isEditMode ? "Editar Tarefa" : "Cadastro de Tarefa"}
              description="Preencha os dados abaixo para completar o cadastro no sistema"
            />
            <BrainFormProvider
              methodsHookForm={methodsHookForm}
              onSubmit={handleSubmit(onFormSubmit)}
            >
              {/* Seção Informações da Tarefa */}
              <ContainerSection
                title="Informações da Tarefa"
                description="Dados básicos da tarefa"
                numberOfCollumns={QUANTITY_COLLUMNS_DEFAULT}
              >
                <BrainTextFieldControlled
                  name="titulo"
                  control={control}
                  label="Título"
                  placeholder="Digite o título da tarefa"
                  required
                />

                <BrainDateTextControlled name="prazo" control={control} label="Prazo" required />

                <BrainTextFieldControlled
                  name="documentoUrl"
                  control={control}
                  label="URL do Documento"
                  placeholder="https://exemplo.com/documento"
                  type="url"
                />
              </ContainerSection>

              {/* Seção Conteúdo */}
              <ContainerSection
                title="Conteúdo"
                description="Descrição detalhada da tarefa"
                numberOfCollumns={1}
              >
                <BrainTextFieldControlled
                  name="conteudo"
                  control={control}
                  label="Conteúdo"
                  placeholder="Digite o conteúdo da tarefa (opcional)"
                  multiline
                  rows={6}
                />
              </ContainerSection>

              <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 2, mt: 4 }}>
                <BrainButtonSecondary onClick={handleCancel}>Cancelar</BrainButtonSecondary>
                <BrainButtonPrimary
                  type="submit"
                  disabled={isSubmitting || createTarefa.isPending || updateTarefa.isPending}
                >
                  {createTarefa.isPending || updateTarefa.isPending ? "Salvando..." : "Salvar"}
                </BrainButtonPrimary>
              </Box>
            </BrainFormProvider>
          </>
        )}
      </Container>
    </ProtectedRoute>
  );
}

export default function TarefaPage() {
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
      <TarefaPageContent />
    </Suspense>
  );
}
