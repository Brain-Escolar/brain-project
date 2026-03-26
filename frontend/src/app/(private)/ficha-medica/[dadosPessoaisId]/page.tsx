"use client";
import { mapFormDataToFichaMedicaPostRequest } from "@/app/(private)/ficha-medica/fichaMedicaUtils";
import { useFichaMedicaMutations } from "@/app/(private)/ficha-medica/useFichaMedicaMutations";
import { RoutesEnum, UserRoleEnum } from "@/enums";
import BrainButtonPrimary from "@/components/brainButtons/brainButtonPrimary/brainButtonPrimary";
import BrainButtonSecondary from "@/components/brainButtons/brainButtonSecondary/brainButtonSecondary";
import { BrainDropdownControlled } from "@/components/brainForms/brainDropdownControlled";
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
  List,
  ListItem,
  ListItemText,
  IconButton,
  Paper,
} from "@mui/material";
import { AttachFile, Delete } from "@mui/icons-material";
import { useRouter } from "next/navigation";
import { Suspense, use, useEffect, useRef } from "react";
import { fichaMedicaDefaultValues, FichaMedicaFormData, fichaMedicaSchema } from "../schema";
import { Controller } from "react-hook-form";

interface PageProps {
  params: Promise<{
    dadosPessoaisId: string;
  }>;
}

