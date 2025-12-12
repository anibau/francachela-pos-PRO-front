// Validadores para formularios

export interface ValidationResult {
  isValid: boolean;
  message?: string;
}

// Validadores para nombres
export const validateName = (name: string): ValidationResult => {
  if (!name.trim()) {
    return { isValid: false, message: 'Este campo es requerido' };
  }
  if (name.length < 2) {
    return { isValid: false, message: 'Debe tener al menos 2 caracteres' };
  }
  if (name.length > 50) {
    return { isValid: false, message: 'No puede exceder 50 caracteres' };
  }
  if (!/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/.test(name)) {
    return { isValid: false, message: 'Solo se permiten letras y espacios' };
  }
  return { isValid: true };
};

// Validador para DNI
export const validateDNI = (dni: string): ValidationResult => {
  if (!dni) {
    return { isValid: false, message: 'El DNI es requerido' };
  }
  if (!/^\d{8}$/.test(dni)) {
    return { isValid: false, message: 'El DNI debe tener 8 dígitos' };
  }
  return { isValid: true };
};

// Validador para teléfono
export const validatePhone = (phone: string): ValidationResult => {
  if (!phone) {
    return { isValid: false, message: 'El teléfono es requerido' };
  }
  if (!/^\d{9}$/.test(phone)) {
    return { isValid: false, message: 'El teléfono debe tener 9 dígitos' };
  }
  return { isValid: true };
};

// Validador para fecha de nacimiento
export const validateBirthday = (birthday: string): ValidationResult => {
  if (!birthday) {
    return { isValid: false, message: 'La fecha de nacimiento es requerida' };
  }
  
  const birthDate = new Date(birthday);
  const today = new Date();
  const age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    // age--;
  }
  
  if (birthDate > today) {
    return { isValid: false, message: 'La fecha no puede ser futura' };
  }
  
  if (age > 120) {
    return { isValid: false, message: 'Edad no válida' };
  }
  
  if (age < 0) {
    return { isValid: false, message: 'Fecha de nacimiento no válida' };
  }
  
  return { isValid: true };
};

// Calcular edad
export const calculateAge = (birthday: string): number => {
  const birthDate = new Date(birthday);
  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  
  return age;
};

// Formatear fecha
export const formatDate = (dateString: string): string => {
  if (!dateString) return '';
  const date = new Date(dateString);
  return date.toLocaleDateString('es-PE');
};

// ===== VALIDADORES PARA PRODUCTOS =====

// Validador para nombre de producto
export const validateProductName = (name: string): ValidationResult => {
  if (!name.trim()) {
    return { isValid: false, message: 'El nombre del producto es requerido' };
  }
  if (name.length < 3) {
    return { isValid: false, message: 'El nombre debe tener al menos 3 caracteres' };
  }
  if (name.length > 100) {
    return { isValid: false, message: 'El nombre no puede exceder 100 caracteres' };
  }
  return { isValid: true };
};

// Validador para código de barras
export const validateBarcode = (barcode: string): ValidationResult => {
  if (!barcode.trim()) {
    return { isValid: false, message: 'El código de barras es requerido' };
  }
  if (!/^\d+$/.test(barcode)) {
    return { isValid: false, message: 'El código de barras solo debe contener números' };
  }
  if (barcode.length < 8 || barcode.length > 20) {
    return { isValid: false, message: 'El código debe tener entre 8 y 20 dígitos' };
  }
  return { isValid: true };
};

// Validador para costo (PUEDE SER 0 y permitir decimales)
export const validateCost = (cost: string | number): ValidationResult => {
  const numericCost = typeof cost === 'string' ? parseFloat(cost) : cost;
  
  if (isNaN(numericCost)) {
    return { isValid: false, message: 'El costo debe ser un número válido' };
  }
  
  if (numericCost < 0) {
    return { isValid: false, message: 'El costo no puede ser negativo' };
  }
  
  // Validar máximo 2 decimales
  const costString = numericCost.toString();
  const decimalPart = costString.split('.')[1];
  if (decimalPart && decimalPart.length > 2) {
    return { isValid: false, message: 'El costo no puede tener más de 2 decimales' };
  }
  
  return { isValid: true };
};

