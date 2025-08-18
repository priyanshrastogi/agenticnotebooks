'use client';

import { useEffect,useRef, useState } from 'react';

import { cn } from '@/lib/utils';

type SheetTabsProps = {
  sheetNames: string[];
  activeSheet: string;
  setActiveSheet: (sheetName: string) => void;
};

export default function SheetTabs({ sheetNames, activeSheet, setActiveSheet }: SheetTabsProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [tabWidth, setTabWidth] = useState<number | undefined>(undefined);
  const sheetCount = sheetNames.length;

  // Calculate tab width based on container width and number of tabs
  useEffect(() => {
    const updateTabWidth = () => {
      if (containerRef.current) {
        const containerWidth = containerRef.current.offsetWidth;
        // Reserve space for the row count display (~100px)
        const availableWidth = Math.max(0, containerWidth - 120);
        // Calculate tab width with a minimum of 60px, maximum of 150px
        const calculatedWidth = Math.min(150, Math.max(60, availableWidth / sheetCount));
        setTabWidth(calculatedWidth);
      }
    };

    updateTabWidth();

    // Add event listener for window resize
    window.addEventListener('resize', updateTabWidth);

    // Create a MutationObserver to watch for changes to the container's size
    if (containerRef.current) {
      const resizeObserver = new ResizeObserver(updateTabWidth);
      resizeObserver.observe(containerRef.current);

      return () => {
        window.removeEventListener('resize', updateTabWidth);
        resizeObserver.disconnect();
      };
    }

    return () => window.removeEventListener('resize', updateTabWidth);
  }, [sheetCount]);

  return (
    <div className="flex overflow-auto" ref={containerRef}>
      {sheetNames.map((sheetName) => (
        <button
          key={sheetName}
          className={cn(
            'overflow-hidden text-ellipsis whitespace-nowrap px-3 py-1 text-sm font-medium transition-colors focus:outline-none',
            activeSheet === sheetName
              ? 'bg-primary/10 text-primary'
              : 'text-muted-foreground hover:text-foreground hover:bg-secondary/20'
          )}
          style={{
            width: tabWidth ? `${tabWidth}px` : 'auto',
            minWidth: '60px',
            maxWidth: '150px',
          }}
          onClick={() => setActiveSheet(sheetName)}
          title={sheetName}
        >
          {sheetName}
        </button>
      ))}
    </div>
  );
}
