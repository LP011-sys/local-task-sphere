
import React from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Table, TableHeader, TableRow, TableHead, TableCell, TableBody } from "@/components/ui/table";
import { Card } from "@/components/ui/card";
import { Ban, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function AdminUsersOverview() {
  // Fetch all users
  const { data: users, isLoading, isError } = useQuery({
    queryKey: ["admin-all-users"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("app_users")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data || [];
    },
  });

  const queryClient = useQueryClient();
  const { mutate: updateStatus, isPending } = useMutation({
    mutationFn: async ({ id, status }: { id: string, status: string }) => {
      const { error } = await supabase
        .from("app_users")
        .update({ status })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-all-users"] });
    },
  });

  return (
    <div>
      <h2 className="text-lg font-semibold mb-4">Users Overview</h2>
      <Card className="p-2 mb-4">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Email</TableHead>
                <TableHead>Username</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Plan</TableHead>
                <TableHead>Join Date</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={7}>
                    <div className="flex items-center justify-center py-10">
                      <Loader2 className="animate-spin mr-2" /> Loading users...
                    </div>
                  </TableCell>
                </TableRow>
              ) : isError || !users?.length ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center text-muted-foreground">
                    No users found.
                  </TableCell>
                </TableRow>
              ) : (
                users.map((user: any) => (
                  <TableRow key={user.id}>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>{user.username ?? "-"}</TableCell>
                    <TableCell className="capitalize">{user.role}</TableCell>
                    <TableCell className="capitalize">{user.subscription_plan || "free"}</TableCell>
                    <TableCell>
                      {user.created_at ? new Date(user.created_at).toLocaleDateString() : "-"}
                    </TableCell>
                    <TableCell>
                      <span className={user.status === "banned" ? "text-red-500" : ""}>
                        {user.status ?? "active"}
                      </span>
                    </TableCell>
                    <TableCell>
                      <Button
                        size="sm"
                        variant={user.status === "banned" ? "secondary" : "destructive"}
                        disabled={user.status === "banned" || isPending}
                        onClick={() => updateStatus({ id: user.id, status: "banned" })}
                        title="Ban/Deactivate"
                      >
                        <Ban size={16} className="mr-1" />{user.status === "banned" ? "Banned" : "Ban"}
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </Card>
    </div>
  );
}
