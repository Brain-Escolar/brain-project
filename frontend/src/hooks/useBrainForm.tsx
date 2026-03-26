import { zodResolver } from "@hookform/resolvers/zod";
import { useCallback, useMemo } from "react";
import {
  Control,
  DefaultValues,
  FieldValues,
  FormState,
  Path,
  useForm,
  UseFormClearErrors,
  UseFormGetValues,
  UseFormHandleSubmit,
  UseFormProps,
  UseFormReset,
  UseFormSetError,
  UseFormSetValue,
  UseFormTrigger,
  UseFormWatch,
} from "react-hook-form";
import { ZodSchema } from "zod";

export interface useBrainFormConfig<T extends FieldValues> {
  schema: ZodSchema<T>;
  defaultValues: DefaultValues<T>;
  onSubmit?: (data: T) => void | Promise<void>;
  mode?: UseFormProps<T>["mode"];
  reValidateMode?: UseFormProps<T>["reValidateMode"];
  shouldFocusError?: UseFormProps<T>["shouldFocusError"];
}

export interface useBrainFormReturn<T extends FieldValues> {
  // Form methods from react-hook-form
  control: Control<T>;
  handleSubmit: UseFormHandleSubmit<T>;
  formState: FormState<T>;
  reset: UseFormReset<T>;
  setValue: UseFormSetValue<T>;
  getValues: UseFormGetValues<T>;
  watch: UseFormWatch<T>;
  trigger: UseFormTrigger<T>;
  clearErrors: UseFormClearErrors<T>;
  setError: UseFormSetError<T>;
  methodsHookForm: UseFormProps<T>;
  // Custom methods
  onFormSubmit: (data: T) => Promise<void>;
  resetToDefaults: () => void;

  // Computed state
  isSubmitting: boolean;
  isDirty: boolean;
  isValid: boolean;
  errors: FormState<T>["errors"];
}

export function useBrainForm<T extends FieldValues>({
  schema,
  defaultValues,
  onSubmit,
  mode = "onChange",
  reValidateMode,
  shouldFocusError,
}: useBrainFormConfig<T>): useBrainFormReturn<T> {
  const methodsHookForm = useForm<T>({
    // @ts-expect-error - Incompatibilidade de tipos conhecida entre zod e react-hook-form
    resolver: zodResolver(schema),
    defaultValues,
    mode,
    reValidateMode,
    shouldFocusError,
  });

  const {
    control,
    handleSubmit,
    formState,
    reset,
    setValue,
    getValues,
    watch,
    trigger,
    clearErrors,
    setError,
  } = methodsHookForm;

  const { errors, isSubmitting, isDirty, isValid } = formState;

  const onFormSubmit = useCallback(
    async (data: T) => {
      try {
        if (onSubmit) {
          await onSubmit(data);
        }
      } catch (error) {
        const errorObj = error instanceof Error ? error : new Error("Erro desconhecido");
        console.error("Erro ao submeter formulário:", errorObj);
      }
    },
    [onSubmit],
  );

  // Handler para resetar o formulário com valores padrão
  const resetToDefaults = useCallback(() => {
    reset(defaultValues);
  }, [reset, defaultValues]);

  // Retorna objeto memoizado para evitar re-renders desnecessários
  return useMemo(
    () =>
      ({
        // Form methods
        control,
        handleSubmit,
        formState,
        reset,
        setValue,
        getValues,
        watch,
        trigger,
        clearErrors,
        setError,
        methodsHookForm,

        // Custom methods
        onFormSubmit,
        resetToDefaults,

        // State
        isSubmitting,
        isDirty,
        isValid,
        errors,
      }) as unknown as useBrainFormReturn<T>,
    [
      control,
      handleSubmit,
      formState,
      methodsHookForm,
      reset,
      setValue,
      getValues,
      watch,
      trigger,
      clearErrors,
      setError,
      onFormSubmit,
      resetToDefaults,
      isSubmitting,
      isDirty,
      isValid,
      errors,
    ],
  );
}

// Hook auxiliar para criar controllers de forma mais limpa
export function useFormField<T extends FieldValues>(control: Control<T>, name: Path<T>) {
  return useMemo(() => ({ control, name }), [control, name]);
}
