"use client";

import { Box, styled, Typography } from "@mui/material";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

const DIAS = ["Segunda", "Terça", "Quarta", "Quinta", "Sexta"];

const TableWrapper = styled(Box)`
  width: 100%;
  overflow-x: auto;
`;

const Table = styled("table")`
  width: 100%;
  border-collapse: collapse;
  min-width: 700px;
`;

const Th = styled("th")`
  padding: 12px 8px;
  text-align: center;
  font-size: 13px;
  font-weight: 600;
  color: #444;
  border: 1px solid #e0e0e0;
  background: #fff;
  white-space: nowrap;
`;

const ThHorario = styled(Th)`
  width: 110px;
  min-width: 90px;
`;

const Td = styled("td")`
  padding: 6px;
  border: 1px solid #e0e0e0;
  vertical-align: top;
  min-width: 120px;
`;

const TdHorario = styled("td")`
  padding: 8px 10px;
  border: 1px solid #e0e0e0;
  text-align: center;
  font-size: 12px;
  color: #666;
  white-space: nowrap;
  background: #fafafa;
`;

const TrIntervalo = styled("tr")`
  background: #fef9e7;
`;

const TdIntervalo = styled("td")`
  padding: 10px 8px;
  border: 1px solid #e0e0e0;
  text-align: center;
  font-size: 12px;
  font-weight: 600;
  color: #b8860b;
  letter-spacing: 1px;
  background: #fef9e7;
`;

export const ClassCard = styled(Box)`
  background: #e8f4fd;
  border-left: 3px solid #2196f3;
  border-radius: 4px;
  padding: 6px 8px;
  cursor: pointer;

  &:hover {
    background: #d0eaf9;
  }
`;

const EmptyCell = styled(Box)`
  text-align: center;
  color: #bbb;
  font-size: 14px;
  padding: 8px;
`;

interface TimeSlot {
  key: string;
  inicioMin: number;
  fimMin: number;
  label: string;
  isIntervalo?: boolean;
}

export interface AulaBase {
  horarioInicio: string;
  horarioFim: string;
}

const parseTimeToMinutes = (time: string): number => {
  const [h, m] = time.split(":").map(Number);
  return h * 60 + m;
};

const formatHour = (minutes: number): string => {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
};

function buildTimeSlots<T extends AulaBase>(aulasByDay: T[][]): TimeSlot[] {
  const slotMap = new Map<string, TimeSlot>();

  for (const aulas of aulasByDay) {
    for (const aula of aulas) {
      const inicioMin = parseTimeToMinutes(aula.horarioInicio);
      const fimMin = parseTimeToMinutes(aula.horarioFim);
      const key = `${inicioMin}-${fimMin}`;
      if (!slotMap.has(key)) {
        slotMap.set(key, {
          key,
          inicioMin,
          fimMin,
          label: `${formatHour(inicioMin)} - ${formatHour(fimMin)}`,
        });
      }
    }
  }

  const sorted = Array.from(slotMap.values()).sort((a, b) => a.inicioMin - b.inicioMin);

  const withIntervalos: TimeSlot[] = [];
  for (let i = 0; i < sorted.length; i++) {
    if (i > 0) {
      const prev = sorted[i - 1];
      const curr = sorted[i];
      if (curr.inicioMin - prev.fimMin > 5) {
        withIntervalos.push({
          key: `intervalo-${prev.fimMin}-${curr.inicioMin}`,
          inicioMin: prev.fimMin,
          fimMin: curr.inicioMin,
          label: `${formatHour(prev.fimMin)} - ${formatHour(curr.inicioMin)}`,
          isIntervalo: true,
        });
      }
    }
    withIntervalos.push(sorted[i]);
  }

  return withIntervalos;
}

interface TabelaHorarioSemanalProps<T extends AulaBase> {
  aulasByDay: T[][];
  weekDays: Date[];
  renderCard: (aula: T) => React.ReactNode;
  onAulaClick?: (aula: T) => void;
}

export default function TabelaHorarioSemanal<T extends AulaBase>({
  aulasByDay,
  weekDays,
  renderCard,
  onAulaClick,
}: TabelaHorarioSemanalProps<T>) {
  const timeSlots = buildTimeSlots(aulasByDay);

  const findAula = (dayIndex: number, slot: TimeSlot): T | undefined =>
    aulasByDay[dayIndex]?.find(
      (a) =>
        parseTimeToMinutes(a.horarioInicio) === slot.inicioMin &&
        parseTimeToMinutes(a.horarioFim) === slot.fimMin,
    );

  if (timeSlots.filter((s) => !s.isIntervalo).length === 0) {
    return (
      <Box sx={{ textAlign: "center", color: "#999", py: 4 }}>
        Nenhuma aula encontrada para essa semana
      </Box>
    );
  }

  return (
    <TableWrapper>
      <Table>
        <thead>
          <tr>
            <ThHorario>Horário</ThHorario>
            {weekDays.map((date, i) => (
              <Th key={i}>
                {DIAS[i]}
                <Typography
                  component="div"
                  sx={{ fontSize: 11, fontWeight: 400, color: "#999", mt: 0.3 }}
                >
                  {format(date, "dd/MM", { locale: ptBR })}
                </Typography>
              </Th>
            ))}
          </tr>
        </thead>
        <tbody>
          {timeSlots.map((slot) => {
            if (slot.isIntervalo) {
              return (
                <TrIntervalo key={slot.key}>
                  <TdIntervalo>{slot.label}</TdIntervalo>
                  {weekDays.map((_, i) => (
                    <TdIntervalo key={i}>INTERVALO</TdIntervalo>
                  ))}
                </TrIntervalo>
              );
            }

            return (
              <tr key={slot.key}>
                <TdHorario>{slot.label}</TdHorario>
                {weekDays.map((_, dayIndex) => {
                  const aula = findAula(dayIndex, slot);
                  return (
                    <Td key={dayIndex}>
                      {aula ? (
                        <ClassCard onClick={() => onAulaClick?.(aula)}>
                          {renderCard(aula)}
                        </ClassCard>
                      ) : (
                        <EmptyCell>—</EmptyCell>
                      )}
                    </Td>
                  );
                })}
              </tr>
            );
          })}
        </tbody>
      </Table>
    </TableWrapper>
  );
}
