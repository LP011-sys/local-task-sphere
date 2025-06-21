
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useI18n } from "@/contexts/I18nContext";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useAuthRedirect } from "@/hooks/useAuthRedirect";

// Helper to update profile role
async function updateUserRole(role: "customer" | "provider") {
  const {
    data: { user },
    error: userError
  } = await supabase.auth.getUser();
  if (userError || !user) throw new Error("Not authenticated");

  const { error } = await supabase
    .from("app_users")
    .update({ role })
    .eq("id", user.id);
  if (error) throw error;
}

export default function OnboardingPage() {
  const [saving, setSaving] = useState(false);
  const navigate = useNavigate();
  const { t } = useI18n();
  const [error, setError] = useState<string | null>(null);
  const { redirectAfterAuth } = useAuthRedirect();

  async function handleRoleSelect(role: "customer" | "provider") {
    setSaving(true);
    setError(null);
    try {
      await updateUserRole(role);
      await redirectAfterAuth();
    } catch (e: any) {
      setError(e.message || "Could not update your role.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-white via-blue-50 to-slate-100">
      <Card className="w-full max-w-lg mx-auto p-8 flex flex-col gap-8 animate-fade-in">
        {/* Clickable logo to home */}
        <a
          href="/"
          className="self-center font-bold text-2xl tracking-tight text-primary hover:underline focus:outline-none mb-2"
          aria-label="Task Hub Home"
          tabIndex={0}
        >
          Task Hub
        </a>
        <h1 className="text-2xl sm:text-3xl font-bold text-center mb-3 text-primary">
          What would you like to do on Task Hub?
        </h1>
        <div className="flex flex-col sm:flex-row gap-6 w-full justify-center">
          <Button
            size="lg"
            disabled={saving}
            className="flex-1 h-24 text-xl rounded-xl shadow-md border-2 border-primary bg-white hover:bg-blue-50 hover:border-blue-400 transition-all duration-150 font-semibold text-primary"
            onClick={() => handleRoleSelect("customer")}
          >
            <span className="block">I want to post tasks</span>
          </Button>
          <Button
            size="lg"
            disabled={saving}
            className="flex-1 h-24 text-xl rounded-xl shadow-md border-2 border-primary bg-white hover:bg-blue-50 hover:border-blue-400 transition-all duration-150 font-semibold text-primary"
            onClick={() => handleRoleSelect("provider")}
          >
            <span className="block">I want to offer services</span>
          </Button>
        </div>
        {error && (
          <div className="text-red-600 text-center font-medium">{error}</div>
        )}
      </Card>
    </div>
  );
}
