"use client";

import { useEffect, useRef, useState } from "react";
import { Avatar } from "@mui/material";
import CheckIcon from "@mui/icons-material/Check";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import { useAlunoSelecionado } from "@/contexts/AlunoSelecionadoContext";
import * as S from "./styles";

function iniciais(nome: string | null): string {
  if (!nome) return "?";
  const partes = nome.trim().split(/\s+/);
  const primeira = partes[0]?.[0] ?? "";
  const ultima = partes.length > 1 ? (partes[partes.length - 1][0] ?? "") : "";
  return (primeira + ultima).toUpperCase();
}

function meta(serie: string | null, turma: string | null, unidade: string | null): string {
  return [[serie, turma].filter(Boolean).join(" "), unidade].filter(Boolean).join(" · ");
}

/**
 * Troca entre os alunos sob responsabilidade de quem esta logado.
 *
 * Nao aparece quando ha um unico aluno — nesse caso mostra so o nome, porque
 * um seletor de uma opcao so e ruido.
 */
export default function SeletorAluno() {
  const { alunos, alunoAtual, selecionarAluno, precisaSeletor, isLoading } = useAlunoSelecionado();
  const [aberto, setAberto] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  // Fecha ao clicar fora ou apertar Esc.
  useEffect(() => {
    if (!aberto) return;

    function onClickFora(e: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setAberto(false);
      }
    }
    function onEsc(e: KeyboardEvent) {
      if (e.key === "Escape") setAberto(false);
    }

    document.addEventListener("mousedown", onClickFora);
    document.addEventListener("keydown", onEsc);
    return () => {
      document.removeEventListener("mousedown", onClickFora);
      document.removeEventListener("keydown", onEsc);
    };
  }, [aberto]);

  if (isLoading || !alunoAtual) return null;

  if (!precisaSeletor) {
    return <S.NomeEstatico>{alunoAtual.nomeSocial || alunoAtual.nome}</S.NomeEstatico>;
  }

  const nomeAtual = alunoAtual.nomeSocial || alunoAtual.nome;

  return (
    <S.Wrapper ref={wrapperRef}>
      <S.Trigger
        type="button"
        onClick={() => setAberto((v) => !v)}
        aria-haspopup="listbox"
        aria-expanded={aberto}
        aria-label={`Aluno selecionado: ${nomeAtual}. Trocar de aluno.`}
      >
        <Avatar sx={{ width: 28, height: 28, fontSize: 12 }}>{iniciais(nomeAtual)}</Avatar>
        <S.TriggerNome>{nomeAtual}</S.TriggerNome>
        <ExpandMoreIcon sx={{ fontSize: 18 }} />
      </S.Trigger>

      {aberto && (
        <S.Dropdown role="listbox" aria-label="Alunos vinculados">
          {alunos.map((aluno) => {
            const nome = aluno.nomeSocial || aluno.nome;
            const ativo = aluno.id === alunoAtual.id;
            return (
              <S.Opcao
                key={aluno.id}
                type="button"
                role="option"
                aria-selected={ativo}
                $ativo={ativo}
                onClick={() => {
                  selecionarAluno(aluno.id);
                  setAberto(false);
                }}
              >
                <Avatar sx={{ width: 36, height: 36, fontSize: 14 }}>{iniciais(nome)}</Avatar>
                <S.OpcaoTexto>
                  <S.OpcaoNome>{nome}</S.OpcaoNome>
                  <S.OpcaoMeta>{meta(aluno.serie, aluno.turma, aluno.unidade)}</S.OpcaoMeta>
                </S.OpcaoTexto>
                {ativo && <CheckIcon sx={{ fontSize: 20 }} color="primary" />}
              </S.Opcao>
            );
          })}
        </S.Dropdown>
      )}
    </S.Wrapper>
  );
}
