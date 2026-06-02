"use client";
import ConteudosTarefas from "@/components/aulaDetailView/conteudosTarefas/conteudosTarefas";
import ListaPresenca from "@/components/aulaDetailView/listaPresenca/listaPresenca";
import RegistrosDisciplinares from "@/components/aulaDetailView/registrosDisciplinares/registrosDisciplinares";
import ContainerSection from "@/components/containerSection/containerSection";
import PageScaffold from "@/components/pageScaffold/PageScaffold";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import StarIcon from "@mui/icons-material/Star";
import { Box, IconButton, Skeleton, Tab, Tabs, Typography } from "@mui/material";
import { useParams, useRouter } from "next/navigation";
import { useState } from "react";
import { useBrainSearchParams } from "@/hooks/useBrainSearchParams";
import { format } from "date-fns";
import SectionVisaoGeral from "./sectionVisaoGeral/sectionVisaoGeral";
import { useAulaDetalhe } from "@/hooks/useAulaDetalhe";
import { useProximaAula } from "@/hooks/useProximaAula";
import * as S from "./styles";

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ py: 2 }}>{children}</Box>}
    </div>
  );
}

export default function AulaDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState(0);

  const aulaId = params.id as string;
  const dataParam = useBrainSearchParams("data");
  const dataOcorrencia = dataParam ?? format(new Date(), "yyyy-MM-dd");
  const { aula, loading, error } = useAulaDetalhe(aulaId);
  const { proximaAula, loading: loadingProxima } = useProximaAula(aulaId, dataOcorrencia);

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  const handleGoBack = () => {
    router.back();
  };

  return (
    <PageScaffold
      title={
        loading
          ? "Carregando..."
          : aula
            ? `${aula.disciplina} — ${aula.serie} ${aula.turma}`
            : "Detalhe da Aula"
      }
      description="Gerencie a presença, conteúdos e registros disciplinares desta aula."
    >
      <Box sx={{ mb: 2, display: "flex", alignItems: "center", gap: 1 }}>
        <IconButton onClick={handleGoBack} size="small">
          <ArrowBackIcon fontSize="small" />
        </IconButton>
        <Typography variant="body2" color="text.secondary">
          Pagina inicial
        </Typography>
      </Box>

      {error && (
        <Typography color="error" sx={{ mb: 2 }}>
          {error}
        </Typography>
      )}

      <S.PageLayout>
        {/* Coluna Principal */}
        <ContainerSection title="Atividades da Aula">
          <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
            <Tabs value={activeTab} onChange={handleTabChange} variant="fullWidth">
              <Tab
                icon={<StarIcon fontSize="small" />}
                iconPosition="start"
                label="Lista de Presença"
              />
              <Tab
                icon={<StarIcon fontSize="small" />}
                iconPosition="start"
                label="Conteúdo e Tarefas"
              />
              <Tab
                icon={<StarIcon fontSize="small" />}
                iconPosition="start"
                label="Registros Disciplinares"
              />
            </Tabs>
          </Box>

          <TabPanel value={activeTab} index={0}>
            <ListaPresenca idAula={aulaId} data={dataOcorrencia} />
          </TabPanel>
          <TabPanel value={activeTab} index={1}>
            <ConteudosTarefas aulaId={aulaId} turmaId={aula?.turmaId} data={dataOcorrencia} />
          </TabPanel>
          <TabPanel value={activeTab} index={2}>
            <RegistrosDisciplinares aulaId={aulaId} data={dataOcorrencia} />
          </TabPanel>
        </ContainerSection>

        {/* Sidebar */}
        <S.SidebarCard>
          <S.SidebarHeader>
            <h4>Informações da Aula</h4>
          </S.SidebarHeader>

          <S.ResumoItem>
            <span className="resumo-label">Horário</span>
            <span className="resumo-value">
              {loading ? (
                <Skeleton variant="text" width={100} />
              ) : aula ? (
                `${aula.horarioInicio} - ${aula.horarioFim}`
              ) : (
                "—"
              )}
            </span>
          </S.ResumoItem>

          <S.ResumoItem>
            <span className="resumo-label">Sala</span>
            <span className="resumo-value">
              {loading ? <Skeleton variant="text" width={80} /> : (aula?.sala ?? "—")}
            </span>
          </S.ResumoItem>

          <S.ResumoItem>
            <span className="resumo-label">Série / Turma</span>
            <span className="resumo-value">
              {loading ? (
                <Skeleton variant="text" width={80} />
              ) : aula ? (
                `${aula.serie} ${aula.turma}`
              ) : (
                "—"
              )}
            </span>
          </S.ResumoItem>

          <S.ResumoItem>
            <span className="resumo-label">Próxima Aula</span>
            <span className="resumo-value">
              {loadingProxima ? (
                <Skeleton variant="text" width={120} />
              ) : proximaAula ? (
                `${proximaAula.data} · ${proximaAula.horarioInicio.slice(0, 5)} - ${proximaAula.horarioFim.slice(0, 5)}`
              ) : (
                "—"
              )}
            </span>
          </S.ResumoItem>

          <SectionVisaoGeral aulaId={aulaId} data={dataOcorrencia} />
        </S.SidebarCard>
      </S.PageLayout>
    </PageScaffold>
  );
}
