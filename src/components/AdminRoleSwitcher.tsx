
import React from "react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useAdminRole } from "@/contexts/AdminRoleContext";
import { useTranslation } from "react-i18next";
import { Crown, User, Wrench } from "lucide-react";

export default function AdminRoleSwitcher() {
  const { currentRole, isAdmin, switchRole, resetRole } = useAdminRole();
  const { t } = useTranslation();

  if (!isAdmin) return null;

  const roleIcons = {
    admin: <Crown size={16} />,
    customer: <User size={16} />,
    provider: <Wrench size={16} />
  };

  const roleColors = {
    admin: "bg-purple-100 text-purple-800 border-purple-200",
    customer: "bg-blue-100 text-blue-800 border-blue-200", 
    provider: "bg-green-100 text-green-800 border-green-200"
  };

  return (
    <div className="flex items-center gap-2">
      <Badge variant="outline" className={`flex items-center gap-1 px-3 py-1 ${roleColors[currentRole]}`}>
        {roleIcons[currentRole]}
        <span className="text-xs font-medium">
          Viewing as {currentRole.charAt(0).toUpperCase() + currentRole.slice(1)}
        </span>
      </Badge>
      
      <Select value={currentRole} onValueChange={(value: "admin" | "customer" | "provider") => switchRole(value)}>
        <SelectTrigger className="w-32 h-8">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="admin">
            <div className="flex items-center gap-2">
              <Crown size={14} />
              Admin
            </div>
          </SelectItem>
          <SelectItem value="customer">
            <div className="flex items-center gap-2">
              <User size={14} />
              Customer
            </div>
          </SelectItem>
          <SelectItem value="provider">
            <div className="flex items-center gap-2">
              <Wrench size={14} />
              Provider
            </div>
          </SelectItem>
        </SelectContent>
      </Select>

      <Button
        variant="ghost"
        size="sm"
        onClick={resetRole}
        className="text-xs h-8"
      >
        Reset
      </Button>
    </div>
  );
}
