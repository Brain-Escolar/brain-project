import { TarefaAulaResponse } from "@/services/domains/aula/response";
import { Box, Divider, Paper, Typography } from "@mui/material";
import ArticleOutlinedIcon from "@mui/icons-material/ArticleOutlined";
import CalendarTodayOutlinedIcon from "@mui/icons-material/CalendarTodayOutlined";

interface TarefaCardProps {
  tarefa: TarefaAulaResponse;
}

function formatPrazo(prazo: string): string {
  if (!prazo) return "";
  const [year, month, day] = prazo.split("-");
  return `${day}/${month}/${String(year).slice(-2)}`;
}

function getFilename(url?: string): string {
  if (!url) return "documento.pdf";
  const parts = url.split("/");
  return parts[parts.length - 1] || "documento.pdf";
}

export default function TarefaCard({ tarefa }: TarefaCardProps) {
  return (
    <Paper
      variant="outlined"
      sx={{
        borderRadius: 2,
        borderColor: "grey.200",
        overflow: "hidden",
      }}
    >
      {/* Title */}
      <Box sx={{ px: 2.5, pt: 2, pb: tarefa.documentoUrl ? 1.5 : 2 }}>
        <Typography variant="subtitle1" fontWeight={600}>
          {tarefa.conteudo}
        </Typography>
      </Box>

      {/* File row */}
      {tarefa.documentoUrl && (
        <>
          <Divider />
          <Box
            sx={{
              px: 2.5,
              py: 1.5,
              display: "flex",
              alignItems: "center",
              gap: 1.5,
              bgcolor: "grey.50",
            }}
          >
            <ArticleOutlinedIcon fontSize="small" color="primary" />
            <Box>
              <Typography variant="body2" fontWeight={500} lineHeight={1.3}>
                {getFilename(tarefa.documentoUrl)}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                • Completo
              </Typography>
            </Box>
          </Box>
          <Divider />
        </>
      )}

      {/* Description + prazo */}
      <Box sx={{ px: 2.5, pt: 1.5, pb: 2 }}>
        {tarefa.conteudo && (
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{
              mb: 1.5,
              display: "-webkit-box",
              WebkitLineClamp: 3,
              WebkitBoxOrient: "vertical",
              overflow: "hidden",
            }}
          >
            {tarefa.conteudo}
          </Typography>
        )}

        <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
          <CalendarTodayOutlinedIcon sx={{ fontSize: 14 }} color="action" />
          <Typography variant="caption" color="text.secondary">
            Prazo: {formatPrazo(tarefa.prazo)}
          </Typography>
        </Box>
      </Box>
    </Paper>
  );
}
