import { useState } from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';

vi.mock('@/features/equipements/hooks/usePannes', () => ({
  usePannes: () => ({ pannes: [], isLoading: false, isError: false }),
}));

import { DiEditModal } from '../DiEditModal';

const familles = [
  { id: 1, nom: 'FAM1' },
  { id: 2, nom: 'FAM2' },
] as any;
const produits = [
  { id: 10, nom: 'PROD1', familleProduitId: 1 },
  { id: 20, nom: 'PROD2', familleProduitId: 2 },
] as any;

// DI-A has famille 2; DI-B has none — switching must not strand FAM2 on B.
const DI_A = { familleId: 2, produitId: 20, priorite: 'HAUTE' };
const DI_B = { priorite: 'BASSE' };

const selects = () => Array.from(document.querySelectorAll('select')) as HTMLSelectElement[];
// order: 0 atelier, 1 ligne, 2 poste, 3 famille

function Harness() {
  const [isOpen, setIsOpen] = useState(false);
  const [data, setData] = useState<any>(null);
  const openWith = (d: any) => {
    setData(d);
    setIsOpen(true);
  };
  return (
    <div>
      <button onClick={() => openWith(DI_A)}>editA</button>
      <button onClick={() => openWith(DI_B)}>editB</button>
      <button onClick={() => setIsOpen(false)}>close</button>
      <DiEditModal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        onSubmit={vi.fn()}
        initialData={data}
        ateliers={[]}
        lignes={[]}
        postes={[]}
        familles={familles}
        produits={produits}
      />
    </div>
  );
}

describe('DiEditModal', () => {
  it('does not keep DI-A famille when switching to a DI with none', () => {
    render(<Harness />);

    fireEvent.click(screen.getByText('editA'));
    expect(selects()[3].value).toBe('2'); // FAM2 for DI-A

    fireEvent.click(screen.getByText('close'));
    fireEvent.click(screen.getByText('editB'));
    expect(selects()[3].value).not.toBe('2'); // must not carry FAM2 into DI-B
  });
});
