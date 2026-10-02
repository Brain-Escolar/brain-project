/**
 * Inclusao de medicacao pelo responsavel. Espelha CadastroMedicacaoDto.
 *
 * So `nome` e obrigatorio no backend (@NotBlank); os demais campos aceitam
 * ausencia. Os limites de tamanho aqui sao os mesmos @Size do DTO.
 */
export interface MedicacaoPostRequest {
  /** max 255, obrigatorio. */
  nome: string;
  /** max 255. */
  dosagem?: string;
  /** max 255. */
  horario?: string;
  /** max 500. */
  observacao?: string;
}
