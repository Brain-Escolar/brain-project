"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import NoteStackOutlinedIcon from "@mui/icons-material/StickyNote2Outlined";
import { RoutesEnum } from "@/enums";
import { AnotacaoProfessorResponse } from "@/services/domains/diretor";
import * as S from "../styles";
import { diaMes, turmaEDisciplina } from "./apresentacao";

const TODAS = "todas";

/** Anotações que o professor registrou sobre alunos no período, filtráveis por tipo. */
export default function AbaAnotacoes({ anotacoes }: { anotacoes: AnotacaoProfessorResponse[] }) {
  const router = useRouter();
  const [tipo, setTipo] = useState(TODAS);

  const tipos = useMemo(() => {
    const mapa = new Map<string, { rotulo: string; total: number }>();
    anotacoes.forEach((a) => {
      const chave = a.tipo ?? "OUTROS";
      const atual = mapa.get(chave);
      mapa.set(chave, { rotulo: a.tipoDescricao ?? "Outros", total: (atual?.total ?? 0) + 1 });
    });
    return [...mapa.entries()].sort((a, b) => b[1].total - a[1].total);
  }, [anotacoes]);

  const visiveis = tipo === TODAS ? anotacoes : anotacoes.filter((a) => (a.tipo ?? "OUTROS") === tipo);

  if (anotacoes.length === 0) {
    return (
      <S.Vazio>
        <NoteStackOutlinedIcon />
        <strong>Nenhuma anotação no período</strong>
        <span>O professor não registrou anotações sobre alunos.</span>
      </S.Vazio>
    );
  }

  return (
    <>
      <S.Chips>
        <S.Chip $ativo={tipo === TODAS} onClick={() => setTipo(TODAS)}>
          Todas <small>{anotacoes.length}</small>
        </S.Chip>
        {tipos.map(([chave, { rotulo, total }]) => (
          <S.Chip key={chave} $ativo={tipo === chave} onClick={() => setTipo(chave)}>
            {rotulo} <small>{total}</small>
          </S.Chip>
        ))}
      </S.Chips>
      <S.Lista>
        {visiveis.map((a) => (
          <S.AnotacaoLinha key={a.id}>
            <span>{diaMes(a.data)}</span>
            <S.AnotacaoCorpo>
              <div>
                <S.LinkAluno onClick={() => router.push(`${RoutesEnum.ALUNO_DETALHE}/${a.alunoId}`)}>
                  {a.aluno}
                </S.LinkAluno>
                <S.Selo $tom={a.tipo === "ATRASO" ? "warning" : "info"}>{a.tipoDescricao ?? "Anotação"}</S.Selo>
                <small>{turmaEDisciplina(a.turma, a.serie, a.disciplina)}</small>
              </div>
              {a.observacao && <p>{a.observacao}</p>}
            </S.AnotacaoCorpo>
          </S.AnotacaoLinha>
        ))}
      </S.Lista>
    </>
  );
}
