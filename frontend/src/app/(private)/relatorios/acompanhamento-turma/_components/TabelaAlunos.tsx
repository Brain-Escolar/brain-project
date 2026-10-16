"use client";

import ArrowUpwardIcon from "@mui/icons-material/ArrowUpward";
import ArrowDownwardIcon from "@mui/icons-material/ArrowDownward";
import UnfoldMoreIcon from "@mui/icons-material/UnfoldMore";
import SearchOffIcon from "@mui/icons-material/SearchOff";
import FlagOutlinedIcon from "@mui/icons-material/FlagOutlined";
import { Tooltip } from "@mui/material";
import { AlunoAcompanhamentoResponse, CriteriosAtencaoResponse } from "@/services/domains/diretor";
import { formatarDecimal, formatarPercentual } from "@/utils/formatoNumero";
import * as S from "../styles";
import { iniciais, plural, tomFrequencia, tomNota } from "./apresentacao";

export type ChaveOrdem =
  | "nome"
  | "media"
  | "abaixo"
  | "faltas"
  | "frequencia"
  | "atrasos"
  | "anotacoes"
  | "situacao";

export interface Ordem {
  chave: ChaveOrdem;
  direcao: 1 | -1;
}

const VALOR_ORDEM: Record<ChaveOrdem, (a: AlunoAcompanhamentoResponse) => string | number> = {
  nome: (a) => a.nome,
  media: (a) => a.media ?? -1,
  abaixo: (a) => a.geral.disciplinasAbaixo,
  faltas: (a) => a.faltas,
  frequencia: (a) => a.frequencia ?? -1,
  atrasos: (a) => a.atrasos,
  anotacoes: (a) => a.anotacoes,
  situacao: (a) => a.motivosAtencao.length,
};

export function ordenarAlunos(alunos: AlunoAcompanhamentoResponse[], ordem: Ordem) {
  const valor = VALOR_ORDEM[ordem.chave];
  return [...alunos].sort((p, q) => {
    const a = valor(p);
    const b = valor(q);
    const cmp = typeof a === "string" ? a.localeCompare(b as string, "pt-BR") : a - (b as number);
    return cmp * ordem.direcao || p.nome.localeCompare(q.nome, "pt-BR");
  });
}

interface TabelaAlunosProps {
  alunos: AlunoAcompanhamentoResponse[];
  criterios: CriteriosAtencaoResponse;
  disciplinaNome: string | null;
  ordem: Ordem;
  onOrdenar: (chave: ChaveOrdem) => void;
  onAbrir: (aluno: AlunoAcompanhamentoResponse) => void;
  resumo: string;
  criterio: string;
}

export default function TabelaAlunos({
  alunos,
  criterios,
  disciplinaNome,
  ordem,
  onOrdenar,
  onAbrir,
  resumo,
  criterio,
}: TabelaAlunosProps) {
  const limiteAtrasos = criterios.atrasosPorPeriodo * criterios.periodosConsiderados;

  const colunas: { chave: ChaveOrdem; rotulo: string; direita?: boolean }[] = [
    { chave: "nome", rotulo: "Aluno" },
    { chave: "media", rotulo: disciplinaNome ? "Nota" : "Média" },
    ...(disciplinaNome
      ? []
      : [
          {
            chave: "abaixo" as ChaveOrdem,
            rotulo: `Abaixo de ${formatarDecimal(criterios.mediaMinima)}`,
          },
        ]),
    { chave: "faltas", rotulo: "Faltas", direita: true },
    { chave: "frequencia", rotulo: "Freq.", direita: true },
    { chave: "atrasos", rotulo: "Atrasos", direita: true },
    { chave: "anotacoes", rotulo: "Anotações", direita: true },
    { chave: "situacao", rotulo: "Situação" },
  ];

  return (
    <S.TabelaWrap>
      <S.Rolagem>
        <S.Tabela>
          <thead>
            <tr>
              {colunas.map((c) => (
                <S.ThOrdenavel
                  key={c.chave}
                  $direita={c.direita}
                  onClick={() => onOrdenar(c.chave)}
                  aria-sort={
                    ordem.chave === c.chave
                      ? ordem.direcao > 0
                        ? "ascending"
                        : "descending"
                      : undefined
                  }
                >
                  {c.rotulo}
                  <span data-noprint>
                    {ordem.chave !== c.chave ? (
                      <UnfoldMoreIcon />
                    ) : ordem.direcao > 0 ? (
                      <ArrowUpwardIcon />
                    ) : (
                      <ArrowDownwardIcon />
                    )}
                  </span>
                </S.ThOrdenavel>
              ))}
            </tr>
          </thead>
          <tbody>
            {alunos.map((a) => {
              const abaixo = a.geral.disciplinasAbaixo;
              return (
                <tr key={a.id} onClick={() => onAbrir(a)}>
                  <td>
                    <S.AlunoCelula>
                      <S.Iniciais>{iniciais(a.nome)}</S.Iniciais>
                      <div>
                        <strong>{a.nome}</strong>
                        {a.matricula && <small>{a.matricula}</small>}
                      </div>
                    </S.AlunoCelula>
                  </td>
                  <td>
                    <S.NotaPill $tom={tomNota(a.media, criterios.mediaMinima)}>
                      {formatarDecimal(a.media)}
                    </S.NotaPill>
                  </td>
                  {!disciplinaNome && (
                    <S.Num $tom={abaixo >= 3 ? "error" : abaixo ? undefined : "neutral"}>
                      {abaixo ? plural(abaixo, "disciplina", "disciplinas") : "—"}
                    </S.Num>
                  )}
                  <S.Num $direita>{a.faltas}</S.Num>
                  <S.Num
                    $direita
                    $forte
                    $tom={tomFrequencia(a.frequencia, criterios.frequenciaMinima)}
                  >
                    {formatarPercentual(a.frequencia, 0)}
                  </S.Num>
                  <S.Num $direita $tom={a.atrasos >= limiteAtrasos ? "warning" : undefined}>
                    {a.atrasos}
                  </S.Num>
                  <S.Num $direita $tom={a.anotacoes ? "error" : "neutral"}>
                    {a.anotacoes}
                  </S.Num>
                  <td>
                    {a.motivosAtencao.length > 0 ? (
                      <Tooltip title={a.motivosAtencao.join(" · ")}>
                        <S.Selo $tom="warning">
                          <FlagOutlinedIcon />
                          Em atenção
                        </S.Selo>
                      </Tooltip>
                    ) : (
                      <S.Selo $tom="neutral">Regular</S.Selo>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </S.Tabela>
      </S.Rolagem>
      {alunos.length === 0 && (
        <S.Vazio>
          <SearchOffIcon />
          <strong>Nenhum aluno encontrado</strong>
          <span>Ajuste a busca ou o filtro de atenção.</span>
        </S.Vazio>
      )}
      <S.Rodape>
        <span>{resumo}</span>
        <span>{criterio}</span>
      </S.Rodape>
    </S.TabelaWrap>
  );
}
