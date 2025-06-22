
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  LineChart, 
  Line, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  ResponsiveContainer
} from "recharts";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { 
  Users, 
  FileText, 
  CheckCircle, 
  Star, 
  CreditCard, 
  DollarSign,
  RefreshCw
} from "lucide-react";
import { 
  useAnalyticsSnapshots, 
  useCurrentAnalytics, 
  useTriggerWeeklyAnalytics 
} from "@/hooks/useAnalytics";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";

const chartConfig = {
  mau: {
    label: "Monthly Active Users",
    color: "hsl(var(--chart-1))",
  },
  tasks_posted: {
    label: "Tasks Posted",
    color: "hsl(var(--chart-2))",
  },
  tasks_completed: {
    label: "Tasks Completed", 
    color: "hsl(var(--chart-3))",
  },
  boost_purchases: {
    label: "Boost Purchases",
    color: "hsl(var(--chart-4))",
  },
  total_revenue: {
    label: "Revenue ($)",
    color: "hsl(var(--chart-5))",
  },
};

export default function AdminAnalyticsDashboard() {
  const { toast } = useToast();
  const { data: snapshots, isLoading: snapshotsLoading } = useAnalyticsSnapshots();
  const { data: currentData, isLoading: currentLoading } = useCurrentAnalytics();
  const triggerAnalytics = useTriggerWeeklyAnalytics();

  const handleRefreshAnalytics = async () => {
    try {
      await triggerAnalytics.mutateAsync();
      toast({
        title: "Success",
        description: "Analytics data refreshed successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to refresh analytics data",
        variant: "destructive",
      });
    }
  };

  const kpiCards = [
    {
      title: "Monthly Active Users",
      value: currentData?.mau || 0,
      icon: <Users className="h-4 w-4" />,
      color: "text-blue-600",
    },
    {
      title: "Tasks Posted",
      value: currentData?.tasks_posted || 0,
      icon: <FileText className="h-4 w-4" />,
      color: "text-green-600",
    },
    {
      title: "Tasks Completed",
      value: currentData?.tasks_completed || 0,
      icon: <CheckCircle className="h-4 w-4" />,
      color: "text-purple-600",
    },
    {
      title: "Boost Purchases",
      value: currentData?.boost_purchases || 0,
      icon: <Star className="h-4 w-4" />,
      color: "text-yellow-600",
    },
    {
      title: "Active Subscriptions",
      value: currentData?.subscription_count || 0,
      icon: <CreditCard className="h-4 w-4" />,
      color: "text-indigo-600",
    },
    {
      title: "Weekly Revenue",
      value: `$${Number(currentData?.total_revenue || 0).toFixed(2)}`,
      icon: <DollarSign className="h-4 w-4" />,
      color: "text-emerald-600",
    },
  ];

  const chartData = snapshots?.map(snapshot => ({
    week: format(new Date(snapshot.week_start), 'MMM dd'),
    mau: snapshot.mau,
    tasks_posted: snapshot.tasks_posted,
    tasks_completed: snapshot.tasks_completed,
    boost_purchases: snapshot.boost_purchases,
    total_revenue: Number(snapshot.total_revenue),
  })).reverse() || [];

  if (currentLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <Skeleton className="h-4 w-24 mb-2" />
                <Skeleton className="h-8 w-16" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold">Analytics Dashboard</h2>
          <p className="text-muted-foreground">Weekly KPI metrics and trends</p>
        </div>
        <Button 
          onClick={handleRefreshAnalytics}
          disabled={triggerAnalytics.isPending}
        >
          <RefreshCw className={`h-4 w-4 mr-2 ${triggerAnalytics.isPending ? 'animate-spin' : ''}`} />
          Refresh Data
        </Button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {kpiCards.map((kpi, index) => (
          <Card key={index}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    {kpi.title}
                  </p>
                  <p className="text-2xl font-bold">{kpi.value}</p>
                </div>
                <div className={`${kpi.color}`}>
                  {kpi.icon}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* User Activity Chart */}
        <Card>
          <CardHeader>
            <CardTitle>User Activity Trends</CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig} className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="week" />
                  <YAxis />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Line 
                    type="monotone" 
                    dataKey="mau" 
                    stroke={chartConfig.mau.color}
                    strokeWidth={2}
                    name="MAU"
                  />
                </LineChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>

        {/* Task Activity Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Task Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig} className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="week" />
                  <YAxis />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Bar 
                    dataKey="tasks_posted" 
                    fill={chartConfig.tasks_posted.color}
                    name="Posted"
                  />
                  <Bar 
                    dataKey="tasks_completed" 
                    fill={chartConfig.tasks_completed.color}
                    name="Completed"
                  />
                </BarChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>

        {/* Revenue Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Revenue & Boosts</CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig} className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="week" />
                  <YAxis />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Line 
                    type="monotone" 
                    dataKey="total_revenue" 
                    stroke={chartConfig.total_revenue.color}
                    strokeWidth={2}
                    name="Revenue ($)"
                  />
                  <Line 
                    type="monotone" 
                    dataKey="boost_purchases" 
                    stroke={chartConfig.boost_purchases.color}
                    strokeWidth={2}
                    name="Boosts"
                  />
                </LineChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>

        {/* Summary Stats */}
        <Card>
          <CardHeader>
            <CardTitle>Weekly Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Completion Rate</span>
                <span className="font-medium">
                  {currentData?.tasks_posted > 0 
                    ? `${Math.round((currentData.tasks_completed / currentData.tasks_posted) * 100)}%`
                    : '0%'
                  }
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Revenue per User</span>
                <span className="font-medium">
                  ${currentData?.mau > 0 
                    ? (Number(currentData.total_revenue) / currentData.mau).toFixed(2)
                    : '0.00'
                  }
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Avg Boost per Week</span>
                <span className="font-medium">
                  {snapshots?.length > 0 
                    ? Math.round(snapshots.reduce((acc, s) => acc + s.boost_purchases, 0) / snapshots.length)
                    : 0
                  }
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Data freshness indicator */}
      <div className="text-center text-sm text-muted-foreground">
        Last updated: {new Date().toLocaleString()}
        <br />
        Analytics refresh every Monday at 00:00 UTC
      </div>
    </div>
  );
}
