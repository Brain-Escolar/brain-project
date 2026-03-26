import { KeyValue } from "@/services/models/keyValue";
import { FormHelperText, InputLabel, SelectProps } from "@mui/material";
import React from "react";
import { StyledFormControl, StyledSelect, StyledMenuItem } from "./styles";

interface IBrainDropdownFieldProps extends Omit<SelectProps, "error"> {
  id?: string;
  label: string;
  options: KeyValue[];
  placeholder?: string;
  error?: boolean;
  helperText?: string;
}

function BrainDropdownField({
  label,
  options,
  placeholder = "Selecione uma opção",
  error = false,
  helperText,
  fullWidth = true,
  size = "small",
  required = false,
  ...selectProps
}: IBrainDropdownFieldProps) {
  return (
    <StyledFormControl fullWidth={fullWidth} error={error} size={size}>
      <InputLabel required={required}>{label}</InputLabel>
      <StyledSelect {...selectProps} label={label} size={size} required={required}>
        <StyledMenuItem value="">{placeholder}</StyledMenuItem>
        {options.map((option) => (
          <StyledMenuItem key={option.key} value={option.key}>
            {option.value}
          </StyledMenuItem>
        ))}
      </StyledSelect>
      {helperText && <FormHelperText>{helperText}</FormHelperText>}
    </StyledFormControl>
  );
}

export default BrainDropdownField;
