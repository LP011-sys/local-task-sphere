import React from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { I18nProvider } from "@/contexts/I18nContext";
import { AdminRoleProvider } from "@/contexts/AdminRoleContext";
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
import TaskCreationWizardPage from "@/pages/TaskCreationWizardPage";
import ProviderDashboard from "@/pages/ProviderDashboard";
import CustomerDashboard from "@/pages/CustomerDashboard";
import CustomerOffers from "@/pages/CustomerOffers";
import Chat from "@/pages/Chat";
import MyFavorites from "@/pages/MyFavorites";
import ProfileSettings from "@/pages/ProfileSettings";
import LeaveReview from "@/pages/LeaveReview";
import ReferralPage from "@/pages/ReferralPage";
import RequireAuth from "@/components/auth/RequireAuth";
import RequireRole from "@/components/auth/RequireRole";
import { RequireAdmin } from "@/components/auth/RequireAdmin";
import CompleteProfileCustomer from "@/pages/CompleteProfileCustomer";
import CompleteProfileProvider from "@/pages/CompleteProfileProvider";
import CompleteProfileProviderVerify from "@/pages/CompleteProfileProviderVerify";
import RequireProfileCompletion from "@/components/auth/RequireProfileCompletion";

const queryClient = new QueryClient();

const App = () => (
  <I18nProvider>
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <AdminRoleProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              {/* Authentication and onboarding routes NOT using AppLayout */}
              <Route path="/onboarding" element={<OnboardingPage />} />
              <Route path="/auth" element={<AuthPage />} />
              
              {/* Profile completion routes */}
              <Route path="/complete-profile/customer" element={
                <RequireAuth>
                  <CompleteProfileCustomer />
                </RequireAuth>
              } />
              <Route path="/complete-profile/provider" element={
                <RequireAuth>
                  <CompleteProfileProvider />
                </RequireAuth>
              } />
              <Route path="/complete-profile/provider/verify" element={
                <RequireAuth>
                  <CompleteProfileProviderVerify />
                </RequireAuth>
              } />

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

              {/* All other public/user routes UNDER AppLayout with profile completion guard */}
              <Route element={<AppLayout />}>
                {/* Public routes */}
                <Route index element={<Index />} />
                <Route path="/premium" element={<PremiumPackages />} />
                
                {/* Protected routes that require authentication and profile completion */}
                <Route path="/profile" element={
                  <RequireAuth>
                    <RequireProfileCompletion>
                      <ProfileSettings />
                    </RequireProfileCompletion>
                  </RequireAuth>
                } />
                
                <Route path="/chat" element={
                  <RequireAuth>
                    <RequireProfileCompletion>
                      <Chat />
                    </RequireProfileCompletion>
                  </RequireAuth>
                } />
                
                <Route path="/review" element={
                  <RequireAuth>
                    <RequireProfileCompletion>
                      <LeaveReview />
                    </RequireProfileCompletion>
                  </RequireAuth>
                } />

                <Route path="/referral" element={
                  <RequireAuth>
                    <RequireProfileCompletion>
                      <ReferralPage />
                    </RequireProfileCompletion>
                  </RequireAuth>
                } />

                {/* Customer dashboard and routes */}
                <Route path="/dashboard/customer" element={
                  <RequireAuth>
                    <RequireRole allowedRoles={["customer"]}>
                      <RequireProfileCompletion>
                        <CustomerDashboard />
                      </RequireProfileCompletion>
                    </RequireRole>
                  </RequireAuth>
                } />

                <Route path="/post-task" element={
                  <RequireAuth>
                    <RequireRole allowedRoles={["customer"]}>
                      <RequireProfileCompletion>
                        <TaskCreationWizardPage />
                      </RequireProfileCompletion>
                    </RequireRole>
                  </RequireAuth>
                } />
                
                <Route path="/offers" element={
                  <RequireAuth>
                    <RequireRole allowedRoles={["customer"]}>
                      <RequireProfileCompletion>
                        <CustomerOffers />
                      </RequireProfileCompletion>
                    </RequireRole>
                  </RequireAuth>
                } />
                
                <Route path="/favorites" element={
                  <RequireAuth>
                    <RequireRole allowedRoles={["customer"]}>
                      <RequireProfileCompletion>
                        <MyFavorites />
                      </RequireProfileCompletion>
                    </RequireRole>
                  </RequireAuth>
                } />

                {/* Provider dashboard and routes */}
                <Route path="/dashboard/provider" element={
                  <RequireAuth>
                    <RequireRole allowedRoles={["provider"]}>
                      <RequireProfileCompletion>
                        <ProviderDashboard />
                      </RequireProfileCompletion>
                    </RequireRole>
                  </RequireAuth>
                } />

                <Route path="/dashboard" element={
                  <RequireAuth>
                    <RequireRole allowedRoles={["provider"]}>
                      <RequireProfileCompletion>
                        <ProviderDashboard />
                      </RequireProfileCompletion>
                    </RequireRole>
                  </RequireAuth>
                } />

                {/* 404 catch-all fallback */}
                <Route path="*" element={<NotFound />} />
              </Route>
            </Routes>
          </BrowserRouter>
        </AdminRoleProvider>
      </TooltipProvider>
    </QueryClientProvider>
  </I18nProvider>
);

export default App;
