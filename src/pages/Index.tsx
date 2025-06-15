import React, { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Loader2, LogIn } from "lucide-react";
import { I18nProvider } from "@/contexts/I18nContext";
import { Table, TableHeader, TableRow, TableHead, TableCell, TableBody } from "@/components/ui/table";
import { useQuery } from "@tanstack/react-query";

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
        <section className="flex flex-col md:flex-row items-center justify-between gap-10 p-8 max-w-7xl w-full mx-auto">
          <div className="flex flex-col gap-4 max-w-xl md:text-left text-center items-start md:items-start">
            <h1 className="text-5xl font-extrabold text-primary drop-shadow mb-3">Find the right person for your task, fast.</h1>
            <p className="text-lg text-muted-foreground mb-3">
              Welcome to <span className="font-semibold text-accent-foreground">Task Hub</span>, your place to post tasks or offer services.<br />
              Instantly find help, make offers, and collaborate in your local area.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 mt-3">
              <a href="/post-task"><Button size="lg" className="text-base">Post a Task</Button></a>
              <a href="#tasks"><Button variant="outline" size="lg" className="text-base">Browse Tasks</Button></a>
              {authed && (<a href="/dashboard"><Button variant="secondary" size="lg" className="text-base">View My Dashboard</Button></a>)}
            </div>
          </div>
          <img
            src="/placeholder.svg"
            alt="Task hub art"
            className="w-80 h-48 object-contain drop-shadow-xl mt-6 md:mt-0"
            draggable={false}
          />
        </section>

        {/* Main content: always render these sections */}
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

// Render tables with built-in fallback UI for loading/error/empty states.
function CustomerTasksTable() {
  const { data, isLoading, error } = useTasks();
  if (isLoading) {
    return (
      <div className="text-center py-10">
        <Loader2 className="animate-spin mx-auto text-blue-400" />
        <span className="block mt-2 text-muted-foreground">Loading tasks...</span>
      </div>
    );
  }
  if (error) {
    return <div className="text-danger text-center py-6">Failed to load tasks.</div>;
  }
  if (!data || data.length === 0) {
    return (
      <div className="text-center py-6 text-muted-foreground">
        No tasks found. Be the first to <a href="/post-task" className="underline text-primary">post a task</a>!
      </div>
    );
  }
  return (
    <div className="rounded-xl bg-white/90 shadow p-4 overflow-x-auto">
      <h3 className="font-bold text-lg mb-1">Tasks</h3>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Title</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Category</TableHead>
            <TableHead>Price</TableHead>
            <TableHead>Deadline</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {(data ?? []).slice(0, 6).map((t:any) => (
            <TableRow key={t.id}>
              <TableCell>{t.offer || t.description}</TableCell>
              <TableCell>{t.status}</TableCell>
              <TableCell>{t.category}</TableCell>
              <TableCell>€{t.price}</TableCell>
              <TableCell>{t.deadline ? new Date(t.deadline).toLocaleString() : "-"}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

function CustomerOffersTable() {
  const { data, isLoading, error } = useOffers();
  if (isLoading) {
    return (
      <div className="text-center py-10">
        <Loader2 className="animate-spin mx-auto text-blue-400" />
        <span className="block mt-2 text-muted-foreground">Loading offers...</span>
      </div>
    );
  }
  if (error) {
    return <div className="text-danger text-center py-6">Failed to load offers.</div>;
  }
  if (!data || data.length === 0) {
    return (
      <div className="text-center py-6 text-muted-foreground">
        No offers found. <a href="/offers" className="underline text-primary">Explore offers</a>.
      </div>
    );
  }
  return (
    <div className="rounded-xl bg-white/90 shadow p-4 overflow-x-auto">
      <h3 className="font-bold text-lg mb-1">Offers</h3>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Task ID</TableHead>
            <TableHead>Provider ID</TableHead>
            <TableHead>Message</TableHead>
            <TableHead>Price</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Created At</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {(data ?? []).slice(0, 6).map((o: any) => (
            <TableRow key={o.id}>
              <TableCell>{o.task_id}</TableCell>
              <TableCell>{o.provider_id}</TableCell>
              <TableCell>{o.message}</TableCell>
              <TableCell>{o.price}</TableCell>
              <TableCell>{o.status}</TableCell>
              <TableCell>{o.created_at ? new Date(o.created_at).toLocaleString() : "-"}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

function CustomerFavoritesTable() {
  const { data, isLoading, error } = useFavorites();
  if (isLoading) {
    return (
      <div className="text-center py-10">
        <Loader2 className="animate-spin mx-auto text-blue-400" />
        <span className="block mt-2 text-muted-foreground">Loading favorites...</span>
      </div>
    );
  }
  if (error) {
    return <div className="text-danger text-center py-6">Failed to load favorites.</div>;
  }
  if (!data || data.length === 0) {
    return (
      <div className="text-center py-6 text-muted-foreground">
        No favorites yet. Browse providers and click the heart to add favorites!
      </div>
    );
  }
  return (
    <div className="rounded-xl bg-white/90 shadow p-4 overflow-x-auto">
      <h3 className="font-bold text-lg mb-1">Favorites</h3>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Customer ID</TableHead>
            <TableHead>Provider ID</TableHead>
            <TableHead>Created At</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {(data ?? []).slice(0, 6).map((f: any) => (
            <TableRow key={f.id}>
              <TableCell>{f.customer_id}</TableCell>
              <TableCell>{f.provider_id}</TableCell>
              <TableCell>{f.created_at ? new Date(f.created_at).toLocaleString() : "-"}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

function useTasks() {
  return useQuery({
    queryKey: ["Tasks"],
    queryFn: async () => {
      const { data } = await supabase.from("Tasks").select("*").order("created_at", { ascending: false });
      return data ?? [];
    },
  });
}
function useOffers() {
  return useQuery({
    queryKey: ["offers-customer"],
    queryFn: async () => {
      const { data } = await supabase.from("offers").select("*").order("created_at", { ascending: false });
      return data ?? [];
    },
  });
}
function useFavorites() {
  return useQuery({
    queryKey: ["favorites"],
    queryFn: async () => {
      const { data } = await supabase.from("favorites").select("*").order("created_at", { ascending: false });
      return data ?? [];
    },
  });
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
