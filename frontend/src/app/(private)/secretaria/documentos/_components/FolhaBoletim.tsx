import { CSSProperties, forwardRef } from "react";
import { BoletimResponse } from "@/services/domains/documento-escolar";
import {
  RelatorioDisciplinaResponse,
  RelatorioResponse,
} from "@/services/domains/estudante/response";
import FolhaDocumento, { COR, estiloNumero, estiloRotulo, TabelaFolha } from "./FolhaDocumento";
import {
  assinaturasPadrao,
  cabecalhoEscola,
  formatarData,
  formatarNota,
  formatarPercentual,
  rodapeEmissao,
} from "./formatacao";

export interface OpcoesBoletim {
  frequencia: boolean;
  assinaturas: boolean;
  observacao: string;
}

interface FolhaBoletimProps {
  boletim: BoletimResponse & { relatorio: RelatorioResponse };
  opcoes: OpcoesBoletim;
}

/** O boletim fecha o ano quando cobre todos os períodos e nenhum está em andamento. */
export function boletimEhFinal(relatorio: RelatorioResponse, periodoAte: number | null): boolean {
  return (
    periodoAte != null &&
    periodoAte >= relatorio.periodos.length &&
    !relatorio.periodos.some((p) => p.isCurrent)
  );
}

function situacao(d: RelatorioDisciplinaResponse, final: boolean, aprovacao: number): string {
  if (d.notaFinal == null) return final ? "Sem notas" : "Cursando";
  if (!final) return d.notaFinal < aprovacao ? "Abaixo da média" : "Cursando";
  if (d.situacao === "REPROVADO") return "Reprovado";
  return d.recuperacao != null && d.notaAnual != null && d.notaAnual < aprovacao
    ? "Aprovado c/ recup."
    : "Aprovado";
}

const celula: CSSProperties = {
  padding: "6px 4px",
  textAlign: "center",
  borderLeft: `1px solid ${COR.bordaLeve}`,
  ...estiloNumero,
};
const celulaCabecalho: CSSProperties = {
  padding: "7px 4px",
  textAlign: "center",
  borderLeft: `1px solid ${COR.borda}`,
};
const vermelho: CSSProperties = { color: COR.erro, fontWeight: 600 };

