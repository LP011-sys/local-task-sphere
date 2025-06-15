import React, { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Loader2, LogIn } from "lucide-react";
import { I18nProvider } from "@/contexts/I18nContext";
import CustomerTasksTable from "./components/CustomerTasksTable";
import CustomerOffersTable from "./components/CustomerOffersTable";
import CustomerFavoritesTable from "./components/CustomerFavoritesTable";
import IndexHero from "./IndexHero";
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
      <div className="min-h-screen bg-gradient-to-br from-white via-blue-50 to-slate-100 flex flex-col">
        <header className="w-full px-6 py-4 flex items-center justify-between bg-white/90 shadow sticky top-0 z-10">
          <div className="flex items-center gap-3">
            <span className="font-bold text-3xl text-primary drop-shadow-sm select-none">Task Hub</span>
          </div>
          <nav className="flex gap-3">
            <a
              href="#tasks"
              className="font-semibold hover:text-primary/80 transition"
            >
              Browse Tasks
            </a>
            <a
              href="#offers"
              className="font-semibold hover:text-primary/80 transition"
            >
              Provider Offers
            </a>
            <a
              href="#favorites"
              className="font-semibold hover:text-primary/80 transition"
            >
              Favorites
            </a>
            <a
              href="/post-task"
              className="font-semibold hover:text-green-700 transition"
            >
              Post a Task
            </a>
            <a
              href="/premium"
              className="font-semibold hover:text-yellow-600 transition"
            >
              Premium
            </a>
          </nav>
          {authed ? (
            <a
              href="/profile"
              className="inline-flex items-center gap-2 rounded-lg px-3 py-2 bg-primary text-primary-foreground font-semibold hover:bg-primary/80 shadow"
            >
              Account
            </a>
          ) : (
            <a
              href="/auth"
              className="inline-flex items-center gap-2 rounded-lg px-3 py-2 bg-primary text-primary-foreground font-semibold hover:bg-primary/80 shadow"
            >
              <LogIn className="w-4 h-4" />
              Log in / Sign up
            </a>
          )}
        </header>
        {/* Hero section always visible */}
        <IndexHero authed={authed} />
        {/* Main content */}
        <main className="flex-grow w-full max-w-7xl mx-auto px-4 py-5 space-y-16">
          {/* Task Table */}
          <section id="tasks" className="space-y-2">
            <h2 className="text-2xl font-bold mb-2 text-blue-900">Latest Tasks</h2>
            <CustomerTasksTable />
            <div className="text-right text-sm mt-1">
              <a href="/dashboard" className="text-primary underline underline-offset-4">View all tasks</a>
            </div>
          </section>
          {/* Offers */}
          <section id="offers" className="space-y-2">
            <h2 className="text-2xl font-bold mb-2 text-blue-900">Provider Offers</h2>
            <CustomerOffersTable />
            <div className="text-right text-sm mt-1">
              <a href="/offers" className="text-primary underline underline-offset-4">See more offers</a>
            </div>
          </section>
          {/* Favorites */}
          <section id="favorites" className="space-y-2">
            <h2 className="text-2xl font-bold mb-2 text-blue-900">Popular Favorites</h2>
            <CustomerFavoritesTable />
            <div className="text-right text-sm mt-1">
              <a href="/favorites" className="text-primary underline underline-offset-4">See my favorites</a>
            </div>
          </section>
        </main>
        <footer className="border-t py-4 w-full bg-white/80 text-center text-sm text-muted-foreground">
          &copy; {new Date().getFullYear()} Task Hub. <a href="https://docs.lovable.dev/" className="underline">About this app</a>
        </footer>
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
          className={`flex-1 p-6 rounded-xl cursor-pointer transition-all ${
            value === role.id
              ? "bg-primary text-primary-foreground shadow-lg scale-105"
              : "bg-white hover:bg-blue-50"
          }`}
          onClick={() => onChange(role.id)}
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
      <div className="w-20 h-0.5 bg-gradient-to-r from-primary to-accent rounded" />
    </div>
  );
}
