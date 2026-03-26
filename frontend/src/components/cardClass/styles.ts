"use client";
import { cssVarColor } from "@/styles";
import { BrainBoxShadow, BrainBoxShadowHover } from "@/utils/utilsCss";
import styled from "styled-components";

export const Container = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: flex-start;
  align-items: flex-start;
  border-radius: 8px;
  padding: 20px 16px;
  gap: 12px;
  border: 1px solid ${cssVarColor("border")};
  background: ${cssVarColor("backgroundSection")};
  transition: background 0.2s ease-in;
  width: 100%;
  ${BrainBoxShadow}

  &:hover {
    cursor: pointer;
    ${BrainBoxShadowHover}
  }
`;

export const AreaImage = styled.div`
  flex-shrink: 0;
  width: 100%;
  max-width: 75px;
  max-height: 75px;
  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    border-radius: 8px;
  }
`;
export const AreaInfo = styled.div`
  display: grid;
  grid-template-areas:
    "title title"
    "hours classroom"
    "campus quantityStudents";
  grid-template-columns: 1fr 1fr;
  grid-template-rows: auto auto auto;
  gap: 4px;
  color: ${cssVarColor("textSecondary")};
`;
export const AreaTitle = styled.div`
  grid-area: title;
  font-size: 1.2rem;
  font-weight: bold;
  color: ${cssVarColor("textSecondary")};
`;

export const AreaHours = styled.div`
  grid-area: hours;
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 4px;
  font-size: 0.875rem;
  line-height: 1.5em;
`;

export const AreaClassroom = styled.div`
  grid-area: classroom;
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 4px;
`;

export const AreaCampus = styled.div`
  grid-area: campus;
  font-size: 0.875rem;
  line-height: 1.5em;
`;
export const AreaQuantityStudents = styled.div`
  grid-area: quantityStudents;
  font-size: 0.875rem;
  line-height: 1.5em;
`;
