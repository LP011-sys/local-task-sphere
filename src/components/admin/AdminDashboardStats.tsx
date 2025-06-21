
import React from "react";
import { Card } from "@/components/ui/card";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { LineChart, Line, XAxis, YAxis, BarChart, Bar, PieChart, Pie, Cell, ResponsiveContainer } from "recharts";
import { useAdminStats } from "@/hooks/useAdminStats";
import { Users, Package, DollarSign, CheckCircle, TrendingUp, UserCheck, Repeat } from "lucide-react";

const StatCard = ({ 
  title, 
  value, 
  icon: Icon, 
  subtitle 
}: { 
  title: string; 
  value: string | number; 
  icon: React.ComponentType<any>; 
  subtitle?: string;
}) => (
  <Card className="p-4">
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm font-medium text-muted-foreground">{title}</p>
        <p className="text-2xl font-bold">{value}</p>
        {subtitle && <p className="text-xs text-muted-foreground mt-1">{subtitle}</p>}
      </div>
      <Icon className="h-8 w-8 text-primary" />
    </div>
  </Card>
);

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

export default function AdminDashboardStats() {
  const { data: stats, isLoading, error } = useAdminStats();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center p-8">
        <p className="text-red-500">Error loading dashboard statistics</p>
      </div>
    );
  }

  if (!stats) return null;

  const chartConfig = {
    tasks: {
      label: "Tasks",
      color: "#8884d8",
    },
    revenue: {
      label: "Revenue",
      color: "#82ca9d",
    },
  };

  return (
    <div className="space-y-6">
      {/* Key Metrics */}
      <div>
        <h2 className="text-xl font-semibold mb-4">Platform Overview</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title="Total Users"
            value={stats.totalUsers}
            icon={Users}
            subtitle={`${stats.newUsersLast7Days} new this week`}
          />
          <StatCard
            title="Total Tasks"
            value={stats.totalTasks}
            icon={Package}
            subtitle={`${stats.tasksLast7Days} posted this week`}
          />
          <StatCard
            title="Total Revenue"
            value={`$${stats.totalRevenue.toLocaleString()}`}
            icon={DollarSign}
            subtitle={`Avg: $${stats.averageTaskValue.toFixed(2)} per task`}
          />
          <StatCard
            title="Completed Tasks"
            value={stats.tasksCompleted}
            icon={CheckCircle}
            subtitle={`${stats.totalOffers} total offers made`}
          />
        </div>
      </div>

      {/* Time-Based Metrics */}
      <div>
        <h2 className="text-xl font-semibold mb-4">Recent Activity</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <StatCard
            title="New Users (30 days)"
            value={stats.newUsersLast30Days}
            icon={TrendingUp}
            subtitle={`${stats.newUsersLast7Days} in last 7 days`}
          />
          <StatCard
            title="Tasks Posted (30 days)"
            value={stats.tasksLast30Days}
            icon={Package}
            subtitle={`${stats.tasksLast7Days} in last 7 days`}
          />
          <StatCard
            title="Offers Made (30 days)"
            value={stats.offersLast30Days}
            icon={TrendingUp}
            subtitle={`${stats.offersLast7Days} in last 7 days`}
          />
        </div>
      </div>

      {/* Role Breakdown */}
      <div>
        <h2 className="text-xl font-semibold mb-4">User Breakdown</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title="Providers"
            value={stats.providersCount}
            icon={UserCheck}
            subtitle={`${stats.activeProvidersThisWeek} active this week`}
          />
          <StatCard
            title="Customers"
            value={stats.customersCount}
            icon={Users}
          />
          <StatCard
            title="Active Providers"
            value={stats.activeProvidersThisWeek}
            icon={TrendingUp}
            subtitle="This week"
          />
          <StatCard
            title="Repeat Customers"
            value={stats.repeatCustomers}
            icon={Repeat}
          />
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Tasks by Day Chart */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Tasks Posted (Last 14 Days)</h3>
          <ChartContainer config={chartConfig} className="h-[300px]">
            <LineChart data={stats.tasksByDay}>
              <XAxis 
                dataKey="date" 
                tickFormatter={(value) => new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
              />
              <YAxis />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Line 
                type="monotone" 
                dataKey="count" 
                stroke="var(--color-tasks)" 
                strokeWidth={2}
                dot={{ r: 4 }}
              />
            </LineChart>
          </ChartContainer>
        </Card>

        {/* Revenue by Week Chart */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Revenue by Week</h3>
          <ChartContainer config={chartConfig} className="h-[300px]">
            <BarChart data={stats.revenueByWeek}>
              <XAxis dataKey="week" />
              <YAxis />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Bar dataKey="revenue" fill="var(--color-revenue)" />
            </BarChart>
          </ChartContainer>
        </Card>
      </div>

      {/* Task Categories Pie Chart */}
      {stats.tasksByCategory.length > 0 && (
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Tasks by Category</h3>
          <div className="h-[400px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={stats.tasksByCategory}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ category, percent }) => `${category} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={120}
                  fill="#8884d8"
                  dataKey="count"
                >
                  {stats.tasksByCategory.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <ChartTooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </Card>
      )}
    </div>
  );
}
