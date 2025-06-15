
import React, { useRef } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import LanguagePicker from "../LanguagePicker";

// NOTE: Real map embed and file upload should be added later

export default function OnboardingCustomerProfileStep() {
  // Handle form state for profile fields here or via parent later
  const fileRef = useRef<HTMLInputElement>(null);
  
  return (
    <form className="flex flex-col gap-6 items-center w-full">
      <div className="flex flex-col gap-2 w-full">
        <label className="font-medium">Profile Photo</label>
        <input
          type="file"
          accept="image/*"
          ref={fileRef}
          className="block w-full border border-input rounded px-3 py-2"
        />
      </div>
      <div className="flex flex-col gap-2 w-full">
        <label className="font-medium">Name or Alias</label>
        <Input type="text" placeholder="Your name or alias" />
      </div>
      <div className="flex flex-col gap-2 w-full">
        <label className="font-medium">Preferred language</label>
        <LanguagePicker />
      </div>
      <div className="flex flex-col gap-2 w-full">
        <label className="font-medium">Location (Google Maps)</label>
        <Input type="text" placeholder="City or address" />
        <div className="h-32 bg-blue-50 w-full rounded-xl flex items-center justify-center text-blue-300 border border-blue-100 text-lg">
          [Google Maps placeholder]
        </div>
      </div>
    </form>
  )
}
