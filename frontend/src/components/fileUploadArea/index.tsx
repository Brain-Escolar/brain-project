"use client";

import CloseIcon from "@mui/icons-material/Close";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import InsertDriveFileOutlinedIcon from "@mui/icons-material/InsertDriveFileOutlined";
import { IconButton, Typography } from "@mui/material";
import { useRef } from "react";
import * as S from "./styles";

interface FileUploadAreaProps {
  files: File[];
  onChange: (files: File[]) => void;
  multiple?: boolean;
  accept?: string;
  label?: string;
}

function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}

export default function FileUploadArea({
  files,
  onChange,
  multiple = true,
  accept = ".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.jpg,.jpeg,.png",
  label = "Clique para selecionar um arquivo",
}: FileUploadAreaProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  function handleSelect(selected: FileList | null) {
    if (!selected || selected.length === 0) return;
    const novos = Array.from(selected);
    onChange(multiple ? [...files, ...novos] : novos);
  }

  function handleRemove(index: number) {
    onChange(files.filter((_, i) => i !== index));
  }

  return (
    <div>
      <input
        ref={inputRef}
        type="file"
        multiple={multiple}
        style={{ display: "none" }}
        onChange={(e) => {
          handleSelect(e.target.files);
          e.target.value = "";
        }}
        accept={accept}
      />
      <S.UploadArea $hasFile={files.length > 0} onClick={() => inputRef.current?.click()}>
        <CloudUploadIcon sx={{ fontSize: 32, color: "text.secondary" }} />
        <S.UploadLabel>{label}</S.UploadLabel>
      </S.UploadArea>

      {files.length > 0 && (
        <S.FileList>
          {files.map((file, index) => (
            <S.FileItem key={`${file.name}-${index}`}>
              <InsertDriveFileOutlinedIcon sx={{ fontSize: 18, color: "primary.main" }} />
              <S.FileName>{file.name}</S.FileName>
              <Typography variant="caption" color="text.secondary">
                {formatSize(file.size)}
              </Typography>
              <IconButton
                size="small"
                aria-label="Remover anexo"
                onClick={(e) => {
                  e.stopPropagation();
                  handleRemove(index);
                }}
              >
                <CloseIcon sx={{ fontSize: 16 }} />
              </IconButton>
            </S.FileItem>
          ))}
        </S.FileList>
      )}
    </div>
  );
}
