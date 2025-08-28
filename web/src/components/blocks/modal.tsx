'use client';

import { X } from 'lucide-react';
import * as React from 'react';
import { createPortal } from 'react-dom';

import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  accessibleTitle?: string;
  children: React.ReactNode;
  dialogContentClassName?: string;
}

export function Modal({
  isOpen,
  onClose,
  title,
  accessibleTitle,
  children,
  dialogContentClassName,
}: ModalProps) {
  // Prevent scrolling when modal is open
  React.useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = 'unset';
      };
    }
  }, [isOpen]);

  // Handle ESC key press to close modal
  React.useEffect(() => {
    const handleEscKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscKey);
      return () => {
        document.removeEventListener('keydown', handleEscKey);
      };
    }
  }, [isOpen, onClose]);

  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  if (!isOpen || !mounted) {
    return null;
  }

  const modalContent = (
    <>
      {/* Overlay/Backdrop */}
      <div
        className="bg-background/50 fixed inset-0 z-[9999] backdrop-blur-sm"
        aria-hidden="true"
      />

      {/* Close Button - positioned at top right of screen */}
      <Button
        variant="ghost"
        size="icon"
        onClick={onClose}
        className="bg-background/80 fixed right-3 top-3 sm:right-6 sm:top-6 z-[10000] h-8 w-8 sm:h-10 sm:w-10 rounded-full shadow-md backdrop-blur-sm"
        aria-label="Close"
      >
        <X className="h-4 w-4 sm:h-6 sm:w-6" />
      </Button>

      {/* Modal Content Container */}
      <div
        className="fixed inset-0 z-[9999] flex items-center justify-center overflow-y-auto"
        role="dialog"
        aria-modal="true"
      >
        <div
          className={cn(
            'relative mx-auto my-4 flex max-h-[calc(100vh-2rem)] w-full max-w-md flex-col border-none bg-transparent p-0 shadow-none',
            dialogContentClassName
          )}
        >
          {title && <div className="sr-only">{accessibleTitle || title}</div>}

          {/* Content - transparent with no border */}
          <div className="mt-0 flex-1 overflow-visible">{children}</div>
        </div>
      </div>
    </>
  );

  // Use a portal to render the modal at the root level of the DOM
  return createPortal(modalContent, document.body);
}
