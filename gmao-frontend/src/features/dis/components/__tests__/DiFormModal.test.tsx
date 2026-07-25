import { useState } from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';

vi.mock('@/features/equipements/hooks/usePannes', () => ({
  usePannes: () => ({ pannes: [], isLoading: false, isError: false }),
}));

import { DiFormModal } from '../DiFormModal';

const ateliers = [{ id: 5, nom: 'ATL5' }] as any;
const familles = [
  { id: 1, nom: 'FAM1' },
  { id: 2, nom: 'FAM2' },
] as any;
const produits = [
  { id: 10, nom: 'PROD1', familleProduitId: 1 },
  { id: 20, nom: 'PROD2', familleProduitId: 2 },
] as any;

// DOM select order: 0 atelier, 1 ligne, 2 poste, 3 famille, 4 produit, 5 panne, 6 priorite
const selects = () => Array.from(document.querySelectorAll('select')) as HTMLSelectElement[];

function Harness(props?: { open?: boolean }) {
  const [isOpen, setIsOpen] = useState(props?.open ?? true);
  return (
    <div>
      <button onClick={() => setIsOpen(true)}>open</button>
      <button onClick={() => setIsOpen(false)}>close</button>
      <DiFormModal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        onSubmit={vi.fn()}
        ateliers={ateliers}
        lignes={[]}
        postes={[]}
        familles={familles}
        produits={produits}
        isAdminOrChef={false}
      />
    </div>
  );
}

describe('DiFormModal', () => {
  it('shows an empty placeholder, not the first option, on fresh open', () => {
    render(<Harness />);
    expect(selects()[0].value).toBe(''); // atelier — not 'ATL5'
    expect(selects()[3].value).toBe(''); // famille — not 'FAM1'
  });

  it('does not keep the previously selected famille after close + reopen', () => {
    render(<Harness />);
    fireEvent.change(selects()[3], { target: { value: '2' } });
    expect(selects()[3].value).toBe('2');

    fireEvent.click(screen.getByText('close'));
    fireEvent.click(screen.getByText('open'));

    expect(selects()[3].value).not.toBe('2');
  });
});
