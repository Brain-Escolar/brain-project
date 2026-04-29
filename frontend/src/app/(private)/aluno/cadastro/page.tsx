"use client";
import { RoutesEnum } from "@/enums";
import {
  mapFormDataToAlunoPostRequest,
  mapFormDataToAlunoPutRequest,
  mapAlunoResponseToFormData,
} from "@/app/(private)/aluno/alunoUtils";
import { useAlunoMutations } from "@/app/(private)/aluno/useAlunoMutations";
import BrainButtonPrimary from "@/components/brainButtons/brainButtonPrimary/brainButtonPrimary";
import BrainButtonSecondary from "@/components/brainButtons/brainButtonSecondary/brainButtonSecondary";
import { BrainDateTextControlled } from "@/components/brainForms/brainDateTextControlled";
import { BrainDropdownControlled } from "@/components/brainForms/brainDropdownControlled";
import BrainFormProvider from "@/components/brainForms/brainFormProvider/brainFormProvider";
import { BrainTextCEPControlled } from "@/components/brainForms/brainTextCEPControlled";
import { BrainTextCPFControlled } from "@/components/brainForms/brainTextCPFControlled";
import { BrainTextFieldControlled } from "@/components/brainForms/brainTextFieldControlled";
import { BrainTextRGControlled } from "@/components/brainForms/brainTextRGControlled";
import { BrainTextPhoneControlled } from "@/components/brainForms/brainTextPhoneControlled";
import { useBrainForm } from "@/hooks/useBrainForm";
import { useAluno } from "@/hooks/useAluno";
import { buscarCep } from "@/services/cep";
import { KeyValue } from "@/services/models/keyValue";
import {
  Alert,
  Box,
  Button,
  Checkbox,
  Chip,
  CircularProgress,
  FormControlLabel,
  IconButton,
  Paper,
  Stack,
  Typography,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import CakeIcon from "@mui/icons-material/Cake";
import ContactPhoneIcon from "@mui/icons-material/ContactPhone";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import FamilyRestroomIcon from "@mui/icons-material/FamilyRestroom";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import MailOutlineIcon from "@mui/icons-material/MailOutline";
import PersonIcon from "@mui/icons-material/Person";
import PlaceIcon from "@mui/icons-material/Place";
import SaveIcon from "@mui/icons-material/Save";
import { useRouter } from "next/navigation";
import { Suspense, useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "react-toastify";
import { useFieldArray } from "react-hook-form";
import type { Control } from "react-hook-form";
import { alunoDefaultValues, AlunoFormData, alunoSchema } from "../schema";
import { useBrainSearchParams } from "@/hooks/useBrainSearchParams";

const MAX_RESPONSAVEIS = 5;

const OPTIONS_UF: KeyValue[] = [
  "AC",
  "AL",
  "AP",
  "AM",
  "BA",
  "CE",
  "DF",
  "ES",
  "GO",
  "MA",
  "MT",
  "MS",
  "MG",
  "PA",
  "PB",
  "PR",
  "PE",
  "PI",
  "RJ",
  "RN",
  "RS",
  "RO",
  "RR",
  "SC",
  "SP",
  "SE",
  "TO",
].map((uf) => ({ key: uf, value: uf }));

const OPTIONS_GENDER: KeyValue[] = [
  { key: "masculino", value: "Masculino" },
  { key: "feminino", value: "Feminino" },
  { key: "outro", value: "Outro" },
];

const OPTIONS_COR_RACA: KeyValue[] = [
  { key: "branca", value: "Branca" },
  { key: "preta", value: "Preta" },
  { key: "parda", value: "Parda" },
  { key: "amarela", value: "Amarela" },
  { key: "indigena", value: "Indígena" },
  { key: "outro", value: "Outro" },
];

function SectionCard({
  icon,
  title,
  action,
  children,
}: {
  icon: React.ReactNode;
  title: string;
  action?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <Paper
      variant="outlined"
      sx={{
        borderRadius: 3,
        borderColor: "#F3F4F6",
        boxShadow: "0px 1px 3px 0px rgba(0,0,0,0.1), 0px 1px 2px 0px rgba(0,0,0,0.1)",
        p: 3,
      }}
    >
      <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 3 }}>
        <Stack direction="row" alignItems="center" spacing={1}>
          <Box sx={{ color: "#101828", display: "flex" }}>{icon}</Box>
          <Typography variant="h6" sx={{ fontWeight: 600, color: "#101828", fontSize: 18 }}>
            {title}
          </Typography>
        </Stack>
        {action}
      </Stack>
      {children}
    </Paper>
  );
}

