
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

  return (
    <div className="flex items-center gap-2">
      <Badge variant="outline" className="flex items-center gap-1">
        {roleIcons[currentRole]}
        <span className="text-xs">Viewing as {t(currentRole)}</span>
      </Badge>
      
      <Select value={currentRole} onValueChange={(value) => switchRole(value as any)}>
        <SelectTrigger className="w-32 h-8">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="admin">
            <div className="flex items-center gap-2">
              <Crown size={14} />
              {t("admin")}
            </div>
          </SelectItem>
          <SelectItem value="customer">
            <div className="flex items-center gap-2">
              <User size={14} />
              {t("customer")}
            </div>
          </SelectItem>
          <SelectItem value="provider">
            <div className="flex items-center gap-2">
              <Wrench size={14} />
              {t("provider")}
            </div>
          </SelectItem>
        </SelectContent>
      </Select>

      <Button
        variant="ghost"
        size="sm"
        onClick={resetRole}
        className="text-xs"
      >
        Reset
      </Button>
    </div>
  );
}
