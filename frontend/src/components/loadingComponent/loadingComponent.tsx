import { CircularProgress } from "@mui/material";
import * as S from "./styles";

function LoadingComponent() {
  return (
    <S.Container>
      <CircularProgress />
    </S.Container>
  );
}

export default LoadingComponent;
