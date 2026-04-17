"use client";
import styled from "styled-components";

export const Nav = styled.nav`
  width: 100%;
  max-width: 1400px;
  margin: 0 auto;
  padding: 16px 20px 0;
`;

export const List = styled.ol`
  display: flex;
  align-items: center;
  gap: 8px;
  list-style: none;
  margin: 0;
  padding: 0;
  flex-wrap: wrap;
`;

export const Item = styled.li`
  display: flex;
  align-items: center;
  gap: 8px;
`;

export const CrumbLink = styled.a`
  font-family: "Inter", sans-serif;
  font-size: 14px;
  font-weight: 400;
  line-height: 20px;
  color: #6a7282;
  text-decoration: none;
  white-space: nowrap;

  &:hover {
    color: #101828;
    text-decoration: underline;
  }
`;

export const CrumbText = styled.span<{ $current?: boolean }>`
  font-family: "Inter", sans-serif;
  font-size: 14px;
  line-height: 20px;
  white-space: nowrap;
  color: ${({ $current }) => ($current ? "#101828" : "#6a7282")};
  font-weight: ${({ $current }) => ($current ? 500 : 400)};
`;

export const Separator = styled.span`
  display: inline-flex;
  align-items: center;
  color: #6a7282;

  svg {
    font-size: 16px;
  }
`;
