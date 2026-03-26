import React, { PropsWithChildren } from "react";
import * as S from "./styles";

interface ILayoutColumnsProps {
  sizeLeft?: string; // Ex: "70%", "2fr", "300px"
  sizeRight?: string;
}

function LayoutColumns({
  sizeLeft = "1fr",
  sizeRight = "1fr",
  children,
}: PropsWithChildren<ILayoutColumnsProps>) {
  const childrenArray = React.Children.toArray(children);

  if (childrenArray.length !== 2) {
    console.warn("LayoutColumns espera exatamente 2 elementos filhos.");
  }

  return (
    <S.Container>
      <S.Column size={sizeLeft}>{childrenArray[0]}</S.Column>
      <S.Column size={sizeRight}>{childrenArray[1]}</S.Column>
    </S.Container>
  );
}

export default LayoutColumns;
