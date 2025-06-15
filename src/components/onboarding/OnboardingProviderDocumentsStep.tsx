
import React from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function OnboardingProviderDocumentsStep() {
  return (
    <form className="flex flex-col gap-8 items-center w-full max-w-md mx-auto">
      <h2 className="text-xl font-semibold">Upload Documents</h2>
      <div className="w-full flex flex-col gap-2">
        <label className="font-medium">ID Verification</label>
        <Input type="file" />
      </div>
      <div className="w-full flex flex-col gap-2">
        <label className="font-medium">Certifications (optional)</label>
        <Input type="file" multiple />
      </div>
      <Button type="submit" className="self-end">Upload</Button>
    </form>
  );
}
