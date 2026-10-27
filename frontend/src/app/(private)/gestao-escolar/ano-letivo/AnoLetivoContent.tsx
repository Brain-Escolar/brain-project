"use client";

import { useEffect, useMemo, useState } from "react";
import { Button, IconButton, Skeleton, TextField, Tooltip } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import LockOpenOutlinedIcon from "@mui/icons-material/LockOpenOutlined";
import PlayCircleOutlineIcon from "@mui/icons-material/PlayCircleOutline";
import SaveOutlinedIcon from "@mui/icons-material/SaveOutlined";
import PageScaffold from "@/components/pageScaffold/PageScaffold";
import { useAnoLetivoMutations, useAnosLetivos } from "@/hooks/useAnosLetivos";
import {
  AnoLetivoResponse,
  PeriodoLetivoRequest,
  StatusAnoLetivo,
} from "@/services/domains/ano-letivo";
import * as S from "./styles";

const ROTULO_STATUS: Record<StatusAnoLetivo, string> = {
  ABERTO: "Ano corrente",
  PLANEJAMENTO: "Em planejamento",
  ENCERRADO: "Encerrado",
};

/** yyyy-MM-dd → dd/MM/yyyy sem passar por Date (evita o deslocamento de fuso). */
function dataCurta(iso: string) {
  const [ano, mes, dia] = iso.split("-");
  return `${dia}/${mes}/${ano}`;
}

function paraEdicao(ano: AnoLetivoResponse | undefined): PeriodoLetivoRequest[] {
  return (ano?.periodos ?? []).map(({ nome, dataInicio, dataFim }) => ({
    nome,
    dataInicio,
    dataFim,
  }));
}

/**
 * Gestão Escolar › Ano letivo: anos da escola, o calendário de períodos de cada
 * um e a abertura do ano corrente. Notas e frequência são agrupadas por esses
 * períodos em boletins e relatórios.
 */
