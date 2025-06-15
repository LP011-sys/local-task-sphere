
import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

// Note: Social logins would require Supabase OAuth config. 
// Here we put placeholder buttons for UI.

export default function OnboardingSignupStep() {
  const [mode, setMode] = useState<"email" | "phone">("email");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  // Display error/feedback as needed

  return (
    <div className="flex flex-col gap-6 items-center w-full">
      <h2 className="text-xl font-semibold">Sign up or log in</h2>
      <div className="flex gap-3">
        <Button variant={mode === "email" ? "default" : "outline"} onClick={() => setMode("email")}>Email</Button>
        <Button variant={mode === "phone" ? "default" : "outline"} onClick={() => setMode("phone")}>Phone</Button>
      </div>
      {mode === "email" ? (
        <Input
          type="email"
          placeholder="Email address"
          value={email}
          onChange={e => setEmail(e.target.value)}
        />
      ) : (
        <Input
          type="tel"
          placeholder="Phone number"
          value={phone}
          onChange={e => setPhone(e.target.value)}
        />
      )}
      <Button className="w-full">Continue</Button>

      <div className="flex flex-col items-center w-full gap-2 mt-4">
        <span className="text-xs text-muted-foreground">Or sign up with:</span>
        <div className="flex gap-2">
          <Button variant="outline" className="w-24" disabled>Google</Button>
          <Button variant="outline" className="w-24" disabled>Facebook</Button>
          <Button variant="outline" className="w-24" disabled>Apple</Button>
        </div>
        <span className="text-xs text-muted-foreground mt-2">[Social login coming soon]</span>
      </div>
    </div>
  );
}
