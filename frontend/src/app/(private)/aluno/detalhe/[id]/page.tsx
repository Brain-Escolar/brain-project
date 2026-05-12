"use client";

import PageTitle from "@/components/pageTitle/pageTitle";
import { useAluno } from "@/hooks/useAluno";
import { useAlunoFichaMedica } from "@/hooks/useAlunoFichaMedica";
import { useAuth } from "@/hooks/useAuth";
import { RoutesEnum } from "@/enums/RoutesEnum";
import { UserRoleEnum } from "@/enums/UserRoleEnum";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import PersonIcon from "@mui/icons-material/Person";
import EditIcon from "@mui/icons-material/Edit";
import {
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  Container,
  Divider,
  IconButton,
  Skeleton,
  Typography,
} from "@mui/material";
import { useParams, useRouter } from "next/navigation";
import * as S from "./styles";

function InfoField({ label, value }: { label: string; value?: string | null }) {
  return (
    <S.FieldItem>
      <div className="field-label">{label}</div>
      <div className="field-value">{value || "—"}</div>
    </S.FieldItem>
  );
}

export default function AlunoDetalhePage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();

  const alunoId = params.id as string;
  const { aluno, loading, error } = useAluno(alunoId);
  const { fichaMedica, loading: loadingFicha } = useAlunoFichaMedica(alunoId);

  const isAdmin = user?.role === UserRoleEnum.ADMIN;

  const handleGoBack = () => router.back();

  const handleEdit = () => {
    router.push(`${RoutesEnum.ALUNO_CADASTRO}?id=${alunoId}`);
  };

  const formatDate = (date?: string | null) => {
    if (!date) return "—";
    try {
      return new Date(date).toLocaleDateString("pt-BR");
    } catch {
      return date;
    }
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Navegação */}
      <Box sx={{ mb: 2, display: "flex", alignItems: "center", gap: 1 }}>
        <IconButton onClick={handleGoBack} size="small">
          <ArrowBackIcon fontSize="small" />
        </IconButton>
        <Typography variant="body2" color="text.secondary">
          Voltar
        </Typography>
      </Box>

      <Box sx={{ mb: 3, display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <PageTitle
          title={loading ? "Carregando..." : aluno?.nome ?? "Detalhe do Aluno"}
          description="Informações completas do aluno"
        />
        {isAdmin && !loading && aluno && (
          <Button
            variant="outlined"
            startIcon={<EditIcon />}
            onClick={handleEdit}
            size="small"
          >
            Editar
          </Button>
        )}
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      <S.PageLayout>
        {/* ─── Sidebar / Perfil ─── */}
        <S.ProfileCard>
          <S.ProfileHeader>
            <S.AvatarWrapper>
              <PersonIcon />
            </S.AvatarWrapper>

            <S.ProfileInfo>
              {loading ? (
                <>
                  <Skeleton variant="text" width={140} />
                  <Skeleton variant="text" width={100} />
                </>
              ) : (
                <>
                  <div className="nome">{aluno?.nomeSocial || aluno?.nome || "—"}</div>
                  <div className="matricula">RA: {aluno?.matricula ?? "—"}</div>
                </>
              )}
            </S.ProfileInfo>

            {loading ? (
              <Skeleton variant="rounded" width={90} height={24} />
            ) : (
              <Chip
                label={aluno?.matriculado ? "Matriculado" : "Não matriculado"}
                color={aluno?.matriculado ? "success" : "default"}
                size="small"
              />
            )}
          </S.ProfileHeader>

          <S.ProfileItem>
            <span className="label">CPF</span>
            <span className="value">
              {loading ? <Skeleton variant="text" width={90} /> : (aluno?.cpf ?? "—")}
            </span>
          </S.ProfileItem>

          <S.ProfileItem>
            <span className="label">RG</span>
            <span className="value">
              {loading ? <Skeleton variant="text" width={80} /> : (aluno?.rg ?? "—")}
            </span>
          </S.ProfileItem>

          <S.ProfileItem>
            <span className="label">E-mail</span>
            <span className="value">
              {loading ? <Skeleton variant="text" width={120} /> : (aluno?.email ?? "—")}
            </span>
          </S.ProfileItem>

          <S.ProfileItem>
            <span className="label">Nascimento</span>
            <span className="value">
              {loading ? (
                <Skeleton variant="text" width={90} />
              ) : (
                formatDate(aluno?.dataDeNascimento)
              )}
            </span>
          </S.ProfileItem>
        </S.ProfileCard>

        {/* ─── Conteúdo principal ─── */}
        <Box>
          {/* Dados do Aluno */}
          <S.SectionCard>
            <S.SectionHeader>
              <h4>Dados do Aluno</h4>
            </S.SectionHeader>
            <S.SectionBody>
              {loading ? (
                <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
                  <CircularProgress />
                </Box>
              ) : (
                <S.FieldGrid>
                  <InfoField label="Nome completo" value={aluno?.nome} />
                  <InfoField label="Nome social" value={aluno?.nomeSocial} />
                  <InfoField label="Data de nascimento" value={formatDate(aluno?.dataDeNascimento)} />
                  <InfoField label="CPF" value={aluno?.cpf} />
                  <InfoField label="RG" value={aluno?.rg} />
                  <InfoField label="Cor/Raça" value={aluno?.corRaca} />
                  <InfoField label="Gênero" value={aluno?.genero} />
                  <InfoField label="E-mail" value={aluno?.email} />
                  <InfoField label="Cidade/Naturalidade" value={aluno?.cidadeNaturalidade} />
                </S.FieldGrid>
              )}

              {!loading && aluno?.endereco && (
                <>
                  <Divider sx={{ my: 2 }} />
                  <Typography
                    variant="caption"
                    fontWeight={600}
                    color="text.secondary"
                    sx={{ textTransform: "uppercase", letterSpacing: 0.5, display: "block", mb: 2 }}
                  >
                    Endereço
                  </Typography>
                  <S.FieldGrid>
                    <InfoField label="CEP" value={aluno.endereco.cep} />
                    <InfoField label="Logradouro" value={aluno.endereco.logradouro} />
                    <InfoField label="Número" value={aluno.endereco.numero} />
                    <InfoField label="Complemento" value={aluno.endereco.complemento} />
                    <InfoField label="Bairro" value={aluno.endereco.bairro} />
                    <InfoField label="Cidade" value={aluno.endereco.cidade} />
                    <InfoField label="UF" value={aluno.endereco.uf} />
                  </S.FieldGrid>
                </>
              )}
            </S.SectionBody>
          </S.SectionCard>

          {/* Ficha Médica */}
          <S.SectionCard>
            <S.SectionHeader>
              <h4>Ficha Médica</h4>
            </S.SectionHeader>
            <S.SectionBody>
              {loadingFicha ? (
                <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
                  <CircularProgress />
                </Box>
              ) : fichaMedica ? (
                <S.FieldGrid>
                  <InfoField label="Tipo sanguíneo" value={fichaMedica.tipoSanguineo} />
                  <InfoField label="Necessidades especiais" value={fichaMedica.necessidadesEspeciais} />
                  <InfoField label="Doenças respiratórias" value={fichaMedica.doencasRespiratorias} />
                  <InfoField label="Alergias alimentares" value={fichaMedica.alergiasAlimentares} />
                  <InfoField label="Alergias medicamentosas" value={fichaMedica.alergiasMedicamentosas} />
                </S.FieldGrid>
              ) : (
                <Typography variant="body2" color="text.secondary">
                  Nenhuma ficha médica cadastrada para este aluno.
                </Typography>
              )}
            </S.SectionBody>
          </S.SectionCard>
        </Box>
      </S.PageLayout>
    </Container>
  );
}
