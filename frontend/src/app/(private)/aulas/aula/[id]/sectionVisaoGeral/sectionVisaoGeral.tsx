import { useTarefas } from "@/hooks/useTarefas";
import { formatDateFromArray } from "@/utils/utils";
import { Box, Card, CardContent, Stack } from "@mui/material";
import Typography from "@mui/material/Typography";
import * as S from "./styles";
import BrainResultNotFound from "@/components/resultNotFound/resultNotFound";

interface ISectionVisaoGeralProps {
  existeAulaNoDia: boolean;
}

function SectionVisaoGeral({ existeAulaNoDia }: ISectionVisaoGeralProps) {
  const { tarefas } = useTarefas();

  return (
    <S.Container>
      <Typography variant="h6" gutterBottom>
        Visão geral
      </Typography>
      <Typography variant="body2" color="text.secondary" gutterBottom>
        Resumo da aula e suas entregas
      </Typography>
      {existeAulaNoDia ? (
        <>
          <Card sx={{ mt: 2 }}>
            <CardContent>
              <Stack spacing={2}>
                <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                  <Typography variant="body2" color="text.secondary">
                    Alunos presentes
                  </Typography>
                  <Typography variant="body2" fontWeight="bold">
                    -/-
                  </Typography>
                </Box>

                <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                  <Typography variant="body2" color="text.secondary">
                    Novas Tarefas
                  </Typography>
                  <Typography variant="body2" fontWeight="bold">
                    {tarefas.length}
                  </Typography>
                </Box>

                <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                  <Typography variant="body2" color="text.secondary">
                    Registros disciplinares
                  </Typography>
                  <Typography variant="body2" fontWeight="bold">
                    0
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
            </CardContent>
          </Card>

          {/* Cards de tarefas na lateral */}
          <Box sx={{ mt: 3 }}>
            {tarefas.map((tarefa, index) => (
              <Card key={tarefa.id} sx={{ mb: 2 }}>
                <CardContent sx={{ p: 2 }}>
                  <Typography variant="subtitle2" gutterBottom>
                    Tarefa {index + 1}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" paragraph>
                    It is a long established fact that a reader will be distracted by the readable
                    content of a page when...
                  </Typography>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <Typography variant="caption" color="text.secondary">
                      🕒 Envio: {formatDateFromArray(tarefa.prazo)}
                    </Typography>
                  </Box>
                </CardContent>
              </Card>
            ))}
          </Box>
        </>
      ) : (
        <>
          <BrainResultNotFound message="Não foi encontrada nenhuma aula para a data selecionada." />
        </>
      )}
    </S.Container>
  );
}

export default SectionVisaoGeral;
