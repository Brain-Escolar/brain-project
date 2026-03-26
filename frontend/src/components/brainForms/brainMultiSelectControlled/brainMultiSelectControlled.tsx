import { KeyValue } from "@/services/models/keyValue";
import {
  Autocomplete,
  Checkbox,
  FormControl,
  FormHelperText,
  TextField,
} from "@mui/material";
import { Control, Controller, FieldValues, Path } from "react-hook-form";
import CheckBoxOutlineBlankIcon from "@mui/icons-material/CheckBoxOutlineBlank";
import CheckBoxIcon from "@mui/icons-material/CheckBox";

interface BrainMultiSelectControlledProps<T extends FieldValues> {
  name: Path<T>;
  control: Control<T>;
  label: string;
  options: KeyValue[];
  placeholder?: string;
  required?: boolean;
}

const icon = <CheckBoxOutlineBlankIcon fontSize="small" />;
const checkedIcon = <CheckBoxIcon fontSize="small" />;

export function BrainMultiSelectControlled<T extends FieldValues>({
  name,
  control,
  label,
  options,
  placeholder = "Selecione as opções",
  required = false,
}: BrainMultiSelectControlledProps<T>) {
  return (
    <Controller
      name={name}
      control={control}
      render={({ field, fieldState: { error } }) => {
        const selectedValues: string[] = Array.isArray(field.value)
          ? field.value.map(String)
          : [];
        const selectedOptions = options.filter((opt) =>
          selectedValues.includes(String(opt.key)),
        );

        return (
          <FormControl fullWidth error={!!error} size="small">
            <Autocomplete
              multiple
              options={options}
              disableCloseOnSelect
              getOptionLabel={(option) => option.value}
              isOptionEqualToValue={(option, value) =>
                String(option.key) === String(value.key)
              }
              value={selectedOptions}
              onChange={(_, newValue) => {
                const keys = newValue.map((opt) => {
                  const numKey = Number(opt.key);
                  return isNaN(numKey) ? opt.key : numKey;
                });
                field.onChange(keys);
              }}
              renderOption={(props, option, { selected }) => {
                const { key, ...restProps } = props;
                return (
                  <li key={key} {...restProps}>
                    <Checkbox
                      icon={icon}
                      checkedIcon={checkedIcon}
                      style={{ marginRight: 8 }}
                      checked={selected}
                    />
                    {option.value}
                  </li>
                );
              }}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label={label}
                  placeholder={selectedOptions.length === 0 ? placeholder : ""}
                  required={required}
                  error={!!error}
                  size="small"
                />
              )}
              size="small"
            />
            {error?.message && <FormHelperText>{error.message}</FormHelperText>}
          </FormControl>
        );
      }}
    />
  );
}
