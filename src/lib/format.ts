export function formatPrice(value: number): string {
  return new Intl.NumberFormat("ru-RU").format(value) + " ₽";
}

export function formatPower(value: number): string {
  return `${value} кВт`;
}
