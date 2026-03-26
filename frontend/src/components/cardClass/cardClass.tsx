import React from "react";
import * as S from "./styles";
import Image from "next/image";
import { isNullUndefined } from "@/utils/utils";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import LocationOnIcon from "@mui/icons-material/LocationOn";

interface ICardClassProps {
  title: string;
  image?: string;
  classroom: string;
  hour: string;
  campus: string;
  quantityStudents: number;
  onClick?: () => void;
}

function CardClass({
  campus,
  classroom,
  image,
  quantityStudents,
  hour,
  title,
  onClick,
}: ICardClassProps) {
  const showAreaImage = !isNullUndefined(image);

  return (
    <S.Container onClick={onClick} style={{ cursor: onClick ? "pointer" : "default" }}>
      {showAreaImage && (
        <S.AreaImage>
          <Image src={image} alt="Placeholder" width={75} height={75} />
        </S.AreaImage>
      )}
      <S.AreaInfo>
        <S.AreaTitle>{title}</S.AreaTitle>
        <S.AreaHours>
          <AccessTimeIcon fontSize="small" />
          {hour}
        </S.AreaHours>
        <S.AreaClassroom>
          <LocationOnIcon fontSize="small" />
          {classroom}
        </S.AreaClassroom>
        <S.AreaCampus>{campus}</S.AreaCampus>
        <S.AreaQuantityStudents>
          {quantityStudents} {quantityStudents === 1 ? "Aluno" : "Alunos"}
        </S.AreaQuantityStudents>
      </S.AreaInfo>
    </S.Container>
  );
}

export default CardClass;
