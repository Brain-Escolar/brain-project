"use client";
import { useMemo, useState } from "react";
import Badge from "@/components/badge";
import LoadingComponent from "@/components/loadingComponent/loadingComponent";
import { useInformesRendimento } from "@/hooks/useInformesRendimento";
import { InformeRendimentoResponse } from "@/services/domains/informe-rendimento";
import DescriptionRounded from "@mui/icons-material/DescriptionRounded";
import DownloadRounded from "@mui/icons-material/DownloadRounded";
import FactCheckRounded from "@mui/icons-material/FactCheckRounded";
import { Button } from "@mui/material";
import * as S from "./styles";
import { formatFileSize } from "./utils";

export default function InformePanel() {
  const { informesRendimento, loading } = useInformesRendimento();

  const anosDisponiveis = useMemo(() => {
    const anos = Array.from(new Set(informesRendimento.map((i) => i.ano))).sort((a, b) => b - a);
    return anos.length > 0 ? anos : [new Date().getFullYear()];
  }, [informesRendimento]);

  const [ano, setAno] = useState(anosDisponiveis[0]);
  const [searched, setSearched] = useState(false);
  const [result, setResult] = useState<InformeRendimentoResponse | null>(null);

  function buscar() {
    setSearched(true);
    setResult(informesRendimento.find((i) => i.ano === ano) ?? null);
  }

  function baixar(url: string) {
    window.open(url, "_blank");
  }

  if (loading) return <LoadingComponent />;

  return (
    <S.Main>
      <S.SearchBar>
        <S.FieldGroup>
          <S.FieldLabel htmlFor="informe-ano">Ano-calendário</S.FieldLabel>
          <S.FilterSelect id="informe-ano" value={ano} onChange={(e) => setAno(Number(e.target.value))}>
            {anosDisponiveis.map((a) => (
              <option key={a} value={a}>
                {a}
              </option>
            ))}
          </S.FilterSelect>
        </S.FieldGroup>
        <Button
          variant="contained"
          startIcon={<DescriptionRounded sx={{ color: "#fff !important" }} />}
          onClick={buscar}
        >
          Buscar informe
        </Button>
      </S.SearchBar>

      {searched && result && (
        <S.ResultCard>
          <S.ResultIcon>
            <FactCheckRounded />
          </S.ResultIcon>
          <S.ResultBody>
            <S.ResultTitle>Informe de rendimentos — {result.ano}</S.ResultTitle>
            <S.ResultSub>Ano-calendário · {result.mesesConsiderados} meses considerados</S.ResultSub>
            <S.ResultFile>
              <DescriptionRounded />
              {result.arquivo.nome}
              {" · "}
              {formatFileSize(result.arquivo.tamanho)}
            </S.ResultFile>
          </S.ResultBody>
          <S.ResultActions>
            {!result.completo && <Badge $tone="warning">Ano em andamento</Badge>}
            <Button
              variant="outlined"
              startIcon={<DownloadRounded />}
              onClick={() => baixar(result.arquivo.downloadUrl)}
            >
              Baixar PDF
            </Button>
          </S.ResultActions>
        </S.ResultCard>
      )}

      {searched && !result && (
        <S.EmptyHint>
          <FactCheckRounded />
          Nenhum informe de rendimentos encontrado para {ano}.
        </S.EmptyHint>
      )}

      {!searched && (
        <S.EmptyHint>
          <FactCheckRounded />
          Selecione o ano-calendário e clique em &quot;Buscar informe&quot; para ver a declaração disponível.
        </S.EmptyHint>
      )}
    </S.Main>
  );
}
