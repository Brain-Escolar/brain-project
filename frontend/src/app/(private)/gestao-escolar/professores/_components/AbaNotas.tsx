"use client";

import { AvaliacaoProfessorResponse, PeriodoProfessoresResponse } from "@/services/domains/diretor";
import { formatarDecimal } from "@/utils/formatoNumero";
import * as S from "../styles";
import { SITUACAO_AVALIACAO, dataCompleta, plural, turmaEDisciplina } from "./apresentacao";

interface AbaNotasProps {
  avaliacoes: AvaliacaoProfessorResponse[];
  periodo: PeriodoProfessoresResponse;
  mediaMinima: number;
}

/** Avaliações do professor no período, com o andamento do lançamento de notas. */
export default function AbaNotas({ avaliacoes, periodo, mediaMinima }: AbaNotasProps) {
  const lancadas = avaliacoes.filter((a) => a.situacao === "LANCADA").length;

  return (
    <S.TabelaWrap>
      <S.Rolagem>
        <S.Tabela>
          <thead>
            <tr>
              <th>Turma</th>
              <th>Avaliação</th>
              <th>Aplicação</th>
              <th>Prazo das notas</th>
              <th>Notas lançadas</th>
              <th style={{ textAlign: "right" }}>Média</th>
              <th>Situação</th>
            </tr>
          </thead>
          <tbody>
            {avaliacoes.map((a) => {
              const situ = SITUACAO_AVALIACAO[a.situacao];
              return (
                <tr key={a.id}>
                  <td style={{ fontWeight: 600 }}>{turmaEDisciplina(a.turma, a.serie)}</td>
                  <td>
                    {a.nome}
                    {a.disciplina && <S.TextoSuave> · {a.disciplina}</S.TextoSuave>}
                  </td>
                  <S.Num>{dataCompleta(a.dataAplicacao)}</S.Num>
                  <S.Num>{dataCompleta(a.prazo)}</S.Num>
                  <S.Num>
                    {a.lancadas}/{a.alunos}
                  </S.Num>
                  <S.Num $direita $suave={a.media == null}>
                    {a.media != null ? (
                      <S.Selo $tom={a.media < mediaMinima ? "error" : "success"}>{formatarDecimal(a.media)}</S.Selo>
                    ) : (
                      "—"
                    )}
                  </S.Num>
                  <td>
                    <S.Selo $tom={situ.tom}>{situ.rotulo}</S.Selo>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </S.Tabela>
      </S.Rolagem>
      {avaliacoes.length === 0 && (
        <S.Vazio>
          <strong>Nenhuma avaliação no período</strong>
          <span>O professor não tem avaliações com aplicação no {periodo.nome.toLowerCase()}.</span>
        </S.Vazio>
      )}
      <S.Rodape>
        <span>
          {lancadas} de {plural(avaliacoes.length, "avaliação lançada", "avaliações lançadas")} · {periodo.nome}
        </span>
        <span>Sem prazo cadastrado, vale o fim do período ({dataCompleta(periodo.fim)})</span>
      </S.Rodape>
    </S.TabelaWrap>
  );
}
