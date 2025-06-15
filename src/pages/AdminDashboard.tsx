
import React, { useState } from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import AdminUserManagement from "@/components/admin/AdminUserManagement";
import AdminTaskOversight from "@/components/admin/AdminTaskOversight";
import AdminReportsDisputes from "@/components/admin/AdminReportsDisputes";
import AdminAnalyticsPanel from "@/components/admin/AdminAnalyticsPanel";
import AdminPushPanel from "@/components/admin/AdminPushPanel";
import { RequireAdmin } from "@/components/auth/RequireAdmin";

export default function AdminDashboard() {
  const [tab, setTab] = useState("users");
  return (
    <RequireAdmin>
      <div className="min-h-screen bg-gradient-to-br from-white via-blue-50 to-slate-100 flex flex-col items-center p-4">
        <Card className="w-full max-w-5xl shadow-xl p-6 rounded-xl space-y-6">
          <h1 className="text-2xl md:text-3xl font-bold mb-4 text-primary">Admin Dashboard</h1>
          <Tabs value={tab} onValueChange={setTab} className="w-full">
            <TabsList className="mb-2">
              <TabsTrigger value="users">User Management</TabsTrigger>
              <TabsTrigger value="tasks">Task Oversight</TabsTrigger>
              <TabsTrigger value="reports">Reports & Disputes</TabsTrigger>
              <TabsTrigger value="analytics">Analytics</TabsTrigger>
              <TabsTrigger value="push">Push Notifications</TabsTrigger>
            </TabsList>
            <TabsContent value="users"><AdminUserManagement /></TabsContent>
            <TabsContent value="tasks"><AdminTaskOversight /></TabsContent>
            <TabsContent value="reports"><AdminReportsDisputes /></TabsContent>
            <TabsContent value="analytics"><AdminAnalyticsPanel /></TabsContent>
            <TabsContent value="push"><AdminPushPanel /></TabsContent>
          </Tabs>
        </Card>
      </div>
    </RequireAdmin>
  );
}
