export enum PerfilNomeEnum {
  ESTUDANTE = "ESTUDANTE",
  PROFESSOR = "PROFESSOR",
  SECRETARIO = "SECRETARIO",
  COORDENADOR = "COORDENADOR",
  DIRETOR = "DIRETOR",
  ADMIN = "ADMIN",
}

export const PERFIL_DISPLAY_NAME: Record<string, string> = {
  ESTUDANTE: "Estudante",
  PROFESSOR: "Professor",
  SECRETARIO: "Secretaria",
  COORDENADOR: "Coordenação Pedagógica",
  DIRETOR: "Diretoria",
  ADMIN: "Administração",
};

export const DESTINATARIOS_DISPONIVEIS = [
  { value: PerfilNomeEnum.SECRETARIO, label: "Secretaria" },
  { value: PerfilNomeEnum.COORDENADOR, label: "Coordenação Pedagógica" },
];
