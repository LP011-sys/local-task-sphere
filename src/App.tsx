import React from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { I18nProvider } from "@/contexts/I18nContext";
// Import i18n configuration
import "./i18n";
import Index from "./pages/Index";
import NotFound from "@/pages/NotFound";
import OnboardingPage from "@/pages/OnboardingPage";
import AdminDashboard from "@/pages/AdminDashboard";
import AdminUsersPage from "@/pages/admin/AdminUsersPage";
import AdminTasksPage from "@/pages/admin/AdminTasksPage";
import AdminReportsPage from "@/pages/admin/AdminReportsPage";
import AdminAnalyticsPage from "@/pages/admin/AdminAnalyticsPage";
import AdminPushPage from "@/pages/admin/AdminPushPage";
import PremiumPackages from "./pages/PremiumPackages";
import AuthPage from "@/pages/AuthPage";
import AppLayout from "@/layout/AppLayout";
import TaskCreationWizard from "@/pages/TaskCreationWizard";
import ProviderDashboard from "@/pages/ProviderDashboard";
import CustomerOffers from "@/pages/CustomerOffers";
import Chat from "@/pages/Chat";
import MyFavorites from "@/pages/MyFavorites";
import ProfileSettings from "@/pages/ProfileSettings";
import LeaveReview from "@/pages/LeaveReview";
import RequireAuth from "@/components/auth/RequireAuth";
import RequireRole from "@/components/auth/RequireRole";
import { RequireAdmin } from "@/components/auth/RequireAdmin";

const queryClient = new QueryClient();

const App = () => (
  <I18nProvider>
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            {/* Authentication and onboarding routes NOT using AppLayout */}
            <Route path="/onboarding" element={<OnboardingPage />} />
            <Route path="/auth" element={<AuthPage />} />

            {/* Admin dashboard route - Admin only */}
            <Route path="/admin" element={
              <RequireAuth>
                <RequireRole allowedRoles={["admin"]}>
                  <AdminDashboard />
                </RequireRole>
              </RequireAuth>
            } />

            {/* Admin nested routes - Admin only */}
            <Route path="/admin/*" element={
              <RequireAuth>
                <RequireRole allowedRoles={["admin"]}>
                  <Routes>
                    <Route index element={<Navigate to="/admin" replace />} />
                    <Route path="users" element={<AdminUsersPage />} />
                    <Route path="tasks" element={<AdminTasksPage />} />
                    <Route path="reports" element={<AdminReportsPage />} />
                    <Route path="analytics" element={<AdminAnalyticsPage />} />
                    <Route path="push" element={<AdminPushPage />} />
                  </Routes>
                </RequireRole>
              </RequireAuth>
            } />

            {/* All other public/user routes UNDER AppLayout */}
            <Route element={<AppLayout />}>
              {/* Public routes */}
              <Route index element={<Index />} />
              <Route path="/premium" element={<PremiumPackages />} />
              
              {/* Protected routes that require authentication */}
              <Route path="/profile" element={
                <RequireAuth>
                  <ProfileSettings />
                </RequireAuth>
              } />
              
              <Route path="/inbox" element={
                <RequireAuth>
                  <Chat />
                </RequireAuth>
              } />
              
              <Route path="/review" element={
                <RequireAuth>
                  <LeaveReview />
                </RequireAuth>
              } />

              {/* Customer-only routes */}
              <Route path="/post-task" element={
                <RequireAuth>
                  <RequireRole allowedRoles={["customer"]}>
                    <TaskCreationWizard />
                  </RequireRole>
                </RequireAuth>
              } />
              
              <Route path="/offers" element={
                <RequireAuth>
                  <RequireRole allowedRoles={["customer"]}>
                    <CustomerOffers />
                  </RequireRole>
                </RequireAuth>
              } />
              
              <Route path="/favorites" element={
                <RequireAuth>
                  <RequireRole allowedRoles={["customer"]}>
                    <MyFavorites />
                  </RequireRole>
                </RequireAuth>
              } />

              {/* Provider-only routes */}
              <Route path="/dashboard" element={
                <RequireAuth>
                  <RequireRole allowedRoles={["provider"]}>
                    <ProviderDashboard />
                  </RequireRole>
                </RequireAuth>
              } />

              <Route path="*" element={<NotFound />} />
            </Route>
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  </I18nProvider>
);

export default App;
