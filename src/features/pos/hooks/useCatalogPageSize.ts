import { useEffect, useState } from 'react';

export const CATALOG_ROW_HEIGHT = 52;
export const MIN_CATALOG_PAGE_SIZE = 8;
export const DEFAULT_CATALOG_PAGE_SIZE = 12;

export function useCatalogPageSize(
  containerRef: React.RefObject<HTMLElement | null>,
): number {
  const [pageSize, setPageSize] = useState(DEFAULT_CATALOG_PAGE_SIZE);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    let timer: ReturnType<typeof setTimeout>;

    const update = (height: number) => {
      if (height <= 0) return;
      const next = Math.max(MIN_CATALOG_PAGE_SIZE, Math.floor(height / CATALOG_ROW_HEIGHT));
      setPageSize((prev) => (prev === next ? prev : next));
    };

    const observer = new ResizeObserver((entries) => {
      clearTimeout(timer);
      timer = setTimeout(() => {
        update(entries[0]?.contentRect.height ?? 0);
      }, 100);
    });

    observer.observe(el);
    update(el.getBoundingClientRect().height);

    return () => {
      clearTimeout(timer);
      observer.disconnect();
    };
  }, [containerRef]);

  return pageSize;
}
