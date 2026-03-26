"use client";
import { ProtectedRoute } from "@/components/ProtectedRoute/ProtectedRoute";
import PageTitle from "@/components/pageTitle/pageTitle";
import { UserRoleEnum } from "@/enums";
import LayoutColumns from "@/components/layoutColumns/layoutColumns";
import { Container, Typography, Box, Card, CardContent, Chip, Stack } from "@mui/material";
import { mockComunicados, Comunicado } from "../../../mocks/comunicados";

export default function ComunicadosPage() {
  const comunicados = mockComunicados;

  return (
    <ProtectedRoute allowedRoles={[UserRoleEnum.PROFESSOR, UserRoleEnum.ADMIN]}>
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <PageTitle title="Comunicados" />
        <Typography variant="body1" color="text.secondary" gutterBottom sx={{ mb: 4 }}>
          Acompanhe atualizações e comunicados importantes da escola
        </Typography>

        <LayoutColumns sizeLeft="70%" sizeRight="30%">
          {/* Lista de comunicados */}
          <Box>
            <Stack spacing={3}>
              {comunicados.map((comunicado: Comunicado) => (
                <Card key={comunicado.id} sx={{ overflow: "hidden" }}>
                  {/* Imagem placeholder */}
                  {comunicado.id === "1" && (
                    <Box
                      sx={{
                        height: 200,
                        bgcolor: "grey.300",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <Box
                        sx={{
                          width: 60,
                          height: 60,
                          bgcolor: "grey.500",
                          borderRadius: 1,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      >
                        <Typography variant="h4" color="white">
                          🖼️
                        </Typography>
                      </Box>
                    </Box>
                  )}

                  <CardContent>
                    <Box
                      sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "flex-start",
                        mb: 2,
                      }}
                    >
                      <Typography variant="h5" component="h2" gutterBottom>
                        {comunicado.titulo}
                      </Typography>
                      <Chip
                        label={comunicado.tipo}
                        color={comunicado.tipo === "Evento" ? "primary" : "secondary"}
                        size="small"
                      />
                    </Box>

                    <Typography variant="body2" color="text.secondary" paragraph>
                      {comunicado.descricao}
                    </Typography>

                    <Typography variant="caption" color="text.secondary">
                      {comunicado.data}
                    </Typography>
                  </CardContent>
                </Card>
              ))}
            </Stack>
          </Box>

          {/* Visão geral - Seção lateral */}
          <Box>
            <Typography variant="h6" gutterBottom>
              Visão geral
            </Typography>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              Resumo de todos os comunicados
            </Typography>

            <Card sx={{ mt: 2 }}>
              <CardContent>
                <Stack spacing={2}>
                  <Box
                    sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}
                  >
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                      <Box
                        sx={{
                          width: 12,
                          height: 12,
                          bgcolor: "primary.main",
                          borderRadius: 1,
                        }}
                      />
                      <Typography variant="body2" color="text.secondary">
                        Evento
                      </Typography>
                    </Box>
                    <Typography variant="body2" fontWeight="bold">
                      2
                    </Typography>
                  </Box>

                  <Box
                    sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}
                  >
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                      <Box
                        sx={{
                          width: 12,
                          height: 12,
                          bgcolor: "error.main",
                          borderRadius: 1,
                        }}
                      />
                      <Typography variant="body2" color="text.secondary">
                        Administrativo
                      </Typography>
                    </Box>
                    <Typography variant="body2" fontWeight="bold">
                      2
                    </Typography>
                  </Box>

                  <Box
                    sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}
                  >
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                      <Box
                        sx={{
                          width: 12,
                          height: 12,
                          bgcolor: "secondary.main",
                          borderRadius: 1,
                        }}
                      />
                      <Typography variant="body2" color="text.secondary">
                        Calendário
                      </Typography>
                    </Box>
                    <Typography variant="body2" fontWeight="bold">
                      2
                    </Typography>
                  </Box>

                  <Box
                    sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}
                  >
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                      <Box
                        sx={{
                          width: 12,
                          height: 12,
                          bgcolor: "success.main",
                          borderRadius: 1,
                        }}
                      />
                      <Typography variant="body2" color="text.secondary">
                        Atualização RH
                      </Typography>
                    </Box>
                    <Typography variant="body2" fontWeight="bold">
                      2
                    </Typography>
                  </Box>
                </Stack>
              </CardContent>
            </Card>
          </Box>
        </LayoutColumns>
      </Container>
    </ProtectedRoute>
  );
}
