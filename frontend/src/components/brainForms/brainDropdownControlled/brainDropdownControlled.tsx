import { KeyValue } from "@/services/models/keyValue";
import { SelectProps } from "@mui/material";
import { Control, Controller, FieldValues, Path } from "react-hook-form";
import BrainDropdownField from "../_base/brainDropdownField/brainDropdownField";

interface BrainDropdownControlledProps<T extends FieldValues>
  extends Omit<SelectProps, "name" | "error"> {
  name: Path<T>;
  control: Control<T>;
  label: string;
  options: KeyValue[];
  placeholder?: string;
  required?: boolean;
}

export function BrainDropdownControlled<T extends FieldValues>({
  name,
  control,
  label,
  options,
  placeholder = "Selecione uma opção",
  required = false,
  size = "small",
  fullWidth = true,
  ...selectProps
}: BrainDropdownControlledProps<T>) {
  return (
    <Controller
      name={name}
      control={control}
      render={({ field, fieldState: { error } }) => (
        <BrainDropdownField
          {...field}
          {...selectProps}
          value={
            field.value === 0 || field.value === null || field.value === undefined
              ? ""
              : field.value
          }
          label={label}
          options={options}
          placeholder={placeholder}
          required={required}
          size={size}
          fullWidth={fullWidth}
          error={!!error}
          helperText={error?.message}
        />
      )}
    />
  );
}
