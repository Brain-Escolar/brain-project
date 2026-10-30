"use client";

import { useMemo } from "react";
import BrainyMascot from "@/components/brainyMascot/BrainyMascot";
import { AnotacaoAcompanhamentoResponse } from "@/services/domains/diretor";
import * as S from "../styles";
import { diaMes } from "./apresentacao";

const TODAS = "todas";

interface ListaAnotacoesProps {
  anotacoes: AnotacaoAcompanhamentoResponse[];
  tipo: string;
  onTipo: (tipo: string) => void;
  onAbrirAluno: (alunoId: number) => void;
}

/** Anotações de comportamento do recorte, filtráveis por tipo. Atrasos ficam na coluna própria. */
export default function ListaAnotacoes({
  anotacoes,
  tipo,
  onTipo,
  onAbrirAluno,
}: ListaAnotacoesProps) {
  const tipos = useMemo(() => {
    const contagem = new Map<string, { descricao: string; n: number }>();
    for (const a of anotacoes) {
      const atual = contagem.get(a.tipo);
      contagem.set(a.tipo, { descricao: a.tipoDescricao, n: (atual?.n ?? 0) + 1 });
    }
    return [...contagem.entries()].sort((p, q) => q[1].n - p[1].n);
  }, [anotacoes]);

  const visiveis = tipo === TODAS ? anotacoes : anotacoes.filter((a) => a.tipo === tipo);

  return (
    <>
      <S.Chips data-noprint>
        <S.Chip type="button" $ativo={tipo === TODAS} onClick={() => onTipo(TODAS)}>
          Todas <small>{anotacoes.length}</small>
        </S.Chip>
        {tipos.map(([chave, { descricao, n }]) => (
          <S.Chip key={chave} type="button" $ativo={tipo === chave} onClick={() => onTipo(chave)}>
            {descricao} <small>{n}</small>
          </S.Chip>
        ))}
      </S.Chips>
      <S.TabelaWrap>
        {visiveis.map((a) => (
          <S.AnotacaoLinha key={a.id}>
            <S.AnotacaoData>{diaMes(a.data)}</S.AnotacaoData>
            <span>
              <S.Selo $tom="warning">{a.tipoDescricao}</S.Selo>
            </span>
            <S.AnotacaoCorpo>
              <S.AnotacaoAutor>
                <S.LinkAluno type="button" onClick={() => onAbrirAluno(a.alunoId)}>
                  {a.aluno}
                </S.LinkAluno>
                <span>{[a.professor, a.disciplina].filter(Boolean).join(" · ")}</span>
              </S.AnotacaoAutor>
              {a.observacao && <S.AnotacaoTexto>{a.observacao}</S.AnotacaoTexto>}
            </S.AnotacaoCorpo>
          </S.AnotacaoLinha>
        ))}
        {visiveis.length === 0 && (
          <S.Vazio>
            <BrainyMascot height={72} />
            <strong>Nenhuma anotação neste filtro</strong>
            <span>Troque o tipo, o período ou a disciplina.</span>
          </S.Vazio>
        )}
      </S.TabelaWrap>
    </>
  );
}