const FolhaBoletim = forwardRef<HTMLDivElement, FolhaBoletimProps>(function FolhaBoletim(
  { boletim, opcoes },
  ref,
) {
  const { relatorio, aluno } = boletim;
  const casas = relatorio.gradingScale?.decimalPlaces ?? 1;
  const aprovacao = relatorio.notaAprovacao;
  const freqMinima = 100 - relatorio.percentualLimiteFaltas;
  const final = boletimEhFinal(relatorio, boletim.periodoAte);
  const periodoAte = boletim.periodoAte ?? relatorio.periodos.length;
  const nomePeriodoAte = relatorio.periodos.find((p) => p.sequence === periodoAte)?.name;

  const colunas = [
    "1.8fr",
    ...relatorio.periodos.map(() => "minmax(0,0.55fr)"),
    "minmax(0,0.75fr)",
    ...(opcoes.frequencia ? ["minmax(0,0.5fr)", "minmax(0,0.5fr)"] : []),
    "minmax(0,1.05fr)",
  ].join(" ");

  const abaixo = relatorio.disciplinas.filter(
    (d) => d.notaFinal != null && d.notaFinal < aprovacao,
  );
  const aulas = relatorio.disciplinas.reduce((acc, d) => acc + (d.totalAulas ?? 0), 0);

  const resumo = [
    { rotulo: "Média geral", valor: formatarNota(relatorio.resumo.mediaGeral, casas) },
    ...(opcoes.frequencia
      ? [
          {
            rotulo: "Frequência global",
            valor: formatarPercentual(relatorio.resumo.frequenciaGeral),
          },
          { rotulo: "Aulas registradas", valor: String(aulas) },
        ]
      : []),
    { rotulo: "Abaixo da média", valor: String(abaixo.length) },
  ];

  const observacoes = [
    !aluno.matriculado && aluno.dataDesmatricula
      ? `Aluno(a) desmatriculado(a) em ${formatarData(aluno.dataDesmatricula)}${
          aluno.motivoDesmatricula ? ` — ${aluno.motivoDesmatricula}` : ""
        }.`
      : null,
    opcoes.observacao.trim() || null,
  ].filter((o): o is string => !!o);

  return (
    <FolhaDocumento
      ref={ref}
      {...cabecalhoEscola(boletim.escola)}
      titulo="Boletim escolar"
      subtitulo={`Ano letivo ${boletim.anoLetivo} · ${
        final ? "resultado final" : `até o ${nomePeriodoAte ?? `${periodoAte}º período`}`
      }`}
      identificacao={[
        { rotulo: "Aluno", valor: aluno.nome, largo: true },
        { rotulo: "Matrícula", valor: aluno.matricula ?? "—" },
        {
          rotulo: "Série / turma",
          valor: [relatorio.aluno.serie, relatorio.aluno.turma].filter(Boolean).join(" · ") || "—",
        },
        { rotulo: "Turno", valor: boletim.turno ?? "—" },
        { rotulo: "Data de nascimento", valor: formatarData(aluno.dataNascimento) },
      ]}
      observacoes={observacoes}
      assinaturas={opcoes.assinaturas ? assinaturasPadrao(boletim.emitidoPor) : null}
      rodape={rodapeEmissao(boletim.emitidoEm, boletim.emitidoPor)}
    >
      <TabelaFolha>
        <div
          data-row
          style={{
            display: "grid",
            gridTemplateColumns: colunas,
            background: COR.cabecalho,
            fontSize: 10,
            fontWeight: 600,
            color: "#334155",
          }}
        >
          <span style={{ padding: "7px 10px" }}>Componente curricular</span>
          {relatorio.periodos.map((p) => (
            <span key={p.id} style={celulaCabecalho}>
              {p.name}
            </span>
          ))}
          <span style={celulaCabecalho}>{final ? "Média final" : "Média parcial"}</span>
          {opcoes.frequencia && (
            <>
              <span style={celulaCabecalho}>Faltas</span>
              <span style={celulaCabecalho}>Freq.</span>
            </>
          )}
          <span style={{ ...celulaCabecalho, textAlign: "left", padding: "7px 8px" }}>
            Situação
          </span>
        </div>

        {relatorio.disciplinas.length === 0 && (
          <div
            style={{
              padding: "12px 10px",
              borderTop: `1px solid ${COR.bordaLeve}`,
              color: COR.rotulo,
            }}
          >
            Nenhuma disciplina cadastrada para a série.
          </div>
        )}

        {relatorio.disciplinas.map((d) => {
          const baixa = d.notaFinal != null && d.notaFinal < aprovacao;
          return (
            <div
              key={d.disciplinaId}
              data-row
              style={{
                display: "grid",
                gridTemplateColumns: colunas,
                borderTop: `1px solid ${COR.bordaLeve}`,
                fontSize: 11.5,
              }}
            >
              <span style={{ padding: "6px 10px", fontWeight: 500 }}>{d.nome}</span>
              {relatorio.periodos.map((p) => {
                const nota = d.periodos.find((np) => np.sequence === p.sequence)?.nota ?? null;
                return (
                  <span
                    key={p.id}
                    style={{
                      ...celula,
                      ...(nota == null ? { color: COR.apagado } : nota < aprovacao ? vermelho : {}),
                    }}
                  >
                    {formatarNota(nota, casas)}
                  </span>
                );
              })}
              <span style={{ ...celula, fontWeight: 700, ...(baixa ? { color: COR.erro } : {}) }}>
                {formatarNota(d.notaFinal, casas)}
              </span>
              {opcoes.frequencia && (
                <>
                  <span style={celula}>{d.totalFaltas}</span>
                  <span
                    style={{
                      ...celula,
                      ...(d.frequencia != null && d.frequencia < freqMinima ? vermelho : {}),
                    }}
                  >
                    {formatarPercentual(d.frequencia)}
                  </span>
                </>
              )}
              <span
                style={{
                  padding: "6px 8px",
                  borderLeft: `1px solid ${COR.bordaLeve}`,
                  fontSize: 11,
                  ...(baixa ? vermelho : { color: "#334155" }),
                }}
              >
                {situacao(d, final, aprovacao)}
              </span>
            </div>
          );
        })}
      </TabelaFolha>

      <div
        style={{
          display: "flex",
          gap: 28,
          flexWrap: "wrap",
          padding: "12px 16px",
          border: `1px solid ${COR.bordaLeve}`,
          borderRadius: 6,
          background: COR.fundoLeve,
        }}
      >
        {resumo.map((k) => (
          <div key={k.rotulo}>
            <div style={estiloRotulo}>{k.rotulo}</div>
            <div style={{ ...estiloNumero, fontSize: 15, fontWeight: 600, marginTop: 2 }}>
              {k.valor}
            </div>
          </div>
        ))}
      </div>

      <div style={{ fontSize: 10, color: COR.secundario }}>
        Média mínima para aprovação: {formatarNota(aprovacao, casas)} · Frequência mínima:{" "}
        {freqMinima}% · Notas em vermelho estão abaixo da média.
        {!final && " Períodos sem nota ainda não foram lançados ou estão fora do recorte."}
      </div>
    </FolhaDocumento>
  );
});

export default FolhaBoletim;
