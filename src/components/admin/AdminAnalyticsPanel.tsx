
import React from "react";
export default function AdminAnalyticsPanel() {
  // Completely mocked for now
  return (
    <div>
      <h3 className="text-lg font-semibold mb-2">Analytics Overview</h3>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-slate-100 p-4 rounded-lg text-center">
          <div className="text-2xl font-bold">57</div>
          <div className="text-muted-foreground">New Users (week)</div>
        </div>
        <div className="bg-slate-100 p-4 rounded-lg text-center">
          <div className="text-2xl font-bold">188</div>
          <div className="text-muted-foreground">Tasks Posted (month)</div>
        </div>
        <div className="bg-slate-100 p-4 rounded-lg text-center">
          <div className="text-2xl font-bold">33</div>
          <div className="text-muted-foreground">Active Users</div>
        </div>
        <div className="bg-slate-100 p-4 rounded-lg text-center">
          <div className="text-2xl font-bold">$1,920</div>
          <div className="text-muted-foreground">Revenue (mocked)</div>
        </div>
      </div>
      <div className="bg-blue-50 border border-blue-100 rounded-lg mt-2 p-4">
        <strong>Boost purchases and additional analytics coming soon.</strong>
      </div>
    </div>
  );
}
