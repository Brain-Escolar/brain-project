export const formatDateForAPI = (date: Date): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

/**
 * Converte uma string no formato dd/mm/yyyy para um ISO string (yyyy-mm-dd)
 * @param dateStr - Data no formato dd/mm/yyyy
 * @returns Data no formato ISO (yyyy-mm-dd) ou null se a entrada for inválida
 */
export const convertDateStringToISO = (dateStr: string): string => {
  const [day, month, year] = dateStr.split("/").map(Number);
  if (!day || !month || !year) return dateStr;

  const date = new Date(year, month - 1, day);
  if (isNaN(date.getTime())) return dateStr;

  return date.toISOString();
};
