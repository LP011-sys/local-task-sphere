
import React from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Plus, Eye, Heart } from "lucide-react";

export default function CustomerDashboard() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-blue-50 to-slate-100 p-4">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold text-primary">Customer Dashboard</h1>
          <p className="text-muted-foreground">Manage your tasks and find providers</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="p-6 text-center space-y-4">
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
              <Plus className="w-8 h-8 text-primary" />
            </div>
            <h3 className="text-xl font-semibold">Post a Task</h3>
            <p className="text-muted-foreground">Create a new task and get offers from providers</p>
            <Button onClick={() => navigate("/post-task")} className="w-full">
              Post Task
            </Button>
          </Card>

          <Card className="p-6 text-center space-y-4">
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
              <Eye className="w-8 h-8 text-primary" />
            </div>
            <h3 className="text-xl font-semibold">View Offers</h3>
            <p className="text-muted-foreground">Review and accept offers from providers</p>
            <Button onClick={() => navigate("/offers")} variant="outline" className="w-full">
              View Offers
            </Button>
          </Card>

          <Card className="p-6 text-center space-y-4">
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
              <Heart className="w-8 h-8 text-primary" />
            </div>
            <h3 className="text-xl font-semibold">My Favorites</h3>
            <p className="text-muted-foreground">Access your favorite providers</p>
            <Button onClick={() => navigate("/favorites")} variant="outline" className="w-full">
              View Favorites
            </Button>
          </Card>
        </div>
      </div>
    </div>
  );
}
