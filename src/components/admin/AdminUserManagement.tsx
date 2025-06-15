import React, { useState } from "react";
import { TableHeader, TableHead, TableRow, TableCell, TableBody } from "@/components/ui/table";
import { AdminTable } from "./AdminTable";
import { Button } from "@/components/ui/button";
import { mockUsers } from "@/mocks/mockUsers";

export default function AdminUserManagement() {
  const [role, setRole] = useState<"all"|"customer"|"provider"|"admin">("all");
  const users = role==="all" ? mockUsers : mockUsers.filter(u=>u.role===role);
  return (
    <div>
      <div className="mb-4 flex gap-2 items-end">
        <label className="font-semibold">Filter by role:</label>
        <select value={role} onChange={e=>setRole(e.target.value as any)} className="border rounded px-2 py-1 bg-background">
          <option value="all">All</option>
          <option value="customer">Customer</option>
          <option value="provider">Provider</option>
          <option value="admin">Admin</option>
        </select>
      </div>
      <AdminTable emptyMessage={!users.length ? "No users found for the selected role." : undefined}>
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
              <TableCell>
                <div className="flex gap-2">
                  <Button size="sm" variant="outline">View</Button>
                  <Button size="sm" variant="destructive">Suspend</Button>
                  <Button size="sm" variant="secondary">Ban</Button>
                  <Button size="sm" variant="default">Verify</Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </AdminTable>
    </div>
  );
}
