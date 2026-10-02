"use client";

import { useState } from "react";
import AccessibilityNewOutlinedIcon from "@mui/icons-material/AccessibilityNewOutlined";
import AddRoundedIcon from "@mui/icons-material/AddRounded";
import AirOutlinedIcon from "@mui/icons-material/AirOutlined";
import BloodtypeOutlinedIcon from "@mui/icons-material/BloodtypeOutlined";
import DescriptionOutlinedIcon from "@mui/icons-material/DescriptionOutlined";
import DownloadRoundedIcon from "@mui/icons-material/DownloadRounded";
import MedicationOutlinedIcon from "@mui/icons-material/MedicationOutlined";
import RestaurantOutlinedIcon from "@mui/icons-material/RestaurantOutlined";
import VaccinesOutlinedIcon from "@mui/icons-material/VaccinesOutlined";
import { Box, Button, CircularProgress } from "@mui/material";

import Badge from "@/components/badge";
import FileUploadArea from "@/components/fileUploadArea";
import KpiCard from "@/components/kpiCard";
import LoadingComponent from "@/components/loadingComponent/loadingComponent";
import PageScaffold from "@/components/pageScaffold/PageScaffold";
import BrainResultNotFound from "@/components/resultNotFound/resultNotFound";
import { useAlunoSelecionado } from "@/contexts/AlunoSelecionadoContext";
import { useFichaMedicaAluno } from "@/hooks/useFichaMedicaAluno";
import { usePermissoes } from "@/hooks/usePermissoes";
import { LaudoResponse, MedicacaoResponse } from "@/services/domains/responsavel-portal";
import ModalAdicionarMedicacao from "./components/ModalAdicionarMedicacao";
import { useFichaMedicaResponsavelMutations } from "./useFichaMedicaResponsavelMutations";
import * as S from "./styles";

function formatarData(iso: string | null): string | null {
  if (!iso) return null;
  const [ano, mes, dia] = iso.split("-").map(Number);
  if (!ano || !mes || !dia) return null;
  return `${String(dia).padStart(2, "0")}/${String(mes).padStart(2, "0")}/${ano}`;
}

function calcularIdade(iso: string | null): number | null {
  if (!iso) return null;
  const [ano, mes, dia] = iso.split("-").map(Number);
  if (!ano || !mes || !dia) return null;
  const hoje = new Date();
  let idade = hoje.getFullYear() - ano;
  const aindaNaoFezAniversario =
    hoje.getMonth() + 1 < mes || (hoje.getMonth() + 1 === mes && hoje.getDate() < dia);
  if (aindaNaoFezAniversario) idade -= 1;
  return idade >= 0 ? idade : null;
}

function formatarTamanho(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}

function CardCampo({
  icone,
  rotulo,
  valor,
}: {
  icone: React.ReactNode;
  rotulo: string;
  valor: string | null;
}) {
  const preenchido = !!valor && valor.trim().length > 0;
  return (
    <S.Card>
      <S.CardTopo>
        {icone}
        <S.CardRotulo>{rotulo}</S.CardRotulo>
      </S.CardTopo>
      {preenchido ? (
        <S.CardValor>{valor}</S.CardValor>
      ) : (
        <S.CardVazio>Nada registrado pela escola.</S.CardVazio>
      )}
    </S.Card>
  );
}

function LinhaMedicacao({ medicacao }: { medicacao: MedicacaoResponse }) {
  return (
    <S.Linha>
      <Box sx={{ minWidth: 0 }}>
        <S.LinhaNome>{medicacao.nome}</S.LinhaNome>
        <S.LinhaMeta>
          {medicacao.dosagem && <Badge $tone="primary">{medicacao.dosagem}</Badge>}
          {medicacao.horario && <span>{medicacao.horario}</span>}
        </S.LinhaMeta>
        {medicacao.observacao && <S.LinhaObs>{medicacao.observacao}</S.LinhaObs>}
      </Box>
    </S.Linha>
  );
}

function LinhaLaudo({ laudo }: { laudo: LaudoResponse }) {
  return (
    <S.Linha>
      <Box sx={{ minWidth: 0 }}>
        <S.LinhaNome>{laudo.nome}</S.LinhaNome>
        <S.LinhaMeta>
          <span>{formatarTamanho(laudo.tamanho)}</span>
        </S.LinhaMeta>
      </Box>
      <S.LinkArquivo href={laudo.downloadUrl} target="_blank" rel="noreferrer">
        <DownloadRoundedIcon />
        Baixar
      </S.LinkArquivo>
    </S.Linha>
  );
}

