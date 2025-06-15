
import React from "react";
import { Card } from "@/components/ui/card";
import { NavLink, Outlet, useLocation } from "react-router-dom";
import { RequireAdmin } from "@/components/auth/RequireAdmin";

const tabs = [
  { label: "User Management", path: "users" },
  { label: "Task Oversight", path: "tasks" },
  { label: "Reports & Disputes", path: "reports" },
  { label: "Analytics", path: "analytics" },
  { label: "Push Notifications", path: "push" },
];

export default function AdminDashboard() {
  const location = useLocation();
  // Extract the subroute ("/admin/users", etc)
  const activeTab = tabs.find(tab => location.pathname.endsWith(tab.path))?.path ?? "users";

  return (
    <RequireAdmin>
      <div className="min-h-screen bg-gradient-to-br from-white via-blue-50 to-slate-100 flex flex-col items-center p-4">
        <Card className="w-full max-w-5xl shadow-xl p-6 rounded-xl space-y-6">
          <h1 className="text-2xl md:text-3xl font-bold mb-4 text-primary">Admin Dashboard</h1>
          <div className="w-full border-b mb-4 flex flex-wrap gap-2">
            {tabs.map(tab => (
              <NavLink
                key={tab.path}
                to={`/admin/${tab.path}`}
                className={({ isActive }) => 
                  `px-4 py-2 rounded-t font-medium text-sm transition-all ${
                    isActive || activeTab === tab.path 
                      ? "bg-blue-200 text-primary"
                      : "text-muted-foreground hover:bg-slate-100"
                  }`
                }
                end
              >
                {tab.label}
              </NavLink>
            ))}
          </div>
          {/* Content rendered by sub-route */}
          <div>
            <Outlet />
          </div>
        </Card>
      </div>
    </RequireAdmin>
  );
}
