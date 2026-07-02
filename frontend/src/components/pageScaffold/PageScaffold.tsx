import React from "react";
import { Box } from "@mui/material";
import PageTitle from "@/components/pageTitle/pageTitle";

interface PageScaffoldProps {
  title?: string;
  description?: string;
  actions?: React.ReactNode;
  children: React.ReactNode;
}

export default function PageScaffold({ title, description, actions, children }: PageScaffoldProps) {
  const hasHeader = !!title || !!actions;
  return (
    <Box sx={{ py: 2 }}>
      {hasHeader && (
        <Box
          sx={{
            mb: 3,
            display: "flex",
            flexDirection: { xs: "column", sm: "row" },
            justifyContent: "space-between",
            alignItems: { xs: "stretch", sm: "center" },
            gap: { xs: 1.5, sm: 2 },
          }}
        >
          {title && <PageTitle title={title} description={description} />}
          {actions && <Box sx={{ flexShrink: 0 }}>{actions}</Box>}
        </Box>
      )}
      {children}
    </Box>
  );
}
