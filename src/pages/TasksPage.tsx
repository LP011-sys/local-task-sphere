
import React from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useUserRole } from "@/contexts/UserRoleContext";
import { useNavigate } from "react-router-dom";
import { MapPin, Clock, Euro } from "lucide-react";
import QueryWrapper from "@/components/QueryWrapper";
import TableSkeleton from "@/components/TableSkeleton";

export default function TasksPage() {
  const { currentRole } = useUserRole();
  const navigate = useNavigate();

  const { data: tasks, isLoading, error, refetch } = useQuery({
    queryKey: ["public-tasks"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("Tasks")
        .select(`
          *,
          app_users!Tasks_user_id_fkey(
            full_name,
            profile_photo
          )
        `)
        .eq("status", "open")
        .order("created_at", { ascending: false });
      
      if (error) throw error;
      return data || [];
    },
  });

  const handleMakeOffer = (taskId: string) => {
    // Navigate to offer creation page or open modal
    navigate(`/tasks/${taskId}/offer`);
  };

  const loadingSkeleton = (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {[...Array(6)].map((_, i) => (
        <Card key={i} className="animate-pulse">
          <CardHeader>
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            <div className="h-3 bg-gray-200 rounded w-1/2"></div>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="h-3 bg-gray-200 rounded"></div>
              <div className="h-3 bg-gray-200 rounded w-2/3"></div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );

  const emptyState = (
    <div className="text-center py-12">
      <div className="text-6xl mb-4">📋</div>
      <h3 className="text-lg font-semibold mb-2">No tasks available</h3>
      <p className="text-muted-foreground mb-4">
        Check back later for new opportunities
      </p>
      {currentRole === 'customer' && (
        <Button onClick={() => navigate("/post-task")}>
          Post Your First Task
        </Button>
      )}
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-primary">Browse Tasks</h1>
          <p className="text-muted-foreground mt-1">
            {currentRole === 'provider' 
              ? "Find tasks that match your skills and expertise" 
              : "Explore what services are in demand"
            }
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          <Badge variant="secondary" className="text-sm">
            Viewing as: {currentRole === 'provider' ? 'Provider' : 'Customer'}
          </Badge>
        </div>
      </div>

      <QueryWrapper
        isLoading={isLoading}
        error={error}
        data={tasks}
        loadingSkeleton={loadingSkeleton}
        retryFn={refetch}
        emptyState={emptyState}
      >
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {(tasks || []).map((task: any) => (
            <Card key={task.id} className="hover:shadow-lg transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-lg line-clamp-2">
                      {task.offer || task.description}
                    </CardTitle>
                    <CardDescription className="flex items-center gap-1 mt-1">
                      <span className="text-sm">by {task.app_users?.full_name || 'Anonymous'}</span>
                    </CardDescription>
                  </div>
                  <Badge 
                    variant="outline" 
                    className="text-xs shrink-0 ml-2"
                  >
                    {task.category}
                  </Badge>
                </div>
              </CardHeader>
              
              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground line-clamp-3">
                  {task.description}
                </p>
                
                <div className="flex items-center justify-between text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Euro className="w-4 h-4" />
                    <span className="font-semibold text-green-600">€{task.price}</span>
                  </div>
                  
                  {task.deadline && (
                    <div className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      <span>{new Date(task.deadline).toLocaleDateString()}</span>
                    </div>
                  )}
                </div>

                {task.location && (
                  <div className="flex items-center gap-1 text-sm text-muted-foreground">
                    <MapPin className="w-4 h-4" />
                    <span>{task.location}</span>
                  </div>
                )}

                <div className="pt-2">
                  {currentRole === 'provider' ? (
                    <Button 
                      onClick={() => handleMakeOffer(task.id)}
                      className="w-full"
                    >
                      Make Offer
                    </Button>
                  ) : (
                    <Button 
                      variant="outline" 
                      className="w-full"
                      disabled
                    >
                      Switch to Provider to Make Offers
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </QueryWrapper>
    </div>
  );
}
