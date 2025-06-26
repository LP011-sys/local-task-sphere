
import React, { createContext, useContext, useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

type Role = "customer" | "provider" | "admin";

interface UserRoleContextType {
  currentRole: Role;
  availableRoles: Role[];
  isAdmin: boolean;
  isLoading: boolean;
  switchRole: (role: Role) => Promise<void>;
  addRole: (role: Role) => Promise<void>;
  refreshUserData: () => Promise<void>;
}

const UserRoleContext = createContext<UserRoleContextType | undefined>(undefined);

export function UserRoleProvider({ children }: { children: React.ReactNode }) {
  const [currentRole, setCurrentRole] = useState<Role>("customer");
  const [availableRoles, setAvailableRoles] = useState<Role[]>(["customer"]);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const refreshUserData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      console.log("Fetching user role data for:", user.email);

      const { data: profile } = await supabase
        .from("app_users")
        .select("roles, active_role")
        .eq("auth_user_id", user.id)
        .single();

      console.log("User profile data:", profile);

      if (profile) {
        const userRoles = profile.roles || ["customer"];
        const activeRole = profile.active_role || "customer";
        
        setAvailableRoles(userRoles as Role[]);
        setCurrentRole(activeRole as Role);
        setIsAdmin(userRoles.includes("admin"));
        
        console.log("Set roles:", { availableRoles: userRoles, currentRole: activeRole, isAdmin: userRoles.includes("admin") });
      }
    } catch (error) {
      console.error("Error fetching user roles:", error);
      toast.error("Failed to load user data");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    refreshUserData();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' && session) {
        await refreshUserData();
      } else if (event === 'SIGNED_OUT') {
        setCurrentRole("customer");
        setAvailableRoles(["customer"]);
        setIsAdmin(false);
        setIsLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const switchRole = async (role: Role) => {
    if (!availableRoles.includes(role)) {
      toast.error("You don't have access to this role");
      return;
    }

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("No user found");

      const { error } = await supabase
        .from("app_users")
        .update({ active_role: role })
        .eq("auth_user_id", user.id);

      if (error) throw error;

      setCurrentRole(role);
      toast.success(`Switched to ${role} account`);
    } catch (error) {
      console.error("Error switching role:", error);
      toast.error("Failed to switch role");
    }
  };

  const addRole = async (role: Role) => {
    if (availableRoles.includes(role)) {
      toast.info("You already have this role");
      return;
    }

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("No user found");

      const newRoles = [...availableRoles, role];
      
      const { error } = await supabase
        .from("app_users")
        .update({ roles: newRoles })
        .eq("auth_user_id", user.id);

      if (error) throw error;

      setAvailableRoles(newRoles);
      toast.success(`${role} role added successfully!`);
    } catch (error) {
      console.error("Error adding role:", error);
      toast.error("Failed to add role");
    }
  };

  return (
    <UserRoleContext.Provider value={{
      currentRole,
      availableRoles,
      isAdmin,
      isLoading,
      switchRole,
      addRole,
      refreshUserData
    }}>
      {children}
    </UserRoleContext.Provider>
  );
}

export function useUserRole() {
  const context = useContext(UserRoleContext);
  if (context === undefined) {
    throw new Error("useUserRole must be used within a UserRoleProvider");
  }
  return context;
}
