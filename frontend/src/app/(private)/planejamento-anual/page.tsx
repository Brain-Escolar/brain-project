"use client";
import { mapFormDataToPlanejamentoAnualRequest } from "@/app/(private)/planejamento-anual/planejamentoAnualUtils";
import { usePlanejamentoAnualMutations } from "@/app/(private)/planejamento-anual/usePlanejamentoAnualMutations";
import { UserRoleEnum } from "@/enums";
import BrainButtonPrimary from "@/components/brainButtons/brainButtonPrimary/brainButtonPrimary";
import BrainButtonSecondary from "@/components/brainButtons/brainButtonSecondary/brainButtonSecondary";
import { BrainTextFieldControlled } from "@/components/brainForms/brainTextFieldControlled";
import BrainFormProvider from "@/components/brainForms/brainFormProvider/brainFormProvider";
import ContainerSection from "@/components/containerSection/containerSection";
import PageTitle from "@/components/pageTitle/pageTitle";
import { ProtectedRoute } from "@/components/ProtectedRoute/ProtectedRoute";
import { useBrainForm } from "@/hooks/useBrainForm";
import {
  Box,
  Container,
  Button,
  Typography,
  Paper,
  Alert,
} from "@mui/material";
import { AttachFile, Delete, Description } from "@mui/icons-material";
import { useRouter } from "next/navigation";
import { useRef } from "react";
import {
  planejamentoAnualDefaultValues,
  PlanejamentoAnualFormData,
  planejamentoAnualSchema,
} from "./schema";
import { Controller } from "react-hook-form";

export default function PlanejamentoAnualCadastroPage() {
  const router = useRouter();

  const { createPlanejamentoAnual } = usePlanejamentoAnualMutations();

  const {
    control,
    handleSubmit,
    onFormSubmit,
    isSubmitting,
    methodsHookForm,
    watch,
    setValue,
  } = useBrainForm<PlanejamentoAnualFormData>({
    schema: planejamentoAnualSchema,
    defaultValues: planejamentoAnualDefaultValues,
    onSubmit: onSubmit,
    mode: "all",
  });

  const fileInputRef = useRef<HTMLInputElement>(null);
  const planejamentoFile = watch("planejamento");

  async function onSubmit(data: PlanejamentoAnualFormData) {
    try {
      const planejamentoData = mapFormDataToPlanejamentoAnualRequest(data);
      await createPlanejamentoAnual.mutateAsync(planejamentoData);
      router.push("/planejamento-anual/lista");
    } catch (error) {
      console.error("Erro ao salvar planejamento anual:", error);
    }
  }

  function handleCancel() {
    router.push("/planejamento-anual/lista");
  }

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files && files.length > 0) {
      setValue("planejamento", files[0], { shouldValidate: true });
    }

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleRemoveFile = () => {
    setValue("planejamento", undefined as unknown as File, {
      shouldValidate: true,
    });
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + " " + sizes[i];
  };

  return (
    <ProtectedRoute allowedRoles={[UserRoleEnum.ADMIN, UserRoleEnum.PROFESSOR]}>
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <PageTitle
          title="Cadastro de Planejamento Anual"
          description="Faça upload do arquivo com o planejamento anual da escola"
        />
        <BrainFormProvider
          methodsHookForm={methodsHookForm}
          onSubmit={handleSubmit(onFormSubmit)}
        >
          {/* Seção Ano */}
          <ContainerSection
            title="Informações do Planejamento"
            description="Defina o ano do planejamento"
            numberOfCollumns={1}
          >
            <BrainTextFieldControlled
              name="ano"
              control={control}
              label="Ano"
              placeholder="Digite o ano (ex: 2025)"
              type="number"
            />
          </ContainerSection>

          {/* Seção Arquivo */}
          <ContainerSection
            title="Arquivo"
            description="Faça upload do planejamento anual da escola"
            numberOfCollumns={1}
          >
            <Box>
              <Alert severity="info" sx={{ mb: 2 }}>
                O arquivo deve estar no formato Excel (.xls ou .xlsx) e conter
                o planejamento anual completo da escola.
              </Alert>

              <input
                ref={fileInputRef}
                type="file"
                accept=".xls,.xlsx,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/vnd.ms-excel"
                onChange={handleFileSelect}
                style={{ display: "none" }}
                id="planejamento-file-input"
              />
              <label htmlFor="planejamento-file-input">
                <Button
                  variant="outlined"
                  component="span"
                  startIcon={<AttachFile />}
                  sx={{ mb: 2 }}
                >
                  {planejamentoFile ? "Alterar Arquivo" : "Selecionar Arquivo"}
                </Button>
              </label>

              {planejamentoFile && planejamentoFile instanceof File && (
                <Paper
                  variant="outlined"
                  sx={{
                    p: 2,
                    mt: 2,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    bgcolor: "background.paper",
                  }}
                >
                  <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                    <Description color="primary" sx={{ fontSize: 40 }} />
                    <Box>
                      <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                        {planejamentoFile.name}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {formatFileSize(planejamentoFile.size)}
                      </Typography>
                    </Box>
                  </Box>
                  <Button
                    variant="outlined"
                    color="error"
                    startIcon={<Delete />}
                    onClick={handleRemoveFile}
                    size="small"
                  >
                    Remover
                  </Button>
                </Paper>
              )}

              <Controller
                name="planejamento"
                control={control}
                render={({ fieldState: { error } }) => (
                  <>
                    {error && (
                      <Typography
                        variant="caption"
                        color="error"
                        sx={{ mt: 1, display: "block" }}
                      >
                        {error.message}
                      </Typography>
                    )}
                  </>
                )}
              />
            </Box>
          </ContainerSection>

          <Box
            sx={{ display: "flex", justifyContent: "flex-end", gap: 2, mt: 4 }}
          >
            <BrainButtonSecondary onClick={handleCancel}>
              Cancelar
            </BrainButtonSecondary>
            <BrainButtonPrimary
              type="submit"
              disabled={isSubmitting || createPlanejamentoAnual.isPending}
            >
              {createPlanejamentoAnual.isPending ? "Salvando..." : "Salvar"}
            </BrainButtonPrimary>
          </Box>
        </BrainFormProvider>
      </Container>
    </ProtectedRoute>
  );
}
