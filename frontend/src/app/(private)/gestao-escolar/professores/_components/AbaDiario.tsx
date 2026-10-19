"use client";

import { useEffect, useMemo, useState } from "react";
import { Button, IconButton, Tooltip } from "@mui/material";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import ScheduleOutlinedIcon from "@mui/icons-material/ScheduleOutlined";
import EventBusyOutlinedIcon from "@mui/icons-material/EventBusyOutlined";
import NotificationsNoneOutlinedIcon from "@mui/icons-material/NotificationsNoneOutlined";
import BrainDropdownField from "@/components/brainForms/_base/brainDropdownField/brainDropdownField";
import { AulaDiarioResponse, SemanaDiarioResponse } from "@/services/domains/diretor";
import * as S from "../styles";
import {
  SITUACAO_AULA,
  dataHora,
  dataPorExtenso,
  diaDaSemana,
  diaMes,
  hojeIso,
  hora,
  plural,
  tomDoDia,
  turmaEDisciplina,
} from "./apresentacao";

const TODAS = "todas";

interface AbaDiarioProps {
  semana: SemanaDiarioResponse;
  onSemana: (ate: string) => void;
  onLembrar?: () => void;
  lembrando: boolean;
  ativo: boolean;
}

/** Na semana atual, o dia de hoje; nas passadas, a sexta-feira. */
function diaInicial(semana: SemanaDiarioResponse): number {
  const indice = semana.dias.findIndex((d) => d.data === hojeIso());
  return indice >= 0 ? indice : semana.dias.length - 1;
}

/** Diário de classe de uma semana (segunda a sexta): conteúdo, chamada e anotações de cada aula. */
export default function AbaDiario({ semana, onSemana, onLembrar, lembrando, ativo }: AbaDiarioProps) {
  const [diaAtivo, setDiaAtivo] = useState(() => diaInicial(semana));
  const [turma, setTurma] = useState<string>(TODAS);

  // Ao trocar de semana, reabre no dia inicial dela.
  useEffect(() => setDiaAtivo(diaInicial(semana)), [semana]);

  const turmas = useMemo(() => {
    const mapa = new Map<number, string>();
    semana.dias.forEach((d) => d.aulas.forEach((a) => mapa.set(a.turmaId, turmaEDisciplina(a.turma, a.serie))));
    return [...mapa.entries()].sort((a, b) => a[1].localeCompare(b[1], "pt-BR"));
  }, [semana]);

  const filtrar = (aulas: AulaDiarioResponse[]) =>
    turma === TODAS ? aulas : aulas.filter((a) => String(a.turmaId) === turma);

  const dia = semana.dias[diaAtivo] ?? semana.dias[semana.dias.length - 1];
  const aulas = filtrar(dia.aulas);
  const registradas = aulas.filter((a) => a.situacao === "REGISTRADA").length;

  return (
    <>
      <S.BarraDiario>
        <S.Dias>
          <Tooltip title="Semana anterior">
            <span style={{ display: "flex" }}>
              <IconButton
                onClick={() => semana.anterior && onSemana(semana.anterior)}
                disabled={!semana.anterior}
                aria-label="Semana anterior"
              >
                <ChevronLeftIcon />
              </IconButton>
            </span>
          </Tooltip>
          {semana.dias.map((d, i) => {
            const doDia = filtrar(d.aulas);
            const contagem = {
              aulas: doDia.length,
              registradas: doDia.filter((a) => a.situacao === "REGISTRADA").length,
              pendentes: doDia.filter((a) => a.situacao === "PENDENTE").length,
            };
            return (
              <S.DiaBotao key={d.data} $ativo={i === diaAtivo} onClick={() => setDiaAtivo(i)}>
                <span>{diaDaSemana(d.data)}</span>
                <strong>{diaMes(d.data)}</strong>
                <small>
                  <S.Ponto $tom={tomDoDia(contagem)} />
                  {d.feriado ? "Feriado" : contagem.aulas ? `${contagem.registradas}/${contagem.aulas}` : "Sem aulas"}
                </small>
              </S.DiaBotao>
            );
          })}
          <Tooltip title="Próxima semana">
            <span style={{ display: "flex" }}>
              <IconButton
                onClick={() => semana.proxima && onSemana(semana.proxima)}
                disabled={!semana.proxima}
                aria-label="Próxima semana"
              >
                <ChevronRightIcon />
              </IconButton>
            </span>
          </Tooltip>
        </S.Dias>
        <BrainDropdownField<string>
          label="Turma"
          value={turma}
          disableClearable
          onChange={(v) => setTurma(v ?? TODAS)}
          options={[
            { key: TODAS, value: "Todas as turmas" },
            ...turmas.map(([id, nome]) => ({ key: String(id), value: nome })),
          ]}
          sx={{ minWidth: 220 }}
        />
      </S.BarraDiario>

      <S.DiaTitulo>
        <strong>{dataPorExtenso(dia.data)}</strong>
        {aulas.length > 0 && (
          <span>
            {plural(aulas.length, "aula", "aulas")} · {registradas} registrada{registradas === 1 ? "" : "s"}
          </span>
        )}
      </S.DiaTitulo>

      {aulas.length === 0 && (
        <S.Vazio>
          <EventBusyOutlinedIcon />
          <strong>{dia.feriado ? dia.feriado : "Sem aulas neste dia"}</strong>
          <span>
            {dia.feriado
              ? "Feriado no calendário da escola."
              : !ativo
                ? "Professor inativo — sem diário a acompanhar."
                : "Não há aulas deste professor no dia ou na turma selecionados."}
          </span>
        </S.Vazio>
      )}

      {aulas.map((a) => (
        <CartaoAula key={a.aulaId} aula={a} onLembrar={onLembrar} lembrando={lembrando} />
      ))}
    </>
  );
}

