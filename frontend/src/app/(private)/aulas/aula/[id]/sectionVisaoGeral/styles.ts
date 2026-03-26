import { cssVarColor } from "@/styles";
import styled from "styled-components";

export const Container = styled.div`
  background: ${cssVarColor("backgroundSection")};
  padding: 0.4rem 1rem;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  border-radius: 0.5rem;
`;
