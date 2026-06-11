import { useEffect, useState } from 'react';
import { toast } from '@/hooks/use-toast';
import { productsService } from '@/services/productsService';
import type { Product } from '@/types';
import type { Ticket } from '@/contexts/POSContext';
import { canAddOneUnit, isOutOfStock } from '@/features/pos/utils/stockUtils';
import { DEFAULT_CATALOG_PAGE_SIZE, MIN_CATALOG_PAGE_SIZE } from './useCatalogPageSize';

export function usePOSCatalog(
  products: Product[],
  activeTicket: Ticket | undefined,
  addItem: (product: Product, isWholesale?: boolean) => void,
  removeItem: (index: number) => void,
  pageSize: number = DEFAULT_CATALOG_PAGE_SIZE,
) {
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  const effectivePageSize = Math.max(MIN_CATALOG_PAGE_SIZE, pageSize);

  const filteredProducts = products.filter((producto) => {
    if (!producto?.productoDescripcion || !producto?.codigoBarra) return false;
    const term = searchTerm.toLowerCase();
    return (
      producto.productoDescripcion.toLowerCase().includes(term) ||
      producto.codigoBarra.includes(searchTerm) ||
      (producto.categoria || '').toLowerCase().includes(term)
    );
  });

  const totalPages =
    filteredProducts.length === 0
      ? 0
      : Math.ceil(filteredProducts.length / effectivePageSize);

  useEffect(() => {
    if (totalPages > 0) {
      setCurrentPage((p) => Math.min(p, totalPages));
    }
  }, [totalPages, effectivePageSize]);

  const displayProducts = filteredProducts.slice(
    (currentPage - 1) * effectivePageSize,
    currentPage * effectivePageSize,
  );

  const canAddProduct = (product: Product) => {
    if (!activeTicket) return false;
    if (isOutOfStock(product)) return false;
    return canAddOneUnit(product, activeTicket.items, product.id);
  };

  const addProduct = (product: Product) => {
    if (!activeTicket) {
      toast({ title: 'Error', description: 'Selecciona un ticket antes de agregar productos', variant: 'destructive' });
      return;
    }
    if (!canAddProduct(product)) {
      toast({
        title: 'Stock insuficiente',
        description: `No hay más unidades disponibles de ${product.productoDescripcion}`,
        variant: 'destructive',
      });
      return;
    }
    addItem(product, false);
  };

  const toggleWholesale = (itemIndex: number) => {
    const item = activeTicket?.items[itemIndex];
    if (!item) return;
    const product = products.find((p) => p.id === item.productId);
    if (!product?.precioMayoreo) return;
    removeItem(itemIndex);
    addItem(product, !(item.isWholesale || false));
  };

  const handleBarcodeSearch = async (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key !== 'Enter' || !searchTerm.trim()) return;
    const product = await productsService.getByBarcode(searchTerm.trim());
    if (product) {
      addProduct(product);
      setSearchTerm('');
      setCurrentPage(1);
    }
  };

  return {
    searchTerm,
    setSearchTerm: (v: string) => { setSearchTerm(v); setCurrentPage(1); },
    currentPage,
    setCurrentPage,
    totalPages,
    displayProducts,
    addProduct,
    canAddProduct,
    toggleWholesale,
    handleBarcodeSearch,
  };
}
