
import React from "react";
import { Table } from "@/components/ui/table";

type AdminTableProps = {
  /** Render your <TableHeader> and <TableBody> as children */
  children: React.ReactNode;
  /** Optionally show when rows are empty */
  emptyMessage?: React.ReactNode;
  /** Show caption if needed */
  caption?: React.ReactNode;
  /** Helpful for responsive layouts */
  className?: string;
};

/**
 * Opinionated wrapper for admin tables. Standardizes layout and optionally renders empty state/caption.
 */
export function AdminTable({ children, emptyMessage, caption, className }: AdminTableProps) {
  return (
    <div className={`w-full overflow-x-auto ${className ?? ""}`}>
      <Table>
        {caption && <caption>{caption}</caption>}
        {children}
      </Table>
      {!!emptyMessage && (
        <div className="py-8 w-full text-center text-muted-foreground text-sm">{emptyMessage}</div>
      )}
    </div>
  );
}
