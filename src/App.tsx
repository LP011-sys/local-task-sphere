
import React from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import Index from "./pages/Index";
import AuthPage from "./pages/AuthPage";
import ProfileSettings from "./pages/ProfileSettings";
import RequireAuth from "./components/auth/RequireAuth";
import { UserRoleProvider } from "./contexts/UserRoleContext";
import CustomerDashboard from "./pages/CustomerDashboard";
import ProviderDashboard from "./pages/ProviderDashboard";
import AdminDashboard from "./pages/AdminDashboard";
import CompleteProfileCustomer from "./pages/CompleteProfileCustomer";
import CompleteProfileProvider from "./pages/CompleteProfileProvider";
import CompleteProfileProviderVerify from "./pages/CompleteProfileProviderVerify";
import AuthCallbackPage from "./pages/AuthCallback";
import { Toaster } from "@/components/ui/sonner";

// Create a client
const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <UserRoleProvider>
        <Router>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/auth" element={<AuthPage />} />
            <Route path="/profile" element={<RequireAuth><ProfileSettings /></RequireAuth>} />
            <Route path="/dashboard/customer" element={<RequireAuth><CustomerDashboard /></RequireAuth>} />
            <Route path="/dashboard/provider" element={<RequireAuth><ProviderDashboard /></RequireAuth>} />
            <Route path="/admin" element={<RequireAuth><AdminDashboard /></RequireAuth>} />
            <Route path="/complete-profile/customer" element={<RequireAuth><CompleteProfileCustomer /></RequireAuth>} />
            <Route path="/complete-profile/provider" element={<RequireAuth><CompleteProfileProvider /></RequireAuth>} />
            <Route path="/complete-profile/provider/verify" element={<RequireAuth><CompleteProfileProviderVerify /></RequireAuth>} />
            
            {/* Add the auth callback route */}
            <Route path="/auth/callback" element={<AuthCallbackPage />} />
            
          </Routes>
          <Toaster />
        </Router>
      </UserRoleProvider>
    </QueryClientProvider>
  );
}

export default App;
