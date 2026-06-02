"use client";
import {
  mapFormDataToTarefaPostRequest,
  mapFormDataToTarefaPutRequest,
  mapTarefaResponseToFormData,
} from "@/app/(private)/tarefa/tarefaUtils";
import { useTarefaMutations } from "@/app/(private)/tarefa/useTarefaMutations";
import { RoutesEnum } from "@/enums";
import BrainButtonPrimary from "@/components/brainButtons/brainButtonPrimary/brainButtonPrimary";
import BrainButtonSecondary from "@/components/brainButtons/brainButtonSecondary/brainButtonSecondary";
import { BrainDateTextControlled } from "@/components/brainForms/brainDateTextControlled";
import { BrainTextFieldControlled } from "@/components/brainForms/brainTextFieldControlled";
import BrainFormProvider from "@/components/brainForms/brainFormProvider/brainFormProvider";
import ContainerSection from "@/components/containerSection/containerSection";
import PageScaffold from "@/components/pageScaffold/PageScaffold";
import { useBrainForm } from "@/hooks/useBrainForm";
import { useTarefa } from "@/hooks/useTarefa";
import { Alert, Box, CircularProgress } from "@mui/material";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect } from "react";
import { tarefaDefaultValues, TarefaFormData, tarefaSchema } from "../schema";

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
    <PageScaffold
      title={isEditMode ? "Editar Tarefa" : "Cadastro de Tarefa"}
      description="Preencha os dados abaixo para completar o cadastro no sistema"
    >
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
              <BrainDateTextControlled name="prazo" control={control} label="Prazo" required />
            </ContainerSection>

            {/* Seção Descrição */}
            <ContainerSection
              title="Descrição"
              description="Descrição da tarefa para os alunos"
              numberOfCollumns={1}
            >
              <BrainTextFieldControlled
                name="conteudo"
                control={control}
                label="Descrição"
                placeholder="Descreva a tarefa para os alunos"
                multiline
                rows={6}
                required
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
    </PageScaffold>
  );
}

export default function TarefaPage() {
  return (
    <Suspense
      fallback={
        <PageScaffold>
          <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
            <CircularProgress />
          </Box>
        </PageScaffold>
      }
    >
      <TarefaPageContent />
    </Suspense>
  );
}
