
import React from "react";
import { Button } from "@/components/ui/button";

export default function OnboardingProviderSignupStep() {
  return (
    <div className="flex flex-col gap-6 items-center">
      <h2 className="text-xl font-semibold">Sign up as a Provider</h2>
      {/* Replace with your signup logic or provider integration */}
      <Button>Continue with Google</Button>
      <Button>Continue with Email</Button>
      <div className="bg-yellow-50 border border-yellow-200 text-yellow-700 px-4 py-2 rounded-md mt-4 text-sm">
        Please verify your email or phone to continue.
      </div>
    </div>
  );
}
