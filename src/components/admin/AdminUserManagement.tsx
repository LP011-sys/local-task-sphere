
import React, { useState } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
const mockUsers = [
  { id: "1", name: "Alice Smith", email: "alice@example.com", role: "customer", status: "active", tasks: 4, rating: 4.8 },
  { id: "2", name: "Bob Lee", email: "bob@example.com", role: "provider", status: "verified", tasks: 21, rating: 4.6 },
  { id: "3", name: "Eva Admin", email: "eva@admin.com", role: "admin", status: "active", tasks: 0, rating: null }
];
export default function AdminUserManagement() {
  const [role, setRole] = useState<"all"|"customer"|"provider"|"admin">("all");
  const users = role==="all" ? mockUsers : mockUsers.filter(u=>u.role===role);
  return (
    <div>
      <div className="mb-4 flex gap-2 items-end">
        <label className="font-semibold">Filter by role:</label>
        <select value={role} onChange={e=>setRole(e.target.value as any)} className="border rounded px-2 py-1">
          <option value="all">All</option>
          <option value="customer">Customer</option>
          <option value="provider">Provider</option>
          <option value="admin">Admin</option>
        </select>
      </div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>User</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Role</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Tasks</TableHead>
            <TableHead>Rating</TableHead>
            <TableHead>Action</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {users.map(user=>(
            <TableRow key={user.id}>
              <TableCell>
                <div>
                  <span className="font-medium">{user.name}</span>
                </div>
              </TableCell>
              <TableCell>{user.email}</TableCell>
              <TableCell className="capitalize">{user.role}</TableCell>
              <TableCell>{user.status}</TableCell>
              <TableCell>{user.tasks}</TableCell>
              <TableCell>{user.rating !== null ? user.rating : "-"}</TableCell>
              <TableCell className="flex gap-1">
                <Button size="sm" variant="outline">View</Button>
                <Button size="sm" variant="destructive">Suspend</Button>
                <Button size="sm" variant="secondary">Ban</Button>
                <Button size="sm">Verify</Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
