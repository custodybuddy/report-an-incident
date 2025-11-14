export const formatDisplayIndex = (index: number, digits = 2): string =>
  String(index + 1).padStart(digits, '0');

export default { formatDisplayIndex };
