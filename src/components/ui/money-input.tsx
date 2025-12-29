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
    const [stringValue, setStringValue] = useState<string>(value === 0 ? '' : value.toFixed(2));
    const isEditingRef = useRef(false);

    // Solo sincronizar cuando el padre actualiza y NO estamos editando
    useEffect(() => {
      if (!isEditingRef.current) {
        setStringValue(value === 0 ? '' : value.toFixed(2));
      }
    }, [value]);

    const handleFocus = () => {
      isEditingRef.current = true;
    };


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
    const commitValue = () => {
      isEditingRef.current = false;

      if (stringValue === '' || stringValue === '.') {
        setStringValue('');
        onChange(0);
        onBlurProp?.();
        return;
      }

      let numValue = parseFloat(stringValue);

      if (isNaN(numValue)) {
        setStringValue('');
        onChange(0);
        onBlurProp?.();
        return;
      }

      numValue = Math.round(numValue * 100) / 100;

      setStringValue(numValue.toFixed(2));
      onChange(numValue);
      onBlurProp?.();
    };


    const handleBlur = () => {
      commitValue();
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'Enter') {
        e.preventDefault();      // evita submits accidentales
        commitValue();
        e.currentTarget.blur(); // opcional: saca el foco visualmente
      }
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
            onFocus={handleFocus}
            onChange={handleChange}
            onBlur={handleBlur}
            onKeyDown={handleKeyDown}
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
