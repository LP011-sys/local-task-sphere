
import React from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Eye, Heart, Clock, CheckCircle } from "lucide-react";
import AdminRoleSwitcher from "@/components/AdminRoleSwitcher";
import LoadingSpinner from "@/components/LoadingSpinner";

export default function CustomerDashboard() {
  const navigate = useNavigate();

  return (
    <div className="space-y-8">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-primary">Welcome Back!</h1>
          <p className="text-muted-foreground mt-1">Manage your tasks and find the perfect providers</p>
        </div>
        
        <div className="flex items-center gap-4">
          <AdminRoleSwitcher />
          
          {/* Prominent Post Task Button */}
          <Button 
            onClick={() => navigate("/post-task")} 
            size="lg"
            className="bg-primary hover:bg-primary/90 text-white font-semibold px-6 py-3 shadow-lg hover:shadow-xl transition-all"
          >
            <Plus className="w-5 h-5 mr-2" />
            Post New Task
          </Button>
        </div>
      </div>

      {/* Quick Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-blue-600">Active Tasks</p>
                <p className="text-2xl font-bold text-blue-900">3</p>
              </div>
              <Clock className="w-8 h-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-green-600">Completed</p>
                <p className="text-2xl font-bold text-green-900">12</p>
              </div>
              <CheckCircle className="w-8 h-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-orange-600">New Offers</p>
                <p className="text-2xl font-bold text-orange-900">5</p>
              </div>
              <Eye className="w-8 h-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-purple-600">Favorites</p>
                <p className="text-2xl font-bold text-purple-900">8</p>
              </div>
              <Heart className="w-8 h-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Action Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => navigate("/post-task")}>
          <CardHeader className="text-center pb-4">
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <Plus className="w-8 h-8 text-primary" />
            </div>
            <CardTitle className="text-xl">Post a Task</CardTitle>
            <CardDescription>Create a new task and get offers from qualified providers</CardDescription>
          </CardHeader>
          <CardContent className="pt-0">
            <Button onClick={() => navigate("/post-task")} className="w-full">
              Get Started
            </Button>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => navigate("/offers")}>
          <CardHeader className="text-center pb-4">
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <Eye className="w-8 h-8 text-primary" />
            </div>
            <CardTitle className="text-xl">Review Offers</CardTitle>
            <CardDescription>Browse and accept offers from providers for your tasks</CardDescription>
          </CardHeader>
          <CardContent className="pt-0">
            <Button onClick={() => navigate("/offers")} variant="outline" className="w-full">
              View Offers
            </Button>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => navigate("/favorites")}>
          <CardHeader className="text-center pb-4">
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <Heart className="w-8 h-8 text-primary" />
            </div>
            <CardTitle className="text-xl">My Favorites</CardTitle>
            <CardDescription>Access your favorite providers and past collaborations</CardDescription>
          </CardHeader>
          <CardContent className="pt-0">
            <Button onClick={() => navigate("/favorites")} variant="outline" className="w-full">
              View Favorites
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
