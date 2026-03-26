/**
 * Mascara o input de horário para o formato HH:MM
 * @param value - Valor do input
 * @returns Valor mascarado no formato HH:MM
 */
export function maskInputHorario(value: string): string {
  // Remove todos os caracteres não numéricos
  const numericValue = value.replace(/\D/g, "");

  // Aplica a máscara de horário
  if (numericValue.length === 0) {
    return "";
  }

  if (numericValue.length === 1) {
    return numericValue;
  }

  if (numericValue.length === 2) {
    // Valida horas (00-23)
    const hours = parseInt(numericValue, 10);
    if (hours > 23) {
      return numericValue.slice(0, 1);
    }
    return numericValue;
  }

  // Extrai horas e minutos
  let hours = numericValue.slice(0, 2);
  let minutes = numericValue.slice(2, 4);

  // Valida horas (00-23)
  if (parseInt(hours, 10) > 23) {
    hours = "23";
  }

  // Valida minutos (00-59)
  if (minutes.length === 1) {
    // Permite digitar o primeiro dígito dos minutos
    if (parseInt(minutes, 10) > 5) {
      minutes = "5";
    }
  } else if (minutes.length >= 2) {
    if (parseInt(minutes, 10) > 59) {
      minutes = "59";
    }
  }

  // Formato: HH:MM
  if (minutes.length > 0) {
    return `${hours}:${minutes}`;
  }

  return `${hours}:`;
}

/**
 * Valida se o horário está no formato correto HH:MM
 * @param value - Valor do horário
 * @returns true se válido, false caso contrário
 */
export function validateHorario(value: string): boolean {
  const regex = /^([0-1][0-9]|2[0-3]):([0-5][0-9])$/;
  return regex.test(value);
}
