
import React, { createContext, useContext, useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

type Role = "customer" | "provider" | "admin";

interface AdminRoleContextType {
  currentRole: Role;
  actualRole: Role | null;
  isAdmin: boolean;
  switchRole: (role: Role) => void;
  resetRole: () => void;
}

const AdminRoleContext = createContext<AdminRoleContextType | undefined>(undefined);

export function AdminRoleProvider({ children }: { children: React.ReactNode }) {
  const [actualRole, setActualRole] = useState<Role | null>(null);
  const [currentRole, setCurrentRole] = useState<Role>("customer");
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const checkUserRole = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Check if user has admin role
      const { data: adminRole } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", user.id)
        .eq("role", "admin")
        .single();

      if (adminRole) {
        setActualRole("admin");
        setIsAdmin(true);
        // Check if there's a saved viewing role
        const savedRole = localStorage.getItem("admin-viewing-as");
        if (savedRole && ["customer", "provider", "admin"].includes(savedRole)) {
          setCurrentRole(savedRole as Role);
        } else {
          setCurrentRole("admin");
        }
      } else {
        // Get user's actual role from app_users
        const { data: profile } = await supabase
          .from("app_users")
          .select("role")
          .eq("auth_user_id", user.id)
          .single();

        if (profile?.role) {
          setActualRole(profile.role as Role);
          setCurrentRole(profile.role as Role);
        }
      }
    };

    checkUserRole();
  }, []);

  const switchRole = (role: Role) => {
    if (!isAdmin) return;
    setCurrentRole(role);
    localStorage.setItem("admin-viewing-as", role);
  };

  const resetRole = () => {
    if (!isAdmin) return;
    setCurrentRole(actualRole || "admin");
    localStorage.removeItem("admin-viewing-as");
  };

  return (
    <AdminRoleContext.Provider value={{
      currentRole,
      actualRole,
      isAdmin,
      switchRole,
      resetRole
    }}>
      {children}
    </AdminRoleContext.Provider>
  );
}

export function useAdminRole() {
  const context = useContext(AdminRoleContext);
  if (context === undefined) {
    throw new Error("useAdminRole must be used within an AdminRoleProvider");
  }
  return context;
}
