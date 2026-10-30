"use client";

import { Button } from "@mui/material";
import MenuBookOutlinedIcon from "@mui/icons-material/MenuBookOutlined";
import EventAvailableOutlinedIcon from "@mui/icons-material/EventAvailableOutlined";
import GradeOutlinedIcon from "@mui/icons-material/GradeOutlined";
import HistoryOutlinedIcon from "@mui/icons-material/HistoryOutlined";
import PendingActionsOutlinedIcon from "@mui/icons-material/PendingActionsOutlined";
import NotificationsNoneOutlinedIcon from "@mui/icons-material/NotificationsNoneOutlined";
import GroupsOutlinedIcon from "@mui/icons-material/GroupsOutlined";
import { AcompanhamentoProfessorResponse } from "@/services/domains/diretor";
import { formatarDecimal, formatarPercentual } from "@/utils/formatoNumero";
import * as S from "../styles";
import {
  dataHora,
  dataCompleta,
  diaMes,
  plural,
  tomProgresso,
  turmaEDisciplina,
} from "./apresentacao";

/** Quantas aulas sem registro listar antes de resumir em "e mais N". */
const MAX_AULAS_LISTADAS = 8;

interface AbaVisaoGeralProps {
  dados: AcompanhamentoProfessorResponse;
  onLembrar?: () => void;
  lembrando: boolean;
}

