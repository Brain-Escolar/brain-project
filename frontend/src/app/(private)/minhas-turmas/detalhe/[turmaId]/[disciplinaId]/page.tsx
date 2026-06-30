"use client";

import LoadingComponent from "@/components/loadingComponent/loadingComponent";
import PageScaffold from "@/components/pageScaffold/PageScaffold";
import { RoutesEnum } from "@/enums";
import { useTurmaProfessorDetalhe } from "@/hooks/useTurmaProfessorDetalhe";
import { AlunoTurmaProfessorResponse } from "@/services/domains/professor/response";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import EventAvailableIcon from "@mui/icons-material/EventAvailable";
import GradeIcon from "@mui/icons-material/Grade";
import GroupIcon from "@mui/icons-material/Group";
import PersonIcon from "@mui/icons-material/Person";
import SearchIcon from "@mui/icons-material/Search";
import {
  Avatar,
  Badge,
  Box,
  Button,
  Chip,
  Collapse,
  InputAdornment,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from "@mui/material";
import { useParams, useRouter } from "next/navigation";
import { Fragment, useMemo, useState } from "react";
import * as S from "./styles";

function formatMedia(media: number | null): string {
  return media == null ? "—" : media.toFixed(1).replace(".", ",");
}

function formatData(data: string): string {
  try {
    return new Date(data).toLocaleDateString("pt-BR");
  } catch {
    return data;
  }
}

function StudentDetailPanel({ aluno }: { aluno: AlunoTurmaProfessorResponse }) {
  const router = useRouter();
  return (
    <S.DetailGrid>
      <Box>
        <S.BlockTitle>Notas lançadas</S.BlockTitle>
        {aluno.notas.length === 0 ? (
          <Typography variant="body2" color="text.secondary">
            Nenhuma nota lançada nesta disciplina.
          </Typography>
        ) : (
          <S.NotasList>
            {aluno.notas.map((nota, idx) => (
              <S.NotaRow key={idx}>
                <span>
                  {nota.nomeAvaliacao} · {formatData(nota.dataAplicacao)}
                </span>
                <strong>{nota.pontuacao}</strong>
              </S.NotaRow>
            ))}
          </S.NotasList>
        )}
      </Box>

      <Box>
        <S.BlockTitle>Anotações recentes</S.BlockTitle>
        {aluno.anotacoes.length === 0 ? (
          <Typography variant="body2" color="text.secondary">
            Nenhuma anotação registrada nesta disciplina.
          </Typography>
        ) : (
          aluno.anotacoes.map((anotacao, idx) => (
            <S.AnotacaoRow key={idx}>
              <S.AnotacaoDate>{formatData(anotacao.data)}</S.AnotacaoDate>
              <Box>
                <Chip label={anotacao.tipoAnotacao} size="small" />
                <S.AnotacaoBody>{anotacao.observacao}</S.AnotacaoBody>
              </Box>
            </S.AnotacaoRow>
          ))
        )}
      </Box>

      <S.DetailActions>
        <Button
          variant="outlined"
          size="small"
          startIcon={<PersonIcon />}
          onClick={() => router.push(`${RoutesEnum.ALUNO_DETALHE}/${aluno.id}`)}
        >
          Ver perfil completo
        </Button>
      </S.DetailActions>
    </S.DetailGrid>
  );
}

export default function MinhasTurmasDetalhePage() {
  const params = useParams();
  const router = useRouter();
  const turmaId = params.turmaId as string;
  const disciplinaId = params.disciplinaId as string;

  const { turma, loading } = useTurmaProfessorDetalhe(turmaId, disciplinaId);
  const [busca, setBusca] = useState("");
  const [expandido, setExpandido] = useState<number | null>(null);

  const alunosFiltrados = useMemo(() => {
    if (!turma) return [];
    const termo = busca.toLowerCase();
    return turma.alunos.filter((a) => a.nome.toLowerCase().includes(termo));
  }, [turma, busca]);

  if (loading) {
    return (
      <PageScaffold>
        <LoadingComponent />
      </PageScaffold>
    );
  }

  if (!turma) {
    return null;
  }

  return (
    <PageScaffold>
      <S.BackLink onClick={() => router.push(RoutesEnum.MINHAS_TURMAS)}>
        <ArrowBackIcon fontSize="small" />
        Minhas turmas
      </S.BackLink>

      <Box sx={{ mb: 2 }}>
        <Typography variant="h5" fontWeight={700}>
          {turma.nomeDisciplina} — {turma.serieNome} {turma.nomeTurma}
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
          Resumo de desempenho, frequência e anotações de cada aluno nesta disciplina.
        </Typography>
      </Box>

      <S.KpisRow>
        <S.KpiCard>
          <S.KpiTop>
            <S.KpiLabel>Alunos</S.KpiLabel>
            <S.KpiIcon $tone="primary">
              <GroupIcon fontSize="small" />
            </S.KpiIcon>
          </S.KpiTop>
          <S.KpiValue>{turma.totalAlunos}</S.KpiValue>
        </S.KpiCard>
        <S.KpiCard>
          <S.KpiTop>
            <S.KpiLabel>Média da turma</S.KpiLabel>
            <S.KpiIcon $tone="info">
              <GradeIcon fontSize="small" />
            </S.KpiIcon>
          </S.KpiTop>
          <S.KpiValue>{formatMedia(turma.mediaTurma)}</S.KpiValue>
        </S.KpiCard>
        <S.KpiCard>
          <S.KpiTop>
            <S.KpiLabel>Frequência média</S.KpiLabel>
            <S.KpiIcon $tone="success">
              <EventAvailableIcon fontSize="small" />
            </S.KpiIcon>
          </S.KpiTop>
          <S.KpiValue>{turma.frequenciaTurma == null ? "—" : `${turma.frequenciaTurma}%`}</S.KpiValue>
        </S.KpiCard>
      </S.KpisRow>

      <S.Toolbar>
        <TextField
          size="small"
          placeholder="Buscar aluno..."
          value={busca}
          onChange={(e) => setBusca(e.target.value)}
          sx={{ minWidth: 240, maxWidth: 360 }}
          slotProps={{
            input: {
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon fontSize="small" />
                </InputAdornment>
              ),
            },
          }}
        />
      </S.Toolbar>

      <S.TableCard>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Aluno</TableCell>
              <TableCell align="center">Média</TableCell>
              <TableCell align="center">Frequência</TableCell>
              <TableCell align="center">Faltas</TableCell>
              <TableCell align="center">Anotações</TableCell>
              <TableCell align="center" />
            </TableRow>
          </TableHead>
          <TableBody>
            {alunosFiltrados.map((aluno) => {
              const isOpen = expandido === aluno.id;
              return (
                <Fragment key={aluno.id}>
                  <TableRow
                    hover
                    onClick={() => setExpandido(isOpen ? null : aluno.id)}
                    sx={{ cursor: "pointer", backgroundColor: isOpen ? "action.selected" : undefined }}
                  >
                    <TableCell>
                      <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                        <Avatar sx={{ width: 32, height: 32, fontSize: 14 }}>
                          {aluno.nome.charAt(0).toUpperCase()}
                        </Avatar>
                        <Box>
                          <S.StudentName>{aluno.nome}</S.StudentName>
                          <S.StudentId>{aluno.matricula}</S.StudentId>
                        </Box>
                      </Box>
                    </TableCell>
                    <TableCell align="center">
                      <S.NumValue $bad={aluno.media != null && aluno.media < 6}>
                        {formatMedia(aluno.media)}
                      </S.NumValue>
                    </TableCell>
                    <TableCell align="center">
                      <S.NumValue $bad={aluno.frequencia != null && aluno.frequencia < 75}>
                        {aluno.frequencia == null ? "—" : `${aluno.frequencia}%`}
                      </S.NumValue>
                    </TableCell>
                    <TableCell align="center">
                      <S.NumValue $bad={aluno.faltas >= 8}>{aluno.faltas}</S.NumValue>
                    </TableCell>
                    <TableCell align="center">
                      {aluno.anotacoes.length > 0 ? (
                        <Badge badgeContent={aluno.anotacoes.length} color="default" />
                      ) : (
                        "—"
                      )}
                    </TableCell>
                    <TableCell align="center">
                      <ChevronRightIcon
                        fontSize="small"
                        sx={{ transform: isOpen ? "rotate(90deg)" : "none", transition: "transform 0.14s" }}
                      />
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell colSpan={6} sx={{ p: 0, border: isOpen ? undefined : "none" }}>
                      <Collapse in={isOpen} timeout="auto" unmountOnExit>
                        <StudentDetailPanel aluno={aluno} />
                      </Collapse>
                    </TableCell>
                  </TableRow>
                </Fragment>
              );
            })}
          </TableBody>
        </Table>
        {alunosFiltrados.length === 0 && (
          <Box sx={{ p: 5, textAlign: "center" }}>
            <Typography variant="body2" color="text.secondary">
              Nenhum aluno encontrado.
            </Typography>
          </Box>
        )}
      </S.TableCard>
    </PageScaffold>
  );
}
