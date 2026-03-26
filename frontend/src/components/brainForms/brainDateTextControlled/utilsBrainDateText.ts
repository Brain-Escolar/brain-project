/**
 * Aplica máscara de data no formato dd/mm/yyyy
 * @param value - String com números da data (ex: "10052000")
 * @returns String formatada com máscara dd/mm/yyyy (ex: "10/05/2000")
 */
export const maskInputDate = (value: string): string => {
  const numbers = value.replace(/\D/g, "");

  if (numbers.length <= 2) {
    return numbers;
  } else if (numbers.length <= 4) {
    return `${numbers.slice(0, 2)}/${numbers.slice(2)}`;
  } else if (numbers.length <= 8) {
    return `${numbers.slice(0, 2)}/${numbers.slice(2, 4)}/${numbers.slice(4, 8)}`;
  } else {
    return `${numbers.slice(0, 2)}/${numbers.slice(2, 4)}/${numbers.slice(4, 8)}`;
  }
};
