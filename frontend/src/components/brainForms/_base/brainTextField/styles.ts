"use client";
import { TextField } from "@mui/material";
import { cssVarColor } from "@/styles";
import styled from "styled-components";

export const StyledTextField = styled(TextField)`
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

    & .MuiInputBase-input {
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
