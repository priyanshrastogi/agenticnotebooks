'use client';

import html2canvas from 'html2canvas-pro';
import { useRef } from 'react';

import { Button } from '@/components/ui/button';
import Logo from '@/components/ui/logo';

export default function MediaPage() {
  const logoRef = useRef<HTMLDivElement>(null);

  const handleExport = async () => {
    if (!logoRef.current) return;

    try {
      const canvas = await html2canvas(logoRef.current, {
        backgroundColor: null,
        scale: 20,
      });

      // Convert to PNG and download
      const link = document.createElement('a');
      link.download = 'intellicharts-logo.png';
      link.href = canvas.toDataURL('image/png', 1.0);
      link.click();
    } catch (error) {
      console.error('Error exporting logo:', error);
    }
  };

  return (
    <div className="bg-background flex h-screen w-screen flex-col items-center justify-center gap-8">
      <div ref={logoRef} className="bg-transparent" data-logo-container>
        <Logo onlyIcon />
      </div>
      <Button onClick={handleExport} variant="secondary" className="absolute bottom-10 right-10">
        Download Logo
      </Button>
    </div>
  );
}
