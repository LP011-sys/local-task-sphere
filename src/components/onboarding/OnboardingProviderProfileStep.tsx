
import React from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";

export default function OnboardingProviderProfileStep() {
  return (
    <form className="flex flex-col gap-6 items-center w-full max-w-md mx-auto">
      <h2 className="text-xl font-semibold">Profile Details</h2>
      <div className="w-full flex flex-col gap-2">
        <label className="font-medium">Short bio</label>
        <Textarea placeholder="Tell clients about yourself..." />
      </div>
      <div className="w-full flex flex-col gap-2">
        <label className="font-medium">Profile Photo</label>
        <Input type="file" accept="image/*" />
      </div>
      <div className="w-full flex flex-col gap-2">
        <label className="font-medium">Your availability</label>
        <Input type="text" placeholder="e.g. Mon–Fri 9am–5pm" />
      </div>
      <Button type="submit" className="self-end">Save</Button>
    </form>
  );
}
