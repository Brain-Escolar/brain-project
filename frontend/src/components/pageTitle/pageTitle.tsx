import React from "react";
import * as S from "./styles";
import { isNullUndefined } from "@/utils/utils";

interface IPageTitleProps {
  title: string;
  description?: string;
}
function PageTitle({ title, description }: IPageTitleProps) {
  const hasDescription = !isNullUndefined(description) && description.trim() !== "";
  return (
    <S.Container>
      <S.AreaTitle>{title}</S.AreaTitle>
      {hasDescription && <S.AreaDescription>{description}</S.AreaDescription>}
    </S.Container>
  );
}

export default PageTitle;
