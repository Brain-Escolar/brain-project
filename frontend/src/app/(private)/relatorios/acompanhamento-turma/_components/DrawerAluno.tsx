"use client";

import { useRouter } from "next/navigation";
import CloseIcon from "@mui/icons-material/Close";
import FolderSharedOutlinedIcon from "@mui/icons-material/FolderSharedOutlined";
import { Alert, Button, Drawer, IconButton } from "@mui/material";
import { RoutesEnum } from "@/enums";
import {
  AlunoAcompanhamentoResponse,
  AnotacaoAcompanhamentoResponse,
  CriteriosAtencaoResponse,
} from "@/services/domains/diretor";
import { formatarDecimal, formatarPercentual } from "@/utils/formatoNumero";
import * as S from "../styles";
import { capitalizar, diaMes, iniciais, plural, tomNota } from "./apresentacao";

interface DrawerAlunoProps {
  aluno: AlunoAcompanhamentoResponse | null;
  anotacoes: AnotacaoAcompanhamentoResponse[];
  criterios: CriteriosAtencaoResponse;
  turma: string;
  periodo: string;
  onFechar: () => void;
}

/** Leitura completa de um aluno no recorte de período — sempre todas as disciplinas. */
export default function DrawerAluno({
  aluno,
  anotacoes,
  criterios,
  turma,
  periodo,
  onFechar,
}: DrawerAlunoProps) {
  const router = useRouter();
  const limiteAtrasos = criterios.atrasosPorPeriodo * criterios.periodosConsiderados;
  const doAluno = aluno ? anotacoes.filter((a) => a.alunoId === aluno.id) : [];

  return (
    <Drawer
      anchor="right"
      open={!!aluno}
      onClose={onFechar}
      slotProps={{ paper: { sx: { width: "min(480px, 100vw)" } } }}
    >
      {aluno && (
        <S.DrawerCorpo>
          <S.DrawerTopo>
            <S.Iniciais $grande>{iniciais(aluno.nome)}</S.Iniciais>
            <div style={{ flex: 1, minWidth: 0 }}>
              <strong>{aluno.nome}</strong>
              <small>{[aluno.matricula, turma, periodo].filter(Boolean).join(" · ")}</small>
            </div>
            <IconButton aria-label="Fechar" onClick={onFechar}>
              <CloseIcon />
            </IconButton>
          </S.DrawerTopo>

          <S.DrawerConteudo>
            {aluno.motivosAtencao.length > 0 && (
              <Alert severity="warning" title="Em atenção">
                <strong>Em atenção.</strong> {capitalizar(aluno.motivosAtencao.join(" · "))}.
              </Alert>
            )}

            <S.MiniStats>
              <S.MiniStat
                $tom={
                  tomNota(aluno.geral.media, criterios.mediaMinima) === "error"
                    ? "error"
                    : undefined
                }
              >
                <span>Média</span>
                <strong>{formatarDecimal(aluno.geral.media)}</strong>
              </S.MiniStat>
              <S.MiniStat
                $tom={
                  aluno.geral.frequencia != null &&
                  aluno.geral.frequencia < criterios.frequenciaMinima
                    ? "error"
                    : undefined
                }
              >
                <span>Freq.</span>
                <strong>{formatarPercentual(aluno.geral.frequencia, 0)}</strong>
              </S.MiniStat>
              <S.MiniStat>
                <span>Faltas</span>
                <strong>{aluno.geral.faltas}</strong>
              </S.MiniStat>
              <S.MiniStat $tom={aluno.atrasos >= limiteAtrasos ? "warning" : undefined}>
                <span>Atrasos</span>
                <strong>{aluno.atrasos}</strong>
              </S.MiniStat>
            </S.MiniStats>

            <S.Bloco>
              <S.BlocoTitulo>Notas e faltas por disciplina</S.BlocoTitulo>
              <S.ListaDisciplinas>
                {aluno.disciplinas.map((d) => (
                  <S.LinhaDisciplina key={d.disciplinaId}>
                    <span>{d.nome}</span>
                    <S.NotaPill $tom={tomNota(d.media, criterios.mediaMinima)}>
                      {formatarDecimal(d.media)}
                    </S.NotaPill>
                    <small>{plural(d.faltas, "falta", "faltas")}</small>
                  </S.LinhaDisciplina>
                ))}
              </S.ListaDisciplinas>
            </S.Bloco>

            <S.Bloco>
              <S.BlocoTitulo>
                Atrasos <span>· {plural(aluno.atrasos, "registro", "registros")}</span>
              </S.BlocoTitulo>
              {aluno.datasAtrasos.length ? (
                <S.Datas>
                  {aluno.datasAtrasos.map((data, i) => (
                    <span key={`${data}-${i}`}>{diaMes(data)}</span>
                  ))}
                </S.Datas>
              ) : (
                <S.TextoSuave>Nenhum atraso no período.</S.TextoSuave>
              )}
            </S.Bloco>

            <S.Bloco>
              <S.BlocoTitulo>
                Anotações <span>· {doAluno.length}</span>
              </S.BlocoTitulo>
              {doAluno.length ? (
                doAluno.map((n) => (
                  <S.CartaoAnotacao key={n.id}>
                    <div>
                      <S.Selo $tom="warning">{n.tipoDescricao}</S.Selo>
                      <span>{diaMes(n.data)}</span>
                      <span>{[n.professor, n.disciplina].filter(Boolean).join(" · ")}</span>
                    </div>
                    {n.observacao && <S.AnotacaoTexto>{n.observacao}</S.AnotacaoTexto>}
                  </S.CartaoAnotacao>
                ))
              ) : (
                <S.TextoSuave>Nenhuma anotação no período.</S.TextoSuave>
              )}
            </S.Bloco>
          </S.DrawerConteudo>

          <S.DrawerRodape>
            <Button
              variant="contained"
              startIcon={<FolderSharedOutlinedIcon />}
              onClick={() => router.push(`${RoutesEnum.ALUNO_DETALHE}/${aluno.id}`)}
            >
              Ver prontuário
            </Button>
          </S.DrawerRodape>
        </S.DrawerCorpo>
      )}
    </Drawer>
  );
}
