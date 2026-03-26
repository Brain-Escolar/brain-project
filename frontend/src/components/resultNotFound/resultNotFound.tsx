import React from "react";
import SearchIcon from "@mui/icons-material/Search";
import * as S from "./styles";
interface IBrainResultNotFoundProps {
  message?: string;
}

function BrainResultNotFound({ message }: IBrainResultNotFoundProps) {
  return (
    <S.Container>
      <SearchIcon color="primary" />
      <S.TitleResultNotFound>{message || "Não foram encontrado resultados"}</S.TitleResultNotFound>
    </S.Container>
  );
}

export default BrainResultNotFound;
