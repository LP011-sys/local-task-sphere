
import React, { useState } from "react";
import { TableHeader, TableHead, TableRow, TableCell, TableBody } from "@/components/ui/table";
import { AdminTable } from "./AdminTable";
import { Button } from "@/components/ui/button";
import { mockUsers } from "@/mocks/mockUsers";
import { UserPlus, Users, UserX, ShieldCheck } from "lucide-react";

export default function AdminUserManagement() {
  const [role, setRole] = useState<"all"|"customer"|"provider"|"admin">("all");
  const users = role==="all" ? mockUsers : mockUsers.filter(u=>u.role===role);
  // Each empty state has its own icon
  const emptyStates: Record<string, {msg: string, icon?: React.ReactNode}> = {
    all: { msg: "No users found. Invite your first user to get started!", icon: <Users size={40} className="text-green-400" /> },
    customer: { msg: "No customers found. As they sign up, they'll show here.", icon: <UserPlus size={40} className="text-blue-400" /> },
    provider: { msg: "No providers found. As they sign up, they'll show here.", icon: <ShieldCheck size={40} className="text-yellow-400" /> },
    admin: { msg: "No admins found. Invite an administrator to manage the platform.", icon: <UserX size={40} className="text-red-400" /> },
  };
  return (
    <div>
      <h2 className="text-xl font-semibold mb-1">User Management</h2>
      <p className="text-muted-foreground mb-4 text-sm">
        View all registered users, filter by role, and manage user accounts, status, and access levels.
      </p>
      <div className="mb-4 flex gap-2 items-end">
        <label className="font-semibold">Filter by role:</label>
        <select value={role} onChange={e=>setRole(e.target.value as any)} className="border rounded px-2 py-1 bg-background">
          <option value="all">All</option>
          <option value="customer">Customer</option>
          <option value="provider">Provider</option>
          <option value="admin">Admin</option>
        </select>
      </div>
      <AdminTable
        emptyMessage={!users.length ? emptyStates[role].msg : undefined}
        emptyIcon={!users.length ? emptyStates[role].icon : undefined}
      >
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
