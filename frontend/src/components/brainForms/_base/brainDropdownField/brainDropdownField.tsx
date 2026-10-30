import { cssVarColor } from "@/styles";
import { Autocomplete, SxProps, TextField, TextFieldProps, Theme } from "@mui/material";
import React from "react";

export interface BrainDropdownOption<K extends string | number = string> {
  key: K;
  value: string;
  disabled?: boolean;
}

interface IBrainDropdownFieldProps<K extends string | number> {
  label?: string;
  options: BrainDropdownOption<K>[];
  value: K | "" | null | undefined;
  onChange: (key: K | null) => void;
  onBlur?: () => void;
  inputRef?: React.Ref<HTMLInputElement>;
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
  error?: boolean;
  helperText?: string;
  size?: TextFieldProps["size"];
  margin?: TextFieldProps["margin"];
  fullWidth?: boolean;
  /** Impede limpar o campo (útil quando há uma opção "Todas"/"Todos" sempre selecionada). */
  disableClearable?: boolean;
  startAdornment?: React.ReactNode;
  noOptionsText?: string;
  sx?: SxProps<Theme>;
}

// Combobox com busca: o usuário digita e a lista mostra só as opções que combinam.
// O filtro padrão do MUI ignora maiúsculas e acentos. Recebe/devolve a key da opção.
function BrainDropdownField<K extends string | number>({
  label,
  options,
  value,
  onChange,
  onBlur,
  inputRef,
  placeholder = "Digite para buscar",
  required = false,
  disabled = false,
  error = false,
  helperText,
  size = "small",
  margin,
  fullWidth = true,
  disableClearable = false,
  startAdornment,
  noOptionsText = "Nenhuma opção encontrada",
  sx,
}: IBrainDropdownFieldProps<K>) {
  const selectedOption =
    value === "" || value === null || value === undefined
      ? null
      : (options.find((opt) => String(opt.key) === String(value)) ?? null);

  return (
    <Autocomplete<BrainDropdownOption<K>, false, boolean>
      options={options}
      value={selectedOption as BrainDropdownOption<K>}
      disabled={disabled}
      disableClearable={disableClearable}
      size={size}
      fullWidth={fullWidth}
      sx={[{ minWidth: 200 }, ...(Array.isArray(sx) ? sx : [sx])]}
      getOptionLabel={(option) => option.value}
      getOptionDisabled={(option) => !!option.disabled}
      isOptionEqualToValue={(option, selected) => String(option.key) === String(selected.key)}
      onChange={(_, newValue) => onChange(newValue?.key ?? null)}
      onBlur={onBlur}
      noOptionsText={noOptionsText}
      renderOption={(props, option) => {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { key, ...restProps } = props;
        return (
          <li key={String(option.key)} {...restProps}>
            {option.value}
          </li>
        );
      }}
      slotProps={{
        paper: {
          sx: {
            color: cssVarColor("text"),
            background: cssVarColor("backgroundSection"),
          },
        },
      }}
      renderInput={(params) => (
        <TextField
          {...params}
          inputRef={inputRef}
          label={label}
          placeholder={selectedOption ? undefined : placeholder}
          required={required}
          error={error}
          helperText={helperText}
          margin={margin}
          InputProps={{
            ...params.InputProps,
            startAdornment: (
              <>
                {startAdornment}
                {params.InputProps.startAdornment}
              </>
            ),
          }}
        />
      )}
    />
  );
}

export default BrainDropdownField;
