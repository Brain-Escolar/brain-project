import React, { PropsWithChildren } from "react";
import * as S from "./styles";
import { Button } from "@mui/material";

interface IBrainButtonPrimaryProps {
  onClick?: () => void;
  disabled?: boolean;
  isLoading?: boolean;
  type?: "button" | "submit" | "reset";
}

function BrainButtonPrimary({
  onClick,
  disabled,
  isLoading,
  children,
  type = "button",
}: PropsWithChildren<IBrainButtonPrimaryProps>) {
  return (
    <S.ContainerButton>
      <Button
        variant="contained"
        type={type}
        disabled={disabled || isLoading}
        onClick={onClick}
        loading={isLoading}
      >
        {children}
      </Button>
    </S.ContainerButton>
  );
}

export default BrainButtonPrimary;
