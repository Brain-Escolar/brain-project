import { useTarefas } from "@/hooks/useTarefas";
import { formatDateString } from "@/utils/utils";
import {
  Box,
  Card,
  CardContent,
  CardHeader,
  Stack,
  Typography,
} from "@mui/material";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import BrainResultNotFound from "@/components/resultNotFound/resultNotFound";
import { mockAulaDetail } from "../../../../../../mocks/aulaDetail";
import * as S from "../styles";

interface ISectionVisaoGeralProps {
  existeAulaNoDia: boolean;
}

function SectionVisaoGeral({ existeAulaNoDia }: ISectionVisaoGeralProps) {
  const { tarefas } = useTarefas();
  const aula = mockAulaDetail;

  return (
    <>
      <S.SidebarHeader>
        <h4>Visão Geral</h4>
      </S.SidebarHeader>

      {existeAulaNoDia ? (
        <>
          <Stack spacing={0}>
            <S.ResumoItem>
              <span className="resumo-label">Alunos presentes</span>
              <span className="resumo-value">
                {aula.alunosPresentes}/{aula.numeroEstudantes}
              </span>
            </S.ResumoItem>
            <S.ResumoItem>
              <span className="resumo-label">Novas Tarefas</span>
              <span className="resumo-value">{aula.novasTarefas}</span>
            </S.ResumoItem>
            <S.ResumoItem>
              <span className="resumo-label">Reg. disciplinares</span>
              <span className="resumo-value">{aula.registrosDisciplinares}</span>
            </S.ResumoItem>
            <S.ResumoItem>
              <span className="resumo-label">Tarefas para hoje</span>
              <span className="resumo-value">{tarefas.length}</span>
            </S.ResumoItem>
          </Stack>

          {tarefas.length > 0 && (
            <>
              <S.SidebarHeader>
                <h4>Tarefas</h4>
              </S.SidebarHeader>
              <Stack spacing={2} sx={{ p: 2 }}>
                {tarefas.map((tarefa, index) => (
                  <Card key={tarefa.id} variant="outlined" elevation={0}>
                    <CardHeader
                      title={`Tarefa ${index + 1}`}
                      titleTypographyProps={{ variant: "subtitle2", fontWeight: "bold" }}
                      sx={{ pb: 0 }}
                    />
                    <CardContent sx={{ pt: 1 }}>
                      <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          display: "-webkit-box",
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: "vertical",
                          mb: 1,
                        }}
                      >
                        It is a long established fact that a reader will be distracted by the
                        readable content of a page when...
                      </Typography>
                      <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                        <AccessTimeIcon sx={{ fontSize: 14, color: "text.secondary" }} />
                        <Typography variant="caption" color="text.secondary">
                          Envio: {formatDateString(tarefa.prazo)}
                        </Typography>
                      </Box>
                    </CardContent>
                  </Card>
                ))}
              </Stack>
            </>
          )}
        </>
      ) : (
        <Box sx={{ p: 2 }}>
          <BrainResultNotFound message="Nenhuma aula encontrada." />
        </Box>
      )}
    </>
  );
}

export default SectionVisaoGeral;
