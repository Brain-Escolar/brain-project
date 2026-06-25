import React from "react";
import * as S from "./styles";
import Image from "next/image";
import { isNullUndefined } from "@/utils/utils";
import { getDisciplinaIcon, formatProfessorLabel } from "@/utils/disciplinaUtils";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import LocationOnOutlinedIcon from "@mui/icons-material/LocationOnOutlined";
import PeopleAltOutlinedIcon from "@mui/icons-material/PeopleAltOutlined";
import PersonOutlineOutlinedIcon from "@mui/icons-material/PersonOutlineOutlined";

interface ICardClassProps {
  title: string;
  image?: string;
  /** Nome da disciplina — exibe ícone temático no lugar da imagem. */
  disciplina?: string;
  classroom: string;
  hour: string;
  /** Unidade/campus (usado no dashboard do aluno). */
  campus?: string;
  /** Professor da aula (dashboard do aluno). */
  teacher?: string;
  /** Quantidade de alunos (usado no dashboard do professor). */
  students?: number;
  /** Destaca o card (ex.: próxima aula do dia). */
  highlight?: boolean;
  /** Rótulo à direita do card (ex.: "Próxima aula"). */
  badgeLabel?: string;
  onClick?: () => void;
}

function CardClass({
  campus,
  classroom,
  disciplina,
  image,
  hour,
  title,
  teacher,
  students,
  highlight = false,
  badgeLabel,
  onClick,
}: ICardClassProps) {
  const showImage = !isNullUndefined(image);
  const showDisciplinaIcon = !showImage && !isNullUndefined(disciplina) && disciplina.trim() !== "";
  const hasStudents = !isNullUndefined(students);
  const hasCampus = !isNullUndefined(campus) && campus.trim() !== "";
  const hasTeacher = !isNullUndefined(teacher) && teacher.trim() !== "";
  const DisciplinaIcon = showDisciplinaIcon ? getDisciplinaIcon(disciplina!) : null;

  return (
    <S.Container onClick={onClick} $clickable={!!onClick} $highlight={highlight}>
      {showImage && (
        <S.AreaImage>
          <Image src={image} alt="" width={64} height={64} />
        </S.AreaImage>
      )}

      {showDisciplinaIcon && DisciplinaIcon && (
        <S.AreaIcon>
          <DisciplinaIcon sx={{ fontSize: 28, color: "var(--colors-textSecondary)" }} />
        </S.AreaIcon>
      )}

      <S.AreaInfo>
        <S.AreaTitle>{title}</S.AreaTitle>
        <S.MetaRow>
          <S.MetaItem>
            <AccessTimeIcon fontSize="small" />
            {hour}
          </S.MetaItem>
          <S.MetaItem>
            <LocationOnOutlinedIcon fontSize="small" />
            {classroom}
          </S.MetaItem>
          {hasStudents ? (
            <S.MetaItem>
              <PeopleAltOutlinedIcon fontSize="small" />
              {students} alunos
            </S.MetaItem>
          ) : hasTeacher ? (
            <S.MetaItem>
              <PersonOutlineOutlinedIcon fontSize="small" />
              {formatProfessorLabel(teacher!)}
            </S.MetaItem>
          ) : hasCampus ? (
            <S.MetaItem>{campus}</S.MetaItem>
          ) : null}
        </S.MetaRow>
      </S.AreaInfo>

      {badgeLabel && <S.Badge>{badgeLabel}</S.Badge>}
    </S.Container>
  );
}

export default CardClass;

/** Painel que agrupa uma lista de {@link CardClass} num único cartão. */
export const CardClassPanel = S.Panel;
