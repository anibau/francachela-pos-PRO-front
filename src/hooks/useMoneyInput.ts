import { useState, useCallback } from 'react';

/**
 * Hook personalizado para manejo profesional de inputs de dinero
 * Soporta decimales naturales (0., 0.50, 12.30) con máximo 2 decimales
 * 
 * Características:
 * - Mantiene valor como string durante la edición (no rompe UX)
 * - Valida solo números y punto decimal
 * - Limita a máximo 2 decimales
 * - Redondea automáticamente en onBlur
 * - Evita problemas con parseFloat en onChange
 */
export const useMoneyInput = (initialValue: number = 0) => {
  const [stringValue, setStringValue] = useState<string>(String(initialValue.toFixed(2)));

  /**
   * Valida y procesa el input de dinero durante la escritura
   * @param input - Valor del input
   * @returns Valor validado o string vacío
   */
  const processMoneyInput = useCallback((input: string): string => {
    // Permitir string vacío para borrar el contenido
    if (input === '') {
      return '';
    }

    // Permitir solo números y un punto decimal
    const regex = /^[0-9]*\.?[0-9]*$/;
    if (!regex.test(input)) {
      return stringValue; // Rechazar entrada inválida
    }

    // Limitar a máximo 2 decimales
    const parts = input.split('.');
    
    if (parts.length > 2) {
      // Si hay más de un punto, rechazar
      return stringValue;
    }

    if (parts[1] && parts[1].length > 2) {
      // Si hay más de 2 decimales, limitar
      return `${parts[0]}.${parts[1].slice(0, 2)}`;
    }

    return input;
  }, [stringValue]);

  /**
   * Maneja el cambio del input (onChange)
   * Mantiene el valor como string para permitir escritura natural
   */
  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const input = e.target.value;
    const processed = processMoneyInput(input);
    setStringValue(processed);
  }, [processMoneyInput]);

  /**
   * Redondea y convierte el valor a número cuando se pierde el foco (onBlur)
   * Maneja casos especiales como "0.", ".5", etc.
   */
  const handleBlur = useCallback((): number => {
    if (stringValue === '' || stringValue === '.') {
      setStringValue('0.00');
      return 0;
    }

    // Convertir a número
    let numValue = parseFloat(stringValue);

    // Manejo de NaN
    if (isNaN(numValue)) {
      setStringValue('0.00');
      return 0;
    }

    // Redondear a 2 decimales
    numValue = Math.round(numValue * 100) / 100;

    // Actualizar el stringValue con formato correcto
    setStringValue(numValue.toFixed(2));

    return numValue;
  }, [stringValue]);

  /**
   * Establece el valor del input (útil para formularios)
   */
  const setValue = useCallback((value: number) => {
    setStringValue(value.toFixed(2));
  }, []);

  /**
   * Obtiene el valor numérico actual sin redondear (estado actual del input)
   */
  const getNumericValue = useCallback((): number => {
    if (stringValue === '' || stringValue === '.') {
      return 0;
    }
    const num = parseFloat(stringValue);
    return isNaN(num) ? 0 : num;
  }, [stringValue]);

  return {
    stringValue,
    handleChange,
    handleBlur,
    setValue,
    getNumericValue,
  };
};

/**
 * Utilidad para formatear número a moneda
 */
export const formatCurrency = (value: number): string => {
  return `S/ ${value.toFixed(2)}`;
};

/**
 * Utilidad para validar que sea un número válido de dinero
 */
export const isValidMoneyValue = (value: string): boolean => {
  if (value === '' || value === '.') return false;
  const num = parseFloat(value);
  return !isNaN(num) && num > 0;
};

/**
 * Redondea un número a 2 decimales (para operaciones numéricas)
 */
export const roundToTwoDecimals = (value: number): number => {
  return Math.round(value * 100) / 100;
};