function calcularIdade(dataBR: string): number | null {
  if (!dataBR || !/^\d{2}\/\d{2}\/\d{4}$/.test(dataBR)) return null;
  const [dia, mes, ano] = dataBR.split("/").map(Number);
  const nasc = new Date(ano, mes - 1, dia);
  if (Number.isNaN(nasc.getTime())) return null;
  const hoje = new Date();
  let idade = hoje.getFullYear() - nasc.getFullYear();
  const m = hoje.getMonth() - nasc.getMonth();
  if (m < 0 || (m === 0 && hoje.getDate() < nasc.getDate())) idade--;
  return idade >= 0 ? idade : null;
}

function TelefonesArray({
  control,
  name,
}: {
  control: Control<AlunoFormData>;
  name: "telefones" | `responsaveis.${number}.telefones`;
}) {
  const { fields, append, remove } = useFieldArray({ control, name });

  return (
    <Stack spacing={1.5}>
      {fields.map((field, index) => (
        <Stack key={field.id} direction="row" spacing={1} alignItems="flex-start">
          <Box sx={{ flex: 1 }}>
            <BrainTextPhoneControlled
              name={`${name}.${index}.value` as const}
              control={control}
              label={`Telefone ${index + 1}`}
              required
            />
          </Box>
          {fields.length > 1 && (
            <IconButton
              aria-label="Remover telefone"
              onClick={() => remove(index)}
              sx={{ mt: 2.5 }}
            >
              <DeleteOutlineIcon fontSize="small" />
            </IconButton>
          )}
        </Stack>
      ))}
      <Box>
        <Button
          variant="outlined"
          size="small"
          startIcon={<AddIcon />}
          onClick={() => append({ value: "" })}
          sx={{
            borderColor: "#BEDBFF",
            backgroundColor: "#EFF6FF",
            color: "#155DFC",
            textTransform: "none",
            fontWeight: 500,
            "&:hover": { backgroundColor: "#dbeafe", borderColor: "#BEDBFF" },
          }}
        >
          Adicionar telefone
        </Button>
      </Box>
    </Stack>
  );
}

