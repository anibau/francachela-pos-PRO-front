import React, { useState, useRef, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { AlertCircle, Check } from 'lucide-react';

interface MoneyInputProps {
  id?: string;
  label?: string;
  value: number;
  onChange: (value: number) => void;
  onBlur?: () => void;
  placeholder?: string;
  disabled?: boolean;
  required?: boolean;
  error?: string;
  className?: string;
  showValidation?: boolean;
}

/**
 * Componente profesional para inputs de dinero
 * 
 * Características:
 * - Permite escribir 0., 0.50, 12.30 de forma natural
 * - Limita a 2 decimales automáticamente
 * - Redondea al salir del campo
 * - No rompe la edición
 * - Muestra validación visual
 */
export const MoneyInput = React.forwardRef<HTMLInputElement, MoneyInputProps>(
  (
    {
      id,
      label,
      value,
      onChange,
      onBlur: onBlurProp,
      placeholder = '0.00',
      disabled = false,
      required = false,
      error,
      className,
      showValidation = true,
    },
    ref
  ) => {
    const [stringValue, setStringValue] = useState<string>(String(value.toFixed(2)));
    const isEditingRef = useRef(false);

    // Solo sincronizar cuando el padre actualiza y NO estamos editando
    useEffect(() => {
      if (!isEditingRef.current) {
        setStringValue(String(value.toFixed(2)));
      }
    }, [value]);

    const validateAndProcessInput = (input: string): string => {
      // Permitir string vacío
      if (input === '') {
        return '';
      }

      // Solo permitir números y un punto
      const regex = /^[0-9]*\.?[0-9]*$/;
      if (!regex.test(input)) {
        return stringValue; // Rechazar
      }

      // Limitar a máximo 2 decimales
      const parts = input.split('.');
      
      if (parts.length > 2) {
        return stringValue; // Rechazar múltiples puntos
      }

      if (parts[1] && parts[1].length > 2) {
        return `${parts[0]}.${parts[1].slice(0, 2)}`;
      }

      return input;
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const input = e.target.value;
      const processed = validateAndProcessInput(input);
      setStringValue(processed);
      isEditingRef.current = true;
    };

    const handleBlur = () => {
      isEditingRef.current = false;

      if (stringValue === '' || stringValue === '.') {
        setStringValue('0.00');
        onChange(0);
        onBlurProp?.();
        return;
      }

      // Convertir a número
      let numValue = parseFloat(stringValue);

      // Manejo de NaN
      if (isNaN(numValue)) {
        setStringValue('0.00');
        onChange(0);
        onBlurProp?.();
        return;
      }

      // Redondear a 2 decimales
      numValue = Math.round(numValue * 100) / 100;

      // Actualizar el display con formato
      setStringValue(numValue.toFixed(2));

      // Llamar onChange con el valor redondeado
      onChange(numValue);
      onBlurProp?.();
    };

    const isValid = !error && showValidation && stringValue && stringValue !== '.';
    const hasError = !!error;

    return (
      <div className="space-y-2">
        {label && (
          <Label htmlFor={id} className={required ? "after:content-['_*']" : ""}>
            {label}
          </Label>
        )}
        <div className="relative">
          <Input
            ref={ref}
            id={id}
            type="text"
            inputMode="decimal"
            value={stringValue}
            onChange={handleChange}
            onBlur={handleBlur}
            placeholder={placeholder}
            disabled={disabled}
            required={required}
            className={`
              pr-10
              ${hasError ? 'border-destructive' : ''}
              ${className}
            `}
            autoComplete="off"
            spellCheck="false"
          />
          {showValidation && (
            <>
              {isValid && (
                <Check className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-green-500" />
              )}
              {hasError && (
                <AlertCircle className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-destructive" />
              )}
            </>
          )}
        </div>
        {error && (
          <p className="text-xs text-destructive flex items-center gap-1">
            <AlertCircle className="h-3 w-3" />
            {error}
          </p>
        )}
      </div>
    );
  }
);

MoneyInput.displayName = 'MoneyInput';