function FichaMedicaPageContent({ params }: PageProps) {
  const router = useRouter();
  const { dadosPessoaisId } = use(params);

  const { createFichaMedica } = useFichaMedicaMutations();

  const {
    control,
    handleSubmit,
    onFormSubmit,
    isSubmitting,
    reset,
    methodsHookForm,
    watch,
    setValue,
  } = useBrainForm<FichaMedicaFormData>({
    schema: fichaMedicaSchema,
    defaultValues: fichaMedicaDefaultValues,
    onSubmit: onSubmit,
    mode: "all",
  });

  const fileInputRef = useRef<HTMLInputElement>(null);
  const laudosFiles = watch("laudos") || [];

  // Set dadosPessoaisId from URL
  useEffect(() => {
    if (dadosPessoaisId) {
      reset({
        ...fichaMedicaDefaultValues,
        dadosPessoaisId: dadosPessoaisId,
      });
    }
  }, [dadosPessoaisId, reset]);

  async function onSubmit(data: FichaMedicaFormData) {
    try {
      const fichaMedicaData = mapFormDataToFichaMedicaPostRequest(data);
      await createFichaMedica.mutateAsync(fichaMedicaData);
      router.push(RoutesEnum.FICHA_MEDICA_LISTA);
    } catch (error) {
      console.error("Erro ao salvar ficha médica:", error);
    }
  }

  function handleCancel() {
    router.push(RoutesEnum.FICHA_MEDICA_LISTA);
  }

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files && files.length > 0) {
      const newFiles = Array.from(files);
      setValue("laudos", [...laudosFiles, ...newFiles], { shouldValidate: true });
    }
    // Reset input so same file can be selected again
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleRemoveFile = (index: number) => {
    const updatedFiles = laudosFiles.filter((_, i) => i !== index);
    setValue("laudos", updatedFiles, { shouldValidate: true });
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + " " + sizes[i];
  };

  // Opções de tipo sanguíneo
  const OPTIONS_TIPO_SANGUINEO = [
    { key: "A_POSITIVO", value: "A+" },
    { key: "A_NEGATIVO", value: "A-" },
    { key: "B_POSITIVO", value: "B+" },
    { key: "B_NEGATIVO", value: "B-" },
    { key: "AB_POSITIVO", value: "AB+" },
    { key: "AB_NEGATIVO", value: "AB-" },
    { key: "O_POSITIVO", value: "O+" },
    { key: "O_NEGATIVO", value: "O-" },
  ];

  const QUANTITY_COLLUMNS_DEFAULT = 2;

  return (
    <ProtectedRoute allowedRoles={[UserRoleEnum.ADMIN, UserRoleEnum.PROFESSOR]}>
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <PageTitle
          title="Cadastro de Ficha Médica"
          description="Preencha os dados abaixo para completar o cadastro no sistema"
        />
        <BrainFormProvider methodsHookForm={methodsHookForm} onSubmit={handleSubmit(onFormSubmit)}>
          {/* Seção Identificação */}
          <ContainerSection
            title="Identificação"
            description="Usuário selecionado"
            numberOfCollumns={1}
          >
            <BrainTextFieldControlled
              name="dadosPessoaisId"
              control={control}
              label="Usuário"
              placeholder={`ID: ${dadosPessoaisId}`}
              disabled={true}
            />
          </ContainerSection>

          {/* Seção Informações Médicas Básicas */}
          <ContainerSection
            title="Informações Médicas Básicas"
            description="Dados gerais de saúde"
            numberOfCollumns={QUANTITY_COLLUMNS_DEFAULT}
          >
            <BrainDropdownControlled
              name="tipoSanguineo"
              control={control}
              label="Tipo Sanguíneo"
              options={OPTIONS_TIPO_SANGUINEO}
              placeholder="Selecione o tipo sanguíneo"
            />

            <BrainTextFieldControlled
              name="necessidadesEspeciais"
              control={control}
              label="Necessidades Especiais"
              placeholder="Descreva as necessidades especiais (opcional)"
              multiline
              rows={3}
            />
          </ContainerSection>

          {/* Seção Condições de Saúde */}
          <ContainerSection
            title="Condições de Saúde"
            description="Informações sobre condições médicas"
            numberOfCollumns={1}
          >
            <BrainTextFieldControlled
              name="doencasRespiratorias"
              control={control}
              label="Doenças Respiratórias"
              placeholder="Descreva doenças respiratórias (opcional)"
              multiline
              rows={3}
            />
          </ContainerSection>

          {/* Seção Alergias */}
          <ContainerSection
            title="Alergias"
            description="Informações sobre alergias"
            numberOfCollumns={QUANTITY_COLLUMNS_DEFAULT}
          >
            <BrainTextFieldControlled
              name="alergiasAlimentares"
              control={control}
              label="Alergias Alimentares"
              placeholder="Descreva alergias alimentares (opcional)"
              multiline
              rows={3}
            />

            <BrainTextFieldControlled
              name="alergiasMedicamentosas"
              control={control}
              label="Alergias Medicamentosas"
              placeholder="Descreva alergias a medicamentos (opcional)"
              multiline
              rows={3}
            />
          </ContainerSection>

          {/* Seção Laudos */}
          <ContainerSection
            title="Laudos"
            description="Adicione arquivos de laudos médicos (opcional)"
            numberOfCollumns={1}
          >
            <Box>
              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                onChange={handleFileSelect}
                style={{ display: "none" }}
                id="laudos-file-input"
              />
              <label htmlFor="laudos-file-input">
                <Button
                  variant="outlined"
                  component="span"
                  startIcon={<AttachFile />}
                  sx={{ mb: 2 }}
                >
                  Adicionar Arquivos
                </Button>
              </label>

              {laudosFiles.length > 0 && (
                <Paper variant="outlined" sx={{ p: 2, mt: 2 }}>
                  <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>
                    Arquivos Selecionados ({laudosFiles.length})
                  </Typography>
                  <List dense>
                    {laudosFiles.map((file, index) => (
                      <ListItem
                        key={index}
                        secondaryAction={
                          <IconButton
                            edge="end"
                            aria-label="remover"
                            onClick={() => handleRemoveFile(index)}
                            color="error"
                            size="small"
                          >
                            <Delete />
                          </IconButton>
                        }
                        sx={{
                          border: "1px solid",
                          borderColor: "divider",
                          borderRadius: 1,
                          mb: 1,
                          bgcolor: "background.paper",
                        }}
                      >
                        <ListItemText primary={file.name} secondary={formatFileSize(file.size)} />
                      </ListItem>
                    ))}
                  </List>
                </Paper>
              )}

              <Controller
                name="laudos"
                control={control}
                render={({ fieldState: { error } }) => (
                  <>
                    {error && (
                      <Typography variant="caption" color="error" sx={{ mt: 1, display: "block" }}>
                        {error.message}
                      </Typography>
                    )}
                  </>
                )}
              />
            </Box>
          </ContainerSection>

          <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 2, mt: 4 }}>
            <BrainButtonSecondary onClick={handleCancel}>Cancelar</BrainButtonSecondary>
            <BrainButtonPrimary
              type="submit"
              disabled={isSubmitting || createFichaMedica.isPending}
            >
              {createFichaMedica.isPending ? "Salvando..." : "Salvar"}
            </BrainButtonPrimary>
          </Box>
        </BrainFormProvider>
      </Container>
    </ProtectedRoute>
  );
}

export default function FichaMedicaPage({ params }: PageProps) {
  return (
    <Suspense fallback={null}>
      <FichaMedicaPageContent params={params} />
    </Suspense>
  );
}
