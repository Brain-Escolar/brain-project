/**
 * Aplica máscara de RG conforme a quantidade de dígitos:
 * - Até 7 dígitos: 0.000.000 (ex: "1.234.567")
 * - 8 ou 9 dígitos: 00.000.000-0 (ex: "12.345.678-9")
 * @param value - String com números do RG (ex: "123456789")
 * @returns String formatada com a máscara correspondente
 */
export const maskInputRG = (value: string): string => {
  // Remove todos os caracteres que não são números e limita a 9 dígitos (RG completo)
  const numbers = value.replace(/\D/g, "").slice(0, 9);

  // RG de 7 dígitos: 0.000.000
  if (numbers.length <= 1) {
    return numbers;
  } else if (numbers.length <= 4) {
    return `${numbers.slice(0, 1)}.${numbers.slice(1)}`;
  } else if (numbers.length <= 7) {
    return `${numbers.slice(0, 1)}.${numbers.slice(1, 4)}.${numbers.slice(4)}`;
  }

  // RG de 8 ou 9 dígitos: 00.000.000-0
  if (numbers.length === 8) {
    return `${numbers.slice(0, 2)}.${numbers.slice(2, 5)}.${numbers.slice(5)}`;
  }
  return `${numbers.slice(0, 2)}.${numbers.slice(2, 5)}.${numbers.slice(5, 8)}-${numbers.slice(8)}`;
};
