"use client";

import ContainerSection from "@/components/containerSection/containerSection";
import PageScaffold from "@/components/pageScaffold/PageScaffold";
import { useAluno } from "@/hooks/useAluno";
import { useAlunoFichaMedica } from "@/hooks/useAlunoFichaMedica";
import { useAlunoProdutos } from "@/hooks/useAlunoProdutos";
import { useAlunoAnotacoesMultiplasDisciplinas, AnotacaoComDisciplina } from "@/hooks/useAlunoAnotacoesMultiplasDisciplinas";
import { useNotasMultiplasDisciplinas, NotaComDisciplina } from "@/hooks/useNotasMultiplasDisciplinas";
import { useAlunoMatriculaMutations } from "@/hooks/useAlunoMatriculaMutations";
import { useDisciplinas } from "@/hooks/useDisciplinas";
import { useProfessorDisciplinas } from "@/hooks/useProfessorDisciplinas";
import { useUnidades } from "@/hooks/useUnidades";
import { useAuth } from "@/hooks/useAuth";
import { RoutesEnum } from "@/enums/RoutesEnum";
import { UserRoleEnum } from "@/enums/UserRoleEnum";
import { AlunoDetalheResponse, FichaMedicaAlunoResponse, ResponsavelResumoResponse } from "@/services/domains/aluno/response";
import { AlunoProdutoResponse } from "@/services/domains/produto/response";
import PersonIcon from "@mui/icons-material/Person";
import EditIcon from "@mui/icons-material/Edit";
import ApartmentIcon from "@mui/icons-material/Apartment";
import SchoolIcon from "@mui/icons-material/School";
import MeetingRoomIcon from "@mui/icons-material/MeetingRoom";
import BadgeIcon from "@mui/icons-material/Badge";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import WarningAmberIcon from "@mui/icons-material/WarningAmber";
import Inventory2Icon from "@mui/icons-material/Inventory2";
import {
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  Divider,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Tab,
  Tabs,
  Skeleton,
  Typography,
} from "@mui/material";
import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import * as S from "./styles";

// ─── Types ────────────────────────────────────────────────────────────────────

type TabKey = "geral" | "produtos";
type SecaoKey = "dadosCadastrais" | "responsaveis" | "ocorrencias" | "boletimResumo" | "fichaMedica";

// ─── Configuração por perfil ──────────────────────────────────────────────────

const PRODUTOS_ROLES: UserRoleEnum[] = [UserRoleEnum.ADMIN, UserRoleEnum.SECRETARIO];

const SECOES_POR_PERFIL: Record<UserRoleEnum, SecaoKey[]> = {
  [UserRoleEnum.PROFESSOR]: ["ocorrencias", "boletimResumo"],
  [UserRoleEnum.ADMIN]: ["dadosCadastrais", "responsaveis", "ocorrencias", "boletimResumo", "fichaMedica"],
  [UserRoleEnum.ESTUDANTE]: ["dadosCadastrais", "responsaveis", "ocorrencias", "boletimResumo", "fichaMedica"],
  [UserRoleEnum.SECRETARIO]: ["dadosCadastrais", "responsaveis", "ocorrencias", "boletimResumo", "fichaMedica"],
};

const LABEL_ABA: Record<TabKey, string> = {
  geral: "Visão geral",
  produtos: "Produtos e Contratos",
};

const SECAO_COLUNA_ESQUERDA: SecaoKey[] = ["dadosCadastrais", "responsaveis", "ocorrencias"];
const SECAO_COLUNA_DIREITA: SecaoKey[] = ["boletimResumo", "fichaMedica"];

// ─── Helpers ──────────────────────────────────────────────────────────────────

function iniciais(nome: string): string {
  const partes = nome.trim().split(/\s+/);
  const primeira = partes[0]?.[0] ?? "";
  const ultima = partes.length > 1 ? partes[partes.length - 1][0] : "";
  return (primeira + ultima).toUpperCase();
}

