import { CSSProperties, forwardRef, Fragment } from "react";
import { AnoHistoricoResponse, HistoricoResponse } from "@/services/domains/documento-escolar";
import FolhaDocumento, {
  COR,
  estiloNumero,
  estiloTituloSecao,
  TabelaFolha,
} from "./FolhaDocumento";
import {
  assinaturasPadrao,
  cabecalhoEscola,
  formatarData,
  formatarNota,
  formatarPercentual,
  rodapeEmissao,
} from "./formatacao";

export interface OpcoesHistorico {
  anoEmCurso: boolean;
  cargaHoraria: boolean;
  assinaturas: boolean;
  observacao: string;
}

interface FolhaHistoricoProps {
  historico: HistoricoResponse;
  opcoes: OpcoesHistorico;
}

function resultadoAno(ano: AnoHistoricoResponse, historico: HistoricoResponse): string {
  if (ano.situacao === "APROVADO") return "Aprovado";
  if (ano.situacao === "REPROVADO") return "Reprovado";
  if (ano.emCurso) return historico.aluno.matriculado ? "Cursando" : "Desmatriculado";
  return "Sem resultado";
}

/** Agrupa anos consecutivos na mesma unidade: "6º Ano ao 8º Ano · 2024–2026". */
function estabelecimentos(anos: AnoHistoricoResponse[]) {
  const blocos: { inicio: AnoHistoricoResponse; fim: AnoHistoricoResponse }[] = [];
  anos.forEach((ano) => {
    const ultimo = blocos[blocos.length - 1];
    if (
      ultimo &&
      ultimo.fim.unidade === ano.unidade &&
      ultimo.fim.anoLetivo + 1 === ano.anoLetivo
    ) {
      ultimo.fim = ano;
    } else {
      blocos.push({ inicio: ano, fim: ano });
    }
  });
  return blocos.map(({ inicio, fim }) => ({
    series: inicio === fim ? inicio.serie : `${inicio.serie} ao ${fim.serie}`,
    anos: inicio === fim ? String(inicio.anoLetivo) : `${inicio.anoLetivo}–${fim.anoLetivo}`,
    unidade: inicio.unidade,
  }));
}

const celula: CSSProperties = { padding: "4px", textAlign: "center" };

