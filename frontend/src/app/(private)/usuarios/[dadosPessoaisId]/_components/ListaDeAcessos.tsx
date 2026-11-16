"use client";

import { Box, Chip, Tooltip, Typography } from "@mui/material";
import {
  AreaDiretaResponse,
  ControleEfetivoResponse,
  OrigemAcessoResponse,
  TelaEfetivaResponse,
} from "@/services/domains/usuario";

/**
 * Telas e ações de um perfil, agrupadas por módulo, com a origem de cada item
 * (grupo, acesso individual ou teto do administrador). Serve à seção "Acesso
 * efetivo" e ao diálogo de conceder ou remover perfil.
 */
export function ListaDeAcessos({
  telas,
  controles,
  vazio,
}: {
  telas: TelaEfetivaResponse[];
  controles: ControleEfetivoResponse[];
  vazio: string;
}) {
  if (telas.length === 0 && controles.length === 0) {
    return (
      <Typography variant="body2" color="text.secondary">
        {vazio}
      </Typography>
    );
  }

  const modulos = new Map<string, TelaEfetivaResponse[]>();
  telas.forEach((tela) => {
    const modulo = tela.modulo ?? "Outras telas";
    modulos.set(modulo, [...(modulos.get(modulo) ?? []), tela]);
  });

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
      {[...modulos.entries()].map(([modulo, telasDoModulo]) => (
        <Box key={modulo}>
          <Typography variant="overline" color="text.secondary" component="div">
            {modulo}
          </Typography>
          <Box component="ul" sx={{ listStyle: "none", m: 0, p: 0 }}>
            {telasDoModulo.map((tela) => (
              <Linha key={tela.codigo} nome={tela.nome} origens={tela.origens} />
            ))}
          </Box>
        </Box>
      ))}
      {controles.length > 0 && (
        <Box>
          <Typography variant="overline" color="text.secondary" component="div">
            Ações
          </Typography>
          <Box component="ul" sx={{ listStyle: "none", m: 0, p: 0 }}>
            {controles.map((controle) => (
              <Linha
                key={controle.codigo}
                nome={controle.nome}
                detalhe={controle.tela ?? undefined}
                sensivel={controle.sensivel}
                origens={controle.origens}
              />
            ))}
          </Box>
        </Box>
      )}
    </Box>
  );
}

function Linha({
  nome,
  detalhe,
  sensivel = false,
  origens,
}: {
  nome: string;
  detalhe?: string;
  sensivel?: boolean;
  origens: OrigemAcessoResponse[];
}) {
  return (
    <Box
      component="li"
      sx={{
        display: "flex",
        flexWrap: "wrap",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 1,
        py: 0.75,
        borderBottom: 1,
        borderColor: "divider",
      }}
    >
      <Box sx={{ display: "flex", alignItems: "center", gap: 1, flexWrap: "wrap", minWidth: 0 }}>
        <Typography variant="body2">{nome}</Typography>
        {detalhe && (
          <Typography variant="caption" color="text.secondary">
            {detalhe}
          </Typography>
        )}
        {sensivel && <Chip size="small" color="warning" variant="outlined" label="Dado sensível" />}
      </Box>
      <Box sx={{ display: "flex", gap: 0.5, flexWrap: "wrap" }}>
        {origens.map((origem) => (
          <Chip
            key={`${origem.tipo}-${origem.nome}`}
            size="small"
            variant={origem.tipo === "GRUPO" ? "filled" : "outlined"}
            color={origem.tipo === "INDIVIDUAL" ? "primary" : "default"}
            label={origem.nome}
          />
        ))}
      </Box>
    </Box>
  );
}

/** O que o perfil abre direto no servidor, sem grupo. */
export function ListaServidor({ areas }: { areas: AreaDiretaResponse[] }) {
  if (areas.length === 0) {
    return (
      <Typography variant="body2" color="text.secondary">
        Este perfil não abre nenhuma área direto no servidor.
      </Typography>
    );
  }
  return (
    <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.75 }}>
      {areas.map((area) => (
        <Tooltip key={area.nome} title={area.detalhe}>
          <Chip
            size="small"
            variant="outlined"
            color={area.sensivel ? "warning" : "default"}
            label={area.sensivel ? `${area.nome} · Dado sensível` : area.nome}
          />
        </Tooltip>
      ))}
    </Box>
  );
}
