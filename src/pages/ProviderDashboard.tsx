
import React from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Search, CheckCircle, MessageCircle } from "lucide-react";

export default function ProviderDashboard() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-blue-50 to-slate-100 p-4">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold text-primary">Provider Dashboard</h1>
          <p className="text-muted-foreground">Find tasks and grow your business</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="p-6 text-center space-y-4">
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
              <Search className="w-8 h-8 text-primary" />
            </div>
            <h3 className="text-xl font-semibold">Browse Tasks</h3>
            <p className="text-muted-foreground">Find tasks that match your skills</p>
            <Button onClick={() => navigate("/dashboard")} className="w-full">
              Browse Tasks
            </Button>
          </Card>

          <Card className="p-6 text-center space-y-4">
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
              <CheckCircle className="w-8 h-8 text-primary" />
            </div>
            <h3 className="text-xl font-semibold">My Tasks</h3>
            <p className="text-muted-foreground">Manage your accepted tasks</p>
            <Button onClick={() => navigate("/dashboard")} variant="outline" className="w-full">
              View My Tasks
            </Button>
          </Card>

          <Card className="p-6 text-center space-y-4">
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
              <MessageCircle className="w-8 h-8 text-primary" />
            </div>
            <h3 className="text-xl font-semibold">Messages</h3>
            <p className="text-muted-foreground">Communicate with customers</p>
            <Button onClick={() => navigate("/chat")} variant="outline" className="w-full">
              View Messages
            </Button>
          </Card>
        </div>
      </div>
    </div>
  );
}
