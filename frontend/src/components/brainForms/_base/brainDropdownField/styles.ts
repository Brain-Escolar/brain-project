"use client";
import { FormControl, Select, MenuItem } from "@mui/material";
import { cssVarColor } from "@/styles";
import styled from "styled-components";

export const StyledFormControl = styled(FormControl)`
  width: 100%;
  &&& {
    .MuiFormLabel-asterisk {
      color: ${cssVarColor("error")};
    }

    & .MuiOutlinedInput-root {
      border-radius: 8px;
      background: ${cssVarColor("backgroundSection")};
      transition: all 0.2s ease-in;

      & fieldset {
        border-color: ${cssVarColor("border")};
      }

      &:hover fieldset {
        border-color: ${cssVarColor("primary")};
      }

      &.Mui-focused fieldset {
        border-color: ${cssVarColor("primary")};
      }

      &.Mui-error fieldset {
        border-color: #ef4444;
      }
    }

    & .MuiInputLabel-root {
      color: ${cssVarColor("textSecondary")};

      &.Mui-focused {
        color: ${cssVarColor("primary")};
      }

      &.Mui-error {
        color: #ef4444;
      }
    }

    & .MuiSelect-select {
      color: ${cssVarColor("text")};
    }

    & .MuiFormHelperText-root {
      color: ${cssVarColor("textSecondary")};

      &.Mui-error {
        color: #ef4444;
      }
    }
  }
`;

export const StyledSelect = styled(Select)``;

export const StyledMenuItem = styled(MenuItem)`
  &&& {
    color: ${cssVarColor("text")};
    background: ${cssVarColor("backgroundSection")};

    &:hover {
      background: ${cssVarColor("backgroundHover")};
    }

    &.Mui-selected {
      background: ${cssVarColor("backgroundHover")};

      &:hover {
        background: ${cssVarColor("backgroundHover")};
      }
    }
  }
`;
