
import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useUserRole } from "@/contexts/UserRoleContext";
import { Users, Briefcase } from "lucide-react";

export default function RoleManagement() {
  const { availableRoles, currentRole, addRole, switchRole } = useUserRole();

  const hasCustomerRole = availableRoles.includes('customer');
  const hasProviderRole = availableRoles.includes('provider');

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="w-5 h-5" />
          Account Roles
        </CardTitle>
        <CardDescription>
          Manage your account roles and switch between them
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-wrap gap-2">
          {availableRoles.map((role) => (
            <Badge 
              key={role} 
              variant={role === currentRole ? "default" : "secondary"}
              className="text-sm py-1 px-3"
            >
              {role === 'customer' ? '👤 Customer' : '🛠️ Provider'}
              {role === currentRole && ' (Active)'}
            </Badge>
          ))}
        </div>

        <div className="space-y-3">
          {!hasCustomerRole && (
            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                  <Users className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <h4 className="font-semibold">Hire Services</h4>
                  <p className="text-sm text-muted-foreground">Post tasks and hire providers</p>
                </div>
              </div>
              <Button 
                onClick={() => addRole('customer')}
                variant="outline"
                size="sm"
              >
                Become Customer
              </Button>
            </div>
          )}

          {!hasProviderRole && (
            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                  <Briefcase className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <h4 className="font-semibold">Offer Services</h4>
                  <p className="text-sm text-muted-foreground">Browse tasks and make offers</p>
                </div>
              </div>
              <Button 
                onClick={() => addRole('provider')}
                variant="outline"
                size="sm"
              >
                Become Provider
              </Button>
            </div>
          )}
        </div>

        {availableRoles.length > 1 && (
          <div className="pt-4 border-t">
            <h4 className="font-semibold mb-2">Quick Switch</h4>
            <div className="flex gap-2">
              {availableRoles.filter(role => role !== currentRole).map((role) => (
                <Button
                  key={role}
                  onClick={() => switchRole(role)}
                  variant="outline"
                  size="sm"
                >
                  Switch to {role === 'customer' ? 'Customer' : 'Provider'}
                </Button>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
