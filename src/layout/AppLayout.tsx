
import React from "react";
import { Outlet } from "react-router-dom";
import { useTranslation } from "react-i18next";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ErrorBoundary from "@/components/ErrorBoundary";
import { useAdminRole } from "@/contexts/AdminRoleContext";

export default function AppLayout() {
  const { t } = useTranslation();
  const { currentRole } = useAdminRole();

  // Base navigation links
  const baseNavLinks = [
    { path: "/", label: t("home") },
  ];

  // Role-specific navigation links
  const roleNavLinks = {
    customer: [
      { path: "/post-task", label: t("postTask") },
      { path: "/offers", label: t("offers") },
      { path: "/favorites", label: t("favorites") },
    ],
    provider: [
      { path: "/dashboard", label: t("dashboard") },
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-primary-50 to-slate-100">
      <Header navLinks={navLinks} />
      
      <ErrorBoundary>
        <main className="max-w-7xl mx-auto px-4 sm:px-6 py-section w-full" role="main">
          <Outlet />
        </main>
      </ErrorBoundary>
      
      <Footer />
    </div>
  );
}
