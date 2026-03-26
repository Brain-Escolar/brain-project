export const dynamic = "force-dynamic";

import LayoutColumns from "@/components/layoutColumns/layoutColumns";
import PageTitle from "@/components/pageTitle/pageTitle";
import { generateTitlePage } from "@/utils/utils";
import { Metadata } from "next";
import * as S from "./styles";
import { aulaApi } from "@/services/api";
import CardClass from "@/components/cardClass/cardClass";

export const metadata: Metadata = {
  title: generateTitlePage("Minhas Aulas"),
  description: "Gerencie suas aulas e atividades",
};

export default async function MinhasAulas() {
  const aulas = await aulaApi.getAula();
  const { content } = aulas;
  return (
    <S.Container>
      <PageTitle title="Minhas Aulas" description="Manage your classes and view today's schedule" />
      <LayoutColumns sizeLeft="70%" sizeRight="30%">
        <S.AreaClass>
          {content.map((aula, index) => (
            <CardClass
              key={index}
              title={aula.disciplina}
              image={"https://placehold.co/100.png"}
              hour={aula.horario}
              classroom={aula.turma}
              campus={""}
              quantityStudents={0}
            />
          ))}
        </S.AreaClass>
        <S.AreaAssignments>
          <PageTitle title="Assignments" description="Recent assign and theis status" />
          {/* Here you can add components or content related to assignments */}
          {/* Example: <CardAssignment /> */}
        </S.AreaAssignments>
      </LayoutColumns>
    </S.Container>
  );
}
