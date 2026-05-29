import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import { useCategorySelector } from "@/hooks/useCategorySelector";

interface CategorySelectorProps {
  value: string;
  categories: string[];
  onChange: (value: string) => void;
  error?: string;
}


export function CategorySelector({ value, categories, onChange, error }: CategorySelectorProps) {
  const category = useCategorySelector(value, categories);

  return (
    <div className="space-y-2">
      <Select value={category.value || undefined} onValueChange={(v) => {
        category.select(v);
        if (v !== "CREATE_NEW") onChange(v);
      }}>
        <SelectTrigger className={error ? "border-destructive" : ""}>
          <SelectValue placeholder="Seleccionar categoría" />
        </SelectTrigger>

        <SelectContent>
          {category.loading ? (
            <SelectItem value="loading" disabled>Cargando...</SelectItem>
          ) : (
            <>
              {category.categorias.map(c => (
                <SelectItem key={c} value={c}>{c}</SelectItem>
              ))}
              <SelectItem value="CREATE_NEW">➕ Crear nueva categoría</SelectItem>
            </>
          )}
        </SelectContent>
      </Select>

      {category.showNew && (
        <div className="flex gap-2">
          <Input
            value={category.newValue}
            onChange={e => category.setNewValue(e.target.value.toUpperCase())}
            placeholder="NUEVA CATEGORÍA"
          />
          <Button
            size="sm"
            onClick={() => {
              const value = category.newValue.trim();
              if (!value) return;

              // Cierra el modo "crear"
              category.create();

              // Setea la categoría en el formulario (esto es lo que importa)
              onChange(value);
            }}
          >
            Agregar
          </Button>
        </div>
      )}


      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  );
}
