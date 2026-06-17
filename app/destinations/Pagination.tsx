"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

function getPageWindow(current: number, total: number, size = 5): number[] {
  if (total <= size) return Array.from({ length: total }, (_, i) => i + 1);
  let start = Math.max(1, current - Math.floor(size / 2));
  const end = Math.min(total, start + size - 1);
  start = Math.max(1, end - size + 1);
  return Array.from({ length: end - start + 1 }, (_, i) => start + i);
}

export default function DestinationPagination({
  page,
  totalPages,
}: {
  page: number;
  totalPages: number;
}) {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  function hrefForPage(target: number) {
    const params = new URLSearchParams(searchParams.toString());
    if (target <= 1) params.delete("page");
    else params.set("page", String(target));
    const qs = params.toString();
    return qs ? `${pathname}?${qs}` : pathname;
  }

  const pages = getPageWindow(page, totalPages);
  const prevDisabled = page <= 1;
  const nextDisabled = page >= totalPages;

  return (
    <nav className="flex items-center justify-center gap-1" aria-label="Pagination">
      <Link
        href={hrefForPage(page - 1)}
        aria-label="Page précédente"
        aria-disabled={prevDisabled}
        tabIndex={prevDisabled ? -1 : undefined}
        className={cn(
          buttonVariants({ variant: "ghost", size: "icon" }),
          prevDisabled && "pointer-events-none opacity-50",
        )}
      >
        <ChevronLeft className="h-4 w-4" />
      </Link>

      {pages[0] > 1 && (
        <>
          <Link
            href={hrefForPage(1)}
            className={buttonVariants({ variant: "ghost", size: "icon" })}
          >
            1
          </Link>
          {pages[0] > 2 && (
            <span className="px-2 text-muted-foreground" aria-hidden>
              …
            </span>
          )}
        </>
      )}

      {pages.map((p) => (
        <Link
          key={p}
          href={hrefForPage(p)}
          aria-current={p === page ? "page" : undefined}
          className={buttonVariants({
            variant: p === page ? "default" : "ghost",
            size: "icon",
          })}
        >
          {p}
        </Link>
      ))}

      {pages[pages.length - 1] < totalPages && (
        <>
          {pages[pages.length - 1] < totalPages - 1 && (
            <span className="px-2 text-muted-foreground" aria-hidden>
              …
            </span>
          )}
          <Link
            href={hrefForPage(totalPages)}
            className={buttonVariants({ variant: "ghost", size: "icon" })}
          >
            {totalPages}
          </Link>
        </>
      )}

      <Link
        href={hrefForPage(page + 1)}
        aria-label="Page suivante"
        aria-disabled={nextDisabled}
        tabIndex={nextDisabled ? -1 : undefined}
        className={cn(
          buttonVariants({ variant: "ghost", size: "icon" }),
          nextDisabled && "pointer-events-none opacity-50",
        )}
      >
        <ChevronRight className="h-4 w-4" />
      </Link>
    </nav>
  );
}
