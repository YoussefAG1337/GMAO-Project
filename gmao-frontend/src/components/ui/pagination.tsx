'use client';

import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface PaginationProps {
  page: number;
  totalPages: number;
  total: number;
}

/**
 * URL-driven pagination control. Updating the page rewrites the `?page=` search
 * param (preserving existing filters), which re-runs the Server Component to
 * fetch that page. Renders nothing meaningful when there's a single page.
 */
export function Pagination({ page, totalPages, total }: PaginationProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const goToPage = (p: number) => {
    const sp = new URLSearchParams(searchParams.toString());
    sp.set('page', String(p));
    router.push(`${pathname}?${sp.toString()}`);
  };

  if (total === 0) return null;

  return (
    <div className="flex items-center justify-between gap-4 px-4 py-3 border-t border-white/[0.06] text-sm">
      <span className="text-muted-foreground">
        {total} résultat{total > 1 ? 's' : ''}
      </span>
      <div className="flex items-center gap-2">
        <Button
          variant="ghost"
          size="sm"
          disabled={page <= 1}
          onClick={() => goToPage(page - 1)}
          className="text-muted-foreground disabled:opacity-40"
        >
          <ChevronLeft className="w-4 h-4 mr-1" /> Précédent
        </Button>
        <span className="text-white tabular-nums">
          Page {page} sur {totalPages}
        </span>
        <Button
          variant="ghost"
          size="sm"
          disabled={page >= totalPages}
          onClick={() => goToPage(page + 1)}
          className="text-muted-foreground disabled:opacity-40"
        >
          Suivant <ChevronRight className="w-4 h-4 ml-1" />
        </Button>
      </div>
    </div>
  );
}
