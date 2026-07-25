'use client';

import { X } from 'lucide-react';
import { ReactNode, useEffect, useState } from 'react';
import { createPortal } from 'react-dom';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
}

export function Modal({ isOpen, onClose, title, children }: ModalProps) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  if (!isOpen || !mounted) return null;

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-start justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-[#09090b] border border-white/[0.1] rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden flex flex-col max-h-[calc(100vh-2rem)]">
        <div className="flex items-center justify-between p-4 border-b border-white/[0.05] shrink-0">
          <h3 className="text-lg font-semibold text-white">{title}</h3>
          <button
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-white/[0.05] text-muted-foreground hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="p-6 overflow-y-auto min-h-0">{children}</div>
      </div>
    </div>,
    document.body,
  );
}
