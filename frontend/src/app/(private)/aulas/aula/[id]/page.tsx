"use client";
import AulaDetailView from "@/components/aulaDetailView";
import ConteudosTarefas from "@/components/aulaDetailView/conteudosTarefas/conteudosTarefas";
import ListaPresenca from "@/components/aulaDetailView/listaPresenca/listaPresenca";
import LayoutColumns from "@/components/layoutColumns/layoutColumns";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import PlaceIcon from "@mui/icons-material/Place";
import TagIcon from "@mui/icons-material/Tag";
import StarIcon from "@mui/icons-material/Star";
import { Box, Container, IconButton, Tab, Tabs, Typography } from "@mui/material";
import { useParams, useRouter } from "next/navigation";
import { useState } from "react";
import { mockAulaDetail } from "../../../../../mocks/aulaDetail";
import SectionVisaoGeral from "./sectionVisaoGeral/sectionVisaoGeral";
import DateSelector from "@/components/dateSelector";
import { useAulas } from "@/hooks/useAulas";
import { formatDateForAPI } from "@/utils/utilsDate";
import BrainResultNotFound from "@/components/resultNotFound/resultNotFound";

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
      {value === index && <Box sx={{ py: 3 }}>{children}</Box>}
    </div>
  );
}

export default function AulaDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState(0);
  const [selectedDate, setSelectedDate] = useState<Date>(() => new Date());
  const { aulas } = useAulas({
    data: formatDateForAPI(selectedDate),
  });

  const aulaId = params.id as string;
  const aula = mockAulaDetail;

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };
  const handleDateChange = (date: Date) => {
    setSelectedDate(date);
  };

  const handleGoBack = () => {
    router.back();
  };

  const existeAulaNoDia = aulas && aulas.length > 0;
  const messageNaoExisteAulanoDia = "Não foi encontrada nenhuma aula para a data selecionada.";
  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Breadcrumb */}
      <Box sx={{ mb: 2, display: "flex", alignItems: "center", gap: 1 }}>
        <IconButton onClick={handleGoBack} size="small">
          <ArrowBackIcon fontSize="small" />
        </IconButton>
        <Typography variant="body2" color="text.secondary">
          Pagina inicial
        </Typography>
      </Box>

      {/* Header: Titulo + Info da aula */}
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          mb: 3,
        }}
      >
        <Typography variant="h5" fontWeight="bold">
          {aula.titulo}
        </Typography>

        <Box sx={{ display: "flex", alignItems: "center", gap: 3 }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
            <AccessTimeIcon fontSize="small" color="action" />
            <Typography variant="body2" color="text.secondary">
              {aula.horario}
            </Typography>
          </Box>
          <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
            <PlaceIcon fontSize="small" color="action" />
            <Typography variant="body2" color="text.secondary">
              {aula.sala}
            </Typography>
          </Box>
          <Typography variant="body2" color="text.secondary">
            {aula.unidade}
          </Typography>
          <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
            <TagIcon fontSize="small" color="action" />
            <Typography variant="body2" color="text.secondary">
              {aula.numeroEstudantes} estudantes
            </Typography>
          </Box>
        </Box>
      </Box>

      <LayoutColumns sizeLeft="70%" sizeRight="30%">
        <Box>
          <DateSelector selectedDate={selectedDate} onDateChange={handleDateChange} />

          {!existeAulaNoDia ? (
            <BrainResultNotFound message={messageNaoExisteAulanoDia} />
          ) : (
            <>
              <Box sx={{ borderBottom: 1, borderColor: "divider", mb: 1 }}>
                <Tabs value={activeTab} onChange={handleTabChange} variant="fullWidth">
                  <Tab
                    icon={<StarIcon fontSize="small" />}
                    iconPosition="start"
                    label="Lista de Presenca"
                  />
                  <Tab
                    icon={<StarIcon fontSize="small" />}
                    iconPosition="start"
                    label="Conteudo e Tarefas"
                  />
                  <Tab
                    icon={<StarIcon fontSize="small" />}
                    iconPosition="start"
                    label="Registros Disciplinares"
                  />
                </Tabs>
              </Box>

              <TabPanel value={activeTab} index={0}>
                <ListaPresenca idAula={aulaId} />
              </TabPanel>
              <TabPanel value={activeTab} index={1}>
                <ConteudosTarefas />
              </TabPanel>
              <TabPanel value={activeTab} index={2}>
                <AulaDetailView type="registros" data={aula.registros} />
              </TabPanel>
            </>
          )}
        </Box>

        {/* Visao geral - Secao lateral */}
        <SectionVisaoGeral existeAulaNoDia={existeAulaNoDia} />
      </LayoutColumns>
    </Container>
  );
}
