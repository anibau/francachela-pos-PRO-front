import { useEffect, useState } from "react";
import { toast } from "sonner";
import { productsService } from "@/services/productsService";

export const useCategorySelector = (value: string | undefined, categories: string[]) => {
  const [showNew, setShowNew] = useState(false);
  const [newValue, setNewValue] = useState("");

  const safeValue = value || undefined;
  const [selected, setSelected] = useState<string | undefined>(safeValue);

  useEffect(() => {
    setSelected(value || undefined);   // 🔥 ESTE era el bug
  }, [value]);

  const select = (v: string) => {
    if (v === "CREATE_NEW") {
      setShowNew(true);
      return;                         // 🚫 no toques selected
    }
    setShowNew(false);
    setSelected(v);
  };

  const create = () => {
    const v = newValue.trim();
    if (!v) return;

    setSelected(v);                   // ✅ nunca vacío
    setShowNew(false);
    setNewValue("");
  };

  return {
    value: selected,
    categorias: categories,
    showNew,
    newValue,
    setNewValue,
    select,
    create,
    loading: false
  };
};
