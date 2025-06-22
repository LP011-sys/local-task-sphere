import React, { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Loader2, LogIn } from "lucide-react";
import { I18nProvider } from "@/contexts/I18nContext";
import CustomerTasksTable from "./components/CustomerTasksTable";
import CustomerOffersTable from "./components/CustomerOffersTable";
import CustomerFavoritesTable from "./components/CustomerFavoritesTable";
import IndexHero from "./IndexHero";
import ErrorBoundary from "@/components/ErrorBoundary";
import { useTasks } from "@/hooks/useTasks";
import { useOffers } from "@/hooks/useOffers";
import { useFavorites } from "@/hooks/useFavorites";

function useAuthState() {
  const [authed, setAuthed] = useState(false);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const sub = supabase.auth.onAuthStateChange((_event, session) => {
      setAuthed(!!session?.user);
      setUser(session?.user ?? null);
    });
    supabase.auth.getUser().then(({ data }) => {
      setAuthed(!!data?.user);
      setUser(data?.user ?? null);
    });
    return () => {
      sub.data.subscription?.unsubscribe?.();
    };
  }, []);

  return { authed, user };
}

export default function Index() {
  const { authed } = useAuthState();

  return (
    <I18nProvider>
      <div className="min-h-screen bg-gradient-to-br from-white via-primary-50 to-slate-100 flex flex-col">
        {/* Hero section always visible */}
        <IndexHero authed={authed} />
        
        {/* Main content */}
        <main className="flex-grow w-full max-w-7xl mx-auto px-4 py-section space-y-section-lg" role="main">
          {/* Task Table */}
          <ErrorBoundary>
            <section id="tasks" className="space-y-2" aria-labelledby="tasks-heading">
              <h2 id="tasks-heading" className="text-heading-2 font-bold mb-2 text-primary-700">Latest Tasks</h2>
              <CustomerTasksTable />
              <div className="text-right text-body-sm mt-1">
                <a 
                  href="/dashboard" 
                  className="text-primary underline underline-offset-4 hover:text-primary-600 transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
                  aria-label="View all tasks on dashboard"
                >
                  View all tasks
                </a>
              </div>
            </section>
          </ErrorBoundary>
          
          {/* Offers */}
          <ErrorBoundary>
            <section id="offers" className="space-y-2" aria-labelledby="offers-heading">
              <h2 id="offers-heading" className="text-heading-2 font-bold mb-2 text-primary-700">Provider Offers</h2>
              <CustomerOffersTable />
              <div className="text-right text-body-sm mt-1">
                <a 
                  href="/offers" 
                  className="text-primary underline underline-offset-4 hover:text-primary-600 transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
                  aria-label="See more provider offers"
                >
                  See more offers
                </a>
              </div>
            </section>
          </ErrorBoundary>
          
          {/* Favorites */}
          <ErrorBoundary>
            <section id="favorites" className="space-y-2" aria-labelledby="favorites-heading">
              <h2 id="favorites-heading" className="text-heading-2 font-bold mb-2 text-primary-700">Popular Favorites</h2>
              <CustomerFavoritesTable />
              <div className="text-right text-body-sm mt-1">
                <a 
                  href="/favorites" 
                  className="text-primary underline underline-offset-4 hover:text-primary-600 transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
                  aria-label="See my favorite providers"
                >
                  See my favorites
                </a>
              </div>
            </section>
          </ErrorBoundary>
        </main>
      </div>
    </I18nProvider>
  );
}

type Role = "customer" | "provider" | "admin";
const defaultTab: Record<Role, string> = {
  customer: "dashboard",
  provider: "task-feed",
  admin: "user-manager"
};

// Utility table component for basic array display
function RoleSelector({ value, onChange }: { value: string, onChange: (role: string) => void }) {
  const roles = [
    { id: "customer", name: "Customer", description: "Post tasks and hire providers" },
    { id: "provider", name: "Provider", description: "Find tasks and offer your services" },
    { id: "admin", name: "Admin", description: "Manage the platform" },
  ];
  
  return (
    <div className="flex flex-col md:flex-row gap-4 w-full max-w-3xl">
      {roles.map(role => (
        <div
          key={role.id}
          className={`flex-1 p-6 rounded-xl cursor-pointer transition-all focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 ${
            value === role.id
              ? "bg-primary text-primary-foreground shadow-lg scale-105"
              : "bg-white hover:bg-blue-50"
          }`}
          onClick={() => onChange(role.id)}
          role="button"
          tabIndex={0}
          aria-label={`Select ${role.name} role: ${role.description}`}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              onChange(role.id);
            }
          }}
        >
          <h3 className="text-xl font-bold mb-2">{role.name}</h3>
          <p className={value === role.id ? "text-primary-foreground/90" : "text-muted-foreground"}>
            {role.description}
          </p>
        </div>
      ))}
    </div>
  );
}

function Section({ title, description }: { title: string; description?: React.ReactNode }) {
  return (
    <div className="flex flex-col items-center justify-center h-[320px] gap-4 animate-fade-in">
      <h2 className="text-3xl font-bold text-primary">{title}</h2>
      {description && <p className="text-lg text-muted-foreground">{description}</p>}
      <div className="w-20 h-0.5 bg-gradient-to-r from-primary to-accent rounded" aria-hidden="true" />
    </div>
  );
}
