"use client";
import {
  mapFormDataToProfessorPostRequest,
  mapFormDataToProfessorPutRequest,
  mapProfessorResponseToFormData,
} from "@/app/(private)/professor/professorUtils";
import { useProfessorMutations } from "@/app/(private)/professor/useProfessorMutations";
import * as S from "@/app/(private)/professor/styles";
import BrainButtonPrimary from "@/components/brainButtons/brainButtonPrimary/brainButtonPrimary";
import BrainButtonSecondary from "@/components/brainButtons/brainButtonSecondary/brainButtonSecondary";
import { BrainDateTextControlled } from "@/components/brainForms/brainDateTextControlled";
import { BrainDropdownControlled } from "@/components/brainForms/brainDropdownControlled";
import BrainFormProvider from "@/components/brainForms/brainFormProvider/brainFormProvider";
import { BrainMultiSelectControlled } from "@/components/brainForms/brainMultiSelectControlled";
import { BrainTextCEPControlled } from "@/components/brainForms/brainTextCEPControlled";
import { BrainTextCPFControlled } from "@/components/brainForms/brainTextCPFControlled";
import { BrainTextFieldControlled } from "@/components/brainForms/brainTextFieldControlled";
import { BrainTextPhoneControlled } from "@/components/brainForms/brainTextPhoneControlled";
import { BrainTextRGControlled } from "@/components/brainForms/brainTextRGControlled";
import ContainerSection from "@/components/containerSection/containerSection";
import PageTitle from "@/components/pageTitle/pageTitle";
import { ProtectedRoute } from "@/components/ProtectedRoute/ProtectedRoute";
import { UserRoleEnum } from "@/enums";
import { useBrainForm } from "@/hooks/useBrainForm";
import { useBrainSearchParams } from "@/hooks/useBrainSearchParams";
import { useDisciplinas } from "@/hooks/useDisciplinas";
import { useProfessor } from "@/hooks/useProfessor";
import { buscarCep } from "@/services/cep";
import { KeyValue } from "@/services/models/keyValue";
import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";
import UploadFileIcon from "@mui/icons-material/UploadFile";
import PersonOffIcon from "@mui/icons-material/PersonOff";
import {
  Alert,
  Box,
  Button,
  Checkbox,
  CircularProgress,
  Container,
  FormControlLabel,
  FormHelperText,
  IconButton,
  Typography,
} from "@mui/material";
import { useRouter } from "next/navigation";
import { Suspense, useCallback, useEffect, useRef, useState } from "react";
import { Controller, useFieldArray } from "react-hook-form";
import { toast } from "react-toastify";
import {
  dependenteDefaultValues,
  professorDefaultValues,
  ProfessorFormData,
  professorSchema,
} from "./schema";

// ─── Opções de select ────────────────────────────────────────────────────────

const OPTIONS_UF: KeyValue[] = [
  { key: "AC", value: "AC" }, { key: "AL", value: "AL" }, { key: "AP", value: "AP" },
  { key: "AM", value: "AM" }, { key: "BA", value: "BA" }, { key: "CE", value: "CE" },
  { key: "DF", value: "DF" }, { key: "ES", value: "ES" }, { key: "GO", value: "GO" },
  { key: "MA", value: "MA" }, { key: "MT", value: "MT" }, { key: "MS", value: "MS" },
  { key: "MG", value: "MG" }, { key: "PA", value: "PA" }, { key: "PB", value: "PB" },
  { key: "PR", value: "PR" }, { key: "PE", value: "PE" }, { key: "PI", value: "PI" },
  { key: "RJ", value: "RJ" }, { key: "RN", value: "RN" }, { key: "RS", value: "RS" },
  { key: "RO", value: "RO" }, { key: "RR", value: "RR" }, { key: "SC", value: "SC" },
  { key: "SP", value: "SP" }, { key: "SE", value: "SE" }, { key: "TO", value: "TO" },
];

const OPTIONS_GENDER: KeyValue[] = [
  { key: "masculino", value: "Masculino" },
  { key: "feminino", value: "Feminino" },
  { key: "nao_binario", value: "Não-binário" },
  { key: "outro", value: "Outro" },
  { key: "prefiro_nao_informar", value: "Prefiro não informar" },
];

