
import React from "react";
import { TableHeader, TableHead, TableRow, TableCell, TableBody } from "@/components/ui/table";
import { AdminTable } from "./AdminTable";
import { Button } from "@/components/ui/button";
import { mockReports } from "@/mocks/mockReports";
import { AlertCircle, Info, Flag } from "lucide-react";

export default function AdminReportsDisputes() {
  const emptyMsg = "No reports or disputes yet—you're all clear!";
  // Show unique icon for empty state (alert for reports/disputes)
  return (
    <div>
      <h2 className="text-xl font-semibold mb-1">Reports & Disputes</h2>
      <p className="text-muted-foreground mb-4 text-sm">
        Address reports and disputes in your community. Review, add notes, and resolve actions here.
      </p>
      <AdminTable
        emptyMessage={!mockReports.length ? emptyMsg : undefined}
        emptyIcon={
          !mockReports.length
            ? <Flag size={40} className="text-purple-400" />
            : undefined
        }
      >
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
                <div className="flex gap-2">
                  <Button size="sm" variant="outline">View</Button>
                  <Button size="sm" variant="secondary">Resolve</Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </AdminTable>
    </div>
  );
}
