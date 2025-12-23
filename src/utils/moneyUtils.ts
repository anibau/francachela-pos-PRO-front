/**
 * Utilidades profesionales para manejo de dinero en el sistema POS
 * Compatible con la solución MoneyInput
 */

/**
 * Redondea un valor a 2 decimales de forma segura
 * Evita problemas de precisión con floating point
 * 
 * @param value - Número a redondear
 * @returns Número redondeado a 2 decimales
 * 
 * @example
 * roundMoney(12.125) // 12.13
 * roundMoney(0.5) // 0.50
 * roundMoney(9.999) // 10.00
 */
export const roundMoney = (value: number): number => {
  return Math.round(value * 100) / 100;
};

/**
 * Formatea un número como moneda peruana
 * 
 * @param value - Número a formatear
 * @param currency - Símbolo de moneda (default: "S/")
 * @param decimals - Número de decimales (default: 2)
 * @returns String formateado
 * 
 * @example
 * formatMoney(12.5) // "S/ 12.50"
 * formatMoney(1000) // "S/ 1,000.00"
 * formatMoney(0.99) // "S/ 0.99"
 */
export const formatMoney = (
  value: number,
  currency: string = 'S/',
  decimals: number = 2
): string => {
  const rounded = roundMoney(value);
  const formatted = new Intl.NumberFormat('es-PE', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(rounded);
  
  return `${currency} ${formatted}`;
};

/**
 * Valida si un string es un valor de dinero válido
 * 
 * @param value - String a validar
 * @returns true si es válido
 * 
 * @example
 * isValidMoneyString("12.50") // true
 * isValidMoneyString("0.99") // true
 * isValidMoneyString("abc") // false
 * isValidMoneyString("12.999") // false (más de 2 decimales)
 */
export const isValidMoneyString = (value: string): boolean => {
  if (!value || value === '.') return false;
  
  // Validar formato
  const regex = /^[0-9]*\.?[0-9]{0,2}$/;
  if (!regex.test(value)) return false;
  
  // Validar número válido
  const num = parseFloat(value);
  return !isNaN(num) && num >= 0;
};

/**
 * Convierte un string de dinero a número redondeado
 * Maneja casos especiales como ".5", "12.", etc.
 * 
 * @param value - String a convertir
 * @param defaultValue - Valor por defecto si es inválido
 * @returns Número redondeado a 2 decimales
 * 
 * @example
 * parseMoneyString("0.5") // 0.50
 * parseMoneyString("12.") // 12.00
 * parseMoneyString("abc") // 0
 * parseMoneyString(".99") // 0.99
 * parseMoneyString("", 5) // 5
 */
export const parseMoneyString = (value: string, defaultValue: number = 0): number => {
  if (!value || value === '.') return defaultValue;
  
  const num = parseFloat(value);
  if (isNaN(num)) return defaultValue;
  
  return roundMoney(num);
};

/**
 * Calcula el cambio entre dos valores
 * Útil para transacciones
 * 
 * @param paid - Monto pagado
 * @param total - Total a pagar
 * @returns Cambio redondeado
 * 
 * @example
 * calculateChange(50, 35.50) // 14.50
 * calculateChange(100, 99.99) // 0.01
 */
export const calculateChange = (paid: number, total: number): number => {
  return roundMoney(paid - total);
};

/**
 * Calcula el total con descuento
 * 
 * @param original - Monto original
 * @param discountPercent - Porcentaje de descuento (0-100)
 * @returns Total con descuento aplicado
 * 
 * @example
 * applyDiscount(100, 10) // 90.00
 * applyDiscount(50.50, 15) // 42.93
 */
export const applyDiscount = (original: number, discountPercent: number): number => {
  const discount = roundMoney(original * (discountPercent / 100));
  return roundMoney(original - discount);
};

/**
 * Calcula el descuento en dinero
 * 
 * @param original - Monto original
 * @param discountPercent - Porcentaje de descuento
 * @returns Monto del descuento
 * 
 * @example
 * calculateDiscountAmount(100, 10) // 10.00
 * calculateDiscountAmount(50.50, 15) // 7.58
 */
export const calculateDiscountAmount = (
  original: number,
  discountPercent: number
): number => {
  return roundMoney(original * (discountPercent / 100));
};

/**
 * Calcula el total con impuesto (IGV)
 * 
 * @param subtotal - Subtotal sin impuesto
 * @param taxPercent - Porcentaje de impuesto (default: 18 para IGV Perú)
 * @returns Total con impuesto incluido
 * 
 * @example
 * calculateWithTax(100) // 118.00
 * calculateWithTax(100, 10) // 110.00
 */
export const calculateWithTax = (
  subtotal: number,
  taxPercent: number = 18
): number => {
  const tax = roundMoney(subtotal * (taxPercent / 100));
  return roundMoney(subtotal + tax);
};

/**
 * Calcula solo el monto del impuesto
 * 
 * @param subtotal - Subtotal sin impuesto
 * @param taxPercent - Porcentaje de impuesto
 * @returns Monto del impuesto
 * 
 * @example
 * calculateTaxAmount(100) // 18.00
 * calculateTaxAmount(100, 10) // 10.00
 */
export const calculateTaxAmount = (
  subtotal: number,
  taxPercent: number = 18
): number => {
  return roundMoney(subtotal * (taxPercent / 100));
};

/**
 * Calcula el porcentaje de ganancia
 * 
 * @param price - Precio de venta
 * @param cost - Costo del producto
 * @returns Porcentaje de ganancia
 * 
 * @example
 * calculateProfitPercent(15, 10) // 50
 * calculateProfitPercent(50, 40) // 25
 */
export const calculateProfitPercent = (price: number, cost: number): number => {
  if (cost === 0) return 0;
  return roundMoney(((price - cost) / cost) * 100);
};

/**
 * Calcula el monto de ganancia
 * 
 * @param price - Precio de venta
 * @param cost - Costo del producto
 * @returns Monto de ganancia
 * 
 * @example
 * calculateProfit(15, 10) // 5.00
 * calculateProfit(50.50, 40) // 10.50
 */
export const calculateProfit = (price: number, cost: number): number => {
  return roundMoney(price - cost);
};

/**
 * Suma múltiples valores de dinero de forma segura
 * 
 * @param values - Array de números
 * @returns Suma redondeada a 2 decimales
 * 
 * @example
 * sumMoney([10.50, 20.30, 5.20]) // 36.00
 */
export const sumMoney = (values: number[]): number => {
  const sum = values.reduce((acc, val) => acc + val, 0);
  return roundMoney(sum);
};

/**
 * Calcula el promedio de valores de dinero
 * 
 * @param values - Array de números
 * @returns Promedio redondeado a 2 decimales
 * 
 * @example
 * averageMoney([10, 20, 30]) // 20.00
 */
export const averageMoney = (values: number[]): number => {
  if (values.length === 0) return 0;
  const sum = sumMoney(values);
  return roundMoney(sum / values.length);
};

/**
 * Valida un rango de precios
 * 
 * @param price - Precio a validar
 * @param minPrice - Precio mínimo
 * @param maxPrice - Precio máximo
 * @returns true si está dentro del rango
 * 
 * @example
 * isPriceInRange(15, 10, 20) // true
 * isPriceInRange(25, 10, 20) // false
 */
export const isPriceInRange = (
  price: number,
  minPrice: number,
  maxPrice: number
): boolean => {
  return price >= minPrice && price <= maxPrice;
};

/**
 * Compara dos valores de dinero con tolerancia para floating point
 * 
 * @param value1 - Primer valor
 * @param value2 - Segundo valor
 * @param tolerance - Tolerancia (default: 0.01)
 * @returns true si son aproximadamente iguales
 * 
 * @example
 * compareMoneyValues(10.00, 10.001) // true
 * compareMoneyValues(10.00, 10.02) // false
 */
export const compareMoneyValues = (
  value1: number,
  value2: number,
  tolerance: number = 0.01
): boolean => {
  return Math.abs(value1 - value2) < tolerance;
};

/**
 * Obtiene el mayor valor de un array
 * 
 * @param values - Array de números
 * @returns Mayor valor
 * 
 * @example
 * maxMoney([10.50, 20.30, 5.20]) // 20.30
 */
export const maxMoney = (values: number[]): number => {
  if (values.length === 0) return 0;
  return Math.max(...values);
};

/**
 * Obtiene el menor valor de un array
 * 
 * @param values - Array de números
 * @returns Menor valor
 * 
 * @example
 * minMoney([10.50, 20.30, 5.20]) // 5.20
 */
export const minMoney = (values: number[]): number => {
  if (values.length === 0) return 0;
  return Math.min(...values);
};
