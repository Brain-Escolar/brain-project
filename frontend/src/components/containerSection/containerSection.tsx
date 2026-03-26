"use client";
import React, { PropsWithChildren } from "react";
import * as S from "./styles";

interface IContainerSectionProps {
  title?: string;
  description?: string;
  numberOfCollumns?: number;
}

function ContainerSection({
  title,
  description,
  children,
  numberOfCollumns = 1,
}: PropsWithChildren<IContainerSectionProps>) {
  return (
    <S.Container>
      <S.HeaderContainer>
        {title && <h3>{title}</h3>}
        {description && <p>{description}</p>}
      </S.HeaderContainer>
      <S.BodyContainer $numberOfCollumns={numberOfCollumns}>{children} </S.BodyContainer>
    </S.Container>
  );
}

export default ContainerSection;
