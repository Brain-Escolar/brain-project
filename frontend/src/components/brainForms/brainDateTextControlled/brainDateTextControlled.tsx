import { TextFieldProps } from "@mui/material";
import { Control, Controller, FieldValues, Path } from "react-hook-form";
import BrainTextField from "../_base/brainTextField/brainTextField";
import { maskInputDate } from "./utilsBrainDateText";

interface BrainDateTextControlledProps<T extends FieldValues> {
  name: Path<T>;
  control: Control<T>;
  label: string;
  required?: boolean;
  placeholder?: string;
  size?: TextFieldProps["size"];
}

export function BrainDateTextControlled<T extends FieldValues>({
  name,
  control,
  label,
  placeholder = "dd/mm/aaaa",
  required = false,
  size = "small",
}: BrainDateTextControlledProps<T>) {
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
            const maskedValue = maskInputDate(e.target.value);
            field.onChange(maskedValue);
          }}
        />
      )}
    />
  );
}
