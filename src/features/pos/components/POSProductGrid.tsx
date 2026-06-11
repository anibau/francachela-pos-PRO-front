import { useRef } from 'react';
import { Plus, Search } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from '@/components/ui/drawer';
import { LoadingState, ErrorState } from '@/components/ui/state-views';
import type { Product } from '@/types';
import type { UnifiedPromotion } from '@/services/unifiedPromotionsService';
import { isOutOfStock } from '@/features/pos/utils/stockUtils';
import { POSPromotionsTab } from './POSPromotionsTab';

interface POSProductGridProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  onBarcodeSearch: (e: React.KeyboardEvent<HTMLInputElement>) => void;
  searchInputRef?: React.RefObject<HTMLInputElement>;
  listContainerRef?: React.RefObject<HTMLDivElement>;
  productsLoading: boolean;
  productsError: Error | null;
  onRetryProducts: () => void;
  displayProducts: Product[];
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  onAddProduct: (product: Product) => void;
  canAddProduct: (product: Product) => boolean;
  promos: UnifiedPromotion[];
  promosLoading: boolean;
  promosError: Error | null;
  onRetryPromos: () => void;
  onApplyPromo: (promo: UnifiedPromotion) => void;
  mobileDrawer?: boolean;
}

function ProductList({
  displayProducts,
  productsLoading,
  productsError,
  onRetryProducts,
  onAddProduct,
  canAddProduct,
  compact = false,
}: Pick<
  POSProductGridProps,
  'displayProducts' | 'productsLoading' | 'productsError' | 'onRetryProducts' | 'onAddProduct' | 'canAddProduct'
> & { compact?: boolean }) {
  if (productsLoading) {
    return <LoadingState message="Cargando productos..." />;
  }
  if (productsError) {
    return <ErrorState message="Error al cargar productos" onRetry={onRetryProducts} />;
  }
  if (displayProducts.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
        <Search className="h-8 w-8 mb-2" />
        <p className="text-sm">Sin resultados</p>
      </div>
    );
  }
  return (
    <>
      {displayProducts.map((product) => {
        const disabled = isOutOfStock(product) || !canAddProduct(product);
        return (
          <Card
            key={product.id}
            className={`cursor-pointer hover:shadow-md transition-shadow ${disabled ? 'opacity-50 pointer-events-none' : ''}`}
            onClick={() => !disabled && onAddProduct(product)}
          >
            <CardContent className="p-2">
              <div className="flex items-center justify-between gap-1">
                <div className="flex-1 min-w-0">
                  <h3 className="font-medium text-xs truncate">{product.productoDescripcion}</h3>
                  <div className="flex items-center gap-1">
                    <span className="text-sm font-bold text-primary">
                      S/{product.precio?.toFixed(2)}
                    </span>
                    {product.usaInventario && (
                      <Badge
                        variant={product.cantidadActual > 10 ? 'secondary' : 'destructive'}
                        className="text-[9px] px-1 h-4"
                      >
                        {product.cantidadActual}
                      </Badge>
                    )}
                  </div>
                </div>
                <Button
                  size="icon"
                  variant="ghost"
                  className={`${compact ? 'h-8 w-8' : 'h-9 w-9 touch-target'} shrink-0`}
                  disabled={disabled}
                  onClick={(e) => {
                    e.stopPropagation();
                    if (!disabled) onAddProduct(product);
                  }}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </>
  );
}

function ProductListScroll({
  listContainerRef,
  displayProducts,
  productsLoading,
  productsError,
  onRetryProducts,
  onAddProduct,
  canAddProduct,
  compact = false,
}: {
  listContainerRef?: React.RefObject<HTMLDivElement>;
  displayProducts: Product[];
  productsLoading: boolean;
  productsError: Error | null;
  onRetryProducts: () => void;
  onAddProduct: (product: Product) => void;
  canAddProduct: (product: Product) => boolean;
  compact?: boolean;
}) {
  return (
    <div ref={listContainerRef} className="flex-1 min-h-0 relative">
      <ScrollArea className="absolute inset-0">
        <div className="space-y-1.5 pr-2">
          <ProductList
            displayProducts={displayProducts}
            productsLoading={productsLoading}
            productsError={productsError}
            onRetryProducts={onRetryProducts}
            onAddProduct={onAddProduct}
            canAddProduct={canAddProduct}
            compact={compact}
          />
        </div>
      </ScrollArea>
    </div>
  );
}

function CatalogTabs({
  searchInput,
  gridContent,
  promoContent,
  pagination,
}: {
  searchInput: React.ReactNode;
  gridContent: React.ReactNode;
  promoContent: React.ReactNode;
  pagination: React.ReactNode;
}) {
  return (
    <Tabs defaultValue="productos" className="flex flex-col flex-1 min-h-0 h-full">
      <TabsList className="w-full grid grid-cols-2 h-9 shrink-0">
        <TabsTrigger value="productos" className="text-xs">Productos</TabsTrigger>
        <TabsTrigger value="promociones" className="text-xs">Promociones</TabsTrigger>
      </TabsList>
      <TabsContent
        value="productos"
        className="flex-1 flex flex-col min-h-0 h-full overflow-hidden mt-2 gap-2 data-[state=active]:flex"
      >
        {searchInput}
        {gridContent}
        {pagination}
      </TabsContent>
      <TabsContent
        value="promociones"
        className="flex-1 flex flex-col min-h-0 h-full overflow-hidden mt-2 data-[state=active]:flex"
      >
        {promoContent}
      </TabsContent>
    </Tabs>
  );
}

export function POSProductGrid({
  searchTerm,
  onSearchChange,
  onBarcodeSearch,
  searchInputRef: externalRef,
  listContainerRef: externalListRef,
  productsLoading,
  productsError,
  onRetryProducts,
  displayProducts,
  currentPage,
  totalPages,
  onPageChange,
  onAddProduct,
  canAddProduct,
  promos,
  promosLoading,
  promosError,
  onRetryPromos,
  onApplyPromo,
  mobileDrawer = true,
}: POSProductGridProps) {
  const internalRef = useRef<HTMLInputElement>(null);
  const internalListRef = useRef<HTMLDivElement>(null);
  const searchInputRef = externalRef ?? internalRef;
  const listContainerRef = externalListRef ?? internalListRef;

  const searchInput = (
    <div className="relative shrink-0">
      <Search className="absolute left-2 top-1/2 -translate-y-1/2 text-muted-foreground h-4 w-4" />
      <Input
        ref={searchInputRef}
        type="text"
        placeholder="Buscar o escanear código..."
        value={searchTerm}
        onChange={(e) => onSearchChange(e.target.value)}
        onKeyDown={onBarcodeSearch}
        className="pl-8 h-9 text-sm"
        inputMode="none"
        aria-label="Buscar producto o código de barras"
      />
    </div>
  );

  const pagination = totalPages >= 1 && (
    <div className="flex items-center justify-between pt-1 shrink-0 text-xs min-h-[36px]">
      <Button
        variant="outline"
        size="sm"
        className="h-8 px-2"
        onClick={() => onPageChange(Math.max(1, currentPage - 1))}
        disabled={currentPage === 1 || totalPages <= 1}
      >
        ←
      </Button>
      <span className="text-muted-foreground">{currentPage}/{totalPages}</span>
      <Button
        variant="outline"
        size="sm"
        className="h-8 px-2"
        onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
        disabled={currentPage === totalPages || totalPages <= 1}
      >
        →
      </Button>
    </div>
  );

  const gridContent = (
    <ProductListScroll
      listContainerRef={listContainerRef}
      displayProducts={displayProducts}
      productsLoading={productsLoading}
      productsError={productsError}
      onRetryProducts={onRetryProducts}
      onAddProduct={onAddProduct}
      canAddProduct={canAddProduct}
      compact
    />
  );

  const promoContent = (
    <POSPromotionsTab
      promos={promos}
      isLoading={promosLoading}
      error={promosError}
      onRetry={onRetryPromos}
      onApply={onApplyPromo}
    />
  );

  return (
    <>
      <div className="hidden lg:flex lg:flex-[0_0_30%] xl:flex-[0_0_28%] min-w-0 bg-background p-1.5 flex-col min-h-0 overflow-hidden h-full">
        <CatalogTabs
          searchInput={searchInput}
          gridContent={gridContent}
          promoContent={promoContent}
          pagination={pagination}
        />
      </div>

      {mobileDrawer && (
        <div className="lg:hidden fixed bottom-4 left-4 right-4 z-40">
          <Drawer>
            <DrawerTrigger asChild>
              <Button className="w-full h-11 touch-target shadow-lg" variant="secondary">
                <Search className="mr-2 h-4 w-4" />
                Catálogo
              </Button>
            </DrawerTrigger>
            <DrawerContent className="max-h-[85vh]">
              <DrawerHeader>
                <DrawerTitle>Catálogo</DrawerTitle>
              </DrawerHeader>
              <div className="px-4 pb-4 flex flex-col gap-2 min-h-0 flex-1 overflow-hidden h-[60vh]">
                <CatalogTabs
                  searchInput={searchInput}
                  gridContent={
                    <ScrollArea className="flex-1 max-h-[40vh]">
                      <div className="space-y-1.5 pr-2">
                        <ProductList
                          displayProducts={displayProducts}
                          productsLoading={productsLoading}
                          productsError={productsError}
                          onRetryProducts={onRetryProducts}
                          onAddProduct={onAddProduct}
                          canAddProduct={canAddProduct}
                        />
                      </div>
                    </ScrollArea>
                  }
                  promoContent={promoContent}
                  pagination={pagination}
                />
              </div>
            </DrawerContent>
          </Drawer>
        </div>
      )}
    </>
  );
}
