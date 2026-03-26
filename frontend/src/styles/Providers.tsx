"use client";

import React from "react";
import StyledComponentsRegistry from "../../lib/registry";
import GlobalStyle from "./GlobalStyle";
import { QueryProvider } from "@/providers/QueryProvider";

function Providers({ children }: React.PropsWithChildren) {
  return (
    <StyledComponentsRegistry>
      <QueryProvider>
        <GlobalStyle />
        {children}
      </QueryProvider>
    </StyledComponentsRegistry>
  );
}

export default Providers;