// Validador para precio (DEBE SER MAYOR QUE 0 y permitir decimales)
export const validatePrice = (price: string | number): ValidationResult => {
  const numericPrice = typeof price === 'string' ? parseFloat(price) : price;
  
  if (isNaN(numericPrice)) {
    return { isValid: false, message: 'El precio debe ser un número válido' };
  }
  
  if (numericPrice <= 0) {
    return { isValid: false, message: 'El precio debe ser mayor que 0' };
  }
  
  // Validar máximo 2 decimales
  const priceString = numericPrice.toString();
  const decimalPart = priceString.split('.')[1];
  if (decimalPart && decimalPart.length > 2) {
    return { isValid: false, message: 'El precio no puede tener más de 2 decimales' };
  }
  
  return { isValid: true };
};

// Validador para precio mayoreo (DEBE SER MAYOR QUE 0 y permitir decimales)
export const validateWholesalePrice = (price: string | number): ValidationResult => {
  const numericPrice = typeof price === 'string' ? parseFloat(price) : price;
  
  if (isNaN(numericPrice)) {
    return { isValid: false, message: 'El precio mayoreo debe ser un número válido' };
  }
  
  if (numericPrice <= 0) {
    return { isValid: false, message: 'El precio mayoreo debe ser mayor que 0' };
  }
  
  // Validar máximo 2 decimales
  const priceString = numericPrice.toString();
  const decimalPart = priceString.split('.')[1];
  if (decimalPart && decimalPart.length > 2) {
    return { isValid: false, message: 'El precio mayoreo no puede tener más de 2 decimales' };
  }
  
  return { isValid: true };
};

// Validador para stock (condicional según si usa inventario)
export const validateStock = (
  stock: string | number, 
  useInventory: boolean, 
  minStock?: string | number
): ValidationResult => {
  const numericStock = typeof stock === 'string' ? parseFloat(stock) : stock;
  
  // Si no usa inventario, debe ser 0
  if (!useInventory) {
    if (numericStock !== 0) {
      return { isValid: false, message: 'El stock debe ser 0 cuando no usa inventario' };
    }
    return { isValid: true };
  }
  
  // Si usa inventario, validar normalmente
  if (isNaN(numericStock)) {
    return { isValid: false, message: 'El stock debe ser un número válido' };
  }
  
  if (numericStock < 0) {
    return { isValid: false, message: 'El stock no puede ser negativo' };
  }
  
  if (numericStock === 0) {
    return { isValid: false, message: 'El stock inicial debe ser mayor que 0 cuando usa inventario' };
  }
  
  // Validar que no tenga decimales
  if (numericStock % 1 !== 0) {
    return { isValid: false, message: 'El stock debe ser un número entero' };
  }
  
  // Validar contra stock mínimo si se proporciona
  if (minStock !== undefined) {
    const numericMinStock = typeof minStock === 'string' ? parseFloat(minStock) : minStock;
    if (!isNaN(numericMinStock) && numericStock <= numericMinStock) {
      return { isValid: false, message: 'El stock inicial debe ser mayor que el stock mínimo' };
    }
  }
  
  return { isValid: true };
};

// Validador para stock mínimo (condicional según si usa inventario)
export const validateMinStock = (
  minStock: string | number, 
  useInventory: boolean
): ValidationResult => {
  const numericMinStock = typeof minStock === 'string' ? parseFloat(minStock) : minStock;
  
  // Si no usa inventario, debe ser 0
  if (!useInventory) {
    if (numericMinStock !== 0) {
      return { isValid: false, message: 'El stock mínimo debe ser 0 cuando no usa inventario' };
    }
    return { isValid: true };
  }
  
  // Si usa inventario, validar normalmente
  if (isNaN(numericMinStock)) {
    return { isValid: false, message: 'El stock mínimo debe ser un número válido' };
  }
  
  if (numericMinStock < 0) {
    return { isValid: false, message: 'El stock mínimo no puede ser negativo' };
  }
  
  // Validar que no tenga decimales
  if (numericMinStock % 1 !== 0) {
    return { isValid: false, message: 'El stock mínimo debe ser un número entero' };
  }
  
  return { isValid: true };
};

// Validador para cantidad (genérico)
export const validateQuantity = (quantity: string | number): ValidationResult => {
  const numericQuantity = typeof quantity === 'string' ? parseFloat(quantity) : quantity;
  
  if (isNaN(numericQuantity)) {
    return { isValid: false, message: 'La cantidad debe ser un número válido' };
  }
  
  if (numericQuantity < 0) {
    return { isValid: false, message: 'La cantidad no puede ser negativa' };
  }
  
  if (numericQuantity % 1 !== 0) {
    return { isValid: false, message: 'La cantidad debe ser un número entero' };
  }
  
  return { isValid: true };
};
