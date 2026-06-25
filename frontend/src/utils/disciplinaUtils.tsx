import CalculateOutlinedIcon from "@mui/icons-material/CalculateOutlined";
import MenuBookOutlinedIcon from "@mui/icons-material/MenuBookOutlined";
import ScienceOutlinedIcon from "@mui/icons-material/ScienceOutlined";
import PaletteOutlinedIcon from "@mui/icons-material/PaletteOutlined";
import PublicOutlinedIcon from "@mui/icons-material/PublicOutlined";
import SportsSoccerOutlinedIcon from "@mui/icons-material/SportsSoccerOutlined";
import MusicNoteOutlinedIcon from "@mui/icons-material/MusicNoteOutlined";
import SchoolOutlinedIcon from "@mui/icons-material/SchoolOutlined";
import type { SvgIconComponent } from "@mui/icons-material";

export type DisciplinaTagTone = "green" | "orange" | "blue" | "neutral";

export function getDisciplinaIcon(disciplina: string): SvgIconComponent {
  const name = disciplina.toLowerCase();

  if (name.includes("matem")) return CalculateOutlinedIcon;
  if (name.includes("portugu") || name.includes("língua") || name.includes("lingua"))
    return MenuBookOutlinedIcon;
  if (name.includes("ciência") || name.includes("ciencia") || name.includes("biolog"))
    return ScienceOutlinedIcon;
  if (name.includes("arte") || name.includes("educa")) return PaletteOutlinedIcon;
  if (name.includes("hist") || name.includes("geo")) return PublicOutlinedIcon;
  if (name.includes("fís") || name.includes("fis") || name.includes("ed. fís"))
    return SportsSoccerOutlinedIcon;
  if (name.includes("mús") || name.includes("mus")) return MusicNoteOutlinedIcon;

  return SchoolOutlinedIcon;
}

/** Cor do chip de disciplina/tarefa (varia por nome). */
export function getDisciplinaTagTone(label: string): DisciplinaTagTone {
  const tones: DisciplinaTagTone[] = ["green", "orange", "blue"];
  let hash = 0;
  for (let i = 0; i < label.length; i += 1) {
    hash = label.charCodeAt(i) + ((hash << 5) - hash);
  }
  return tones[Math.abs(hash) % tones.length];
}

export function formatProfessorLabel(professor: string): string {
  const trimmed = professor.trim();
  if (/^prof/i.test(trimmed)) return trimmed;
  return `Prof. ${trimmed}`;
}
