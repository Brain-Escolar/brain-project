"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Box,
  Button,
  Checkbox,
  CircularProgress,
  FormControlLabel,
  TextField,
} from "@mui/material";
import ContainerSection from "@/components/containerSection/containerSection";
import { useSituacaoFamiliar } from "@/hooks/useSituacaoFamiliar";
import * as S from "./styles";

interface SituacaoFamiliarAlunoProps {
  alunoId: string;
  /** Quando falso, a aba é somente leitura. */
  podeEditar: boolean;
}

/** Compara ignorando a ordem — a API não garante ordem das marcações. */
function mesmasOpcoes(a: number[], b: number[]): boolean {
  if (a.length !== b.length) return false;
  const conjunto = new Set(a);
  return b.every((id) => conjunto.has(id));
}

export default function SituacaoFamiliarAluno({
  alunoId,
  podeEditar,
}: SituacaoFamiliarAlunoProps) {
  const { situacao, loading, error, salvar } = useSituacaoFamiliar(alunoId);

  const [descricao, setDescricao] = useState("");
  const [marcadas, setMarcadas] = useState<number[]>([]);

  // O registro chega depois do primeiro render e muda a cada salvamento; como
  // toda escrita passa pelo botão Salvar, ressincronizar aqui não atropela
  // edição em andamento.
  useEffect(() => {
    setDescricao(situacao?.descricao ?? "");
    setMarcadas(situacao?.opcoesMarcadas ?? []);
  }, [situacao]);

  const opcoes = situacao?.opcoesDisponiveis ?? [];

  const alterado = useMemo(() => {
    const descricaoOriginal = situacao?.descricao ?? "";
    return (
      descricao !== descricaoOriginal || !mesmasOpcoes(marcadas, situacao?.opcoesMarcadas ?? [])
    );
  }, [descricao, marcadas, situacao]);

  function alternar(opcaoId: number) {
    setMarcadas((atual) =>
      atual.includes(opcaoId) ? atual.filter((id) => id !== opcaoId) : [...atual, opcaoId],
    );
  }

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", py: 6 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <S.Stack>
      <ContainerSection
        title="Situação familiar"
        description="Contexto de casa registrado pela orientação."
        actions={
          podeEditar && (
            <Button
              size="small"
              variant="contained"
              disabled={!alterado || salvar.isPending}
              onClick={() => salvar.mutate({ descricao, opcoesMarcadas: marcadas })}
            >
              {salvar.isPending ? "Salvando..." : "Salvar alterações"}
            </Button>
          )
        }
      >
        <TextField
          fullWidth
          multiline
          minRows={5}
          size="small"
          label="Descrição"
          placeholder="Relato do contexto familiar, acordos com a família, encaminhamentos..."
          value={descricao}
          onChange={(e) => setDescricao(e.target.value)}
          disabled={!podeEditar}
        />
      </ContainerSection>

      <ContainerSection
        title="Marcações"
        description="Itens usados nos relatórios de acompanhamento."
        actions={
          <S.Contador>
            {marcadas.length} de {opcoes.length}
          </S.Contador>
        }
      >
        {error ? (
          <S.Vazio>{error}</S.Vazio>
        ) : opcoes.length === 0 ? (
          <S.Vazio>Nenhuma opção cadastrada.</S.Vazio>
        ) : (
          <S.OpcaoGrid>
            {opcoes.map((opcao) => (
              <FormControlLabel
                key={opcao.id}
                control={
                  <Checkbox
                    size="small"
                    checked={marcadas.includes(opcao.id)}
                    onChange={() => alternar(opcao.id)}
                    disabled={!podeEditar}
                  />
                }
                label={opcao.descricao}
              />
            ))}
          </S.OpcaoGrid>
        )}
      </ContainerSection>
    </S.Stack>
  );
}
