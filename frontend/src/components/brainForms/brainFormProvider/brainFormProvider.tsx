import { PropsWithChildren } from "react";
import { FormProvider } from "react-hook-form";

interface IBrainFormProviderProps {
  //eslint-disable-next-line @typescript-eslint/no-explicit-any
  methodsHookForm?: any;
  //eslint-disable-next-line @typescript-eslint/no-explicit-any
  onSubmit: (data: any) => void; // Função de callback para submissão do formulário
}

function BrainFormProvider({
  children,
  onSubmit,
  methodsHookForm,
}: PropsWithChildren<IBrainFormProviderProps>) {
  return (
    <FormProvider {...methodsHookForm}>
      <form onSubmit={onSubmit} noValidate>
        {children}
      </form>
    </FormProvider>
  );
}

export default BrainFormProvider;
