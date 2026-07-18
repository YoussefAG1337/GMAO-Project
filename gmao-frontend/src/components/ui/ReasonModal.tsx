'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';

interface ReasonModalProps {
  isOpen: boolean;
  title: string;
  description: string;
  confirmLabel: string;
  confirmClassName?: string;
  onConfirm: (raison: string) => void;
  onClose: () => void;
}

/**
 * Reusable modal for capturing a mandatory reason/explanation.
 * Used by: Reporter, Annuler, Non Validé.
 */
export function ReasonModal({
  isOpen,
  title,
  description,
  confirmLabel,
  confirmClassName = 'bg-rose-500 hover:bg-rose-600 text-white',
  onConfirm,
  onClose,
}: ReasonModalProps) {
  const [raison, setRaison] = useState('');
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleConfirm = () => {
    if (raison.trim().length < 5) {
      setError('Veuillez saisir au moins 5 caractères');
      return;
    }
    onConfirm(raison.trim());
    setRaison('');
    setError('');
  };

  const handleClose = () => {
    setRaison('');
    setError('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={handleClose}
      />

      {/* Modal */}
      <div className="relative w-full max-w-md rounded-2xl bg-zinc-900 border border-white/10 shadow-2xl p-6 flex flex-col gap-4">
        <div>
          <h2 className="text-lg font-semibold text-white">{title}</h2>
          <p className="text-sm text-muted-foreground mt-1">{description}</p>
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-sm text-gray-400 font-medium">
            Raison <span className="text-rose-400">*</span>
          </label>
          <textarea
            rows={4}
            value={raison}
            onChange={(e) => {
              setRaison(e.target.value);
              if (error) setError('');
            }}
            placeholder="Décrivez la raison..."
            className="w-full rounded-lg bg-zinc-800 border border-white/10 text-white placeholder-gray-500 px-3 py-2 text-sm resize-none focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/20 transition"
          />
          {error && <p className="text-xs text-rose-400 mt-0.5">{error}</p>}
        </div>

        <div className="flex justify-end gap-2 pt-2">
          <Button variant="ghost" size="sm" onClick={handleClose}>
            Annuler
          </Button>
          <Button size="sm" className={confirmClassName} onClick={handleConfirm}>
            {confirmLabel}
          </Button>
        </div>
      </div>
    </div>
  );
}
