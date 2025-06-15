import React from "react";
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
import PremiumPackages from "./pages/PremiumPackages";
import AuthPage from "@/pages/AuthPage";
import AppLayout from "@/layout/AppLayout";
import RequireAuth from "@/components/RequireAuth";

// Add page imports (below previous ones)
import TaskCreationWizard from "@/pages/TaskCreationWizard";
import ProviderDashboard from "@/pages/ProviderDashboard";
import CustomerOffers from "@/pages/CustomerOffers";
import Chat from "@/pages/Chat";
import MyFavorites from "@/pages/MyFavorites";
import ProfileSettings from "@/pages/ProfileSettings";
import LeaveReview from "@/pages/LeaveReview";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          {/* Authentication and onboarding routes NOT using AppLayout */}
          <Route path="/onboarding" element={<OnboardingPage />} />
          <Route path="/auth" element={<AuthPage />} />

          {/* Admin dashboard and nested routes (untouched) */}
          <Route path="/admin" element={<AdminDashboard />}>
            <Route index element={<Navigate to="users" replace />} />
            <Route path="users" element={<AdminUsersPage />} />
            <Route path="tasks" element={<AdminTasksPage />} />
            <Route path="reports" element={<AdminReportsPage />} />
            <Route path="analytics" element={<AdminAnalyticsPage />} />
            <Route path="push" element={<AdminPushPage />} />
          </Route>

          {/* All other public/user routes UNDER AppLayout */}
          <Route element={<AppLayout>
            <RequireAuth>
              <React.Fragment />
            </RequireAuth>
          </AppLayout>}>
            {/* Wrapped with RequireAuth and AppLayout */}
            <Route index element={<Index />} />
            <Route path="/dashboard" element={<ProviderDashboard />} />
            <Route path="/post-task" element={<TaskCreationWizard />} />
            <Route path="/offers" element={<CustomerOffers />} />
            <Route path="/inbox" element={<Chat />} />
            <Route path="/favorites" element={<MyFavorites />} />
            <Route path="/profile" element={<ProfileSettings />} />
            <Route path="/review" element={<LeaveReview />} />
            <Route path="/premium" element={<PremiumPackages />} />
            {/* fallback */}
            <Route path="*" element={<NotFound />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
