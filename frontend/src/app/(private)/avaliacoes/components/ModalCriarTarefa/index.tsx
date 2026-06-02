"use client";

import {
  mapFormDataToTarefaPostRequest,
} from "@/app/(private)/tarefa/tarefaUtils";
import { useTarefaMutations } from "@/app/(private)/tarefa/useTarefaMutations";
import { tarefaDefaultValues, TarefaFormData, tarefaSchema } from "@/app/(private)/tarefa/schema";
import { BrainDateTextControlled } from "@/components/brainForms/brainDateTextControlled";
import { BrainTextFieldControlled } from "@/components/brainForms/brainTextFieldControlled";
import BrainFormProvider from "@/components/brainForms/brainFormProvider/brainFormProvider";
import { useBrainForm } from "@/hooks/useBrainForm";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import InsertDriveFileOutlinedIcon from "@mui/icons-material/InsertDriveFileOutlined";
import {
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Typography,
} from "@mui/material";
import { useRef, useState } from "react";
import styled from "styled-components";
import { cssVarColor } from "@/styles";

const UploadArea = styled.div<{ hasFile?: boolean }>`
  border: 2px dashed ${(p) => (p.hasFile ? cssVarColor("primary") : cssVarColor("border"))};
  border-radius: 8px;
  padding: 24px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  background: ${(p) => (p.hasFile ? "rgba(0, 120, 212, 0.04)" : cssVarColor("background"))};
  transition: all 0.2s ease;

  &:hover {
    border-color: ${cssVarColor("primary")};
    background: rgba(0, 120, 212, 0.04);
  }
`;

const UploadLabel = styled.p`
  margin: 0;
  font-size: 0.85rem;
  color: ${cssVarColor("textSecondary")};
  text-align: center;
`;

const FilePreview = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 0.85rem;
  color: ${cssVarColor("text")};
  font-weight: 500;
`;

interface ModalCriarTarefaProps {
  open: boolean;
  onClose: () => void;
}

export default function ModalCriarTarefa({ open, onClose }: ModalCriarTarefaProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const { createTarefa } = useTarefaMutations();

  const { control, handleSubmit, onFormSubmit, isSubmitting, reset, methodsHookForm } =
    useBrainForm<TarefaFormData>({
      schema: tarefaSchema,
      defaultValues: tarefaDefaultValues,
      onSubmit: onSubmit,
      mode: "all",
    });

  async function onSubmit(data: TarefaFormData) {
    try {
      const requestData = mapFormDataToTarefaPostRequest(data);
      await createTarefa.mutateAsync(requestData);
      handleClose();
    } catch {
      // Error handled by the mutation hook
    }
  }

  function handleClose() {
    reset(tarefaDefaultValues);
    setSelectedFile(null);
    onClose();
  }

  function handleFileSelect(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0] ?? null;
    setSelectedFile(file);
  }

  function handleUploadAreaClick() {
    fileInputRef.current?.click();
  }

  return (
    <Dialog open={open} onClose={handleClose} fullWidth maxWidth="sm">
      <DialogTitle sx={{ fontWeight: 600 }}>Nova Tarefa</DialogTitle>

      <BrainFormProvider methodsHookForm={methodsHookForm} onSubmit={handleSubmit(onFormSubmit)}>
        <DialogContent sx={{ display: "flex", flexDirection: "column", gap: 2, pt: 1 }}>
          <BrainTextFieldControlled
            name="conteudo"
            control={control}
            label="Descrição"
            placeholder="Descreva a tarefa para os alunos"
            multiline
            rows={3}
            required
          />

          <BrainDateTextControlled name="prazo" control={control} label="Prazo" required />

          {/* Upload de arquivo */}
          <div>
            <Typography variant="body2" sx={{ mb: 1, fontWeight: 500 }}>
              Arquivo (opcional)
            </Typography>
            <input
              ref={fileInputRef}
              type="file"
              style={{ display: "none" }}
              onChange={handleFileSelect}
              accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.jpg,.jpeg,.png"
            />
            <UploadArea hasFile={!!selectedFile} onClick={handleUploadAreaClick}>
              {selectedFile ? (
                <FilePreview>
                  <InsertDriveFileOutlinedIcon sx={{ fontSize: 20, color: "primary.main" }} />
                  <span>{selectedFile.name}</span>
                  <Typography variant="caption" color="text.secondary">
                    ({(selectedFile.size / 1024).toFixed(0)} KB)
                  </Typography>
                </FilePreview>
              ) : (
                <>
                  <CloudUploadIcon sx={{ fontSize: 32, color: "text.secondary" }} />
                  <UploadLabel>
                    Clique para selecionar um arquivo
                    <br />
                    PDF, Word, Excel, PowerPoint ou imagem
                  </UploadLabel>
                </>
              )}
            </UploadArea>
            {selectedFile && (
              <Button
                size="small"
                color="error"
                sx={{ mt: 0.5 }}
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedFile(null);
                  if (fileInputRef.current) fileInputRef.current.value = "";
                }}
              >
                Remover arquivo
              </Button>
            )}
          </div>
        </DialogContent>

        <DialogActions sx={{ px: 3, pb: 2, gap: 1 }}>
          <Button variant="outlined" onClick={handleClose} disabled={isSubmitting}>
            Cancelar
          </Button>
          <Button
            variant="contained"
            type="submit"
            disabled={isSubmitting}
            startIcon={isSubmitting ? <CircularProgress size={16} /> : undefined}
          >
            {isSubmitting ? "Criando..." : "Criar tarefa"}
          </Button>
        </DialogActions>
      </BrainFormProvider>
    </Dialog>
  );
}
