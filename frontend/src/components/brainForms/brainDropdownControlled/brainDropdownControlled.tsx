import { KeyValue } from "@/services/models/keyValue";
import { TextFieldProps } from "@mui/material";
import { Control, Controller, FieldValues, Path } from "react-hook-form";
import BrainDropdownField from "../_base/brainDropdownField/brainDropdownField";
import { StyledFormControl } from "../_base/brainDropdownField/styles";

interface BrainDropdownControlledProps<T extends FieldValues> {
  name: Path<T>;
  control: Control<T>;
  label: string;
  options: KeyValue[];
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
  size?: TextFieldProps["size"];
  noOptionsText?: string;
}

// Versão react-hook-form do BrainDropdownField: o form guarda a key da opção.
export function BrainDropdownControlled<T extends FieldValues>({
  name,
  control,
  label,
  options,
  placeholder,
  required = false,
  disabled = false,
  size = "small",
  noOptionsText,
}: BrainDropdownControlledProps<T>) {
  return (
    <Controller
      name={name}
      control={control}
      render={({ field, fieldState: { error } }) => (
        <StyledFormControl fullWidth error={!!error} size={size}>
          <BrainDropdownField
            label={label}
            options={options}
            value={field.value}
            onChange={(key) => field.onChange(key ?? "")}
            onBlur={field.onBlur}
            inputRef={field.ref}
            placeholder={placeholder}
            required={required}
            disabled={disabled}
            size={size}
            error={!!error}
            helperText={error?.message}
            noOptionsText={noOptionsText}
          />
        </StyledFormControl>
      )}
    />
  );
}
