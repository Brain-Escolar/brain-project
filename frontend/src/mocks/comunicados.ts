export interface Comunicado {
  id: string;
  titulo: string;
  descricao: string;
  tipo: "Evento" | "Administrativo" | "Calendário" | "Atualização RH";
  data: string;
}

export const mockComunicados: Comunicado[] = [
  {
    id: "1",
    titulo: "Reunião de pais 06/12",
    descricao:
      "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Maecenas auctor enim lectus, ut convallis arcu molestie nec. Donec eu mauris pulvinar, imperdiet elit et, feugiat nisl. Aliquam interdum diam lacus.",
    tipo: "Evento",
    data: "14/01/25",
  },
  {
    id: "2",
    titulo: "Reunião de pais 06/12",
    descricao:
      "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Maecenas auctor enim lectus, ut convallis arcu molestie nec. Donec eu mauris pulvinar, imperdiet elit et, feugiat nisl. Aliquam interdum diam lacus.",
    tipo: "Evento",
    data: "14/01/25",
  },
  {
    id: "3",
    titulo: "Reunião de pais 06/12",
    descricao:
      "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Maecenas auctor enim lectus, ut convallis arcu molestie nec. Donec eu mauris pulvinar, imperdiet elit et, feugiat nisl. Aliquam interdum diam lacus.",
    tipo: "Evento",
    data: "14/01/25",
  },
  {
    id: "4",
    titulo: "Atualização de normas",
    descricao:
      "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Maecenas auctor enim lectus, ut convallis arcu molestie nec. Donec eu mauris pulvinar, imperdiet elit et, feugiat nisl. Aliquam interdum diam lacus.",
    tipo: "Administrativo",
    data: "14/01/25",
  },
  {
    id: "5",
    titulo: "Evento de fim de ano",
    descricao:
      "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Maecenas auctor enim lectus, ut convallis arcu molestie nec. Donec eu mauris pulvinar, imperdiet elit et, feugiat nisl. Aliquam interdum diam lacus.",
    tipo: "Calendário",
    data: "14/01/25",
  },
  {
    id: "6",
    titulo: "Mudanças no RH",
    descricao:
      "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Maecenas auctor enim lectus, ut convallis arcu molestie nec. Donec eu mauris pulvinar, imperdiet elit et, feugiat nisl. Aliquam interdum diam lacus.",
    tipo: "Atualização RH",
    data: "14/01/25",
  },
];