function ResponsavelCard({
  index,
  control,
  onRemove,
  onCopiarEnderecoAluno,
  buscandoCep,
}: {
  index: number;
  control: Control<AlunoFormData>;
  onRemove: () => void;
  onCopiarEnderecoAluno: (index: number) => void;
  buscandoCep: boolean;
}) {
  const { watch, setValue } = useBrainFormCtx();
  const financeiro = watch(`responsaveis.${index}.financeiro`) ?? false;
  const mesmoEndereco = watch(`responsaveis.${index}.mesmoEnderecoAluno`) ?? false;

  useEffect(() => {
    if (mesmoEndereco) onCopiarEnderecoAluno(index);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mesmoEndereco]);

  return (
    <Box
      sx={{
        borderRadius: 2.5,
        border: "2px solid #E5E7EB",
        backgroundColor: "rgba(249,250,251,0.5)",
        p: 3,
      }}
    >
      <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 2 }}>
        <Stack direction="row" alignItems="center" spacing={1}>
          <Typography sx={{ fontWeight: 600, fontSize: 18, color: "#101828" }}>
            Responsável {index + 1}
          </Typography>
          {financeiro && (
            <Chip
              label="Financeiro"
              size="small"
              sx={{
                backgroundColor: "#DCFCE7",
                color: "#008236",
                fontWeight: 600,
                fontSize: 12,
                height: 22,
              }}
            />
          )}
        </Stack>
        <IconButton aria-label="Remover responsável" onClick={onRemove} size="small">
          <DeleteOutlineIcon fontSize="small" />
        </IconButton>
      </Stack>

      <Stack spacing={2}>
        <BrainTextFieldControlled
          name={`responsaveis.${index}.nomeResponsavel`}
          control={control}
          label="Nome"
          placeholder="Nome completo do responsável"
          required
        />

        <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" }, gap: 2 }}>
          <BrainTextCPFControlled
            name={`responsaveis.${index}.cpfResponsavel`}
            control={control}
            label="CPF"
            required
          />
          <BrainDateTextControlled
            name={`responsaveis.${index}.dataNascimentoResponsavel`}
            control={control}
            label="Data de Nascimento"
            required
          />
        </Box>

        <BrainTextFieldControlled
          name={`responsaveis.${index}.emailResponsavel`}
          control={control}
          label="E-mail"
          placeholder="exemplo@email.com"
          type="email"
          required
        />

        <Stack spacing={1}>
          <Typography sx={{ fontSize: 14, fontWeight: 500, color: "#364153" }}>
            Telefones
          </Typography>
          <TelefonesArray control={control} name={`responsaveis.${index}.telefones`} />
        </Stack>

        <Box
          sx={{
            border: "1px solid #E5E7EB",
            borderRadius: 2.5,
            backgroundColor: "white",
            px: 1.75,
            py: 1,
          }}
        >
          <FormControlLabel
            control={
              <Checkbox
                checked={financeiro}
                onChange={(e) =>
                  setValue(`responsaveis.${index}.financeiro`, e.target.checked, {
                    shouldValidate: true,
                  })
                }
              />
            }
            label={
              <Typography sx={{ fontSize: 14, fontWeight: 500, color: "#364153" }}>
                Responsável Financeiro
              </Typography>
            }
          />
        </Box>

        <Box
          sx={{
            border: "1px solid #E5E7EB",
            borderRadius: 2.5,
            backgroundColor: "white",
            px: 1.75,
            py: 1,
          }}
        >
          <FormControlLabel
            control={
              <Checkbox
                checked={mesmoEndereco}
                onChange={(e) =>
                  setValue(`responsaveis.${index}.mesmoEnderecoAluno`, e.target.checked, {
                    shouldValidate: true,
                  })
                }
              />
            }
            label={
              <Typography sx={{ fontSize: 14, fontWeight: 500, color: "#364153" }}>
                Mesmo endereço do aluno
              </Typography>
            }
          />
        </Box>

        {!mesmoEndereco && (
          <Stack spacing={2}>
            <Typography
              sx={{ fontSize: 14, fontWeight: 600, color: "#101828", letterSpacing: 0.7 }}
            >
              ENDEREÇO DO RESPONSÁVEL
            </Typography>
            <Box
              sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" }, gap: 2 }}
            >
              <Box sx={{ position: "relative" }}>
                <BrainTextCEPControlled
                  name={`responsaveis.${index}.cep`}
                  control={control}
                  label="CEP"
                  required
                />
                {buscandoCep && (
                  <Box sx={{ position: "absolute", right: 10, top: "50%" }}>
                    <CircularProgress size={18} />
                  </Box>
                )}
              </Box>
              <BrainTextFieldControlled
                name={`responsaveis.${index}.numero`}
                control={control}
                label="Número"
                required
              />
            </Box>
            <BrainTextFieldControlled
              name={`responsaveis.${index}.logradouro`}
              control={control}
              label="Logradouro"
              required
            />
            <BrainTextFieldControlled
              name={`responsaveis.${index}.complemento`}
              control={control}
              label="Complemento"
              placeholder="Apto, bloco, etc. (opcional)"
            />
            <Box
              sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" }, gap: 2 }}
            >
              <BrainTextFieldControlled
                name={`responsaveis.${index}.bairro`}
                control={control}
                label="Bairro"
                required
              />
              <BrainTextFieldControlled
                name={`responsaveis.${index}.cidade`}
                control={control}
                label="Cidade"
                required
              />
            </Box>
            <Box sx={{ maxWidth: { md: "50%" } }}>
              <BrainDropdownControlled
                name={`responsaveis.${index}.uf`}
                control={control}
                label="UF"
                options={OPTIONS_UF}
                placeholder="UF"
                required
              />
            </Box>
          </Stack>
        )}
      </Stack>
    </Box>
  );
}