const FolhaHistorico = forwardRef<HTMLDivElement, FolhaHistoricoProps>(function FolhaHistorico(
  { historico, opcoes },
  ref,
) {
  const { aluno } = historico;
  const casas = historico.casasDecimais ?? 1;
  const indices = historico.anos
    .map((ano, i) => ({ ano, i }))
    .filter(({ ano }) => opcoes.anoEmCurso || !ano.emCurso);
  const temParcial = indices.some(({ ano }) => ano.emCurso);
  const colunas = `1.7fr repeat(${Math.max(indices.length, 1)}, minmax(0,1fr))`;
  const subColunas = opcoes.cargaHoraria ? "1fr 1fr" : "1fr";
  const linhaBase: CSSProperties = {
    display: "grid",
    gridTemplateColumns: colunas,
    borderTop: `1px solid ${COR.bordaLeve}`,
    fontSize: 11,
  };
  const linhaResumo: CSSProperties = {
    ...linhaBase,
    borderTop: `1px solid ${COR.borda}`,
    fontWeight: 600,
    background: COR.fundoLeve,
  };

  const linhasResumo: {
    nome: string;
    valor: (ano: AnoHistoricoResponse) => string;
    numero?: boolean;
  }[] = [
    {
      nome: "Carga horária anual",
      valor: (a) => `${a.cargaHoraria} h${a.emCurso ? "*" : ""}`,
      numero: true,
    },
    { nome: "Frequência", valor: (a) => formatarPercentual(a.frequencia), numero: true },
    { nome: "Resultado final", valor: (a) => resultadoAno(a, historico) },
  ];

  const observacoes = [
    !aluno.matriculado && aluno.dataDesmatricula
      ? `Aluno(a) desmatriculado(a) em ${formatarData(aluno.dataDesmatricula)}${
          aluno.motivoDesmatricula ? ` — ${aluno.motivoDesmatricula}` : ""
        }.`
      : null,
    opcoes.observacao.trim() || null,
    "Documento expedido nos termos da Lei nº 9.394/96 (LDB).",
  ].filter((o): o is string => !!o);

  let areaAnterior: string | null = null;

  return (
    <FolhaDocumento
      ref={ref}
      {...cabecalhoEscola(historico.escola)}
      titulo="Histórico escolar"
      subtitulo={aluno.serie ? `Série atual: ${aluno.serie}` : "Componentes cursados na escola"}
      identificacao={[
        { rotulo: "Aluno", valor: aluno.nome, largo: true },
        { rotulo: "Matrícula", valor: aluno.matricula ?? "—" },
        { rotulo: "Data de nascimento", valor: formatarData(aluno.dataNascimento) },
        { rotulo: "Naturalidade", valor: aluno.naturalidade ?? "—" },
        { rotulo: "CPF", valor: aluno.cpf ?? "—" },
      ]}
      observacoes={observacoes}
      assinaturas={opcoes.assinaturas ? assinaturasPadrao(historico.emitidoPor) : null}
      rodape={rodapeEmissao(historico.emitidoEm, historico.emitidoPor)}
    >
      {indices.length === 0 ? (
        <div
          style={{
            padding: "16px",
            border: `1px dashed ${COR.borda}`,
            borderRadius: 6,
            color: COR.rotulo,
            textAlign: "center",
          }}
        >
          Nenhum ano letivo com notas ou frequência registradas para este aluno.
        </div>
      ) : (
        <>
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
              <span style={{ padding: "7px 10px", alignSelf: "end" }}>Componente curricular</span>
              {indices.map(({ ano }) => (
                <span
                  key={ano.anoLetivo}
                  style={{
                    borderLeft: `1px solid ${COR.borda}`,
                    display: "flex",
                    flexDirection: "column",
                  }}
                >
                  <span style={{ padding: "6px 6px 4px", textAlign: "center" }}>
                    {ano.serie} · {ano.anoLetivo}
                  </span>
                  {opcoes.cargaHoraria && (
                    <span
                      style={{
                        display: "grid",
                        gridTemplateColumns: "1fr 1fr",
                        borderTop: "1px solid #D7DEEA",
                        fontSize: 9,
                        color: COR.rotulo,
                      }}
                    >
                      <span style={{ padding: 3, textAlign: "center" }}>Nota</span>
                      <span
                        style={{ padding: 3, textAlign: "center", borderLeft: "1px solid #D7DEEA" }}
                      >
                        CH
                      </span>
                    </span>
                  )}
                </span>
              ))}
            </div>

            {historico.componentes.map((c) => {
              const novaArea = c.area !== areaAnterior;
              areaAnterior = c.area;
              return (
                <Fragment key={c.nome}>
                  {novaArea && (
                    <div
                      data-row
                      style={{
                        borderTop: `1px solid ${COR.bordaLeve}`,
                        background: COR.fundoLeve,
                        padding: "3px 10px",
                        fontSize: 9,
                        fontWeight: 600,
                        color: COR.rotulo,
                        textTransform: "uppercase",
                        letterSpacing: "0.06em",
                      }}
                    >
                      {c.area}
                    </div>
                  )}
                  <div data-row style={linhaBase}>
                    <span style={{ padding: "4px 10px" }}>{c.nome}</span>
                    {indices.map(({ ano, i }) => {
                      const nota = c.anos[i];
                      const cursou = nota?.cargaHoraria != null;
                      const texto = cursou
                        ? `${formatarNota(nota.nota, casas)}${ano.emCurso && nota.nota != null ? "*" : ""}`
                        : "—";
                      return (
                        <span
                          key={ano.anoLetivo}
                          style={{
                            borderLeft: `1px solid ${COR.bordaLeve}`,
                            display: "grid",
                            gridTemplateColumns: subColunas,
                            ...estiloNumero,
                          }}
                        >
                          <span
                            style={{
                              ...celula,
                              ...(texto === "—" ? { color: COR.apagado } : {}),
                              ...(ano.emCurso
                                ? { color: COR.secundario, fontStyle: "italic" }
                                : {}),
                            }}
                          >
                            {texto}
                          </span>
                          {opcoes.cargaHoraria && (
                            <span
                              style={{
                                ...celula,
                                borderLeft: "1px solid #EEF2F6",
                                color: cursou ? COR.secundario : COR.apagado,
                              }}
                            >
                              {cursou ? nota.cargaHoraria : "—"}
                            </span>
                          )}
                        </span>
                      );
                    })}
                  </div>
                </Fragment>
              );
            })}

            {linhasResumo.map((linha) => (
              <div key={linha.nome} data-row style={linhaResumo}>
                <span style={{ padding: "4px 10px" }}>{linha.nome}</span>
                {indices.map(({ ano }) => (
                  <span
                    key={ano.anoLetivo}
                    style={{
                      ...celula,
                      borderLeft: `1px solid ${COR.bordaLeve}`,
                      ...(linha.numero ? estiloNumero : {}),
                    }}
                  >
                    {linha.valor(ano)}
                  </span>
                ))}
              </div>
            ))}
          </TabelaFolha>

          <div style={{ fontSize: 10, color: COR.secundario }}>
            {temParcial && "* Ano em curso: notas parciais, média dos períodos já lançados. "}
            {historico.notaAprovacao != null &&
              `Média mínima para aprovação: ${formatarNota(historico.notaAprovacao, casas)}`}
            {historico.frequenciaMinima != null &&
              ` · Frequência mínima: ${historico.frequenciaMinima}%.`}
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            <span style={estiloTituloSecao}>Estabelecimentos de ensino cursados</span>
            <TabelaFolha>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1.2fr 0.8fr 2fr",
                  background: COR.cabecalho,
                  fontSize: 10,
                  fontWeight: 600,
                  color: "#334155",
                }}
              >
                <span style={{ padding: "6px 10px" }}>Série</span>
                <span style={{ padding: "6px 10px" }}>Ano(s)</span>
                <span style={{ padding: "6px 10px" }}>Estabelecimento</span>
              </div>
              {estabelecimentos(historico.anos).map((e) => (
                <div
                  key={e.anos}
                  data-row
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1.2fr 0.8fr 2fr",
                    borderTop: `1px solid ${COR.bordaLeve}`,
                    fontSize: 11,
                  }}
                >
                  <span style={{ padding: "5px 10px" }}>{e.series}</span>
                  <span style={{ padding: "5px 10px", ...estiloNumero }}>{e.anos}</span>
                  <span style={{ padding: "5px 10px" }}>
                    {[historico.escola.nome, e.unidade].filter(Boolean).join(" — ")}
                  </span>
                </div>
              ))}
            </TabelaFolha>
          </div>
        </>
      )}
    </FolhaDocumento>
  );
});

export default FolhaHistorico;
