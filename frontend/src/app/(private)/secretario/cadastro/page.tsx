"use client";
import { RoutesEnum } from "@/enums";
import { mapFormDataToSecretarioPostRequest } from "@/app/(private)/secretario/secretarioUtils";
import { useSecretarioMutations } from "@/app/(private)/secretario/useSecretarioMutations";
import * as S from "@/app/(private)/professor/styles";
import BrainButtonPrimary from "@/components/brainButtons/brainButtonPrimary/brainButtonPrimary";
import BrainButtonSecondary from "@/components/brainButtons/brainButtonSecondary/brainButtonSecondary";
import { BrainDateTextControlled } from "@/components/brainForms/brainDateTextControlled";
import { BrainDropdownControlled } from "@/components/brainForms/brainDropdownControlled";
import BrainFormProvider from "@/components/brainForms/brainFormProvider/brainFormProvider";
import { BrainTextCEPControlled } from "@/components/brainForms/brainTextCEPControlled";
import { BrainTextCPFControlled } from "@/components/brainForms/brainTextCPFControlled";
import { BrainTextFieldControlled } from "@/components/brainForms/brainTextFieldControlled";
import { BrainTextPhoneControlled } from "@/components/brainForms/brainTextPhoneControlled";
import { BrainTextRGControlled } from "@/components/brainForms/brainTextRGControlled";
import ContainerSection from "@/components/containerSection/containerSection";
import PageScaffold from "@/components/pageScaffold/PageScaffold";
import { useBrainForm } from "@/hooks/useBrainForm";
import { buscarCep } from "@/services/cep";
import { KeyValue } from "@/services/models/keyValue";
import {
  Alert,
  Box,
  Checkbox,
  CircularProgress,
  FormControlLabel,
  FormHelperText,
  Typography,
} from "@mui/material";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { Controller } from "react-hook-form";
import { toast } from "react-toastify";
import { secretarioDefaultValues, SecretarioFormData, secretarioSchema } from "../schema";

// ─── Opções de select ────────────────────────────────────────────────────────

const OPTIONS_UF: KeyValue[] = [
  { key: "AC", value: "AC" },
  { key: "AL", value: "AL" },
  { key: "AP", value: "AP" },
  { key: "AM", value: "AM" },
  { key: "BA", value: "BA" },
  { key: "CE", value: "CE" },
  { key: "DF", value: "DF" },
  { key: "ES", value: "ES" },
  { key: "GO", value: "GO" },
  { key: "MA", value: "MA" },
  { key: "MT", value: "MT" },
  { key: "MS", value: "MS" },
  { key: "MG", value: "MG" },
  { key: "PA", value: "PA" },
  { key: "PB", value: "PB" },
  { key: "PR", value: "PR" },
  { key: "PE", value: "PE" },
  { key: "PI", value: "PI" },
  { key: "RJ", value: "RJ" },
  { key: "RN", value: "RN" },
  { key: "RS", value: "RS" },
  { key: "RO", value: "RO" },
  { key: "RR", value: "RR" },
  { key: "SC", value: "SC" },
  { key: "SP", value: "SP" },
  { key: "SE", value: "SE" },
  { key: "TO", value: "TO" },
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

// ─── Página principal ─────────────────────────────────────────────────────────

export default function SecretarioCadastroPage() {
  const router = useRouter();
  const { createSecretario } = useSecretarioMutations();

  const { control, handleSubmit, onFormSubmit, isSubmitting, methodsHookForm, setValue, watch } =
    useBrainForm<SecretarioFormData>({
      schema: secretarioSchema,
      defaultValues: secretarioDefaultValues,
      onSubmit: onSubmit,
      mode: "all",
    });

  const [buscandoCep, setBuscandoCep] = useState(false);
  const watcherCepValue = watch("cep");

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

  async function onSubmit(data: SecretarioFormData) {
    try {
      await createSecretario.mutateAsync(mapFormDataToSecretarioPostRequest(data));
      router.push(RoutesEnum.SECRETARIO_LISTA);
    } catch (error) {
      console.error("Erro ao salvar secretário:", error);
    }
  }

  function handleCancel() {
    router.push(RoutesEnum.SECRETARIO_LISTA);
  }

  const isSaving = createSecretario.isPending;

  return (
    <PageScaffold
      title="Cadastro de Secretário"
      description="Preencha todos os dados necessários para o registro"
    >
      <BrainFormProvider methodsHookForm={methodsHookForm} onSubmit={handleSubmit(onFormSubmit)}>
        {/* ── Dados Pessoais ─────────────────────────────────────────── */}
        <ContainerSection
          title="Dados Pessoais"
          description="Informações pessoais e documentos do secretário"
          numberOfCollumns={2}
        >
          <Box sx={{ gridColumn: "1 / -1" }}>
            <BrainTextFieldControlled
              name="nomeCompleto"
              control={control}
              label="Nome Completo"
              placeholder="Nome completo do secretário"
              required
            />
          </Box>

          <Box sx={{ gridColumn: "1 / -1" }}>
            <BrainTextFieldControlled
              name="nomeSocial"
              control={control}
              label="Nome Social"
              placeholder="Nome social (opcional)"
            />
          </Box>

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

          <BrainTextFieldControlled
            name="cidadeNaturalidade"
            control={control}
            label="Cidade de Naturalidade"
            placeholder="Cidade onde nasceu"
            required
          />
          <BrainTextCPFControlled name="cpf" control={control} label="CPF" required={true} />

          <BrainTextRGControlled name="rg" control={control} label="RG" required={true} />
          <BrainTextFieldControlled
            name="carteiraTrabalho"
            control={control}
            label="Carteira de Trabalho"
            placeholder="Número da CTPS"
            required
          />
        </ContainerSection>

        {/* ── Endereço ───────────────────────────────────────────────── */}
        <ContainerSection
          title="Endereço"
          description="Endereço residencial do secretário"
          numberOfCollumns={3}
        >
          <Box sx={{ position: "relative" }}>
            <BrainTextCEPControlled name="cep" control={control} label="CEP" required={true} />
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
        <ContainerSection title="Contato" description="Informações de contato" numberOfCollumns={2}>
          <BrainTextPhoneControlled
            name="telefone"
            control={control}
            label="Telefone"
            placeholder="(00) 00000-0000"
            required
          />
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
                        Aceito o <strong>termo de consentimento LGPD</strong> *
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
            <BrainButtonSecondary onClick={handleCancel}>Cancelar</BrainButtonSecondary>
            <BrainButtonPrimary
              type="submit"
              disabled={isSubmitting || isSaving}
              isLoading={isSaving}
            >
              {isSaving ? "Salvando..." : "Salvar Secretário"}
            </BrainButtonPrimary>
          </S.FooterActions>
        </Box>
      </BrainFormProvider>
    </PageScaffold>
  );
}
