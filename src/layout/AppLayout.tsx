
import React from "react";
import { Outlet, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ErrorBoundary from "@/components/ErrorBoundary";
import Breadcrumbs from "@/components/Breadcrumbs";
import { useUserRole } from "@/contexts/UserRoleContext";

export default function AppLayout() {
  const { t } = useTranslation();
  const { currentRole } = useUserRole();
  const location = useLocation();

  // Base navigation links
  const baseNavLinks = [
    { path: "/", label: t("home") },
    { path: "/tasks", label: "Browse Tasks" }, // Universal task browsing
  ];

  // Role-specific navigation links
  const roleNavLinks = {
    customer: [
      { path: "/dashboard/customer", label: t("dashboard") },
      { path: "/post-task", label: t("postTask") },
      { path: "/offers", label: t("offers") },
      { path: "/favorites", label: t("favorites") },
    ],
    provider: [
      { path: "/dashboard/provider", label: t("dashboard") },
    ],
    admin: [
      { path: "/admin", label: "Admin Dashboard" },
    ]
  };

  // Common links for all authenticated users
  const commonLinks = [
    { path: "/chat", label: t("chat") },
    { path: "/profile", label: t("profile") },
    { path: "/referral", label: t("referral") },
    { path: "/review", label: t("review") },
  ];

  // Build navigation based on current role
  const navLinks = [
    ...baseNavLinks,
    ...(roleNavLinks[currentRole] || []),
    ...commonLinks
  ];

  // Don't show breadcrumbs on home page or auth pages
  const showBreadcrumbs = location.pathname !== '/' && 
                         !location.pathname.startsWith('/auth') &&
                         !location.pathname.startsWith('/onboarding');

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-primary-50 to-slate-100 flex flex-col">
      <Header navLinks={navLinks} />
      
      <ErrorBoundary>
        <main className="flex-1 w-full" role="main">
          {showBreadcrumbs && (
            <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-4">
              <Breadcrumbs />
            </div>
          )}
          
          <div className="max-w-7xl mx-auto px-4 sm:px-6 py-section">
            <Outlet />
          </div>
        </main>
      </ErrorBoundary>
      
      <Footer />
    </div>
  );
}
