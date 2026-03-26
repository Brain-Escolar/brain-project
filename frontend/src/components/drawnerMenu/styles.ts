import { cssVarColor } from "@/styles";
import Link from "next/link";
import styled from "styled-components";

export const Container = styled.div`
  margin-left: auto;
`;

const BaseLink = styled(Link)`
  text-decoration: none;
  color: ${cssVarColor("text")};
`;

export const LinkLogo = styled(BaseLink)`
  text-decoration: none;
  color: ${cssVarColor("text")};
`;
export const ItemMenu = styled(BaseLink)`
  display: flex;
  color: black;

  &&& {
    .MuiButtonBase-root {
      display: flex;
      align-items: flex-start;
      gap: 6px;
      color: ${cssVarColor("text")};
      text-transform: none;

      &:hover {
      }
    }
  }
`;
