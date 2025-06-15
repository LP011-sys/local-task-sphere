
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import OnboardingPage from "./pages/OnboardingPage";
import AdminDashboard from "@/pages/AdminDashboard";
// NEW: Import our admin nested pages
import AdminUsersPage from "@/pages/admin/AdminUsersPage";
import AdminTasksPage from "@/pages/admin/AdminTasksPage";
import AdminReportsPage from "@/pages/admin/AdminReportsPage";
import AdminAnalyticsPage from "@/pages/admin/AdminAnalyticsPage";
import AdminPushPage from "@/pages/admin/AdminPushPage";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/onboarding" element={<OnboardingPage />} />
          {/* ADMIN dashboard (protected!) with nested routes */}
          <Route path="/admin" element={<AdminDashboard />}>
            {/* Default to /admin/users */}
            <Route index element={<Navigate to="users" replace />} />
            <Route path="users" element={<AdminUsersPage />} />
            <Route path="tasks" element={<AdminTasksPage />} />
            <Route path="reports" element={<AdminReportsPage />} />
            <Route path="analytics" element={<AdminAnalyticsPage />} />
            <Route path="push" element={<AdminPushPage />} />
          </Route>
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
