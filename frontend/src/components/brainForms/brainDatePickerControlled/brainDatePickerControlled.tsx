import { TextFieldProps } from "@mui/material";
import { DatePicker, LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { ptBR } from "date-fns/locale";
import { Control, Controller, FieldValues, Path } from "react-hook-form";

interface BrainDatePickerControlledProps<T extends FieldValues> {
  name: Path<T>;
  control: Control<T>;
  label: string;
  required?: boolean;
  disabled?: boolean;
  minDate?: Date;
  maxDate?: Date;
  size?: TextFieldProps["size"];
  onValueChange?: (value: Date | null) => void;
}

export function BrainDatePickerControlled<T extends FieldValues>({
  name,
  control,
  label,
  required = false,
  disabled = false,
  minDate,
  maxDate,
  size = "small",
  onValueChange,
}: BrainDatePickerControlledProps<T>) {
  return (
    <Controller
      name={name}
      control={control}
      render={({ field, fieldState: { error } }) => (
        <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={ptBR}>
          <DatePicker
            label={label}
            value={(field.value as Date | null) ?? null}
            inputRef={field.ref}
            onChange={(value) => {
              field.onChange(value);
              onValueChange?.(value as Date | null);
            }}
            minDate={minDate}
            maxDate={maxDate}
            disabled={disabled}
            slotProps={{
              textField: {
                size,
                fullWidth: true,
                required,
                onBlur: field.onBlur,
                error: !!error,
                helperText: error?.message,
              },
            }}
          />
        </LocalizationProvider>
      )}
    />
  );
}
