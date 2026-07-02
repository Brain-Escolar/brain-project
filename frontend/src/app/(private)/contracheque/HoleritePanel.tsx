"use client";
import { useMemo, useState } from "react";
import Badge from "@/components/badge";
import LoadingComponent from "@/components/loadingComponent/loadingComponent";
import { useHolerites } from "@/hooks/useHolerites";
import { HoleriteResponse } from "@/services/domains/holerite";
import ChevronRightRounded from "@mui/icons-material/ChevronRightRounded";
import DescriptionRounded from "@mui/icons-material/DescriptionRounded";
import DownloadRounded from "@mui/icons-material/DownloadRounded";
import ReceiptLongRounded from "@mui/icons-material/ReceiptLongRounded";
import { Button } from "@mui/material";
import * as S from "./styles";
import { MESES_PT, formatFileSize } from "./utils";

export default function HoleritePanel() {
  const { holerites, loading } = useHolerites();

  const anosDisponiveis = useMemo(() => {
    const anos = Array.from(new Set(holerites.map((h) => h.ano))).sort((a, b) => b - a);
    return anos.length > 0 ? anos : [new Date().getFullYear()];
  }, [holerites]);

  const [ano, setAno] = useState(anosDisponiveis[0]);
  const [mes, setMes] = useState(() => holerites[0]?.mes ?? new Date().getMonth() + 1);
  const [searched, setSearched] = useState(false);
  const [result, setResult] = useState<HoleriteResponse | null>(null);

  const recentes = holerites.slice(0, 6);

  function buscar() {
    setSearched(true);
    setResult(holerites.find((h) => h.ano === ano && h.mes === mes) ?? null);
  }

  function abrir(holerite: HoleriteResponse) {
    setAno(holerite.ano);
    setMes(holerite.mes);
    setSearched(true);
    setResult(holerite);
  }

  function baixar(url: string) {
    window.open(url, "_blank");
  }

  if (loading) return <LoadingComponent />;

  return (
    <S.Grid>
      <S.Main>
        <S.SearchBar>
          <S.FieldGroup>
            <S.FieldLabel htmlFor="holerite-ano">Ano</S.FieldLabel>
            <S.FilterSelect
              id="holerite-ano"
              value={ano}
              onChange={(e) => setAno(Number(e.target.value))}
            >
              {anosDisponiveis.map((a) => (
                <option key={a} value={a}>
                  {a}
                </option>
              ))}
            </S.FilterSelect>
          </S.FieldGroup>
          <S.FieldGroup>
            <S.FieldLabel htmlFor="holerite-mes">Mês</S.FieldLabel>
            <S.FilterSelect id="holerite-mes" value={mes} onChange={(e) => setMes(Number(e.target.value))}>
              {MESES_PT.map((nome, i) => (
                <option key={nome} value={i + 1}>
                  {nome}
                </option>
              ))}
            </S.FilterSelect>
          </S.FieldGroup>
          <Button
            variant="contained"
            startIcon={<DescriptionRounded sx={{ color: "#fff !important" }} />}
            onClick={buscar}
          >
            Buscar contracheque
          </Button>
        </S.SearchBar>

        {searched && result && (
          <S.ResultCard>
            <S.ResultIcon>
              <ReceiptLongRounded />
            </S.ResultIcon>
            <S.ResultBody>
              <S.ResultTitle>
                {MESES_PT[result.mes - 1]} de {result.ano}
              </S.ResultTitle>
              <S.ResultSub>Contracheque — folha de pagamento</S.ResultSub>
              <S.ResultFile>
                <DescriptionRounded />
                {result.arquivo.nome}
                {" · "}
                {formatFileSize(result.arquivo.tamanho)}
              </S.ResultFile>
            </S.ResultBody>
            <S.ResultActions>
              <Badge $tone="success">Pago</Badge>
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
            <ReceiptLongRounded />
            Nenhum contracheque encontrado para {MESES_PT[mes - 1]} de {ano}.
          </S.EmptyHint>
        )}

        {!searched && (
          <S.EmptyHint>
            <ReceiptLongRounded />
            Selecione o ano e o mês desejados e clique em &quot;Buscar contracheque&quot;.
          </S.EmptyHint>
        )}
      </S.Main>

      <S.Side>
        <S.SideHead>Últimos contracheques</S.SideHead>
        <S.HList>
          {recentes.map((h) => (
            <S.HRow key={h.id} onClick={() => abrir(h)}>
              <DescriptionRounded />
              <S.HRowMain>
                <b>
                  {MESES_PT[h.mes - 1]} de {h.ano}
                </b>
                <span>PDF · {formatFileSize(h.arquivo.tamanho)}</span>
              </S.HRowMain>
              <S.HRowChevron>
                <ChevronRightRounded />
              </S.HRowChevron>
            </S.HRow>
          ))}
          {recentes.length === 0 && (
            <S.EmptyHint style={{ padding: 24 }}>Nenhum contracheque disponível ainda.</S.EmptyHint>
          )}
        </S.HList>
      </S.Side>
    </S.Grid>
  );
}
