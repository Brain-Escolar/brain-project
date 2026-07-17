import React from "react";
import SearchIcon from "@mui/icons-material/Search";
import * as S from "./styles";

interface IBrainResultNotFoundProps {
  message?: string;
  /** Texto de apoio exibido abaixo do título. */
  description?: string;
  /** Ícone customizado (padrão: lupa). */
  icon?: React.ReactNode;
}

function BrainResultNotFound({ message, description, icon }: IBrainResultNotFoundProps) {
  return (
    <S.Container>
      {icon ?? <SearchIcon color="primary" />}
      <S.TitleResultNotFound>{message || "Não foram encontrado resultados"}</S.TitleResultNotFound>
      {description && (
        <S.DescriptionResultNotFound>{description}</S.DescriptionResultNotFound>
      )}
    </S.Container>
  );
}

export default BrainResultNotFound;
