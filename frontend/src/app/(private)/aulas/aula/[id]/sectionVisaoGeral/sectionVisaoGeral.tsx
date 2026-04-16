import { useTarefas } from "@/hooks/useTarefas";
import { formatDateFromArray } from "@/utils/utils";
import {
  Box,
  Card,
  CardContent,
  CardHeader,
  Paper,
  Stack,
  Typography,
} from "@mui/material";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import BrainResultNotFound from "@/components/resultNotFound/resultNotFound";
import { mockAulaDetail } from "../../../../../../mocks/aulaDetail";

interface ISectionVisaoGeralProps {
  existeAulaNoDia: boolean;
}

function SectionVisaoGeral({ existeAulaNoDia }: ISectionVisaoGeralProps) {
  const { tarefas } = useTarefas();
  const aula = mockAulaDetail;

  return (
    <Paper variant="outlined" sx={{ p: 3 }}>
      <Typography variant="h6" gutterBottom>
        Visao geral
      </Typography>
      <Typography variant="body2" color="text.secondary" gutterBottom>
        Resumo da aula e suas entregas
      </Typography>

      {existeAulaNoDia ? (
        <>
          {/* Resumo */}
          <Stack spacing={1} sx={{ mt: 3 }}>
            <Box sx={{ display: "flex", justifyContent: "space-between" }}>
              <Typography variant="body2" color="text.secondary">
                Alunos presentes
              </Typography>
              <Typography variant="body2" fontWeight="bold">
                {aula.alunosPresentes}/{aula.numeroEstudantes}
              </Typography>
            </Box>

            <Box sx={{ display: "flex", justifyContent: "space-between" }}>
              <Typography variant="body2" color="text.secondary">
                Novas Tarefas
              </Typography>
              <Typography variant="body2" fontWeight="bold">
                {aula.novasTarefas}
              </Typography>
            </Box>

            <Box sx={{ display: "flex", justifyContent: "space-between" }}>
              <Typography variant="body2" color="text.secondary">
                Registros disciplinares
              </Typography>
              <Typography variant="body2" fontWeight="bold">
                {aula.registrosDisciplinares}
              </Typography>
            </Box>

            <Box sx={{ display: "flex", justifyContent: "space-between" }}>
              <Typography variant="body2" color="text.secondary">
                Tarefas para hoje
              </Typography>
              <Typography variant="body2" fontWeight="bold">
                {tarefas.length}
              </Typography>
            </Box>
          </Stack>

          {/* Cards de tarefas */}
          <Stack spacing={2} sx={{ mt: 4 }}>
            {tarefas.map((tarefa, index) => (
              <Card key={tarefa.id} variant="outlined" elevation={1}>
                <CardHeader
                  title={`Tarefa ${index + 1}`}
                  titleTypographyProps={{ variant: "subtitle1", fontWeight: "bold" }}
                  sx={{ pb: 0 }}
                />
                <CardContent>
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      display: "-webkit-box",
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: "vertical",
                      mb: 2,
                    }}
                  >
                    It is a long established fact that a reader will be distracted by the readable
                    content of a page when...
                  </Typography>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                    <AccessTimeIcon sx={{ fontSize: 16, color: "text.secondary" }} />
                    <Typography variant="caption" color="text.secondary">
                      Envio: {formatDateFromArray(tarefa.prazo)}
                    </Typography>
                  </Box>
                </CardContent>
              </Card>
            ))}
          </Stack>
        </>
      ) : (
        <BrainResultNotFound message="Nao foi encontrada nenhuma aula para a data selecionada." />
      )}
    </Paper>
  );
}

export default SectionVisaoGeral;
