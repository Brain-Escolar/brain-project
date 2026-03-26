export function generateTitlePage(title: string) {
  return `${title} | Brain`;
}

export function isNullUndefined<T>(value: T | null | undefined): value is null | undefined {
  return value === null || value === undefined;
}

/**
 * Formata um array de números representando uma data para o formato brasileiro
 * @param dateArray Array no formato [ano, mês, dia]
 * @returns String formatada no padrão DD/MM/AAAA
 */
export function formatDateFromArray(dateArray: number[]): string {
  if (!dateArray || dateArray.length < 3) {
    return "Data não informada";
  }

  const [year, month, day] = dateArray;
  return `${day.toString().padStart(2, "0")}/${month.toString().padStart(2, "0")}/${year}`;
}

/**
 * Converte um cpf formatado (ex: 000.000.000-00) para apenas números (ex: 00000000000)
 * @param cpf - CPF formatado
 * @returns CPF apenas com números
 */
export function unmaskCPF(cpf: string): string {
  return cpf.replace(/\D/g, "");
}

/**
 * Converte um CEP formatado (ex: 00000-000) para apenas números (ex: 00000000)
 * @param cep - CEP formatado
 * @returns CEP apenas com números
 */
export function unmaskCEP(cep: string): string {
  return cep.replace(/\D/g, "");
}

/**
 * Converter um rg formatado (ex: 00.000.000-0) para apenas números (ex: 000000000)
 * @param rg - RG formatado
 * @returns RG apenas com números
 */
export function unmaskRG(rg: string): string {
  return rg.replace(/\D/g, "");
}

/**
 * Converte um telefone formatado (ex: (00) 00000-0000) para apenas números (ex: 00000000000)
 * @param phone - Telefone formatado
 * @returns Telefone apenas com números
 */
export function unmaskPhone(phone: string): string {
  return phone.replace(/\D/g, "");
}
