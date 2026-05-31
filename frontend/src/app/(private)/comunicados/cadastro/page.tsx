"use client";

import {
  mapComunicadoResponseToFormData,
  mapFormDataToComunicadoPostRequest,
  mapFormDataToComunicadoPutRequest,
} from "@/app/(private)/comunicados/comunicadoUtils";
import {
  comunicadoDefaultValues,
  ComunicadoFormData,
  comunicadoSchema,
} from "@/app/(private)/comunicados/schema";
import BrainButtonPrimary from "@/components/brainButtons/brainButtonPrimary/brainButtonPrimary";
import BrainButtonSecondary from "@/components/brainButtons/brainButtonSecondary/brainButtonSecondary";
import { BrainDateTextControlled } from "@/components/brainForms/brainDateTextControlled";
import { BrainDropdownControlled } from "@/components/brainForms/brainDropdownControlled";
import BrainFormProvider from "@/components/brainForms/brainFormProvider/brainFormProvider";
import { BrainTextFieldControlled } from "@/components/brainForms/brainTextFieldControlled";
import { RichTextEditor } from "@/components/richTextEditor/RichTextEditor";
import ContainerSection from "@/components/containerSection/containerSection";
import PageScaffold from "@/components/pageScaffold/PageScaffold";
import { RoutesEnum } from "@/enums";
import { useBrainForm } from "@/hooks/useBrainForm";
import { useComunicado } from "@/hooks/useComunicado";
import { useComunicadoMutations } from "@/hooks/useComunicadoMutations";
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  FormHelperText,
  Typography,
} from "@mui/material";
import UploadFileIcon from "@mui/icons-material/UploadFile";
import CloseIcon from "@mui/icons-material/Close";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useRef, useState } from "react";
import { Controller } from "react-hook-form";

const CATEGORIA_OPTIONS = [
  { key: "EVENTO", value: "Evento" },
  { key: "ADMINISTRATIVO", value: "Administrativo" },
  { key: "CALENDARIO", value: "Calendário" },
  { key: "ATUALIZACAO_RH", value: "Atualização RH" },
];

function ComunicadoPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const comunicadoId = searchParams.get("id");

  const { comunicado, loading: loadingComunicado, error: errorComunicado } = useComunicado(comunicadoId);
  const { createComunicado, updateComunicado } = useComunicadoMutations();

  const isEditMode = !!comunicadoId;

  const [imagemFile, setImagemFile] = useState<File | null>(null);
  const [imagemPreview, setImagemPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { control, handleSubmit, onFormSubmit, isSubmitting, reset, methodsHookForm } =
    useBrainForm<ComunicadoFormData>({
      schema: comunicadoSchema,
      defaultValues: comunicadoDefaultValues,
      onSubmit: onSubmit,
      mode: "all",
    });

  useEffect(() => {
    if (comunicado && isEditMode) {
      reset(mapComunicadoResponseToFormData(comunicado));
      if (comunicado.imagemUrl) {
        setImagemPreview(comunicado.imagemUrl);
      }
    }
  }, [comunicado, isEditMode, reset]);

  function handleImageSelect(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0] ?? null;
    setImagemFile(file);
    if (file) {
      setImagemPreview(URL.createObjectURL(file));
    }
  }

  function handleRemoveImage() {
    setImagemFile(null);
    setImagemPreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }

  async function onSubmit(data: ComunicadoFormData) {
    try {
      if (isEditMode && comunicadoId) {
        const updateData = mapFormDataToComunicadoPutRequest(data, Number(comunicadoId));
        await updateComunicado.mutateAsync(updateData);
      } else {
        const createData = mapFormDataToComunicadoPostRequest(data);
        await createComunicado.mutateAsync({ data: createData, imagem: imagemFile ?? undefined });
      }
      router.push(RoutesEnum.COMUNICADOS);
    } catch (error) {
      console.error("Erro ao salvar comunicado:", error);
    }
  }

  function handleCancel() {
    router.push(RoutesEnum.COMUNICADOS);
  }

  return (
    <PageScaffold
      title={isEditMode ? "Editar Comunicado" : "Cadastro de Comunicado"}
      description="Preencha os dados abaixo para completar o cadastro no sistema"
    >
      {loadingComunicado && isEditMode ? (
        <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
          <CircularProgress />
        </Box>
      ) : errorComunicado && isEditMode ? (
        <Alert severity="error" sx={{ mb: 2 }}>
          {errorComunicado}
        </Alert>
      ) : (
        <>
          <BrainFormProvider
            methodsHookForm={methodsHookForm}
            onSubmit={handleSubmit(onFormSubmit)}
          >
            {/* Informações gerais */}
            <ContainerSection
              title="Informações do Comunicado"
              description="Dados básicos do comunicado"
              numberOfCollumns={3}
            >
              <BrainTextFieldControlled
                name="titulo"
                control={control}
                label="Título"
                placeholder="Digite o título do comunicado"
                required
              />

              <BrainDateTextControlled
                name="data"
                control={control}
                label="Data de Publicação"
                required
              />

              <BrainDropdownControlled
                name="categoria"
                control={control}
                label="Categoria"
                options={CATEGORIA_OPTIONS}
                placeholder="Selecione uma categoria"
              />
            </ContainerSection>

            {/* Conteúdo */}
            <ContainerSection
              title="Conteúdo"
              description="Descrição detalhada do comunicado. Selecione um texto e clique no ícone de link para criar hiperlinks."
              numberOfCollumns={1}
            >
              <Controller
                name="conteudo"
                control={control}
                render={({ field, fieldState: { error } }) => (
                  <Box>
                    <RichTextEditor
                      value={field.value}
                      onChange={field.onChange}
                      placeholder="Digite o conteúdo do comunicado..."
                      error={!!error}
                      minHeight={200}
                    />
                    {error && (
                      <FormHelperText error sx={{ ml: 1.5 }}>
                        {error.message}
                      </FormHelperText>
                    )}
                  </Box>
                )}
              />
            </ContainerSection>

            {/* Imagem */}
            <ContainerSection
              title="Imagem"
              description="Imagem de capa do comunicado (opcional)"
              numberOfCollumns={1}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                style={{ display: "none" }}
                onChange={handleImageSelect}
              />

              {imagemPreview ? (
                <Box sx={{ position: "relative", display: "inline-block" }}>
                  <img
                    src={imagemPreview}
                    alt="Pré-visualização"
                    style={{
                      width: "100%",
                      maxHeight: 220,
                      objectFit: "cover",
                      borderRadius: 8,
                      display: "block",
                    }}
                  />
                  <Button
                    size="small"
                    variant="contained"
                    color="error"
                    startIcon={<CloseIcon />}
                    onClick={handleRemoveImage}
                    sx={{ mt: 1, textTransform: "none" }}
                  >
                    Remover imagem
                  </Button>
                </Box>
              ) : (
                <Box
                  onClick={() => fileInputRef.current?.click()}
                  sx={{
                    border: "2px dashed",
                    borderColor: "divider",
                    borderRadius: 2,
                    p: 4,
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    gap: 1,
                    cursor: "pointer",
                    "&:hover": { borderColor: "primary.main", bgcolor: "action.hover" },
                    transition: "all 0.2s",
                  }}
                >
                  <UploadFileIcon sx={{ fontSize: 40, color: "text.disabled" }} />
                  <Typography variant="body2" color="text.secondary">
                    Clique para selecionar uma imagem
                  </Typography>
                  <Typography variant="caption" color="text.disabled">
                    PNG, JPG, JPEG, WEBP
                  </Typography>
                </Box>
              )}
            </ContainerSection>

            {/* Anexo */}
            <ContainerSection
              title="Anexo"
              description="URL de um arquivo anexo (opcional)"
              numberOfCollumns={1}
            >
              <BrainTextFieldControlled
                name="anexoUrl"
                control={control}
                label="URL do Anexo"
                placeholder="https://..."
              />
            </ContainerSection>

            <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 2, mt: 4 }}>
              <BrainButtonSecondary onClick={handleCancel}>Cancelar</BrainButtonSecondary>
              <BrainButtonPrimary
                type="submit"
                disabled={isSubmitting || createComunicado.isPending || updateComunicado.isPending}
              >
                {createComunicado.isPending || updateComunicado.isPending ? "Salvando..." : "Salvar"}
              </BrainButtonPrimary>
            </Box>
          </BrainFormProvider>
        </>
      )}
    </PageScaffold>
  );
}

export default function ComunicadoCadastroPage() {
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
      <ComunicadoPageContent />
    </Suspense>
  );
}
