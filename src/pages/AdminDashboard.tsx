
import React, { useState } from "react";
import { Card } from "@/components/ui/card";
import { RequireAdmin } from "@/components/auth/RequireAdmin";
import AdminDashboardStats from "@/components/admin/AdminDashboardStats";
import AdminUsersOverview from "@/components/admin/AdminUsersOverview";
import AdminTasksOverview from "@/components/admin/AdminTasksOverview";
import AdminRevenueOverview from "@/components/admin/AdminRevenueOverview";
import { BarChart3, Users, Package, DollarSign } from "lucide-react";

const TABS = [
  { key: "dashboard", label: "Dashboard", icon: <BarChart3 className="inline mb-1 mr-1" size={18} /> },
  { key: "users", label: "Users", icon: <Users className="inline mb-1 mr-1" size={18} /> },
  { key: "tasks", label: "Tasks", icon: <Package className="inline mb-1 mr-1" size={18} /> },
  { key: "revenue", label: "Revenue", icon: <DollarSign className="inline mb-1 mr-1" size={18} /> },
];

export default function AdminDashboard() {
  const [tab, setTab] = useState<"dashboard" | "users" | "tasks" | "revenue">("dashboard");

  return (
    <RequireAdmin>
      <div className="min-h-screen bg-gradient-to-br from-white via-blue-50 to-slate-100 flex flex-col items-center p-2 sm:p-4">
        <Card className="w-full max-w-7xl shadow-xl p-2 sm:p-6 rounded-xl space-y-4">
          <h1 className="text-2xl md:text-3xl font-bold mb-2 text-primary text-center">Admin Dashboard</h1>
          
          {/* Tab Navigation */}
          <div className="w-full flex justify-center gap-1 mb-4">
            {TABS.map((t) => (
              <button
                key={t.key}
                className={`flex items-center px-4 py-2 rounded-t font-medium text-sm transition-all border-b-2 ${
                  tab === t.key
                    ? "bg-blue-100 border-primary text-primary"
                    : "hover:bg-slate-100 border-transparent text-muted-foreground"
                }`}
                onClick={() => setTab(t.key as any)}
              >
                {t.icon}
                {t.label}
              </button>
            ))}
          </div>
          
          <div className="w-full">
            {tab === "dashboard" && <AdminDashboardStats />}
            {tab === "users" && <AdminUsersOverview />}
            {tab === "tasks" && <AdminTasksOverview />}
            {tab === "revenue" && <AdminRevenueOverview />}
          </div>
        </Card>
      </div>
    </RequireAdmin>
  );
}
