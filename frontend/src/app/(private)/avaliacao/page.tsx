"use client";
import {
  mapFormDataToAvaliacaoPostRequest,
  mapFormDataToAvaliacaoPutRequest,
  mapAvaliacaoResponseToFormData,
} from "@/app/(private)/avaliacao/avaliacaoUtils";
import { useAvaliacaoMutations } from "@/app/(private)/avaliacao/useAvaliacaoMutations";
import { UserRoleEnum } from "@/enums";
import BrainButtonPrimary from "@/components/brainButtons/brainButtonPrimary/brainButtonPrimary";
import BrainButtonSecondary from "@/components/brainButtons/brainButtonSecondary/brainButtonSecondary";
import { BrainDropdownControlled } from "@/components/brainForms/brainDropdownControlled";
import BrainFormProvider from "@/components/brainForms/brainFormProvider/brainFormProvider";
import { BrainTextFieldControlled } from "@/components/brainForms/brainTextFieldControlled";
import ContainerSection from "@/components/containerSection/containerSection";
import PageTitle from "@/components/pageTitle/pageTitle";
import { ProtectedRoute } from "@/components/ProtectedRoute/ProtectedRoute";
import { useBrainForm } from "@/hooks/useBrainForm";
import { useAvaliacao } from "@/hooks/useAvaliacao";
import { useDisciplinas } from "@/hooks/useDisciplinas";
import { KeyValue } from "@/services/models/keyValue";
import { Alert, Box, CircularProgress, Container, FormControlLabel, Checkbox } from "@mui/material";
import { useRouter } from "next/navigation";
import { Suspense, useEffect, useMemo } from "react";
import { avaliacaoDefaultValues, AvaliacaoFormData, avaliacaoSchema } from "./schema";
import { Controller } from "react-hook-form";
import { useBrainSearchParams } from "@/hooks/useBrainSearchParams";

function AvaliacaoPageContent() {
  const router = useRouter();
  const avaliacaoId = useBrainSearchParams("id");

  const { avaliacao, loading: loadingAvaliacao, error: errorAvaliacao } = useAvaliacao(avaliacaoId);
  const { createAvaliacao, updateAvaliacao } = useAvaliacaoMutations();

  // Buscar disciplinas da API
  const { disciplinas, loading: loadingDisciplinas } = useDisciplinas();

  const isEditMode = !!avaliacaoId;

  const { control, handleSubmit, onFormSubmit, isSubmitting, reset, methodsHookForm } =
    useBrainForm<AvaliacaoFormData>({
      schema: avaliacaoSchema,
      defaultValues: avaliacaoDefaultValues,
      onSubmit: onSubmit,
      mode: "all",
    });

  useEffect(() => {
    if (avaliacao && isEditMode) {
      const formData = mapAvaliacaoResponseToFormData(avaliacao);
      reset(formData);
    }
  }, [avaliacao, isEditMode, reset]);

  async function onSubmit(data: AvaliacaoFormData) {
    try {
      if (isEditMode && avaliacaoId) {
        const avaliacaoData = mapFormDataToAvaliacaoPutRequest(data, avaliacaoId);
        await updateAvaliacao.mutateAsync(avaliacaoData);
      } else {
        const avaliacaoData = mapFormDataToAvaliacaoPostRequest(data);
        await createAvaliacao.mutateAsync(avaliacaoData);
      }

      router.push("/avaliacao/lista");
    } catch (error) {
      console.error("Erro ao salvar avaliação:", error);
    }
  }

  function handleCancel() {
    router.push("/avaliacao/lista");
  }

  const QUANTITY_COLLUMNS_DEFAULT = 2;

  // Converter disciplinas para formato KeyValue
  const OPTIONS_DISCIPLINAS: KeyValue[] = useMemo(
    () =>
      disciplinas.map((disciplina) => ({ key: disciplina.id.toString(), value: disciplina.nome })),
    [disciplinas],
  );

  return (
    <ProtectedRoute allowedRoles={[UserRoleEnum.PROFESSOR]}>
      <Container maxWidth="lg" sx={{ py: 4 }}>
        {(loadingAvaliacao && isEditMode) || loadingDisciplinas ? (
          <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
            <CircularProgress />
          </Box>
        ) : errorAvaliacao && isEditMode ? (
          <Alert severity="error" sx={{ mb: 2 }}>
            Erro ao carregar avaliação
          </Alert>
        ) : (
          <>
            <PageTitle
              title={isEditMode ? "Editar Avaliação" : "Cadastro de Avaliação"}
              description="Preencha os dados abaixo para completar o cadastro no sistema"
            />
            <BrainFormProvider
              methodsHookForm={methodsHookForm}
              onSubmit={handleSubmit(onFormSubmit)}
            >
              {/* Seção Informações Básicas */}
              <ContainerSection
                title="Informações Básicas"
                description="Dados principais da avaliação"
                numberOfCollumns={QUANTITY_COLLUMNS_DEFAULT}
              >
                <BrainTextFieldControlled
                  name="nome"
                  control={control}
                  label="Nome da Avaliação"
                  placeholder="Digite o nome da avaliação"
                  required
                />

                <BrainDropdownControlled
                  name="disciplinaId"
                  control={control}
                  label="Disciplina"
                  required
                  options={OPTIONS_DISCIPLINAS}
                  placeholder="Selecione a disciplina"
                />

                <BrainTextFieldControlled
                  name="peso"
                  control={control}
                  label="Peso"
                  placeholder="Digite o peso da avaliação"
                  required
                  type="number"
                />

                <Box sx={{ display: "flex", alignItems: "center", mt: 2 }}>
                  <Controller
                    name="notaExtra"
                    control={control}
                    render={({ field }) => (
                      <FormControlLabel
                        control={
                          <Checkbox
                            {...field}
                            checked={field.value}
                            onChange={(e) => field.onChange(e.target.checked)}
                          />
                        }
                        label="Nota Extra"
                      />
                    )}
                  />
                </Box>
              </ContainerSection>

              {/* Seção Conteúdo */}
              <ContainerSection
                title="Conteúdo"
                description="Descrição do conteúdo da avaliação"
                numberOfCollumns={1}
              >
                <BrainTextFieldControlled
                  name="conteudo"
                  control={control}
                  label="Conteúdo"
                  placeholder="Descreva o conteúdo da avaliação"
                  required
                />
              </ContainerSection>

              <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 2, mt: 4 }}>
                <BrainButtonSecondary onClick={handleCancel}>Cancelar</BrainButtonSecondary>
                <BrainButtonPrimary
                  type="submit"
                  disabled={isSubmitting || createAvaliacao.isPending || updateAvaliacao.isPending}
                >
                  {createAvaliacao.isPending || updateAvaliacao.isPending
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

export default function AvaliacaoPage() {
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
      <AvaliacaoPageContent />
    </Suspense>
  );
}
