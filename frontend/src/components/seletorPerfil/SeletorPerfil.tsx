"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import CheckIcon from "@mui/icons-material/Check";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import SwitchAccountOutlinedIcon from "@mui/icons-material/SwitchAccountOutlined";
import SchoolOutlinedIcon from "@mui/icons-material/SchoolOutlined";
import CoPresentOutlinedIcon from "@mui/icons-material/CoPresentOutlined";
import FamilyRestroomOutlinedIcon from "@mui/icons-material/FamilyRestroomOutlined";
import BadgeOutlinedIcon from "@mui/icons-material/BadgeOutlined";
import AdminPanelSettingsOutlinedIcon from "@mui/icons-material/AdminPanelSettingsOutlined";

import { usePerfilAtivo } from "@/contexts/PerfilAtivoContext";
import { UserRoleEnum } from "@/enums";
import { PERFIL_DISPLAY_NAME } from "@/enums/PerfilNomeEnum";
import { RoutesEnum } from "@/enums";
import * as S from "./styles";

const ICONE: Record<UserRoleEnum, React.ReactNode> = {
  [UserRoleEnum.ESTUDANTE]: <SchoolOutlinedIcon />,
  [UserRoleEnum.PROFESSOR]: <CoPresentOutlinedIcon />,
  [UserRoleEnum.RESPONSAVEL]: <FamilyRestroomOutlinedIcon />,
  [UserRoleEnum.SECRETARIO]: <BadgeOutlinedIcon />,
  [UserRoleEnum.ADMIN]: <AdminPanelSettingsOutlinedIcon />,
};

/**
 * Troca sob qual perfil a pessoa está usando o sistema.
 *
 * Só aparece para quem acumula mais de um — a grande maioria tem um só e não
 * precisa saber que isso existe.
 */
export default function SeletorPerfil() {
  const { perfis, perfilAtivo, trocarPerfil, precisaSeletor } = usePerfilAtivo();
  const [aberto, setAberto] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  useEffect(() => {
    if (!aberto) return;

    function onClickFora(e: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setAberto(false);
      }
    }
    function onEsc(e: KeyboardEvent) {
      if (e.key === "Escape") setAberto(false);
    }

    document.addEventListener("mousedown", onClickFora);
    document.addEventListener("keydown", onEsc);
    return () => {
      document.removeEventListener("mousedown", onClickFora);
      document.removeEventListener("keydown", onEsc);
    };
  }, [aberto]);

  if (!precisaSeletor || !perfilAtivo) return null;

  return (
    <S.Wrapper ref={wrapperRef}>
      <S.Trigger
        type="button"
        onClick={() => setAberto((v) => !v)}
        aria-haspopup="listbox"
        aria-expanded={aberto}
        aria-label={`Perfil ativo: ${PERFIL_DISPLAY_NAME[perfilAtivo]}. Trocar de perfil.`}
      >
        <SwitchAccountOutlinedIcon sx={{ fontSize: 18 }} />
        <S.Rotulo>{PERFIL_DISPLAY_NAME[perfilAtivo]}</S.Rotulo>
        <ExpandMoreIcon sx={{ fontSize: 18 }} />
      </S.Trigger>

      {aberto && (
        <S.Dropdown role="listbox" aria-label="Perfis disponíveis">
          <S.Titulo>Usar o sistema como</S.Titulo>
          {perfis.map((perfil) => {
            const ativo = perfil === perfilAtivo;
            return (
              <S.Opcao
                key={perfil}
                type="button"
                role="option"
                aria-selected={ativo}
                $ativo={ativo}
                onClick={() => {
                  setAberto(false);
                  if (ativo) return;
                  trocarPerfil(perfil);
                  // Volta para a home: a rota atual pode não existir no novo
                  // perfil, e o middleware redirecionaria de qualquer forma.
                  router.push(RoutesEnum.HOME);
                }}
              >
                {ICONE[perfil]}
                <span style={{ flex: 1 }}>{PERFIL_DISPLAY_NAME[perfil]}</span>
                {ativo && <CheckIcon sx={{ fontSize: 18 }} />}
              </S.Opcao>
            );
          })}
        </S.Dropdown>
      )}
    </S.Wrapper>
  );
}