export default function AnoLetivoContent() {
  const { anos, loading, error } = useAnosLetivos();
  const { criar, salvarPeriodos, abrir, fecharPeriodo, reabrirPeriodo } = useAnoLetivoMutations();

  const [anoSelecionado, setAnoSelecionado] = useState<number>();
  const selecionado = useMemo(
    () =>
      anos.find((a) => a.ano === anoSelecionado) ??
      anos.find((a) => a.status === "ABERTO") ??
      anos[0],
    [anos, anoSelecionado],
  );

  const [periodos, setPeriodos] = useState<PeriodoLetivoRequest[]>([]);
  useEffect(() => setPeriodos(paraEdicao(selecionado)), [selecionado]);

  const alterado = JSON.stringify(periodos) !== JSON.stringify(paraEdicao(selecionado));
  const somenteLeitura = selecionado?.status === "ENCERRADO";
  const proximoAno = anos.length
    ? Math.max(...anos.map((a) => a.ano)) + 1
    : new Date().getFullYear();
  const aberto = anos.find((a) => a.status === "ABERTO");

  function alterar(indice: number, campo: keyof PeriodoLetivoRequest, valor: string) {
    setPeriodos((atual) => atual.map((p, i) => (i === indice ? { ...p, [campo]: valor } : p)));
  }

  function adicionar() {
    setPeriodos((atual) => {
      const ultimo = atual[atual.length - 1];
      return [
        ...atual,
        { nome: `${atual.length + 1}º Período`, dataInicio: ultimo?.dataFim ?? "", dataFim: "" },
      ];
    });
  }

  function remover(indice: number) {
    setPeriodos((atual) => atual.filter((_, i) => i !== indice));
  }

  const completo =
    periodos.length > 0 && periodos.every((p) => p.nome.trim() && p.dataInicio && p.dataFim);

  const acoes = (
    <Button
      variant="contained"
      startIcon={<AddIcon />}
      disabled={loading || criar.isPending}
      onClick={() => criar.mutate(proximoAno, { onSuccess: (novo) => setAnoSelecionado(novo.ano) })}
    >
      Planejar {proximoAno}
    </Button>
  );

  return (
    <PageScaffold
      title="Ano letivo"
      description="Defina o calendário de períodos de cada ano e qual é o ano corrente da escola."
      actions={acoes}
    >
      {error ? (
        <S.Vazio>
          <strong>{error}</strong>
          <span>Tente novamente em instantes.</span>
        </S.Vazio>
      ) : loading ? (
        <S.Layout>
          <Skeleton variant="rounded" height={240} />
          <Skeleton variant="rounded" height={320} />
        </S.Layout>
      ) : !selecionado ? (
        <S.Vazio>
          <strong>Nenhum ano letivo cadastrado</strong>
          <span>Use “Planejar {proximoAno}” para começar.</span>
        </S.Vazio>
      ) : (
        <S.Layout>
          <S.ListaAnos>
            {anos.map((a) => (
              <S.CartaoAno
                key={a.ano}
                type="button"
                $selecionado={a.ano === selecionado.ano}
                onClick={() => setAnoSelecionado(a.ano)}
              >
                <S.CartaoAnoTopo>
                  <S.AnoNumero>{a.ano}</S.AnoNumero>
                  <S.Status $status={a.status}>{ROTULO_STATUS[a.status]}</S.Status>
                </S.CartaoAnoTopo>
                <S.Suave>
                  {dataCurta(a.dataInicio)} a {dataCurta(a.dataFim)} · {a.periodos.length}{" "}
                  {a.periodos.length === 1 ? "período" : "períodos"}
                </S.Suave>
              </S.CartaoAno>
            ))}
          </S.ListaAnos>

          <S.Painel>
            <S.PainelTopo>
              <S.Titulo>
                Calendário de {selecionado.ano}
                <S.Status $status={selecionado.status}>
                  {ROTULO_STATUS[selecionado.status]}
                </S.Status>
              </S.Titulo>
              {selecionado.status === "PLANEJAMENTO" && (
                <Tooltip
                  title={
                    aberto
                      ? `Encerre ${aberto.ano} antes de abrir ${selecionado.ano}.`
                      : "Passa a ser o ano usado por padrão em todas as telas."
                  }
                >
                  <span>
                    <Button
                      variant="outlined"
                      startIcon={<PlayCircleOutlineIcon />}
                      disabled={!!aberto || alterado || abrir.isPending}
                      onClick={() => abrir.mutate(selecionado.ano)}
                    >
                      Tornar ano corrente
                    </Button>
                  </span>
                </Tooltip>
              )}
            </S.PainelTopo>

            {somenteLeitura ? (
              <S.Aviso>
                Ano encerrado: o calendário fica como histórico e não pode mais ser alterado.
              </S.Aviso>
            ) : (
              <S.Aviso>
                Notas e frequência são agrupadas por estes períodos nos boletins e relatórios. Os
                períodos precisam estar em ordem e sem sobreposição. Feche um período (cadeado)
                quando o boletim dele estiver pronto: notas e chamadas dele deixam de aceitar
                alterações.
              </S.Aviso>
            )}

            <S.Periodos>
              {periodos.map((p, i) => {
                const gravado = selecionado.periodos.find((g) => g.sequencia === i + 1);
                const fechado = !!gravado?.fechadoEm;
                const datasTravadas = somenteLeitura || fechado;
                return (
                  <S.LinhaPeriodo key={i}>
                    <S.Sequencia>{i + 1}º</S.Sequencia>
                    <TextField
                      size="small"
                      label="Nome"
                      value={p.nome}
                      disabled={somenteLeitura}
                      onChange={(e) => alterar(i, "nome", e.target.value)}
                      slotProps={{ htmlInput: { maxLength: 40 } }}
                    />
                    <TextField
                      className="data"
                      size="small"
                      type="date"
                      label="Início"
                      value={p.dataInicio}
                      disabled={datasTravadas}
                      onChange={(e) => alterar(i, "dataInicio", e.target.value)}
                      slotProps={{ inputLabel: { shrink: true } }}
                    />
                    <TextField
                      className="data"
                      size="small"
                      type="date"
                      label="Fim"
                      value={p.dataFim}
                      disabled={datasTravadas}
                      onChange={(e) => alterar(i, "dataFim", e.target.value)}
                      slotProps={{ inputLabel: { shrink: true } }}
                    />
                    <S.AcoesPeriodo>
                      {gravado && !somenteLeitura && (
                        <Tooltip
                          title={
                            fechado
                              ? "Período fechado. Reabrir permite corrigir notas e chamadas."
                              : alterado
                                ? "Salve o calendário antes de fechar."
                                : "Fechar o período: notas e chamadas dele ficam definitivas."
                          }
                        >
                          <span>
                            <IconButton
                              aria-label={
                                fechado ? `Reabrir ${gravado.nome}` : `Fechar ${gravado.nome}`
                              }
                              disabled={
                                (!fechado && alterado) ||
                                fecharPeriodo.isPending ||
                                reabrirPeriodo.isPending
                              }
                              onClick={() =>
                                (fechado ? reabrirPeriodo : fecharPeriodo).mutate({
                                  ano: selecionado.ano,
                                  sequencia: gravado.sequencia,
                                })
                              }
                            >
                              {fechado ? (
                                <LockOutlinedIcon fontSize="small" color="warning" />
                              ) : (
                                <LockOpenOutlinedIcon fontSize="small" />
                              )}
                            </IconButton>
                          </span>
                        </Tooltip>
                      )}
                      {!somenteLeitura && (
                        <Tooltip
                          title={fechado ? "Reabra o período para removê-lo" : "Remover período"}
                        >
                          <span>
                            <IconButton
                              aria-label={`Remover ${p.nome}`}
                              disabled={periodos.length === 1 || fechado}
                              onClick={() => remover(i)}
                            >
                              <DeleteOutlineIcon fontSize="small" />
                            </IconButton>
                          </span>
                        </Tooltip>
                      )}
                    </S.AcoesPeriodo>
                  </S.LinhaPeriodo>
                );
              })}
            </S.Periodos>

            {!somenteLeitura && (
              <S.Acoes>
                <Button startIcon={<AddIcon />} onClick={adicionar}>
                  Adicionar período
                </Button>
                <Button disabled={!alterado} onClick={() => setPeriodos(paraEdicao(selecionado))}>
                  Descartar
                </Button>
                <Button
                  variant="contained"
                  startIcon={<SaveOutlinedIcon />}
                  disabled={!alterado || !completo || salvarPeriodos.isPending}
                  onClick={() =>
                    salvarPeriodos.mutate({ ano: selecionado.ano, dados: { periodos } })
                  }
                >
                  Salvar calendário
                </Button>
              </S.Acoes>
            )}
          </S.Painel>
        </S.Layout>
      )}
    </PageScaffold>
  );
}