function PreviewPanel({ data }: { data: AlunoFormData }) {
  const idade = calcularIdade(data.dataNascimento);
  const responsaveis = data.responsaveis ?? [];
  const financeiro = responsaveis.find((r) => r.financeiro);
  const temAluno = !!data.nomeCompleto || !!data.email;

  return (
    <Paper
      variant="outlined"
      sx={{
        borderRadius: 3,
        borderColor: "#F3F4F6",
        boxShadow: "0px 10px 15px -3px rgba(0,0,0,0.1), 0px 4px 6px -4px rgba(0,0,0,0.1)",
        position: "sticky",
        top: 24,
        overflow: "hidden",
      }}
    >
      <Box
        sx={{
          backgroundColor: "#F9FAFB",
          borderBottom: "1px solid #F3F4F6",
          px: 3,
          py: 2,
          display: "flex",
          alignItems: "center",
          gap: 1,
        }}
      >
        <Box sx={{ width: 10, height: 10, borderRadius: "50%", backgroundColor: "#2B7FFF" }} />
        <Typography sx={{ fontWeight: 600, fontSize: 18, color: "#1E2939" }}>
          Preview em Tempo Real
        </Typography>
      </Box>

      <Box sx={{ p: 3 }}>
        {!temAluno && responsaveis.length === 0 ? (
          <Typography sx={{ color: "#6A7282", fontSize: 14 }}>
            Preencha o formulário para visualizar os dados do aluno.
          </Typography>
        ) : (
          <Stack spacing={3}>
            <Box sx={{ borderBottom: "1px solid #F3F4F6", pb: 1.5 }}>
              <Typography sx={{ fontWeight: 700, fontSize: 20, color: "#101828", mb: 1 }}>
                {data.nomeCompleto || "Nome do aluno"}
              </Typography>
              <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                {idade !== null && (
                  <Chip
                    icon={<CakeIcon sx={{ fontSize: "12px !important", color: "#1447E6" }} />}
                    label={`${idade} anos`}
                    size="small"
                    sx={{
                      backgroundColor: "#EFF6FF",
                      color: "#1447E6",
                      border: "1px solid #DBEAFE",
                      fontWeight: 500,
                      fontSize: 12,
                    }}
                  />
                )}
                {(data.cidade || data.uf) && (
                  <Chip
                    icon={<PlaceIcon sx={{ fontSize: "12px !important", color: "#8200DB" }} />}
                    label={`${data.cidade || ""}${data.cidade && data.uf ? "/" : ""}${data.uf || ""}`}
                    size="small"
                    sx={{
                      backgroundColor: "#FAF5FF",
                      color: "#8200DB",
                      border: "1px solid #F3E8FF",
                      fontWeight: 500,
                      fontSize: 12,
                    }}
                  />
                )}
                {data.email && (
                  <Chip
                    icon={
                      <MailOutlineIcon sx={{ fontSize: "12px !important", color: "#008236" }} />
                    }
                    label="Email cadastrado"
                    size="small"
                    sx={{
                      backgroundColor: "#F0FDF4",
                      color: "#008236",
                      border: "1px solid #DCFCE7",
                      fontWeight: 500,
                      fontSize: 12,
                    }}
                  />
                )}
              </Stack>
            </Box>

            {responsaveis.length > 0 && (
              <Stack spacing={1.5}>
                <Typography
                  sx={{
                    fontSize: 14,
                    fontWeight: 600,
                    color: "#101828",
                    textTransform: "uppercase",
                    letterSpacing: 0.7,
                  }}
                >
                  Responsáveis
                </Typography>
                <Stack spacing={1}>
                  {responsaveis.map((r, idx) => (
                    <Box
                      key={idx}
                      sx={{
                        border: "1px solid #E5E7EB",
                        backgroundColor: "#F9FAFB",
                        borderRadius: 2.5,
                        p: 1.5,
                      }}
                    >
                      <Stack direction="row" justifyContent="space-between" alignItems="center">
                        <Typography sx={{ fontSize: 14, fontWeight: 500, color: "#101828" }}>
                          {r.nomeResponsavel || `Responsável ${idx + 1}`}
                        </Typography>
                        {r.financeiro && (
                          <Chip
                            label="Financeiro"
                            size="small"
                            sx={{
                              backgroundColor: "#DCFCE7",
                              color: "#008236",
                              fontWeight: 500,
                              fontSize: 12,
                              height: 20,
                            }}
                          />
                        )}
                      </Stack>
                      {r.cpfResponsavel && (
                        <Typography sx={{ fontSize: 12, color: "#6A7282", mt: 0.5 }}>
                          CPF: {r.cpfResponsavel}
                        </Typography>
                      )}
                      {r.emailResponsavel && (
                        <Typography sx={{ fontSize: 12, color: "#6A7282" }}>
                          Email: {r.emailResponsavel}
                        </Typography>
                      )}
                      {r.telefones?.[0]?.value && (
                        <Box
                          sx={{
                            mt: 1,
                            display: "inline-block",
                            backgroundColor: "white",
                            border: "1px solid #E5E7EB",
                            borderRadius: 1,
                            px: 1,
                            py: 0.5,
                            fontSize: 12,
                          }}
                        >
                          {r.telefones[0].value}
                        </Box>
                      )}
                    </Box>
                  ))}
                </Stack>
                <Box
                  sx={{
                    borderRadius: 2.5,
                    border: "1px solid #DBEAFE",
                    backgroundColor: "rgba(239,246,255,0.5)",
                    px: 1.75,
                    py: 1,
                  }}
                >
                  <Typography sx={{ fontSize: 12, color: "#1447E6" }}>
                    {responsaveis.length} responsável(is) cadastrado(s)
                    {financeiro?.nomeResponsavel &&
                      ` • Resp. financeiro: ${financeiro.nomeResponsavel}`}
                  </Typography>
                </Box>
              </Stack>
            )}
          </Stack>
        )}
      </Box>
    </Paper>
  );
}

