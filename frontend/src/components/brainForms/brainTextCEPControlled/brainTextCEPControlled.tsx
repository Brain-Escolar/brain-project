import { TextFieldProps } from "@mui/material";
import { Control, Controller, FieldValues, Path } from "react-hook-form";
import BrainTextField from "../_base/brainTextField/brainTextField";
import { maskInputCEP } from "./utilsBrainTextCEP";

interface BrainTextCEPControlledProps<T extends FieldValues> {
  name: Path<T>;
  control: Control<T>;
  label: string;
  required?: boolean;
  placeholder?: string;
  size?: TextFieldProps["size"];
}

export function BrainTextCEPControlled<T extends FieldValues>({
  name,
  control,
  label,
  placeholder = "00000-000",
  required = false,
  size = "small",
}: BrainTextCEPControlledProps<T>) {
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
            const maskedValue = maskInputCEP(e.target.value);
            field.onChange(maskedValue);
          }}
        />
      )}
    />
  );
}
