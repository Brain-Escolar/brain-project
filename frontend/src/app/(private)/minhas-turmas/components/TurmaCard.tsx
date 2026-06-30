import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import { TurmaProfessorResumoResponse } from "@/services/domains/professor/response";
import * as S from "./TurmaCard.styles";

interface TurmaCardProps {
  turma: TurmaProfessorResumoResponse;
  nomeDisciplina: string;
  onClick: () => void;
}

function formatMedia(media: number | null): string {
  return media == null ? "—" : media.toFixed(1).replace(".", ",");
}

function formatFrequencia(frequencia: number | null): string {
  return frequencia == null ? "—" : `${frequencia}%`;
}

export default function TurmaCard({ turma, nomeDisciplina, onClick }: TurmaCardProps) {
  return (
    <S.Card onClick={onClick}>
      <S.Top>
        <div>
          <S.Title>
            {turma.serieNome} {turma.nomeTurma}
          </S.Title>
          <S.Subtitle>
            {nomeDisciplina} · {turma.totalAlunos} alunos
          </S.Subtitle>
        </div>
        <ChevronRightIcon fontSize="small" sx={{ color: "var(--colors-textTertiary)" }} />
      </S.Top>
      <S.Stats>
        <S.Stat>
          <S.StatValue>{formatFrequencia(turma.frequenciaTurma)}</S.StatValue>
          <S.StatLabel>Frequência</S.StatLabel>
        </S.Stat>
        <S.Stat>
          <S.StatValue>{formatMedia(turma.mediaTurma)}</S.StatValue>
          <S.StatLabel>Nota média</S.StatLabel>
        </S.Stat>
      </S.Stats>
    </S.Card>
  );
}