const OPTIONS_COR_RACA: KeyValue[] = [
  { key: "branca", value: "Branca" },
  { key: "preta", value: "Preta" },
  { key: "parda", value: "Parda" },
  { key: "amarela", value: "Amarela" },
  { key: "indigena", value: "Indígena" },
  { key: "nao_declarado", value: "Não declarado" },
];

const OPTIONS_TIPO_CONTA: KeyValue[] = [
  { key: "conta_corrente", value: "Conta Corrente" },
  { key: "conta_poupanca", value: "Conta Poupança" },
  { key: "conta_salario", value: "Conta Salário" },
];

const OPTIONS_PARENTESCO: KeyValue[] = [
  { key: "filho", value: "Filho(a)" },
  { key: "conjugue", value: "Cônjuge" },
  { key: "pai", value: "Pai" },
  { key: "mae", value: "Mãe" },
  { key: "outro", value: "Outro" },
];

const OPTIONS_ESCOLARIDADE: KeyValue[] = [
  { key: "fundamental_incompleto", value: "Ensino Fundamental Incompleto" },
  { key: "fundamental_completo", value: "Ensino Fundamental Completo" },
  { key: "medio_incompleto", value: "Ensino Médio Incompleto" },
  { key: "medio_completo", value: "Ensino Médio Completo" },
  { key: "tecnico", value: "Ensino Técnico" },
  { key: "superior_incompleto", value: "Superior Incompleto" },
  { key: "superior_completo", value: "Superior Completo" },
  { key: "pos_graduacao", value: "Pós-Graduação" },
  { key: "mestrado", value: "Mestrado" },
  { key: "doutorado", value: "Doutorado" },
];

const OPTIONS_ENQUADRAMENTO_HORA_AULA: KeyValue[] = [
  { key: "nivel_i", value: "Nível I — Licenciatura Plena" },
  { key: "nivel_ii", value: "Nível II — Especialização" },
  { key: "nivel_iii", value: "Nível III — Mestrado" },
  { key: "nivel_iv", value: "Nível IV — Doutorado" },
];

const MOCK_DISCIPLINAS: KeyValue[] = [
  { key: "1", value: "Matemática" },
  { key: "2", value: "Língua Portuguesa" },
  { key: "3", value: "Ciências" },
  { key: "4", value: "História" },
  { key: "5", value: "Geografia" },
  { key: "6", value: "Arte" },
  { key: "7", value: "Educação Física" },
  { key: "8", value: "Língua Inglesa" },
  { key: "9", value: "Filosofia" },
  { key: "10", value: "Sociologia" },
  { key: "11", value: "Química" },
  { key: "12", value: "Física" },
  { key: "13", value: "Biologia" },
];

// ─── Componentes internos ─────────────────────────────────────────────────────

interface DependenteRowProps {
  index: number;
  control: ProfessorFormContentProps["control"];
  onRemove: () => void;
}

function DependenteRow({ index, control, onRemove }: DependenteRowProps) {
  return (
    <Box
      sx={{
        display: "grid",
        gridTemplateColumns: "1fr 1fr 1fr 1fr auto",
        gap: 2,
        alignItems: "start",
        width: "100%",
        mb: 2,
      }}
    >
      <BrainTextFieldControlled
        name={`dependentes.${index}.nomeCompleto`}
        control={control}
        label="Nome Completo"
        placeholder="Nome completo"
      />
      <BrainTextCPFControlled
        name={`dependentes.${index}.cpf`}
        control={control}
        label="CPF"
      />
      <BrainDateTextControlled
        name={`dependentes.${index}.dataNascimento`}
        control={control}
        label="Data de Nascimento"
      />
      <BrainDropdownControlled
        name={`dependentes.${index}.parentesco`}
        control={control}
        label="Parentesco"
        options={OPTIONS_PARENTESCO}
        placeholder="Selecione"
      />
      <IconButton
        onClick={onRemove}
        color="error"
        sx={{ mt: 1 }}
        aria-label="Remover dependente"
      >
        <DeleteIcon />
      </IconButton>
    </Box>
  );
}

interface ExameUploadProps {
  fileName: string | null;
  onChange: (file: File | null) => void;
}