function CartaoAula({
  aula: a,
  onLembrar,
  lembrando,
}: {
  aula: AulaDiarioResponse;
  onLembrar?: () => void;
  lembrando: boolean;
}) {
  const situ = SITUACAO_AULA[a.situacao];
  const horario = a.inicio ? `${hora(a.inicio)}${a.fim ? `–${hora(a.fim)}` : ""}` : (a.horario ?? "Sem horário");

  return (
    <S.AulaCartao $pendente={a.situacao === "PENDENTE"}>
      <S.AulaTopo>
        <strong>{horario}</strong>
        <strong>{turmaEDisciplina(a.turma, a.serie)}</strong>
        <span>{a.disciplina}</span>
        <small>{a.registradoEm ? `Registrado em ${dataHora(a.registradoEm)}` : ""}</small>
        <S.Selo $tom={situ.tom}>
          {a.situacao === "REGISTRADA" ? <CheckCircleOutlineIcon /> : <ScheduleOutlinedIcon />}
          {situ.rotulo}
        </S.Selo>
      </S.AulaTopo>

      {a.situacao === "REGISTRADA" && (
        <S.AulaCorpo>
          <S.Campo>
            <span>Conteúdo ministrado</span>
            <div>{a.conteudo ?? <S.TextoSuave>Conteúdo não lançado</S.TextoSuave>}</div>
          </S.Campo>
          <S.Campo>
            <span>Chamada</span>
            <div>
              {a.presentes != null ? (
                <>
                  <strong>{a.presentes}</strong> presente{a.presentes === 1 ? "" : "s"} ·{" "}
                  <strong style={a.faltas && a.faltas >= 3 ? { color: "var(--colors-errorText)" } : undefined}>
                    {a.faltas}
                  </strong>{" "}
                  falta{a.faltas === 1 ? "" : "s"}
                </>
              ) : (
                <S.TextoSuave>Chamada não feita</S.TextoSuave>
              )}
            </div>
          </S.Campo>
          {a.anotacoes.length > 0 && (
            <S.CampoLargo>
              <span>Anotações sobre alunos</span>
              <div>
                {a.anotacoes.map((an, i) => (
                  <div key={i}>
                    <strong>{an.aluno}</strong> — {an.tipoDescricao ?? "Anotação"}
                    {an.observacao ? `: ${an.observacao}` : ""}
                  </div>
                ))}
              </div>
            </S.CampoLargo>
          )}
        </S.AulaCorpo>
      )}

      {a.situacao === "PENDENTE" && (
        <S.AulaPendente>
          <span>Conteúdo e chamada ainda não registrados pelo professor.</span>
          {onLembrar && (
            <Button
              size="small"
              variant="outlined"
              startIcon={<NotificationsNoneOutlinedIcon />}
              onClick={onLembrar}
              disabled={lembrando}
            >
              Enviar lembrete
            </Button>
          )}
        </S.AulaPendente>
      )}

      {a.situacao === "PREVISTA" && (
        <S.AulaPendente>
          <span>Aula ainda não aconteceu.</span>
        </S.AulaPendente>
      )}
    </S.AulaCartao>
  );
}
