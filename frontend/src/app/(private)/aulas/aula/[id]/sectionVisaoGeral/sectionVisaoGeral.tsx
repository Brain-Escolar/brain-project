"use client";

import { useChamadaDaAula } from "@/hooks/useChamada";
import { useAula } from "@/hooks/useAula";
import { useAnotacoesAula } from "@/hooks/useAnotacoesAula";
import { useTarefasAula } from "@/hooks/useTarefasAula";
import { useDiarioDaAula } from "@/hooks/useDiarioDaAula";
import {
  Box,
  Card,
  CardContent,
  Skeleton,
  Stack,
  Typography,
} from "@mui/material";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import { format, parseISO } from "date-fns";
import * as S from "../styles";

interface ISectionVisaoGeralProps {
  aulaId: string;
  data: string;
}

function SectionVisaoGeral({ aulaId, data }: ISectionVisaoGeralProps) {
  const { chamadas, carregando: carregandoChamada } = useChamadaDaAula(aulaId, data);
  const { alunos, loading: loadingAlunos } = useAula({ idAula: aulaId });
  const { anotacoes, loading: loadingAnotacoes } = useAnotacoesAula(aulaId, data);
  const { tarefas, loading: loadingTarefas } = useTarefasAula(aulaId, data);
  const { diario, carregando: carregandoDiario } = useDiarioDaAula(aulaId, data);

  const totalAlunos = alunos.length;
  const alunosPresentes = chamadas.filter((c) => c.presente).length;
  const chamadaFeita = chamadas.length > 0;

  return (
    <>
      <S.SidebarHeader>
        <h4>Visão Geral</h4>
      </S.SidebarHeader>

      <Stack spacing={0}>
        <S.ResumoItem>
          <span className="resumo-label">Alunos presentes</span>
          <span className="resumo-value">
            {carregandoChamada || loadingAlunos ? (
              <Skeleton variant="text" width={50} />
            ) : chamadaFeita ? (
              `${alunosPresentes} / ${totalAlunos}`
            ) : (
              `— / ${totalAlunos}`
            )}
          </span>
        </S.ResumoItem>

        <S.ResumoItem>
          <span className="resumo-label">Reg. disciplinares</span>
          <span className="resumo-value">
            {loadingAnotacoes ? (
              <Skeleton variant="text" width={30} />
            ) : (
              anotacoes.length
            )}
          </span>
        </S.ResumoItem>

        <S.ResumoItem>
          <span className="resumo-label">Tarefas criadas</span>
          <span className="resumo-value">
            {carregandoDiario ? (
              <Skeleton variant="text" width={30} />
            ) : (
              diario.tarefa !== null ? 1 : 0
            )}
          </span>
        </S.ResumoItem>

        <S.ResumoItem>
          <span className="resumo-label">Tarefas para hoje</span>
          <span className="resumo-value">
            {loadingTarefas ? (
              <Skeleton variant="text" width={30} />
            ) : (
              tarefas.length
            )}
          </span>
        </S.ResumoItem>
      </Stack>

      {(loadingTarefas || tarefas.length > 0) && (
        <>
          <S.SidebarHeader>
            <h4>Tarefas</h4>
          </S.SidebarHeader>

          <Stack spacing={2} sx={{ p: 2 }}>
            {loadingTarefas ? (
              <Skeleton variant="rounded" height={80} />
            ) : (
              tarefas.map((tarefa) => (
                <Card key={tarefa.id} variant="outlined" elevation={0}>
                  <CardContent sx={{ p: 1.5, "&:last-child": { pb: 1.5 } }}>
                    <Typography
                      variant="body2"
                      sx={{
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        display: "-webkit-box",
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: "vertical",
                        mb: 0.5,
                      }}
                    >
                      {tarefa.conteudo}
                    </Typography>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                      <AccessTimeIcon sx={{ fontSize: 13, color: "text.secondary" }} />
                      <Typography variant="caption" color="text.secondary">
                        Prazo: {format(parseISO(tarefa.prazo), "dd/MM/yyyy")}
                      </Typography>
                    </Box>
                  </CardContent>
                </Card>
              ))
            )}
          </Stack>
        </>
      )}
    </>
  );
}

export default SectionVisaoGeral;