function ExameUpload({ fileName, onChange }: ExameUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0] ?? null;
    if (file && file.size > 5 * 1024 * 1024) {
      toast.error("O arquivo deve ter no máximo 5MB.");
      return;
    }
    onChange(file);
  }

  return (
    <S.UploadArea $hasFile={!!fileName} htmlFor="exame-admissional-upload">
      <input
        ref={inputRef}
        id="exame-admissional-upload"
        type="file"
        accept=".pdf,.jpg,.jpeg,.png"
        onChange={handleFileChange}
      />
      <UploadFileIcon sx={{ fontSize: 32, color: fileName ? "success.main" : "text.secondary" }} />
      {fileName ? (
        <>
          <strong>{fileName}</strong>
          <span>Clique para trocar o arquivo</span>
        </>
      ) : (
        <>
          <strong>Clique para anexar o exame admissional</strong>
          <span>PDF, JPG, PNG — máximo 5MB</span>
        </>
      )}
    </S.UploadArea>
  );
}

// ─── Tipos internos ───────────────────────────────────────────────────────────

interface ProfessorFormContentProps {
  control: ReturnType<typeof useBrainForm<ProfessorFormData>>["control"];
}

// ─── Página principal ─────────────────────────────────────────────────────────

function ProfessorPageContent() {
  const router = useRouter();
  const professorId = useBrainSearchParams("id");

  const { professor, loading: loadingProfessor, error: errorProfessor } = useProfessor(professorId);
  const { createProfessor, updateProfessor } = useProfessorMutations();
  const { disciplinas } = useDisciplinas();

  const isEditMode = !!professorId;

  const {
    control,
    handleSubmit,
    onFormSubmit,
    isSubmitting,
    reset,
    methodsHookForm,
    setValue,
    watch,
  } = useBrainForm<ProfessorFormData>({
    schema: professorSchema,
    defaultValues: professorDefaultValues,
    onSubmit: onSubmit,
    mode: "all",
  });

  const { fields: dependentesFields, append: appendDependente, remove: removeDependente } =
    useFieldArray({ control, name: "dependentes" });

  const [buscandoCep, setBuscandoCep] = useState(false);
  const [exameFileName, setExameFileName] = useState<string | null>(null);

  const watcherCepValue = watch("cep");
  const watchExameRealizado = watch("exameAdmissionalRealizado");

  const disciplinasOptions: KeyValue[] =
    disciplinas && disciplinas.length > 0
      ? disciplinas.map((d) => ({ key: String(d.id), value: d.nome }))
      : MOCK_DISCIPLINAS;

  useEffect(() => {
    if (professor && isEditMode) {
      const formData = mapProfessorResponseToFormData(professor);
      reset(formData);
      if (professor.exameAdmissionalRealizado) {
        setExameFileName("exame-admissional.pdf");
      }
    }
  }, [professor, isEditMode, reset]);

  const buscarEnderecoPorCep = useCallback(
    async (cepValue: string) => {
      if (cepValue && cepValue.length === 9) {
        setBuscandoCep(true);
        try {
          const dadosCep = await buscarCep(cepValue);
          if (dadosCep && !dadosCep.erro) {
            setValue("logradouro", dadosCep.logradouro, { shouldValidate: true });
            setValue("bairro", dadosCep.bairro, { shouldValidate: true });
            setValue("cidade", dadosCep.localidade, { shouldValidate: true });
            setValue("uf", dadosCep.uf, { shouldValidate: true });
            if (dadosCep.complemento) {
              setValue("complemento", dadosCep.complemento, { shouldValidate: true });
            }
          } else {
            toast.error("CEP não encontrado.");
          }
        } finally {
          setBuscandoCep(false);
        }
      }
    },
    [setValue],
  );

  useEffect(() => {
    buscarEnderecoPorCep(watcherCepValue);
  }, [watcherCepValue, buscarEnderecoPorCep]);

  async function onSubmit(data: ProfessorFormData) {
    try {
      if (isEditMode && professorId) {
        const professorData = mapFormDataToProfessorPutRequest(data, professorId);
        await updateProfessor.mutateAsync(professorData);
      } else {
        const professorData = mapFormDataToProfessorPostRequest(data);
        await createProfessor.mutateAsync(professorData);
      }
      router.push("/professor/lista");
    } catch (error) {
      console.error("Erro ao salvar professor:", error);
    }
  }

  function handleCancel() {
    router.push("/professor/lista");
  }

  const isSaving = createProfessor.isPending || updateProfessor.isPending;

  return (
    <ProtectedRoute allowedRoles={[UserRoleEnum.PROFESSOR]}>
      <Container maxWidth="lg" sx={{ py: 4 }}>
        {loadingProfessor && isEditMode ? (
          <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
            <CircularProgress />
          </Box>
        ) : errorProfessor && isEditMode ? (
          <Alert severity="error" sx={{ mb: 2 }}>
            {errorProfessor}
          </Alert>
        ) : (
          <>
            <PageTitle
              title={isEditMode ? "Editar Professor" : "Cadastro de Professor"}
              description="Preencha todos os dados necessários para o registro"
            />

            <BrainFormProvider
              methodsHookForm={methodsHookForm}
              onSubmit={handleSubmit(onFormSubmit)}
            >
              {/* ── Dados Pessoais ─────────────────────────────────────────── */}
              <ContainerSection
                title="Dados Pessoais"
                description="Informações pessoais e documentos do professor"
                numberOfCollumns={2}
              >
                {/* Nome Completo — largura total */}
                <Box sx={{ gridColumn: "1 / -1" }}>
                  <BrainTextFieldControlled
                    name="nomeCompleto"
                    control={control}
                    label="Nome Completo"
                    placeholder="Nome completo do professor"
                    required
                  />
                </Box>

                {/* Nome Social — largura total */}
                <Box sx={{ gridColumn: "1 / -1" }}>
                  <BrainTextFieldControlled
                    name="nomeSocial"
                    control={control}
                    label="Nome Social"
                    placeholder="Nome social (opcional)"
                  />
                </Box>

                {/* E-mail | Data de Nascimento */}
                <BrainTextFieldControlled
                  name="email"
                  control={control}
                  label="E-mail"
                  placeholder="email@exemplo.com"
                  type="email"
                  required
                />
                <BrainDateTextControlled
                  name="dataNascimento"
                  control={control}
                  label="Data de Nascimento"
                  required
                />

                {/* Gênero | Cor/Raça */}
                <BrainDropdownControlled
                  name="genero"
                  control={control}
                  label="Gênero"
                  required
                  options={OPTIONS_GENDER}
                  placeholder="Selecione o gênero"
                />
                <BrainDropdownControlled
                  name="corRaca"
                  control={control}
                  label="Cor/Raça"
                  required
                  options={OPTIONS_COR_RACA}
                  placeholder="Selecione a cor/raça"
                />

                {/* Cidade de Naturalidade | CPF */}
                <BrainTextFieldControlled
                  name="cidadeNaturalidade"
                  control={control}
                  label="Cidade de Naturalidade"
                  placeholder="Cidade onde nasceu"
                  required
                />
                <BrainTextCPFControlled
                  name="cpf"
                  control={control}
                  label="CPF"
                  required={true}
                />

                {/* RG | Carteira de Trabalho */}
                <BrainTextRGControlled
                  name="rg"
                  control={control}
                  label="RG"
                  required={true}
                />
                <BrainTextFieldControlled
                  name="carteiraTrabalho"
                  control={control}
                  label="Carteira de Trabalho"
                  placeholder="Número da CTPS"
                  required
                />

                {/* Título de Eleitor | PIS/PASEP */}
                <BrainTextFieldControlled
                  name="tituloEleitor"
                  control={control}
                  label="Título de Eleitor"
                  placeholder="0000 0000 0000"
                  required
                />
                <BrainTextFieldControlled
                  name="pisPasep"
                  control={control}
                  label="PIS/PASEP"
                  placeholder="000.00000.00-0"
                  required
                />
              </ContainerSection>

              {/* ── Endereço ───────────────────────────────────────────────── */}
              <ContainerSection
                title="Endereço"
                description="Endereço residencial do professor"
                numberOfCollumns={3}
              >
                {/* CEP com spinner de busca */}
                <Box sx={{ position: "relative" }}>
                  <BrainTextCEPControlled
                    name="cep"
                    control={control}
                    label="CEP"
                    required={true}
                  />
                  {buscandoCep && (
                    <Box
                      sx={{
                        position: "absolute",
                        right: 10,
                        top: "50%",
                        transform: "translateY(-50%)",
                      }}
                    >
                      <CircularProgress size={18} />
                    </Box>
                  )}
                </Box>

                <BrainTextFieldControlled
                  name="logradouro"
                  control={control}
                  label="Logradouro"
                  placeholder="Rua, avenida, etc."
                  required
                />
                <BrainTextFieldControlled
                  name="numero"
                  control={control}
                  label="Número"
                  placeholder="Número"
                  required
                />
                <BrainTextFieldControlled
                  name="complemento"
                  control={control}
                  label="Complemento"
                  placeholder="Apto, bloco, etc. (opcional)"
                />
                <BrainTextFieldControlled
                  name="bairro"
                  control={control}
                  label="Bairro"
                  placeholder="Bairro"
                  required
                />
                <BrainTextFieldControlled
                  name="cidade"
                  control={control}
                  label="Cidade"
                  placeholder="Cidade"
                  required
                />
                <BrainDropdownControlled
                  name="uf"
                  control={control}
                  label="UF"
                  required
                  options={OPTIONS_UF}
                  placeholder="UF"
                />
              </ContainerSection>

              {/* ── Contato ────────────────────────────────────────────────── */}
              <ContainerSection
                title="Contato"
                description="Informações de contato"
                numberOfCollumns={2}
              >
                <BrainTextPhoneControlled
                  name="telefone"
                  control={control}
                  label="Telefone"
                  placeholder="(00) 00000-0000"
                  required
                />
              </ContainerSection>

              {/* ── Disciplinas ────────────────────────────────────────────── */}
              <ContainerSection
                title="Disciplinas"
                description="Disciplinas que o professor leciona"
                numberOfCollumns={1}
              >
                <BrainMultiSelectControlled
                  name="disciplinaIds"
                  control={control}
                  label="Disciplinas"
                  options={disciplinasOptions}
                  placeholder="Selecione as disciplinas..."
                />
              </ContainerSection>

              {/* ── Dados Bancários ────────────────────────────────────────── */}
              <ContainerSection
                title="Dados Bancários (Opcional)"
                description="Informações bancárias para pagamento"
                numberOfCollumns={3}
              >
                <BrainTextFieldControlled
                  name="nomeBanco"
                  control={control}
                  label="Nome do Banco"
                  placeholder="Nome do banco"
                />
                <BrainDropdownControlled
                  name="tipoConta"
                  control={control}
                  label="Tipo de Conta"
                  options={OPTIONS_TIPO_CONTA}
                  placeholder="Tipo de conta"
                />
                <BrainTextFieldControlled
                  name="agencia"
                  control={control}
                  label="Agência"
                  placeholder="Agência"
                />
                <BrainTextFieldControlled
                  name="conta"
                  control={control}
                  label="Conta"
                  placeholder="00000-0"
                />
                <BrainTextFieldControlled
                  name="chavePix"
                  control={control}
                  label="Chave PIX"
                  placeholder="CPF, e-mail, telefone ou chave aleatória"
                />
              </ContainerSection>

              {/* ── Dependentes ────────────────────────────────────────────── */}
              <ContainerSection
                title="Dependentes"
                description="Adicione os dependentes do professor"
                numberOfCollumns={1}
              >
                {dependentesFields.length === 0 ? (
                  <S.EmptyDependentesContainer>
                    <PersonOffIcon sx={{ fontSize: 40, opacity: 0.4 }} />
                    <Typography variant="body2" color="text.secondary">
                      Nenhum dependente adicionado
                    </Typography>
                  </S.EmptyDependentesContainer>
                ) : (
                  dependentesFields.map((field, index) => (
                    <DependenteRow
                      key={field.id}
                      index={index}
                      control={control}
                      onRemove={() => removeDependente(index)}
                    />
                  ))
                )}

                <Button
                  variant="outlined"
                  startIcon={<AddIcon />}
                  onClick={() => appendDependente(dependenteDefaultValues)}
                  sx={{ alignSelf: "flex-start", mt: dependentesFields.length > 0 ? 0 : 2 }}
                >
                  Adicionar Dependente
                </Button>
              </ContainerSection>

              {/* ── Informações Profissionais ──────────────────────────────── */}
              <ContainerSection
                title="Informações Profissionais"
                description="Dados acadêmicos e profissionais"
                numberOfCollumns={2}
              >
                {/* Escolaridade | Enquadramento */}
                <BrainDropdownControlled
                  name="escolaridade"
                  control={control}
                  label="Escolaridade"
                  required
                  options={OPTIONS_ESCOLARIDADE}
                  placeholder="Selecione a escolaridade"
                />
                <BrainDropdownControlled
                  name="enquadramentoHoraAula"
                  control={control}
                  label="Enquadramento de Hora Aula"
                  required
                  options={OPTIONS_ENQUADRAMENTO_HORA_AULA}
                  placeholder="Selecione o enquadramento"
                />

                {/* Exame admissional — largura total */}
                <Box sx={{ gridColumn: "1 / -1" }}>
                  <Controller
                    name="exameAdmissionalRealizado"
                    control={control}
                    render={({ field }) => (
                      <FormControlLabel
                        control={
                          <Checkbox
                            {...field}
                            checked={field.value}
                            onChange={(e) => field.onChange(e.target.checked)}
                          />
                        }
                        label="Exame admissional realizado"
                      />
                    )}
                  />
                </Box>

                {/* Upload do exame (condicional) */}
                {watchExameRealizado && (
                  <Box sx={{ gridColumn: "1 / -1" }}>
                    <Typography variant="caption" color="text.secondary" sx={{ mb: 0.5, display: "block" }}>
                      Upload do Exame Admissional
                    </Typography>
                    <ExameUpload
                      fileName={exameFileName}
                      onChange={(file) => setExameFileName(file?.name ?? null)}
                    />
                  </Box>
                )}

                {/* Férias */}
                <BrainDateTextControlled
                  name="dataInicioFerias"
                  control={control}
                  label="Data de Início das Férias"
                />
                <BrainDateTextControlled
                  name="dataFimFerias"
                  control={control}
                  label="Data de Fim das Férias"
                />

                {/* Observações — largura total */}
                <Box sx={{ gridColumn: "1 / -1" }}>
                  <BrainTextFieldControlled
                    name="observacoesFerias"
                    control={control}
                    label="Observações sobre Férias"
                    placeholder="Observações adicionais"
                    multiline
                    rows={3}
                  />
                </Box>
              </ContainerSection>

              {/* ── Footer: LGPD + Ações ───────────────────────────────────── */}
              <Box sx={{ mt: 2 }}>
                <S.LgpdContainer>
                  <Controller
                    name="aceitoLgpd"
                    control={control}
                    render={({ field, fieldState: { error } }) => (
                      <>
                        <FormControlLabel
                          control={
                            <Checkbox
                              {...field}
                              checked={field.value}
                              onChange={(e) => field.onChange(e.target.checked)}
                            />
                          }
                          label={
                            <Typography variant="body2">
                              Aceito o{" "}
                              <strong>termo de consentimento LGPD</strong>
                              {" "}*
                            </Typography>
                          }
                        />
                        {error && (
                          <FormHelperText error sx={{ ml: 4 }}>
                            {error.message}
                          </FormHelperText>
                        )}
                      </>
                    )}
                  />
                </S.LgpdContainer>

                <S.FooterActions>
                  <BrainButtonSecondary onClick={handleCancel}>
                    Cancelar
                  </BrainButtonSecondary>
                  <BrainButtonPrimary
                    type="submit"
                    disabled={isSubmitting || isSaving}
                    isLoading={isSaving}
                  >
                    {isSaving ? "Salvando..." : "Salvar Professor"}
                  </BrainButtonPrimary>
                </S.FooterActions>
              </Box>
            </BrainFormProvider>
          </>
        )}
      </Container>
    </ProtectedRoute>
  );
}

export default function ProfessorPage() {
  return (
    <Suspense
      fallback={
        <Container maxWidth="lg" sx={{ py: 4 }}>
          <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
            <CircularProgress />
          </Box>
        </Container>
      }
    >
      <ProfessorPageContent />
    </Suspense>
  );
}
