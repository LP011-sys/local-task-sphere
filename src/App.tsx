import React from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Index from "./pages/Index";
import AuthPage from "./pages/AuthPage";
import ProfilePage from "./pages/ProfilePage";
import RequireAuth from "./components/auth/RequireAuth";
import { QueryClient } from "@tanstack/react-query";
import { UserRoleProvider } from "./contexts/UserRoleContext";
import CustomerDashboard from "./pages/dashboard/CustomerDashboard";
import ProviderDashboard from "./pages/dashboard/ProviderDashboard";
import AdminDashboard from "./pages/dashboard/AdminDashboard";
import PostTask from "./pages/PostTask";
import TaskDetails from "./pages/TaskDetails";
import CompleteProfileCustomer from "./pages/profile/CompleteProfileCustomer";
import CompleteProfileProvider from "./pages/profile/CompleteProfileProvider";
import OffersPage from "./pages/OffersPage";
import FavoritesPage from "./pages/FavoritesPage";
import AuthCallbackPage from "./pages/AuthCallback";

function App() {
  return (
    <QueryClient>
      <UserRoleProvider>
        <Router>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/auth" element={<AuthPage />} />
            <Route path="/profile" element={<RequireAuth><ProfilePage /></RequireAuth>} />
            <Route path="/dashboard/customer" element={<RequireAuth><CustomerDashboard /></RequireAuth>} />
            <Route path="/dashboard/provider" element={<RequireAuth><ProviderDashboard /></RequireAuth>} />
            <Route path="/admin" element={<RequireAuth><AdminDashboard /></RequireAuth>} />
            <Route path="/post-task" element={<RequireAuth><PostTask /></RequireAuth>} />
            <Route path="/task/:taskId" element={<RequireAuth><TaskDetails /></RequireAuth>} />
            <Route path="/complete-profile/customer" element={<RequireAuth><CompleteProfileCustomer /></RequireAuth>} />
            <Route path="/complete-profile/provider" element={<RequireAuth><CompleteProfileProvider /></RequireAuth>} />
            <Route path="/offers" element={<RequireAuth><OffersPage /></RequireAuth>} />
            <Route path="/favorites" element={<RequireAuth><FavoritesPage /></RequireAuth>} />
            
            {/* Add the new auth callback route */}
            <Route path="/auth/callback" element={<AuthCallbackPage />} />
            
          </Routes>
        </Router>
      </UserRoleProvider>
    </QueryClient>
  );
}

export default App;
