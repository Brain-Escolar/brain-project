"use client";
import styled from "styled-components";

export const Container = styled.div`
  display: flex;
  gap: 16px;

  @media (max-width: 768px) {
    flex-direction: column;
  }
`;

export const Column = styled.div<{ size: string }>`
  flex: 0 0 ${({ size }) => size};
  max-width: ${({ size }) => size};

  @media (max-width: 768px) {
    flex: 1 0 auto;
    max-width: none;
  }
`;
