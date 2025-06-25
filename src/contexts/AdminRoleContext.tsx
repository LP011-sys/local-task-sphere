
import React, { createContext, useContext, useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

type Role = "customer" | "provider" | "admin";

interface AdminRoleContextType {
  currentRole: Role;
  actualRole: Role | null;
  availableRoles: Role[];
  isAdmin: boolean;
  switchRole: (role: Role) => void;
  resetRole: () => void;
}

const AdminRoleContext = createContext<AdminRoleContextType | undefined>(undefined);

export function AdminRoleProvider({ children }: { children: React.ReactNode }) {
  const [actualRole, setActualRole] = useState<Role | null>(null);
  const [availableRoles, setAvailableRoles] = useState<Role[]>([]);
  const [currentRole, setCurrentRole] = useState<Role>("customer");
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const checkUserRole = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      console.log("Checking user role for:", user.email);

      // Get user profile with roles
      const { data: profile } = await supabase
        .from("app_users")
        .select("role, roles, active_role")
        .eq("auth_user_id", user.id)
        .single();

      console.log("User profile:", profile);

      if (profile) {
        // Use new roles array if available, otherwise fall back to single role
        const userRoles = profile.roles || [profile.role as Role];
        const activeRole = profile.active_role as Role || profile.role as Role;
        
        setAvailableRoles(userRoles);
        setActualRole(activeRole);
        
        // Check if user is admin
        const hasAdminRole = userRoles.includes("admin");
        setIsAdmin(hasAdminRole);
        
        if (hasAdminRole) {
          // Check if there's a saved viewing role
          const savedRole = localStorage.getItem("admin-viewing-as");
          if (savedRole && userRoles.includes(savedRole as Role)) {
            setCurrentRole(savedRole as Role);
            console.log("Loaded saved role:", savedRole);
          } else {
            setCurrentRole(activeRole);
            console.log("Set default active role:", activeRole);
          }
        } else {
          setCurrentRole(activeRole);
          console.log("Set user role:", activeRole);
        }
      }
    };

    checkUserRole();
  }, []);

  const switchRole = (role: Role) => {
    if (!isAdmin || !availableRoles.includes(role)) return;
    console.log("Switching role to:", role);
    setCurrentRole(role);
    localStorage.setItem("admin-viewing-as", role);
  };

  const resetRole = () => {
    if (!isAdmin) return;
    console.log("Resetting role to:", actualRole || "customer");
    setCurrentRole(actualRole || "customer");
    localStorage.removeItem("admin-viewing-as");
  };

  console.log("AdminRoleContext state:", { currentRole, actualRole, availableRoles, isAdmin });

  return (
    <AdminRoleContext.Provider value={{
      currentRole,
      actualRole,
      availableRoles,
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
