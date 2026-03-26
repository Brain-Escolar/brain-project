import { TextFieldProps } from "@mui/material";
import { Control, Controller, FieldValues, Path } from "react-hook-form";
import BrainTextField from "../_base/brainTextField/brainTextField";
import { maskInputCPF } from "./utilsBrainTextCPF";

interface BrainTextCPFControlledProps<T extends FieldValues> {
  name: Path<T>;
  control: Control<T>;
  label: string;
  required?: boolean;
  placeholder?: string;
  size?: TextFieldProps["size"];
}

export function BrainTextCPFControlled<T extends FieldValues>({
  name,
  control,
  label,
  placeholder = "000.000.000-00",
  required = false,
  size = "small",
}: BrainTextCPFControlledProps<T>) {
  return (
    <Controller
      name={name}
      control={control}
      render={({ field, fieldState: { error } }) => (
        <BrainTextField
          {...field}
          fullWidth={true}
          size={size}
          required={required}
          label={label}
          placeholder={placeholder}
          type={"text"}
          error={!!error}
          helperText={error?.message}
          onChange={(e) => {
            const maskedValue = maskInputCPF(e.target.value);
            field.onChange(maskedValue);
          }}
        />
      )}
    />
  );
}
