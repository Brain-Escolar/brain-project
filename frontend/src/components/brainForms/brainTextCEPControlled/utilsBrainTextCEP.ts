/**
 * Aplica máscara de CEP no formato 00000-000
 * @param value - String com números do CEP (ex: "12345678")
 * @returns String formatada com máscara 00000-000 (ex: "12345-678")
 */
export const maskInputCEP = (value: string): string => {
  // Remove todos os caracteres que não são números
  const numbers = value.replace(/\D/g, "");

  // Aplica a máscara progressivamente conforme o usuário digita
  if (numbers.length <= 5) {
    return numbers;
  } else if (numbers.length <= 8) {
    return `${numbers.slice(0, 5)}-${numbers.slice(5, 8)}`;
  } else {
    // Limita a 8 dígitos (CEP completo)
    return `${numbers.slice(0, 5)}-${numbers.slice(5, 8)}`;
  }
};
