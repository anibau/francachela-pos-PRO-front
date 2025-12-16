/**
 * Validadores reutilizables para validaciones de formularios
 * Enfocado en validaciones específicas del negocio
 */

interface ValidationResult {
  isValid: boolean;
  message?: string;
}

/**
 * Valida que la fecha de nacimiento sea válida y que el cliente sea mayor de 18 años
 * @param birthday - Fecha en formato YYYY-MM-DD o Date
 * @param minAge - Edad mínima requerida (por defecto 18)
 * @returns Objeto con validación y mensaje de error si aplica
 */
export const validateBirthday = (
  birthday: string | Date | null | undefined,
  minAge: number = 18
): ValidationResult => {
  // Validar que la fecha no esté vacía
  if (!birthday) {
    return {
      isValid: false,
      message: 'La fecha de nacimiento es requerida',
    };
  }

  // Convertir a Date si es string
  let birthDate: Date;
  if (typeof birthday === 'string') {
    birthDate = new Date(birthday);
  } else {
    birthDate = birthday;
  }

  // Validar que sea una fecha válida
  if (isNaN(birthDate.getTime())) {
    return {
      isValid: false,
      message: 'La fecha de nacimiento no es válida',
    };
  }

  // Obtener la fecha actual
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  birthDate.setHours(0, 0, 0, 0);

  // Validar que la fecha no sea en el futuro
  if (birthDate > today) {
    return {
      isValid: false,
      message: 'La fecha de nacimiento no puede ser en el futuro',
    };
  }

  // Calcular la edad
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();

  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }

  // Validar edad mínima
  if (age < minAge) {
    return {
      isValid: false,
      message: `El cliente debe ser mayor de ${minAge} años (actualmente tiene ${age} años)`,
    };
  }

  // Validar edad máxima razonable (150 años)
  if (age > 150) {
    return {
      isValid: false,
      message: 'Por favor, verifica que la fecha sea correcta',
    };
  }

  return {
    isValid: true,
  };
};

/**
 * Valida que el nombre tenga al menos el número mínimo de caracteres
 * @param name - Nombre a validar
 * @param minLength - Longitud mínima (por defecto 2)
 * @returns Objeto con validación y mensaje de error si aplica
 */
export const validateName = (name: string, minLength: number = 2): ValidationResult => {
  const trimmedName = name.trim();

  if (!trimmedName) {
    return {
      isValid: false,
      message: 'Este campo es requerido',
    };
  }

  if (trimmedName.length < minLength) {
    return {
      isValid: false,
      message: `Debe tener al menos ${minLength} caracteres`,
    };
  }

  // Validar que no contenga números o caracteres especiales excesivos
  if (!/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s'-]+$/.test(trimmedName)) {
    return {
      isValid: false,
      message: 'El nombre contiene caracteres inválidos',
    };
  }

  return {
    isValid: true,
  };
};

/**
 * Valida que el DNI o CE sea válido
 * DNI: exactamente 8 dígitos
 * CE: máximo 10 dígitos
 * @param dni - DNI o CE a validar
 * @returns Objeto con validación y mensaje de error si aplica
 */
export const validateDNI = (dni: string): ValidationResult => {
  if (!dni) {
    return {
      isValid: false,
      message: 'El DNI o CE es requerido',
    };
  }

  // Validar DNI (exactamente 8 dígitos) o CE (máximo 10 dígitos)
  const isDNI = /^\d{8}$/.test(dni);
  const isCE = /^\d{1,10}$/.test(dni);

  if (!isDNI && !isCE) {
    return {
      isValid: false,
      message: 'Debe ser un DNI válido (8 dígitos) o CE válido (máximo 10 dígitos)',
    };
  }

  return {
    isValid: true,
  };
};

/**
 * Valida que el teléfono sea un número válido de 9 dígitos
 * @param phone - Teléfono a validar (sin el prefijo +51)
 * @returns Objeto con validación y mensaje de error si aplica
 */
export const validatePhone = (phone: string): ValidationResult => {
  if (!phone) {
    return {
      isValid: false,
      message: 'El teléfono es requerido',
    };
  }

  if (!/^\d{9}$/.test(phone)) {
    return {
      isValid: false,
      message: 'El teléfono debe tener exactamente 9 dígitos',
    };
  }

  return {
    isValid: true,
  };
};

/**
 * Valida un precio con decimales (hasta 2 dígitos)
 * @param price - Precio a validar como número
 * @param fieldName - Nombre del campo para el mensaje
 * @param allowZero - Permitir cero (por defecto true)
 * @returns Objeto con validación y mensaje de error si aplica
 */
