'use client';

import * as React from 'react';
import { createPortal } from 'react-dom';

interface FullscreenModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
}

export function FullscreenModal({
  isOpen,
  onClose,
  children,
}: FullscreenModalProps) {
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
    <div className="fixed inset-0 z-[9999] bg-white">
      {/* Content */}
      <div className="w-full h-full overflow-hidden">
        {children}
      </div>
    </div>
  );

  // Use a portal to render the modal at the root level of the DOM
  return createPortal(modalContent, document.body);
}