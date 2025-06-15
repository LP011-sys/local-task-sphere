
import React from "react";

export default function OnboardingCustomerIntroStep() {
  return (
    <div className="flex flex-col gap-6 items-center text-center">
      <h2 className="text-xl font-semibold">How to post a task</h2>
      <div className="flex flex-col items-center gap-2">
        <div className="w-16 h-16 bg-gradient-to-br from-blue-300 to-blue-100 rounded-full flex items-center justify-center text-3xl mb-2">📝</div>
        <p className="text-base">Fill out the details of your task and submit it.</p>
        <div className="w-16 h-1 bg-blue-200 rounded my-1" />
        <p className="text-base">Providers will offer you their services—pick the best one!</p>
        <div className="w-16 h-1 bg-blue-200 rounded my-1" />
        <p className="text-base">Chat, finalize and get your task done safely.</p>
      </div>
    </div>
  );
}