export default function FichaMedicaResponsavelPage() {
  const { alunoAtual, alunoId, isLoading: carregandoAlunos } = useAlunoSelecionado();
  const { ficha, loading, error } = useFichaMedicaAluno();
  const { incluirNaFichaMedica: podeIncluir } = usePermissoes();
  const { anexarLaudo } = useFichaMedicaResponsavelMutations(alunoId);

  const [modalAberto, setModalAberto] = useState(false);
  const [arquivo, setArquivo] = useState<File | null>(null);

  if (carregandoAlunos || loading) return <LoadingComponent />;
  if (!alunoAtual) {
    return <BrainResultNotFound message="Nenhum aluno vinculado ao seu cadastro." />;
  }
  if (error) {
    return (
      <BrainResultNotFound message="Não foi possível carregar a ficha médica deste aluno." />
    );
  }

  // ficha === null: o aluno ainda não tem ficha criada. A tela aparece vazia,
  // com as ações de escrita — que criam a ficha na primeira inclusão.
  const medicacoes = ficha?.medicacoes ?? [];
  const laudos = ficha?.laudos ?? [];

  const nomeAluno = alunoAtual.nomeSocial || alunoAtual.nome || "";
  const primeiroNome = nomeAluno.split(" ")[0];
  const nascimento = formatarData(ficha?.dataDeNascimento ?? null);
  const idade = calcularIdade(ficha?.dataDeNascimento ?? null);

  const descricao = [
    nascimento && `Nascimento ${nascimento}`,
    idade != null && `${idade} anos`,
    [alunoAtual.serie, alunoAtual.turma].filter(Boolean).join(" ") || null,
  ]
    .filter(Boolean)
    .join(" · ");

  async function handleEnviarLaudo() {
    if (!arquivo) return;
    await anexarLaudo.mutateAsync(arquivo);
    setArquivo(null);
  }

  return (
    <PageScaffold title={`Ficha médica de ${primeiroNome}`} description={descricao}>
      <S.KpiGrid>
        <KpiCard
          rotulo="Tipo sanguíneo"
          valor={ficha?.tipoSanguineo ?? "–"}
          icone={<BloodtypeOutlinedIcon />}
          tone="error"
        />
        <KpiCard
          rotulo="Medicações em uso"
          valor={medicacoes.length}
          icone={<MedicationOutlinedIcon />}
          tone="primary"
        />
        <KpiCard
          rotulo="Laudos anexados"
          valor={laudos.length}
          icone={<DescriptionOutlinedIcon />}
          tone="info"
        />
      </S.KpiGrid>

      <S.SecaoTitulo>Alergias e condições</S.SecaoTitulo>
      <S.CardGrid>
        <CardCampo
          icone={<RestaurantOutlinedIcon />}
          rotulo="Alergias alimentares"
          valor={ficha?.alergiasAlimentares ?? null}
        />
        <CardCampo
          icone={<VaccinesOutlinedIcon />}
          rotulo="Alergias medicamentosas"
          valor={ficha?.alergiasMedicamentosas ?? null}
        />
        <CardCampo
          icone={<AirOutlinedIcon />}
          rotulo="Doenças respiratórias"
          valor={ficha?.doencasRespiratorias ?? null}
        />
        <CardCampo
          icone={<AccessibilityNewOutlinedIcon />}
          rotulo="Necessidades especiais"
          valor={ficha?.necessidadesEspeciais ?? null}
        />
      </S.CardGrid>

      <S.SecaoTopo>
        <S.SecaoTitulo>Medicações em uso</S.SecaoTitulo>
        {podeIncluir && (
          <Button
            variant="contained"
            startIcon={<AddRoundedIcon />}
            onClick={() => setModalAberto(true)}
          >
            Adicionar medicação
          </Button>
        )}
      </S.SecaoTopo>

      {medicacoes.length === 0 ? (
        <BrainResultNotFound message="Nenhuma medicação registrada." />
      ) : (
        <S.Lista>
          {medicacoes.map((m) => (
            <LinhaMedicacao key={m.id} medicacao={m} />
          ))}
        </S.Lista>
      )}

      <S.SecaoTitulo>Laudos</S.SecaoTitulo>

      {laudos.length === 0 ? (
        <BrainResultNotFound message="Nenhum laudo anexado." />
      ) : (
        <S.Lista>
          {laudos.map((l) => (
            <LinhaLaudo key={l.id} laudo={l} />
          ))}
        </S.Lista>
      )}

      {podeIncluir && (
        <Box sx={{ mt: 2, display: "flex", flexDirection: "column", gap: 1.5 }}>
          <FileUploadArea
            files={arquivo ? [arquivo] : []}
            onChange={(files) => setArquivo(files[files.length - 1] ?? null)}
            multiple={false}
            label="Clique para selecionar o laudo"
          />
          <Box sx={{ display: "flex", justifyContent: "flex-end" }}>
            <Button
              variant="contained"
              onClick={handleEnviarLaudo}
              disabled={!arquivo || anexarLaudo.isPending}
              startIcon={anexarLaudo.isPending ? <CircularProgress size={16} /> : undefined}
            >
              {anexarLaudo.isPending ? "Enviando..." : "Enviar laudo"}
            </Button>
          </Box>
        </Box>
      )}

      <S.Nota>
        Esta é a ficha que a escola mantém. Você pode acrescentar medicações e anexar laudos — ao
        anexar um laudo, a Orientação Educacional é avisada. Para corrigir tipo sanguíneo, alergias
        ou qualquer outro campo, fale com a secretaria.
      </S.Nota>

      <ModalAdicionarMedicacao
        open={modalAberto}
        alunoId={alunoId}
        nomeAluno={primeiroNome}
        onClose={() => setModalAberto(false)}
      />
    </PageScaffold>
  );
}
