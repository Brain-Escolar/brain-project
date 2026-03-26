import React, { PropsWithChildren } from "react";
import * as S from "./styles";
import { Button } from "@mui/material";

interface BrainButtonSecondaryProps {
  onClick: () => void;
  disabled?: boolean;
  isLoading?: boolean;
}

function BrainButtonSecondary({
  onClick,
  disabled,
  isLoading,
  children,
}: PropsWithChildren<BrainButtonSecondaryProps>) {
  return (
    <S.ContainerButton>
      <Button variant="outlined" onClick={onClick} disabled={disabled} loading={isLoading}>
        {children}
      </Button>
    </S.ContainerButton>
  );
}

export default BrainButtonSecondary;