// Contexto trivial para acesso ao methodsHookForm dentro de ResponsavelCard
import { createContext, useContext } from "react";
type FormCtx = {
  watch: ReturnType<typeof useBrainForm<AlunoFormData>>["watch"];
  setValue: ReturnType<typeof useBrainForm<AlunoFormData>>["setValue"];
};
const BrainFormCtx = createContext<FormCtx | null>(null);
function useBrainFormCtx() {
  const ctx = useContext(BrainFormCtx);
  if (!ctx) throw new Error("BrainFormCtx not found");
  return ctx;
}

function AlunoPageContent() {
  const router = useRouter();
  const alunoId = useBrainSearchParams("id");

  const { aluno, loading: loadingAluno, error: errorAluno } = useAluno(alunoId);
  const { createAluno, updateAluno } = useAlunoMutations();

  const isEditMode = !!alunoId;

  const {
    control,
    handleSubmit,
    onFormSubmit,
    isSubmitting,
    reset,
    methodsHookForm,
    setValue,
    watch,
    getValues,
  } = useBrainForm<AlunoFormData>({
    schema: alunoSchema,
    defaultValues: alunoDefaultValues,
    onSubmit,
    mode: "all",
  });

  const [buscandoCep, setBuscandoCep] = useState(false);
  const [buscandoCepResp, setBuscandoCepResp] = useState<Record<number, boolean>>({});
  const watcherCep = watch("cep");
  const watchedData = watch();

  const {
    fields: responsaveisFields,
    append: appendResponsavel,
    remove: removeResponsavel,
  } = useFieldArray({ control, name: "responsaveis" });

  useEffect(() => {
    if (aluno && isEditMode) {
      reset(mapAlunoResponseToFormData(aluno));
    }
  }, [aluno, isEditMode, reset]);

  const buscarEnderecoPorCep = useCallback(
    async (cep: string) => {
      if (!cep || cep.length !== 9) return;
      setBuscandoCep(true);
      try {
        const dados = await buscarCep(cep);
        if (dados && !dados.erro) {
          setValue("logradouro", dados.logradouro, { shouldValidate: true });
          setValue("bairro", dados.bairro, { shouldValidate: true });
          setValue("cidade", dados.localidade, { shouldValidate: true });
          setValue("uf", dados.uf, { shouldValidate: true });
          if (dados.complemento) {
            setValue("complemento", dados.complemento, { shouldValidate: true });
          }
        } else {
          toast.error("CEP não encontrado.");
        }
      } finally {
        setBuscandoCep(false);
      }
    },
    [setValue],
  );

  useEffect(() => {
    buscarEnderecoPorCep(watcherCep);
  }, [watcherCep, buscarEnderecoPorCep]);

  const responsaveisCepsKey = useMemo(
    () => (watchedData.responsaveis ?? []).map((r) => r?.cep || "").join("|"),
    [watchedData.responsaveis],
  );

  const buscarEnderecoPorCepResp = useCallback(
    async (cep: string, index: number) => {
      if (!cep || cep.length !== 9) return;
      setBuscandoCepResp((p) => ({ ...p, [index]: true }));
      try {
        const dados = await buscarCep(cep);
        if (dados && !dados.erro) {
          setValue(`responsaveis.${index}.logradouro`, dados.logradouro, { shouldValidate: true });
          setValue(`responsaveis.${index}.bairro`, dados.bairro, { shouldValidate: true });
          setValue(`responsaveis.${index}.cidade`, dados.localidade, { shouldValidate: true });
          setValue(`responsaveis.${index}.uf`, dados.uf, { shouldValidate: true });
          if (dados.complemento) {
            setValue(`responsaveis.${index}.complemento`, dados.complemento, {
              shouldValidate: true,
            });
          }
        } else {
          toast.error("CEP não encontrado.");
        }
      } finally {
        setBuscandoCepResp((p) => ({ ...p, [index]: false }));
      }
    },
    [setValue],
  );

  useEffect(() => {
    responsaveisFields.forEach((_, index) => {
      const cep = watchedData.responsaveis?.[index]?.cep;
      const mesmo = watchedData.responsaveis?.[index]?.mesmoEnderecoAluno;
      if (!mesmo && cep && cep.length === 9) {
        buscarEnderecoPorCepResp(cep, index);
      }
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [responsaveisCepsKey, buscarEnderecoPorCepResp]);

  const copiarEnderecoAluno = useCallback(
    (index: number) => {
      const v = getValues();
      setValue(`responsaveis.${index}.cep`, v.cep || "", { shouldValidate: true });
      setValue(`responsaveis.${index}.logradouro`, v.logradouro || "", { shouldValidate: true });
      setValue(`responsaveis.${index}.numero`, v.numero || "", { shouldValidate: true });
      setValue(`responsaveis.${index}.complemento`, v.complemento || "", { shouldValidate: true });
      setValue(`responsaveis.${index}.bairro`, v.bairro || "", { shouldValidate: true });
      setValue(`responsaveis.${index}.cidade`, v.cidade || "", { shouldValidate: true });
      setValue(`responsaveis.${index}.uf`, v.uf || "", { shouldValidate: true });
    },
    [getValues, setValue],
  );

  async function onSubmit(data: AlunoFormData) {
    try {
      if (isEditMode && alunoId) {
        await updateAluno.mutateAsync(mapFormDataToAlunoPutRequest(data, alunoId));
      } else {
        await createAluno.mutateAsync(mapFormDataToAlunoPostRequest(data));
      }
      router.push(RoutesEnum.ALUNO_LISTA);
    } catch (error) {
      console.error("Erro ao salvar aluno:", error);
    }
  }

  function handleCancel() {
    router.push(RoutesEnum.ALUNO_LISTA);
  }

  function handleAddResponsavel() {
    if (responsaveisFields.length >= MAX_RESPONSAVEIS) return;
    appendResponsavel({
      nomeResponsavel: "",
      cpfResponsavel: "",
      dataNascimentoResponsavel: "",
      emailResponsavel: "",
      telefones: [{ value: "" }],
      financeiro: false,
      mesmoEnderecoAluno: false,
      cep: "",
      logradouro: "",
      numero: "",
      complemento: "",
      bairro: "",
      cidade: "",
      uf: "",
    });
  }

  const isSaving = createAluno.isPending || updateAluno.isPending;

  if (loadingAluno && isEditMode) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", py: 6 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (errorAluno && isEditMode) {
    return (
      <Box sx={{ p: 4 }}>
        <Alert severity="error">{errorAluno}</Alert>
      </Box>
    );
  }

  return (
    <BrainFormCtx.Provider value={{ watch, setValue }}>
      <Box sx={{ backgroundColor: "#F7F8FA", minHeight: "100%" }}>
        <Box
          sx={{
            backgroundColor: "white",
            borderBottom: "1px solid #E5E7EB",
            px: 4,
            py: 3,
          }}
        >
          <Stack
            direction={{ xs: "column", md: "row" }}
            justifyContent="space-between"
            alignItems={{ xs: "flex-start", md: "center" }}
            spacing={2}
          >
            <Box>
              <Stack direction="row" alignItems="center" spacing={1}>
                <PersonIcon sx={{ color: "#101828" }} />
                <Typography sx={{ fontWeight: 600, fontSize: 24, color: "#101828" }}>
                  {isEditMode ? "Editar Aluno" : "Novo Aluno"}
                </Typography>
              </Stack>
              <Typography sx={{ color: "#6A7282", fontSize: 16, mt: 0.5 }}>
                Preencha todos os dados necessários para o cadastro do aluno
              </Typography>
            </Box>
            <Stack direction="row" spacing={1.5}>
              <BrainButtonSecondary onClick={handleCancel} disabled={isSaving}>
                Cancelar
              </BrainButtonSecondary>
              <BrainButtonPrimary
                type="submit"
                disabled={isSubmitting || isSaving}
                onClick={handleSubmit(onFormSubmit)}
              >
                <SaveIcon sx={{ fontSize: 16, mr: 1 }} />
                {isSaving ? "Salvando..." : "Salvar Aluno"}
              </BrainButtonPrimary>
            </Stack>
          </Stack>
        </Box>

        <Box sx={{ p: { xs: 2, md: 4 } }}>
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: { xs: "1fr", lg: "1fr 420px" },
              gap: 3,
              alignItems: "flex-start",
            }}
          >
            <BrainFormProvider
              methodsHookForm={methodsHookForm}
              onSubmit={handleSubmit(onFormSubmit)}
            >
              <Stack spacing={3}>
                <SectionCard icon={<PersonIcon />} title="Dados Pessoais">
                  <Stack spacing={2}>
                    <BrainTextFieldControlled
                      name="nomeCompleto"
                      control={control}
                      label="Nome Completo"
                      placeholder="Digite o nome completo"
                      required
                    />
                    <BrainTextFieldControlled
                      name="nomeSocial"
                      control={control}
                      label="Nome Social (Opcional)"
                      placeholder="Nome social (se aplicável)"
                    />
                    <Box
                      sx={{
                        display: "grid",
                        gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" },
                        gap: 2,
                      }}
                    >
                      <BrainTextCPFControlled
                        name="cpf"
                        control={control}
                        label="CPF"
                        required
                      />
                      <BrainTextRGControlled name="rg" control={control} label="RG" required />
                    </Box>
                    <BrainTextFieldControlled
                      name="email"
                      control={control}
                      label="E-mail"
                      placeholder="exemplo@email.com"
                      type="email"
                      required
                    />
                    <Box
                      sx={{
                        display: "grid",
                        gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" },
                        gap: 2,
                      }}
                    >
                      <BrainDateTextControlled
                        name="dataNascimento"
                        control={control}
                        label="Data de Nascimento"
                        required
                      />
                      <BrainDropdownControlled
                        name="genero"
                        control={control}
                        label="Gênero"
                        options={OPTIONS_GENDER}
                        placeholder="Selecione o gênero"
                        required
                      />
                    </Box>
                    <Box
                      sx={{
                        display: "grid",
                        gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" },
                        gap: 2,
                      }}
                    >
                      <BrainDropdownControlled
                        name="corRaca"
                        control={control}
                        label="Cor/Raça"
                        options={OPTIONS_COR_RACA}
                        placeholder="Selecione"
                      />
                      <BrainTextFieldControlled
                        name="cidadeNaturalidade"
                        control={control}
                        label="Cidade de Naturalidade"
                        placeholder="Ex.: Brasília"
                      />
                    </Box>
                  </Stack>
                </SectionCard>

                <SectionCard icon={<ContactPhoneIcon />} title="Contato">
                  <TelefonesArray control={control} name="telefones" />
                </SectionCard>

                <SectionCard icon={<LocationOnIcon />} title="Endereço">
                  <Stack spacing={2}>
                    <Box sx={{ maxWidth: { md: "50%" }, position: "relative" }}>
                      <BrainTextCEPControlled
                        name="cep"
                        control={control}
                        label="CEP"
                        required
                      />
                      {buscandoCep && (
                        <Box sx={{ position: "absolute", right: 10, top: "50%" }}>
                          <CircularProgress size={18} />
                        </Box>
                      )}
                    </Box>
                    <BrainTextFieldControlled
                      name="logradouro"
                      control={control}
                      label="Logradouro"
                      required
                    />
                    <Box
                      sx={{
                        display: "grid",
                        gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" },
                        gap: 2,
                      }}
                    >
                      <BrainTextFieldControlled
                        name="numero"
                        control={control}
                        label="Número"
                        required
                      />
                      <BrainTextFieldControlled
                        name="complemento"
                        control={control}
                        label="Complemento (Opcional)"
                        placeholder="Apto, bloco, etc."
                      />
                    </Box>
                    <Box
                      sx={{
                        display: "grid",
                        gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" },
                        gap: 2,
                      }}
                    >
                      <BrainTextFieldControlled
                        name="bairro"
                        control={control}
                        label="Bairro"
                        required
                      />
                      <BrainTextFieldControlled
                        name="cidade"
                        control={control}
                        label="Cidade"
                        required
                      />
                    </Box>
                    <Box sx={{ maxWidth: { md: "50%" } }}>
                      <BrainDropdownControlled
                        name="uf"
                        control={control}
                        label="UF"
                        options={OPTIONS_UF}
                        placeholder="UF"
                        required
                      />
                    </Box>
                  </Stack>
                </SectionCard>

                <SectionCard
                  icon={<FamilyRestroomIcon />}
                  title="Responsáveis"
                  action={
                    <Button
                      variant="outlined"
                      size="small"
                      startIcon={<AddIcon />}
                      onClick={handleAddResponsavel}
                      disabled={responsaveisFields.length >= MAX_RESPONSAVEIS}
                      sx={{
                        borderColor: "#BEDBFF",
                        backgroundColor: "#EFF6FF",
                        color: "#155DFC",
                        textTransform: "none",
                        fontWeight: 500,
                        "&:hover": { backgroundColor: "#dbeafe", borderColor: "#BEDBFF" },
                      }}
                    >
                      Adicionar Responsável
                    </Button>
                  }
                >
                  {responsaveisFields.length === 0 ? (
                    <Box
                      sx={{
                        border: "2px dashed #E5E7EB",
                        borderRadius: 2.5,
                        p: 4,
                        textAlign: "center",
                        color: "#6A7282",
                        fontSize: 14,
                      }}
                    >
                      Nenhum responsável cadastrado. Clique em &quot;Adicionar Responsável&quot;
                      para incluir.
                    </Box>
                  ) : (
                    <Stack spacing={2}>
                      {responsaveisFields.map((field, index) => (
                        <ResponsavelCard
                          key={field.id}
                          index={index}
                          control={control}
                          onRemove={() => removeResponsavel(index)}
                          onCopiarEnderecoAluno={copiarEnderecoAluno}
                          buscandoCep={!!buscandoCepResp[index]}
                        />
                      ))}
                    </Stack>
                  )}
                </SectionCard>
              </Stack>
            </BrainFormProvider>

            <Box sx={{ display: { xs: "none", lg: "block" } }}>
              <PreviewPanel data={watchedData} />
            </Box>
          </Box>
        </Box>
      </Box>
    </BrainFormCtx.Provider>
  );
}

export default function AlunoPage() {
  return (
    <Suspense
      fallback={
        <Box sx={{ display: "flex", justifyContent: "center", py: 6 }}>
          <CircularProgress />
        </Box>
      }
    >
      <AlunoPageContent />
    </Suspense>
  );
}
