
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
export default function AdminPushPanel() {
  const [role, setRole] = useState("all");
  const [city, setCity] = useState("");
  const [message, setMessage] = useState("");
  return (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold mb-2">Send Push Notification (Mock)</h3>
      <div className="space-y-2">
        <label className="block font-medium">Target Role:</label>
        <select value={role} onChange={e=>setRole(e.target.value)} className="border px-2 py-1 rounded w-44">
          <option value="all">All</option>
          <option value="customer">Customer</option>
          <option value="provider">Provider</option>
        </select>
      </div>
      <div className="space-y-2">
        <label className="block font-medium">Target City (optional):</label>
        <input className="border px-2 py-1 rounded w-44" value={city} onChange={e=>setCity(e.target.value)} />
      </div>
      <div className="space-y-2">
        <label className="block font-medium">Message:</label>
        <textarea className="border px-2 py-1 rounded w-full min-h-[60px]" value={message} onChange={e=>setMessage(e.target.value)} />
      </div>
      <Button
        className="w-44"
        onClick={()=>alert("Push notification sent! (This is a mock)")}
        disabled={!message}
      >
        Send Notification
      </Button>
      <div className="text-muted-foreground text-xs mt-2">* This is a UI placeholder only, not connected to real push service yet.</div>
    </div>
  );
}
