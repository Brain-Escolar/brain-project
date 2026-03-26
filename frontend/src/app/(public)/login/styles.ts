"use client";
import styled from "styled-components";
import { Box } from "@mui/material";

export const LoginWrapper = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100vh;
  background: linear-gradient(to right, #e0f7fa, #80deea);
  padding: 1rem;
`;

export const FormBox = styled(Box)`
  display: flex;
  flex-direction: column;
  padding: 3rem 2rem;
  width: 100%;
  max-width: 400px;
  border-radius: 16px;
`;