export const validatePrice = (
  price: number | string | null | undefined,
  fieldName: string = 'El precio',
  allowZero: boolean = true
): ValidationResult => {
  if (price === null || price === undefined || price === '') {
    return {
      isValid: false,
      message: `${fieldName} es requerido`,
    };
  }

  const numPrice = typeof price === 'string' ? parseFloat(price) : price;

  if (isNaN(numPrice)) {
    return {
      isValid: false,
      message: `${fieldName} debe ser un número válido`,
    };
  }

  if (numPrice < 0) {
    return {
      isValid: false,
      message: `${fieldName} no puede ser negativo`,
    };
  }

  if (!allowZero && numPrice === 0) {
    return {
      isValid: false,
      message: `${fieldName} debe ser mayor a 0`,
    };
  }

  // Validar máximo 2 decimales
  if (!/^\d+(\.\d{0,2})?$/.test(numPrice.toString())) {
    return {
      isValid: false,
      message: `${fieldName} puede tener máximo 2 decimales`,
    };
  }

  return {
    isValid: true,
  };
};

/**
 * Valida una cantidad (número entero, puede ser 0)
 * @param quantity - Cantidad a validar
 * @param fieldName - Nombre del campo para el mensaje
 * @param allowZero - Permitir cero (por defecto true)
 * @returns Objeto con validación y mensaje de error si aplica
 */
export const validateQuantity = (
  quantity: number | string | null | undefined,
  fieldName: string = 'La cantidad',
  allowZero: boolean = true
): ValidationResult => {
  if (quantity === null || quantity === undefined || quantity === '') {
    return {
      isValid: false,
      message: `${fieldName} es requerida`,
    };
  }

  const numQuantity = typeof quantity === 'string' ? parseInt(quantity, 10) : quantity;

  if (isNaN(numQuantity)) {
    return {
      isValid: false,
      message: `${fieldName} debe ser un número válido`,
    };
  }

  if (numQuantity < 0) {
    return {
      isValid: false,
      message: `${fieldName} no puede ser negativa`,
    };
  }

  if (!allowZero && numQuantity === 0) {
    return {
      isValid: false,
      message: `${fieldName} debe ser mayor a 0`,
    };
  }

  // Validar que sea entero
  if (!Number.isInteger(numQuantity)) {
    return {
      isValid: false,
      message: `${fieldName} debe ser un número entero`,
    };
  }

  return {
    isValid: true,
  };
};

/**
 * Valida un código de barras (alfanumérico, opcional)
 * @param barcode - Código de barras a validar
 * @param required - Es requerido (por defecto false)
 * @returns Objeto con validación y mensaje de error si aplica
 */
export const validateBarcode = (
  barcode: string | null | undefined,
  required: boolean = false
): ValidationResult => {
  if (!barcode || !barcode.trim()) {
    if (required) {
      return {
        isValid: false,
        message: 'El código de barras es requerido',
      };
    }
    return { isValid: true };
  }

  const trimmedBarcode = barcode.trim();

  // Validar longitud razonable (entre 3 y 50 caracteres)
  if (trimmedBarcode.length < 3 || trimmedBarcode.length > 50) {
    return {
      isValid: false,
      message: 'El código de barras debe tener entre 3 y 50 caracteres',
    };
  }

  // Validar que contenga solo caracteres alfanuméricos, guiones y espacios
  if (!/^[a-zA-Z0-9\-\s]+$/.test(trimmedBarcode)) {
    return {
      isValid: false,
      message: 'El código de barras solo puede contener letras, números, guiones y espacios',
    };
  }

  return {
    isValid: true,
  };
};

/**
 * Valida que el nombre de producto no esté vacío
 * @param productName - Nombre del producto
 * @param minLength - Longitud mínima (por defecto 3)
 * @returns Objeto con validación y mensaje de error si aplica
 */
export const validateProductName = (
  productName: string,
  minLength: number = 3
): ValidationResult => {
  const trimmedName = productName.trim();

  if (!trimmedName) {
    return {
      isValid: false,
      message: 'El nombre del producto es requerido',
    };
  }

  if (trimmedName.length < minLength) {
    return {
      isValid: false,
      message: `El nombre debe tener al menos ${minLength} caracteres`,
    };
  }

  if (trimmedName.length > 100) {
    return {
      isValid: false,
      message: 'El nombre no puede exceder 100 caracteres',
    };
  }

  return {
    isValid: true,
  };
};

/**
 * Calcula la edad a partir de la fecha de nacimiento
 * @param birthday - Fecha de nacimiento en formato YYYY-MM-DD o Date
 * @returns Edad en años, o null si la fecha no es válida
 */
export const calculateAge = (birthday: string | Date | null | undefined): number | null => {
  if (!birthday) return null;

  let birthDate: Date;
  if (typeof birthday === 'string') {
    birthDate = new Date(birthday);
  } else {
    birthDate = birthday;
  }

  if (isNaN(birthDate.getTime())) return null;

  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();

  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }

  return age >= 0 ? age : null;
};

/**
 * Formatea una fecha para mostrar de forma legible
 * @param date - Fecha a formatear
 * @param locale - Locale para el formato (por defecto 'es-PE')
 * @returns Fecha formateada
 */
export const formatDate = (
  date: string | Date | null | undefined,
  locale: string = 'es-PE'
): string => {
  if (!date) return '';

  try {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    return dateObj.toLocaleDateString(locale, {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  } catch {
    return '';
  }
};
