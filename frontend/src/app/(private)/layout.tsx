"use client";
// import DrawnerMenu from "@/components/drawnerMenu/drawnerMenu";
import AppBar from "@/components/appBar/appBar";
import Breadcrumbs from "@/components/breadcrumbs";
import { BreadcrumbProvider } from "@/contexts/BreadcrumbContext";
import { DrawerProvider, useDrawer } from "@/contexts/DrawerContext";
import { Toolbar } from "@mui/material";
import Box from "@mui/material/Box";
import * as S from "./styles";

const DRAWER_WIDTH = 240;
const DRAWER_WIDTH_CLOSED = 60;

function PrivateLayoutContent({ children }: { children: React.ReactNode }) {
  const { drawerOpen } = useDrawer();

  return (
    <>
      {/* <DrawnerMenu /> */}
      <AppBar />
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          marginLeft: { xs: 0, md: drawerOpen ? `${DRAWER_WIDTH}px` : `${DRAWER_WIDTH_CLOSED}px` },
          transition: (theme) =>
            theme.transitions.create(["margin"], {
              easing: theme.transitions.easing.sharp,
              duration: theme.transitions.duration.enteringScreen,
            }),
        }}
      >
        <Toolbar />
        <Breadcrumbs />
        <S.Content>{children}</S.Content>
      </Box>
    </>
  );
}

export default function PrivateLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <S.Container>
      <DrawerProvider>
        <BreadcrumbProvider>
          <PrivateLayoutContent>{children}</PrivateLayoutContent>
        </BreadcrumbProvider>
      </DrawerProvider>
    </S.Container>
  );
}