export default function AbaVisaoGeral({ dados, onLembrar, lembrando }: AbaVisaoGeralProps) {
  const { resumo, periodo } = dados;
  const atrasadas = dados.avaliacoes.filter((a) => a.situacao === "ATRASADA");
  const temPendencia = dados.aulasPendentes.length > 0 || atrasadas.length > 0;
  const [dataUltimo, horaUltimo] = resumo.ultimoRegistro ? dataHora(resumo.ultimoRegistro).split(" às ") : [];

  return (
    <>
      <S.MiniGrid>
        <S.Mini $tom={resumo.aulasPrevistas ? tomProgresso(resumo.aulasRegistradas, resumo.aulasPrevistas) : undefined}>
          <span>
            <MenuBookOutlinedIcon />
            Aulas registradas
          </span>
          <strong>
            {resumo.aulasRegistradas}/{resumo.aulasPrevistas}
          </strong>
          <small>{periodo.nome} até hoje</small>
        </S.Mini>
        <S.Mini>
          <span>
            <EventAvailableOutlinedIcon />
            Frequência das turmas
          </span>
          <strong>{formatarPercentual(resumo.frequencia)}</strong>
          <small>Nas chamadas registradas</small>
        </S.Mini>
        <S.Mini $tom={resumo.avaliacoesPendentes ? "error" : undefined}>
          <span>
            <GradeOutlinedIcon />
            Notas lançadas
          </span>
          <strong>
            {resumo.avaliacoesLancadas}/{resumo.avaliacoesAplicadas}
          </strong>
          <small>
            {resumo.avaliacoesPendentes
              ? `${plural(resumo.avaliacoesPendentes, "avaliação", "avaliações")} em atraso`
              : "Avaliações já aplicadas"}
          </small>
        </S.Mini>
        <S.Mini>
          <span>
            <HistoryOutlinedIcon />
            Último registro
          </span>
          <strong>{dataUltimo ?? "—"}</strong>
          <small>{horaUltimo ? `às ${horaUltimo}` : "Nenhum lançamento no diário"}</small>
        </S.Mini>
      </S.MiniGrid>

      {temPendencia && (
        <S.Aviso>
          <S.AvisoTopo>
            <PendingActionsOutlinedIcon />
            <strong>
              {[
                dados.aulasPendentes.length
                  ? plural(dados.aulasPendentes.length, "aula sem registro", "aulas sem registro")
                  : null,
                atrasadas.length
                  ? plural(atrasadas.length, "avaliação com notas em atraso", "avaliações com notas em atraso")
                  : null,
              ]
                .filter(Boolean)
                .join(" e ")}
            </strong>
            {onLembrar && (
              <Button
                size="small"
                variant="outlined"
                color="inherit"
                startIcon={<NotificationsNoneOutlinedIcon />}
                onClick={onLembrar}
                disabled={lembrando}
                sx={{ bgcolor: "var(--colors-backgroundSection)" }}
              >
                Enviar lembrete
              </Button>
            )}
          </S.AvisoTopo>
          <S.AvisoLista>
            {dados.aulasPendentes.slice(0, MAX_AULAS_LISTADAS).map((a, i) => (
              <li key={i}>
                Diário de {diaMes(a.data)}
                {a.horario ? `, ${a.horario.slice(0, 5)}` : ""} — {turmaEDisciplina(a.turma, a.serie, a.disciplina)}
              </li>
            ))}
            {dados.aulasPendentes.length > MAX_AULAS_LISTADAS && (
              <li>e mais {dados.aulasPendentes.length - MAX_AULAS_LISTADAS} aulas — veja na aba Diário de classe</li>
            )}
            {atrasadas.map((a) => (
              <li key={a.id}>
                Notas de “{a.nome}” — {turmaEDisciplina(a.turma, a.serie)}: {a.lancadas}/{a.alunos} lançadas, prazo{" "}
                {dataCompleta(a.prazo)}
              </li>
            ))}
          </S.AvisoLista>
        </S.Aviso>
      )}

      <S.SecaoTitulo>
        <GroupsOutlinedIcon />
        Turmas
        <small>{periodo.nome}</small>
      </S.SecaoTitulo>
      <S.TabelaWrap>
        <S.Rolagem>
          <S.Tabela>
            <thead>
              <tr>
                <th>Turma</th>
                <th>Disciplina</th>
                <th style={{ textAlign: "right" }}>Alunos</th>
                <th>Aulas registradas</th>
                <th style={{ textAlign: "right" }}>Frequência</th>
                <th style={{ textAlign: "right" }}>Média</th>
                <th>Notas lançadas</th>
              </tr>
            </thead>
            <tbody>
              {dados.turmas.map((t) => (
                <tr key={`${t.turmaId}-${t.disciplinaId}`}>
                  <td style={{ fontWeight: 600 }}>{turmaEDisciplina(t.turma, t.serie)}</td>
                  <td>{t.disciplina}</td>
                  <S.Num $direita>{t.alunos}</S.Num>
                  <S.Num>
                    {t.aulasPrevistas ? `${t.aulasRegistradas}/${t.aulasPrevistas}` : "—"}
                  </S.Num>
                  <S.Num $direita $suave={t.frequencia == null}>
                    {formatarPercentual(t.frequencia)}
                  </S.Num>
                  <S.Num $direita $suave={t.media == null}>
                    {t.media != null ? (
                      <S.Selo $tom={t.media < dados.mediaMinima ? "error" : "success"}>
                        {formatarDecimal(t.media)}
                      </S.Selo>
                    ) : (
                      "—"
                    )}
                  </S.Num>
                  <td>
                    {t.avaliacoes ? (
                      <S.Selo $tom={t.avaliacoesLancadas === t.avaliacoes ? "success" : "warning"}>
                        {t.avaliacoesLancadas} de {t.avaliacoes}
                      </S.Selo>
                    ) : (
                      <S.TextoSuave>Nenhuma avaliação</S.TextoSuave>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </S.Tabela>
        </S.Rolagem>
        {dados.turmas.length === 0 && (
          <S.Vazio>
            <strong>Sem aulas na grade</strong>
            <span>Este professor não tem aulas na grade horária do ano letivo.</span>
          </S.Vazio>
        )}
        <S.Rodape>
          <span>Aulas e frequência de {diaMes(periodo.inicio)} até hoje</span>
          <span>Média das avaliações regulares lançadas (sem recuperação)</span>
        </S.Rodape>
      </S.TabelaWrap>
    </>
  );
}
