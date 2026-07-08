"use client";

import { Box, styled, Typography } from "@mui/material";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

const DIAS = ["Domingo", "Segunda", "Terça", "Quarta", "Quinta", "Sexta", "Sábado"];

const TableWrapper = styled(Box)`
  width: 100%;
  overflow-x: auto;
`;

const Table = styled("table")`
  width: 100%;
  border-collapse: separate;
  border-spacing: 0;
  min-width: 720px;
`;

const Th = styled("th")`
  padding: 10px 8px;
  text-align: center;
  font-size: 12px;
  font-weight: 600;
  color: var(--colors-textSecondary);
  border-bottom: 1px solid var(--colors-border);
  white-space: nowrap;
`;

const ThHorario = styled(Th)`
  width: 104px;
  min-width: 90px;
  text-align: left;
  padding-left: 10px;
`;

const Td = styled("td")`
  padding: 5px;
  border-bottom: 1px solid var(--colors-borderSubtle);
  vertical-align: top;
  min-width: 118px;
`;

const TdHorario = styled("td")`
  padding: 8px 10px;
  border-bottom: 1px solid var(--colors-borderSubtle);
  text-align: center;
  font-size: 12px;
  color: var(--colors-textSecondary);
  font-variant-numeric: tabular-nums;
  white-space: nowrap;
  background: var(--colors-surfaceSunken);
`;

const TrIntervalo = styled("tr")`
  background: var(--colors-warningSubtle);
`;

const TdIntervalo = styled("td")`
  padding: 7px 4px;
  border-bottom: 1px solid var(--colors-borderSubtle);
  text-align: center;
  font-size: 11px;
  font-weight: 600;
  color: var(--colors-warningText);
  letter-spacing: 0.08em;
  background: var(--colors-warningSubtle);
`;

export const ClassCard = styled(Box)`
  background: var(--colors-primarySubtle);
  border-left: 3px solid var(--colors-primary);
  border-radius: var(--radii-sm);
  padding: 7px 9px;
  cursor: pointer;
  transition: background 0.14s ease;

  &:hover {
    background: var(--colors-primarySubtleHover);
  }
`;

const EmptyCell = styled(Box)`
  text-align: center;
  color: var(--colors-textTertiary);
  font-size: 14px;
  padding: 8px 0;
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
      <Box sx={{ textAlign: "center", color: "var(--colors-textSecondary)", py: 4 }}>
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
                  sx={{
                    fontSize: 11,
                    fontWeight: 400,
                    color: "var(--colors-textTertiary)",
                    fontVariantNumeric: "tabular-nums",
                    mt: 0.3,
                  }}
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
