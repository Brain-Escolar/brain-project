/**
 * Mascara o input de telefone para o formato (00) 00000-0000 ou (00) 0000-0000
 * @param value - Valor do input
 * @returns Valor mascarado
 */
export function maskInputPhone(value: string): string {
  // Remove todos os caracteres não numéricos
  const numericValue = value.replace(/\D/g, "");

  // Aplica a máscara de acordo com o tamanho
  if (numericValue.length <= 10) {
    // Formato: (00) 0000-0000
    return numericValue
      .replace(/^(\d{2})(\d)/, "($1) $2")
      .replace(/(\d{4})(\d)/, "$1-$2")
      .slice(0, 14); // Limita a 14 caracteres: (00) 0000-0000
  } else {
    // Formato: (00) 00000-0000
    return numericValue
      .replace(/^(\d{2})(\d)/, "($1) $2")
      .replace(/(\d{5})(\d)/, "$1-$2")
      .slice(0, 15); // Limita a 15 caracteres: (00) 00000-0000
  }
}
