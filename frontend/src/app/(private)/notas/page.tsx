"use client";
import {
  mapFormDataToNotaPostRequest,
  mapFormDataToNotaPutRequest,
  mapNotaResponseToFormData,
} from "@/app/(private)/notas/notasUtils";
import { useNotaMutations } from "@/app/(private)/notas/useNotaMutations";
import { UserRoleEnum } from "@/enums";
import BrainButtonPrimary from "@/components/brainButtons/brainButtonPrimary/brainButtonPrimary";
import BrainButtonSecondary from "@/components/brainButtons/brainButtonSecondary/brainButtonSecondary";
import { BrainDropdownControlled } from "@/components/brainForms/brainDropdownControlled";
import BrainFormProvider from "@/components/brainForms/brainFormProvider/brainFormProvider";
import { BrainTextFieldControlled } from "@/components/brainForms/brainTextFieldControlled";
import { BrainDateTextControlled } from "@/components/brainForms/brainDateTextControlled";
import ContainerSection from "@/components/containerSection/containerSection";
import PageTitle from "@/components/pageTitle/pageTitle";
import { ProtectedRoute } from "@/components/ProtectedRoute/ProtectedRoute";
import { useBrainForm } from "@/hooks/useBrainForm";
import { useNota } from "@/hooks/useNota";
import { useAlunos } from "@/hooks/useAlunos";
import { useAvaliacoes } from "@/hooks/useAvaliacoes";
import { KeyValue } from "@/services/models/keyValue";
import { Alert, Box, CircularProgress, Container } from "@mui/material";
import { useRouter } from "next/navigation";
import { useBrainSearchParams } from "@/hooks/useBrainSearchParams";
import { Suspense, useEffect, useMemo } from "react";
import { notaDefaultValues, NotaFormData, notaSchema } from "./schema";

function NotaPageContent() {
  const router = useRouter();
  const notaId = useBrainSearchParams("id");

  const { nota, loading: loadingNota, error: errorNota } = useNota(notaId);
  const { createNota, updateNota } = useNotaMutations();

  // Buscar alunos e avaliações da API
  const { alunos, loading: loadingAlunos } = useAlunos();
  const { avaliacoes, loading: loadingAvaliacoes } = useAvaliacoes();

  const isEditMode = !!notaId;

  const { control, handleSubmit, onFormSubmit, isSubmitting, reset, methodsHookForm } =
    useBrainForm<NotaFormData>({
      schema: notaSchema,
      defaultValues: notaDefaultValues,
      onSubmit: onSubmit,
      mode: "all",
    });

  useEffect(() => {
    if (nota && isEditMode) {
      const formData = mapNotaResponseToFormData(nota);
      reset(formData);
    }
  }, [nota, isEditMode, reset]);

  async function onSubmit(data: NotaFormData) {
    try {
      if (isEditMode && notaId) {
        const notaData = mapFormDataToNotaPutRequest(data, notaId);
        await updateNota.mutateAsync(notaData);
      } else {
        const notaData = mapFormDataToNotaPostRequest(data);
        await createNota.mutateAsync(notaData);
      }

      router.push("/notas/lista");
    } catch (error) {
      console.error("Erro ao salvar nota:", error);
    }
  }

  function handleCancel() {
    router.push("/notas/lista");
  }

  const QUANTITY_COLLUMNS_DEFAULT = 2;

  // Converter alunos para formato KeyValue
  const OPTIONS_ALUNOS: KeyValue[] = useMemo(
    () => alunos.map((aluno) => ({ key: aluno.id.toString(), value: aluno.nome })),
    [alunos],
  );

  // Converter avaliações para formato KeyValue
  const OPTIONS_AVALIACOES: KeyValue[] = useMemo(
    () => avaliacoes.map((avaliacao) => ({ key: avaliacao.id.toString(), value: avaliacao.nome })),
    [avaliacoes],
  );

  return (
    <ProtectedRoute allowedRoles={[UserRoleEnum.PROFESSOR]}>
      <Container maxWidth="lg" sx={{ py: 4 }}>
        {(loadingNota && isEditMode) || loadingAlunos || loadingAvaliacoes ? (
          <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
            <CircularProgress />
          </Box>
        ) : errorNota && isEditMode ? (
          <Alert severity="error" sx={{ mb: 2 }}>
            Erro ao carregar nota
          </Alert>
        ) : (
          <>
            <PageTitle
              title={isEditMode ? "Editar Nota" : "Cadastro de Nota"}
              description="Preencha os dados abaixo para completar o cadastro no sistema"
            />
            <BrainFormProvider
              methodsHookForm={methodsHookForm}
              onSubmit={handleSubmit(onFormSubmit)}
            >
              {/* Seção Informações Básicas */}
              <ContainerSection
                title="Informações da Nota"
                description="Dados da nota do aluno"
                numberOfCollumns={QUANTITY_COLLUMNS_DEFAULT}
              >
                <BrainDropdownControlled
                  name="alunoId"
                  control={control}
                  label="Aluno"
                  required
                  options={OPTIONS_ALUNOS}
                  placeholder="Selecione o aluno"
                />

                <BrainDropdownControlled
                  name="avaliacaoId"
                  control={control}
                  label="Avaliação"
                  required
                  options={OPTIONS_AVALIACOES}
                  placeholder="Selecione a avaliação"
                />

                <BrainTextFieldControlled
                  name="pontuacao"
                  control={control}
                  label="Pontuação"
                  placeholder="Digite a pontuação"
                  required
                  type="number"
                />

                <BrainDateTextControlled
                  name="periodoReferencia"
                  control={control}
                  label="Período de Referência"
                  required
                />
              </ContainerSection>

              <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 2, mt: 4 }}>
                <BrainButtonSecondary onClick={handleCancel}>Cancelar</BrainButtonSecondary>
                <BrainButtonPrimary
                  type="submit"
                  disabled={isSubmitting || createNota.isPending || updateNota.isPending}
                >
                  {createNota.isPending || updateNota.isPending ? "Salvando..." : "Salvar"}
                </BrainButtonPrimary>
              </Box>
            </BrainFormProvider>
          </>
        )}
      </Container>
    </ProtectedRoute>
  );
}

export default function NotaPage() {
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
      <NotaPageContent />
    </Suspense>
  );
}
