"use client";
import React, { PropsWithChildren } from "react";
import * as S from "./styles";

interface IContainerSectionProps {
  title?: string;
  description?: string;
  numberOfCollumns?: number;
  actions?: React.ReactNode;
}

function ContainerSection({
  title,
  description,
  children,
  numberOfCollumns = 1,
  actions,
}: PropsWithChildren<IContainerSectionProps>) {
  return (
    <S.Container>
      <S.HeaderContainer>
        <S.HeaderTitleRow>
          <div>
            {title && <h3>{title}</h3>}
            {description && <p>{description}</p>}
          </div>
          {actions && <S.HeaderActions>{actions}</S.HeaderActions>}
        </S.HeaderTitleRow>
      </S.HeaderContainer>
      <S.BodyContainer $numberOfCollumns={numberOfCollumns}>{children} </S.BodyContainer>
    </S.Container>
  );
}

export default ContainerSection;
