"use client";

import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import {
  CriteriosAtencaoResponse,
  DisciplinaAcompanhamentoResponse,
} from "@/services/domains/diretor";
import { formatarDecimal, formatarPercentual } from "@/utils/formatoNumero";
import * as S from "../styles";
import { tomFrequencia, tomNota } from "./apresentacao";

interface TabelaDisciplinasProps {
  disciplinas: DisciplinaAcompanhamentoResponse[];
  criterios: CriteriosAtencaoResponse;
  onVer: (disciplinaId: number) => void;
  criterio: string;
}

/** A partir de 30% da turma abaixo da média é crítico; de 15%, alerta. */
function tomProporcao(pct: number): S.Tom {
  if (pct >= 30) return "error";
  if (pct >= 15) return "warning";
  return "success";
}

export default function TabelaDisciplinas({
  disciplinas,
  criterios,
  onVer,
  criterio,
}: TabelaDisciplinasProps) {
  return (
    <S.TabelaWrap>
      <S.Rolagem>
        <S.Tabela style={{ minWidth: 820 }}>
          <thead>
            <tr>
              <th>Disciplina</th>
              <th>Professor(a)</th>
              <th>Média</th>
              <th style={{ width: 220 }}>Alunos abaixo da média</th>
              <th style={{ textAlign: "right" }}>Faltas</th>
              <th style={{ textAlign: "right" }}>Freq.</th>
              <th style={{ textAlign: "right" }}>Anotações</th>
              <th style={{ width: 40 }} data-noprint />
            </tr>
          </thead>
          <tbody>
            {disciplinas.map((d) => {
              const pct = d.alunosComNota
                ? Math.round((d.alunosAbaixo / d.alunosComNota) * 100)
                : 0;
              return (
                <tr key={d.id} onClick={() => onVer(d.id)}>
                  <td style={{ fontWeight: 600 }}>{d.nome}</td>
                  <S.Num $tom={d.professor ? undefined : "neutral"}>
                    {d.professor ?? "Sem professor na grade"}
                  </S.Num>
                  <td>
                    <S.NotaPill $tom={tomNota(d.media, criterios.mediaMinima)}>
                      {formatarDecimal(d.media)}
                    </S.NotaPill>
                  </td>
                  <td>
                    {d.alunosComNota ? (
                      <S.BarraProgresso>
                        <span>
                          {d.alunosAbaixo} de {d.alunosComNota} ({pct}%)
                        </span>
                        <S.Trilho>
                          <S.Preenchido $pct={pct} $tom={tomProporcao(pct)} />
                        </S.Trilho>
                      </S.BarraProgresso>
                    ) : (
                      <S.TextoSuave>Sem notas lançadas</S.TextoSuave>
                    )}
                  </td>
                  <S.Num $direita>{d.faltas}</S.Num>
                  <S.Num
                    $direita
                    $forte
                    $tom={tomFrequencia(d.frequencia, criterios.frequenciaMinima)}
                  >
                    {formatarPercentual(d.frequencia, 0)}
                  </S.Num>
                  <S.Num $direita>{d.anotacoes}</S.Num>
                  <td data-noprint>
                    <ChevronRightIcon
                      fontSize="small"
                      sx={{ color: "var(--colors-textTertiary)" }}
                    />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </S.Tabela>
      </S.Rolagem>
      <S.Rodape>
        <span>Clique em uma disciplina para ver os alunos nela</span>
        <span>{criterio}</span>
      </S.Rodape>
    </S.TabelaWrap>
  );
}