function formatBRL(valor: number): string {
  return valor.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

// ─── Componentes auxiliares ───────────────────────────────────────────────────

function TabPanel({ children, value, index }: { children?: React.ReactNode; index: number; value: number }) {
  return (
    <div role="tabpanel" hidden={value !== index} id={`aluno-tab-${index}`} aria-labelledby={`aluno-tab-${index}`}>
      {value === index && <Box sx={{ pt: 3 }}>{children}</Box>}
    </div>
  );
}

function InfoField({ label, value }: { label: string; value?: string | null }) {
  return (
    <S.FieldItem>
      <div className="field-label">{label}</div>
      <div className="field-value">{value || "—"}</div>
    </S.FieldItem>
  );
}

function CardLoading() {
  return (
    <Box sx={{ display: "flex", justifyContent: "center", py: 3 }}>
      <CircularProgress size={22} />
    </Box>
  );
}

// ─── Cards da aba "Visão geral" ───────────────────────────────────────────────

function DadosCadastraisCard({
  aluno, loading, formatDate,
}: {
  aluno: AlunoDetalheResponse | null | undefined;
  loading: boolean;
  formatDate: (d?: string | null) => string;
}) {
  return (
    <ContainerSection title="Dados cadastrais">
      {loading ? <CardLoading /> : (
        <>
          <S.FieldGrid>
            <InfoField label="Nome completo"       value={aluno?.nome} />
            <InfoField label="Nome social"         value={aluno?.nomeSocial} />
            <InfoField label="Data de nascimento"  value={formatDate(aluno?.dataDeNascimento)} />
            <InfoField label="CPF"                 value={aluno?.cpf} />
            <InfoField label="RG"                  value={aluno?.rg} />
            <InfoField label="Cor/Raça"            value={aluno?.corRaca} />
            <InfoField label="Gênero"              value={aluno?.genero} />
            <InfoField label="E-mail"              value={aluno?.email} />
            <InfoField label="Cidade/Naturalidade" value={aluno?.cidadeNaturalidade} />
          </S.FieldGrid>

          {aluno?.endereco && (
            <>
              <Divider sx={{ my: 3 }} />
              <Typography
                variant="caption" fontWeight={600} color="text.secondary"
                sx={{ textTransform: "uppercase", letterSpacing: 0.5, display: "block", mb: 2 }}
              >
                Endereço
              </Typography>
              <S.FieldGrid>
                <InfoField label="CEP"         value={aluno.endereco.cep} />
                <InfoField label="Logradouro"  value={aluno.endereco.logradouro} />
                <InfoField label="Número"      value={aluno.endereco.numero} />
                <InfoField label="Complemento" value={aluno.endereco.complemento} />
                <InfoField label="Bairro"      value={aluno.endereco.bairro} />
                <InfoField label="Cidade"      value={aluno.endereco.cidade} />
                <InfoField label="UF"          value={aluno.endereco.uf} />
              </S.FieldGrid>
            </>
          )}
        </>
      )}
    </ContainerSection>
  );
}

function ResponsaveisCard({
  responsaveis, loading,
}: {
  responsaveis: ResponsavelResumoResponse[] | undefined;
  loading: boolean;
}) {
  return (
    <ContainerSection title="Responsáveis">
      {loading ? <CardLoading /> : responsaveis && responsaveis.length > 0 ? (
        <S.ResponsavelList>
          {responsaveis.map((r) => (
            <S.ResponsavelRow key={r.id}>
              <S.InitialsAvatar>{iniciais(r.nome)}</S.InitialsAvatar>
              <div className="info">
                <span className="nome">{r.nome}</span>
                <span className="tel">{r.telefones[0] || "—"}</span>
              </div>
              {r.financeiro && <Chip label="Financeiro" size="small" color="primary" variant="outlined" />}
            </S.ResponsavelRow>
          ))}
        </S.ResponsavelList>
      ) : (
        <Typography variant="body2" color="text.secondary">Nenhum responsável cadastrado.</Typography>
      )}
    </ContainerSection>
  );
}

function OcorrenciasCard({
  anotacoes, loading,
}: {
  anotacoes: AnotacaoComDisciplina[];
  loading: boolean;
}) {
  return (
    <ContainerSection title="Ocorrências e anotações">
      {loading ? <CardLoading /> : anotacoes.length > 0 ? (
        <S.OcorrenciaList>
          {anotacoes.map((a, idx) => (
            <S.OcorrenciaRow key={idx}>
              <span className="data">{a.data ? new Date(a.data).toLocaleDateString("pt-BR") : "—"}</span>
              <div className="corpo">
                <span className="tipo">{a.disciplinaNome} · {a.tipoAnotacao}</span>
                <p>{a.observacao || "—"}</p>
              </div>
            </S.OcorrenciaRow>
          ))}
        </S.OcorrenciaList>
      ) : (
        <Typography variant="body2" color="text.secondary">Nenhuma ocorrência registrada pelos professores.</Typography>
      )}
    </ContainerSection>
  );
}

function BoletimResumoCard({
  notas, loading, onAbrirRelatorio,
}: {
  notas: NotaComDisciplina[];
  loading: boolean;
  onAbrirRelatorio: () => void;
}) {
  const mediaGeral = notas.length > 0
    ? notas.reduce((acc, n) => acc + n.pontuacao, 0) / notas.length
    : null;

  return (
    <ContainerSection title="Boletim">
      {loading ? <CardLoading /> : (
        <S.StatItem>
          <span className="value">{mediaGeral !== null ? mediaGeral.toFixed(1) : "—"}</span>
          <span className="label">Média geral</span>
        </S.StatItem>
      )}
      <Button
        size="small" onClick={onAbrirRelatorio} endIcon={<ChevronRightIcon fontSize="small" />}
        sx={{ alignSelf: "flex-start", mt: 1, textTransform: "none" }}
      >
        Abrir relatório completo
      </Button>
    </ContainerSection>
  );
}

function FichaMedicaResumoCard({
  fichaMedica, loading, onAbrirFicha,
}: {
  fichaMedica: FichaMedicaAlunoResponse | null | undefined;
  loading: boolean;
  onAbrirFicha: () => void;
}) {
  return (
    <ContainerSection title="Ficha médica">
      {loading ? <CardLoading /> : fichaMedica ? (
        <Typography variant="body2" color="text.secondary">
          Ficha preenchida — tipo sanguíneo {fichaMedica.tipoSanguineo || "não informado"}.
        </Typography>
      ) : (
        <Alert severity="warning" icon={<WarningAmberIcon fontSize="small" />} sx={{ py: 0.5 }}>
          Aluno ainda sem ficha médica.
        </Alert>
      )}
      <Button
        size="small" onClick={onAbrirFicha} endIcon={<ChevronRightIcon fontSize="small" />}
        sx={{ alignSelf: "flex-start", mt: 1.5, textTransform: "none" }}
      >
        Abrir ficha médica
      </Button>
    </ContainerSection>
  );
}

// ─── Aba "Produtos e Contratos" ───────────────────────────────────────────────

function ProdutosPanel({
  produtos, loading, formatDate,
}: {
  produtos: AlunoProdutoResponse[];
  loading: boolean;
  formatDate: (d?: string | null) => string;
}) {
  if (loading) return <CardLoading />;

  if (produtos.length === 0) {
    return (
      <S.EmptyState>
        <Inventory2Icon fontSize="large" />
        <Typography variant="body1" fontWeight={600}>Nenhum produto contratado</Typography>
        <Typography variant="body2" color="text.secondary">
          Ainda não há produtos ou modalidades registrados para este aluno.
        </Typography>
      </S.EmptyState>
    );
  }

  return (
    <ContainerSection title="Produtos e serviços contratados">
      <Table size="small">
        <TableHead>
          <TableRow>
            <TableCell>Produto</TableCell>
            <TableCell>Modalidade</TableCell>
            <TableCell align="right">Valor</TableCell>
            <TableCell align="right">Desconto</TableCell>
            <TableCell align="right">Valor pago</TableCell>
            <TableCell>Data da compra</TableCell>
            <TableCell>Situação</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {produtos.map((p) => (
            <TableRow key={p.id}>
              <TableCell>{p.produtoNome}</TableCell>
              <TableCell>{p.modalidade}</TableCell>
              <TableCell align="right">{formatBRL(p.valorOriginal)}</TableCell>
              <TableCell align="right">{formatBRL(p.desconto)}</TableCell>
              <TableCell align="right">{formatBRL(p.valorPago)}</TableCell>
              <TableCell>{formatDate(p.dataCompra)}</TableCell>
              <TableCell>
                <Chip
                  label={p.status === "ATIVO" ? "Ativo" : "Cancelado"}
                  color={p.status === "ATIVO" ? "success" : "default"}
                  size="small"
                />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </ContainerSection>
  );
}

// ─── Página ───────────────────────────────────────────────────────────────────

export default function AlunoDetalhePage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();

  const alunoId = params.id as string;
  const role = user?.role ?? UserRoleEnum.ADMIN;
  const isAdmin = role === UserRoleEnum.ADMIN;
  const secoesDoRole = SECOES_POR_PERFIL[role] ?? SECOES_POR_PERFIL[UserRoleEnum.ADMIN];
  const temProdutos = PRODUTOS_ROLES.includes(role);
  const abasDoRole: TabKey[] = ["geral", ...(temProdutos ? (["produtos"] as TabKey[]) : [])];

  const { aluno, loading, error } = useAluno(alunoId);
  const precisaFichaMedica = secoesDoRole.includes("fichaMedica");
  const { fichaMedica, loading: loadingFicha } = useAlunoFichaMedica(alunoId, !!user && precisaFichaMedica);
  const { produtos, loading: loadingProdutos } = useAlunoProdutos(alunoId, !!user && temProdutos);
  const { disciplinas: todasDisciplinas } = useDisciplinas();
  const { disciplinas: disciplinasProfessor } = useProfessorDisciplinas();
  const disciplinas = role === UserRoleEnum.PROFESSOR ? disciplinasProfessor : todasDisciplinas;
  const { unidades } = useUnidades();
  const unidadeNome = unidades.find((u) => u.id === aluno?.unidadeId)?.nome;
  const { matricular, desmatricular } = useAlunoMatriculaMutations(alunoId);

  const [activeTab, setActiveTab] = useState(0);

  const { notas: todasNotas, loading: loadingNotas } = useNotasMultiplasDisciplinas(alunoId, disciplinas);
  const { anotacoes: todasAnotacoes, loading: loadingAnotacoes } = useAlunoAnotacoesMultiplasDisciplinas(alunoId, disciplinas);

  const formatDate = (date?: string | null) => {
    if (!date) return "—";
    try { return new Date(date).toLocaleDateString("pt-BR"); } catch { return date; }
  };

  const SECAO_MAP: Record<SecaoKey, React.ReactNode> = {
    dadosCadastrais: <DadosCadastraisCard aluno={aluno} loading={loading} formatDate={formatDate} />,
    responsaveis: <ResponsaveisCard responsaveis={aluno?.responsaveis} loading={loading} />,
    ocorrencias: <OcorrenciasCard anotacoes={todasAnotacoes} loading={loadingAnotacoes} />,
    boletimResumo: <BoletimResumoCard notas={todasNotas} loading={loadingNotas} onAbrirRelatorio={() => router.push(RoutesEnum.RELATORIOS)} />,
    fichaMedica: <FichaMedicaResumoCard fichaMedica={fichaMedica} loading={loadingFicha} onAbrirFicha={() => router.push(RoutesEnum.FICHA_MEDICA_LISTA)} />,
  };

  const colunaEsquerda = SECAO_COLUNA_ESQUERDA.filter((k) => secoesDoRole.includes(k));
  const colunaDireita = SECAO_COLUNA_DIREITA.filter((k) => secoesDoRole.includes(k));

  const PAINEL_MAP: Record<TabKey, React.ReactNode> = {
    geral: (
      <S.TwoColumnGrid>
        {colunaEsquerda.length > 0 && (
          <div className="col">
            {colunaEsquerda.map((k) => <Box key={k}>{SECAO_MAP[k]}</Box>)}
          </div>
        )}
        {colunaDireita.length > 0 && (
          <div className="col">
            {colunaDireita.map((k) => <Box key={k}>{SECAO_MAP[k]}</Box>)}
          </div>
        )}
      </S.TwoColumnGrid>
    ),
    produtos: <ProdutosPanel produtos={produtos} loading={loadingProdutos} formatDate={formatDate} />,
  };

  return (
    <PageScaffold
      title={loading ? "Carregando..." : aluno?.nome ?? "Detalhe do Aluno"}
      description="Informações completas do aluno"
      actions={
        isAdmin && !loading && aluno ? (
          <Box sx={{ display: "flex", gap: 1 }}>
            <Button variant="outlined" startIcon={<EditIcon />} onClick={() => router.push(`${RoutesEnum.ALUNO_CADASTRO}?id=${alunoId}`)} size="small">
              Editar
            </Button>
            {aluno.matriculado ? (
              <Button variant="outlined" color="error" size="small" onClick={() => desmatricular.mutate(undefined)} disabled={desmatricular.isPending}>
                {desmatricular.isPending ? "Desmatriculando..." : "Desmatricular"}
              </Button>
            ) : (
              <Button variant="contained" color="success" size="small" onClick={() => matricular.mutate()} disabled={matricular.isPending}>
                {matricular.isPending ? "Matriculando..." : "Matricular"}
              </Button>
            )}
          </Box>
        ) : undefined
      }
    >
      {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}

      <S.PageStack>
        <S.ProfileHeaderCard>
          <S.InitialsAvatar $large>
            {loading || !aluno ? <PersonIcon /> : iniciais(aluno.nome)}
          </S.InitialsAvatar>

          <S.ProfileHeaderInfo>
            {loading ? (
              <>
                <Skeleton variant="text" width={200} height={32} />
                <Skeleton variant="text" width={280} />
              </>
            ) : (
              <>
                <div className="nome-linha">
                  <span className="nome">{aluno?.nomeSocial || aluno?.nome || "—"}</span>
                  <Chip
                    label={aluno?.matriculado ? "Matriculado" : "Não matriculado"}
                    color={aluno?.matriculado ? "success" : "default"}
                    size="small"
                  />
                </div>
                <S.ProfileMetaRow>
                  <span><ApartmentIcon fontSize="small" />{unidadeNome || "—"}</span>
                  <span><SchoolIcon fontSize="small" />{aluno?.serieNome || "—"}</span>
                  <span><MeetingRoomIcon fontSize="small" />{aluno?.turmaNome || "Sem turma"}</span>
                  <span className="mono"><BadgeIcon fontSize="small" />{aluno?.matricula || "—"}</span>
                </S.ProfileMetaRow>
              </>
            )}
          </S.ProfileHeaderInfo>
        </S.ProfileHeaderCard>

        <Box>
          <Box sx={{ borderBottom: 1, borderColor: "divider", mb: 0 }}>
            <Tabs value={activeTab} onChange={(_e, v) => setActiveTab(v)}>
              {abasDoRole.map((aba, i) => (
                <Tab key={aba} label={LABEL_ABA[aba]} id={`aluno-tab-${i}`} sx={{ textTransform: "none" }} />
              ))}
            </Tabs>
          </Box>

          {abasDoRole.map((aba, i) => (
            <TabPanel key={aba} value={activeTab} index={i}>
              {PAINEL_MAP[aba]}
            </TabPanel>
          ))}
        </Box>
      </S.PageStack>
    </PageScaffold>
  );
}
