"use client";

import { Box, Link } from "@mui/material";
import InsertDriveFileOutlinedIcon from "@mui/icons-material/InsertDriveFileOutlined";
import { ArquivoDocumentoResponse } from "@/services/domains/documento";

/**
 * Links dos arquivos de um documento. As URLs são assinadas e expiram em
 * minutos — por isso abrem direto em nova aba, sem cache nem download prévio.
 */
export default function ArquivosDocumento({ arquivos }: { arquivos: ArquivoDocumentoResponse[] }) {
  if (arquivos.length === 0) return null;
  return (
    <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1.5 }}>
      {arquivos.map((arquivo, index) => (
        <Link
          key={arquivo.id}
          href={arquivo.downloadUrl}
          target="_blank"
          rel="noreferrer"
          variant="body2"
          sx={{ display: "inline-flex", alignItems: "center", gap: 0.5 }}
        >
          <InsertDriveFileOutlinedIcon sx={{ fontSize: 16 }} />
          {arquivo.nome || `Arquivo ${index + 1}`}
        </Link>
      ))}
    </Box>
  );
}
