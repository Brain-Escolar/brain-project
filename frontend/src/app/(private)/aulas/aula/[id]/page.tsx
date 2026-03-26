"use client";
import { ProtectedRoute } from "@/components/ProtectedRoute/ProtectedRoute";
import AulaDetailView from "@/components/aulaDetailView";
import { UserRoleEnum } from "@/enums";
import ConteudosTarefas from "@/components/aulaDetailView/conteudosTarefas/conteudosTarefas";
import ListaPresenca from "@/components/aulaDetailView/listaPresenca/listaPresenca";
import LayoutColumns from "@/components/layoutColumns/layoutColumns";
import PageTitle from "@/components/pageTitle/pageTitle";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
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

  // Pega o ID da URL para uso futuro
  const aulaId = params.id as string;
  const aula = {
    ...mockAulaDetail,
    titulo: `${mockAulaDetail.titulo} - Aula ${aulaId}`,
  };

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
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
    <ProtectedRoute allowedRoles={[UserRoleEnum.PROFESSOR, UserRoleEnum.ADMIN]}>
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Box sx={{ mb: 3, display: "flex", alignItems: "center", gap: 2 }}>
          <IconButton onClick={handleGoBack} size="small">
            <ArrowBackIcon />
          </IconButton>
          <Typography variant="body2" color="text.secondary">
            Página inicial
          </Typography>
        </Box>

        <PageTitle title={aula.titulo} />
        {/* Tabs */}
        <LayoutColumns sizeLeft="70%" sizeRight="30%">
          <Box>
            <DateSelector selectedDate={selectedDate} onDateChange={handleDateChange} />

            {!existeAulaNoDia ? (
              <BrainResultNotFound message={messageNaoExisteAulanoDia} />
            ) : (
              <>
                <Box sx={{ borderBottom: 1, borderColor: "divider", mb: 1 }}>
                  <Tabs value={activeTab} onChange={handleTabChange} variant="fullWidth">
                    <Tab label="⭐ Lista de Presença" />
                    <Tab label="⭐ Conteúdo e Tarefas" />
                    <Tab label="⭐ Registros Disciplinares" />
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

          {/* Visão geral - Seção lateral */}
          <SectionVisaoGeral existeAulaNoDia={existeAulaNoDia} />
        </LayoutColumns>
      </Container>
    </ProtectedRoute>
  );
}
