/**
 * Aplica máscara de RG no formato 00.000.000-0
 * @param value - String com números do RG (ex: "123456789")
 * @returns String formatada com máscara 00.000.000-0 (ex: "12.345.678-9")
 */
export const maskInputRG = (value: string): string => {
  // Remove todos os caracteres que não são números
  const numbers = value.replace(/\D/g, "");

  // Aplica a máscara progressivamente conforme o usuário digita
  if (numbers.length <= 2) {
    return numbers;
  } else if (numbers.length <= 5) {
    return `${numbers.slice(0, 2)}.${numbers.slice(2)}`;
  } else if (numbers.length <= 8) {
    return `${numbers.slice(0, 2)}.${numbers.slice(2, 5)}.${numbers.slice(5)}`;
  } else if (numbers.length <= 9) {
    return `${numbers.slice(0, 2)}.${numbers.slice(2, 5)}.${numbers.slice(5, 8)}-${numbers.slice(8, 9)}`;
  } else {
    // Limita a 9 dígitos (RG completo)
    return `${numbers.slice(0, 2)}.${numbers.slice(2, 5)}.${numbers.slice(5, 8)}-${numbers.slice(8, 9)}`;
  }
};
