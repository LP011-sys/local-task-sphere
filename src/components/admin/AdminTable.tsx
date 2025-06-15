
import React from "react";
import { Table } from "@/components/ui/table";
import { Info } from "lucide-react";

type AdminTableProps = {
  /** Render your <TableHeader> and <TableBody> as children */
  children: React.ReactNode;
  /** Optionally show when rows are empty */
  emptyMessage?: React.ReactNode;
  /** Optionally customize empty state icon */
  emptyIcon?: React.ReactNode;
  /** Show caption if needed */
  caption?: React.ReactNode;
  /** Helpful for responsive layouts */
  className?: string;
};

/**
 * Opinionated wrapper for admin tables. Standardizes layout and optionally renders empty state/caption.
 */
export function AdminTable({ children, emptyMessage, emptyIcon, caption, className }: AdminTableProps) {
  return (
    <div className={`w-full overflow-x-auto ${className ?? ""}`}>
      <Table>
        {caption && <caption>{caption}</caption>}
        {children}
      </Table>
      {!!emptyMessage && (
        <div className="py-12 flex flex-col items-center w-full text-center text-muted-foreground text-base space-y-3">
          <div className="mb-2 text-blue-400">
            {emptyIcon || <Info size={40} />}
          </div>
          <div>{emptyMessage}</div>
        </div>
      )}
    </div>
  );
}

