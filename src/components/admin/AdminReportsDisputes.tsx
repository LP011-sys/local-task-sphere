
import React from "react";
import { TableHeader, TableHead, TableRow, TableCell, TableBody } from "@/components/ui/table";
import { AdminTable } from "./AdminTable";
import { Button } from "@/components/ui/button";
import { mockReports } from "@/mocks/mockReports";

export default function AdminReportsDisputes() {
  return (
    <div>
      <AdminTable emptyMessage={!mockReports.length ? "No reports or disputes." : undefined}>
        <TableHeader>
          <TableRow>
            <TableHead>Type</TableHead>
            <TableHead>Name</TableHead>
            <TableHead>Reason</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Notes</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {mockReports.map(r=>(
            <TableRow key={r.id}>
              <TableCell>{r.type}</TableCell>
              <TableCell>{r.name}</TableCell>
              <TableCell>{r.reason}</TableCell>
              <TableCell>{r.status}</TableCell>
              <TableCell>
                <input className="border rounded px-2 py-1 w-36" placeholder="Add note" />
              </TableCell>
              <TableCell>
                <Button size="sm" variant="outline">View</Button>
                <Button size="sm" variant="secondary">Resolve</Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </AdminTable>
    </div>
  );
}
