
import React from "react";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";

type Role = "customer" | "provider";

interface RoleSelectorProps {
  selectedRole: Role | null;
  onRoleChange: (role: Role) => void;
}

export default function RoleSelector({ selectedRole, onRoleChange }: RoleSelectorProps) {
  return (
    <div className="space-y-3">
      <Label className="text-sm font-medium">I'm here to:</Label>
      <RadioGroup 
        value={selectedRole || ""} 
        onValueChange={(value) => onRoleChange(value as Role)}
        className="space-y-2"
      >
        <div className="flex items-center space-x-2">
          <RadioGroupItem value="customer" id="customer" />
          <Label htmlFor="customer" className="text-sm cursor-pointer">
            🧑‍💼 Hire help (Customer)
          </Label>
        </div>
        <div className="flex items-center space-x-2">
          <RadioGroupItem value="provider" id="provider" />
          <Label htmlFor="provider" className="text-sm cursor-pointer">
            🛠️ Offer services (Provider)
          </Label>
        </div>
      </RadioGroup>
      <p className="text-xs text-muted-foreground">
        You can add the other role later in your profile settings.
      </p>
    </div>
  );
}
