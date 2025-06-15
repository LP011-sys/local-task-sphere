import React, { useState } from "react";
import RoleSelector, { roles } from "@/components/RoleSelector";
import NavBar from "@/components/NavBar";
import { I18nProvider, useI18n } from "@/contexts/I18nContext";

type Role = "customer" | "provider" | "admin";
const defaultTab: Record<Role, string> = {
  customer: "dashboard",
  provider: "task-feed",
  admin: "user-manager"
};

// Utility table component for basic array display
import { Table, TableHeader, TableRow, TableHead, TableCell, TableBody, TableCaption } from "@/components/ui/table";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Loader2 } from "lucide-react";

// Wrapper per-role tabs and current page
function RoleHome({ initialRole = "customer" }: { initialRole?: Role }) {
  const [role, setRole] = useState<Role>(initialRole);
  const [activeTab, setActiveTab] = useState(defaultTab[initialRole]);
  const { t } = useI18n();

  // Map for role/tab to page component
  const TabComponent = (() => {
    switch (role) {
      case "customer":
        switch (activeTab) {
          case "dashboard": return <CustomerDashboard />;
          case "post-task": return <CustomerPostTask />;
          case "my-tasks": return <CustomerMyTasks />;
          case "offers": return <CustomerOffers />;
          case "messages": return <CustomerMessages />;
          case "profile": return <CustomerProfile />;
          case "settings": return <CustomerSettings />;
          default: return <CustomerDashboard />;
        }
      case "provider":
        switch (activeTab) {
          case "task-feed": return <ProviderTaskFeed />;
          case "my-offers": return <ProviderMyOffers />;
          case "accepted-tasks": return <ProviderAcceptedTasks />;
          case "messages": return <ProviderMessages />;
          case "earnings": return <ProviderEarnings />;
          case "profile": return <ProviderProfile />;
          case "settings": return <ProviderSettings />;
          default: return <ProviderTaskFeed />;
        }
      // Hide admin tabs in Index - admin dashboard is routed at /admin
      default:
        return <div />;
    }
  })();

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-white via-blue-50 to-slate-100">
      <NavBar
        role={role}
        activeTab={activeTab}
        onTabChange={setActiveTab}
        onRoleChange={role => {
          setRole(role as Role);
          setActiveTab(defaultTab[role as Role]);
        }}
      />
      <main className="flex-grow flex justify-center items-start px-2 py-8">
        <section className="w-full max-w-3xl rounded-2xl bg-white/95 shadow-lg p-8 animate-fade-in min-h-[500px]">
          {TabComponent}
        </section>
      </main>
    </div>
  );
}

export default function Index() {
  const [selectedRole, setSelectedRole] = React.useState<"customer" | "provider" | "admin" | null>(null);
  const [authed, setAuthed] = React.useState(false);

  React.useEffect(() => {
    // Listen for login status
    const sub = supabase.auth.onAuthStateChange((_event, session) => {
      setAuthed(!!session?.user);
    });
    supabase.auth.getUser().then(({ data }) => {
      setAuthed(!!data?.user);
    });
    return () => {
      sub.data.subscription?.unsubscribe?.();
    };
  }, []);

  return (
    <I18nProvider>
      <div className="min-h-screen bg-gradient-to-br from-white via-blue-50 to-slate-100">
        {!authed ? (
          <div className="flex flex-col items-center justify-center min-h-screen">
            <h1 className="text-5xl font-bold mb-6 text-primary drop-shadow">{'Task Hub'}</h1>
            <RoleSelector value="customer" onChange={role => setSelectedRole(role)} />
            <a
              href="/auth"
              className="mt-6 text-blue-700 underline underline-offset-2 font-semibold"
            >
              Log in / Sign up →
            </a>
          </div>
        ) : !selectedRole ? (
          <div className="flex flex-col items-center justify-center min-h-screen">
            <h1 className="text-5xl font-bold mb-6 text-primary drop-shadow">{'Task Hub'}</h1>
            <RoleSelector value="customer" onChange={role => setSelectedRole(role)} />
          </div>
        ) : (
          <RoleHome initialRole={selectedRole} />
        )}
      </div>
    </I18nProvider>
  );
}

// ----------- CUSTOMER PAGE STUBS (with DATA) -----------
function CustomerDashboard() { 
  return <CustomerDataExplorer />;
}
function CustomerPostTask() {
  const { t } = useI18n();
  // Link to the real wizard page
  return (
    <Section
      title={t("postTask")}
      description={
        <span>
          Describe a new task for providers.<br />
          <a
            href="/task-create"
            className="inline-flex gap-2 items-center mt-3 text-blue-800 hover:underline underline-offset-4 font-semibold"
          >
            Go to Task Creation Wizard →
          </a>
        </span>
      }
    />
  );
}
function CustomerMyTasks() { 
  return <CustomerTasksTable />;
}
function CustomerOffers() { 
  return <CustomerOffersTable />;
}
function CustomerMessages() { const { t } = useI18n(); return <Section title={t("messages")} description="Direct messages and negotiations." />; }
function CustomerProfile() { const { t } = useI18n(); return <Section title={t("profile")} description="View and edit your customer profile." />; }
function CustomerSettings() { const { t } = useI18n(); return <Section title={t("settings")} description="Configure your account." />; }

// ----------- PROVIDER PAGE STUBS (with DATA) -----------
function ProviderTaskFeed() { 
  return <ProviderTasksTable />;
}
function ProviderMyOffers() { 
  return <ProviderOffersTable />;
}
function ProviderAcceptedTasks() { const { t } = useI18n(); return <Section title={t("acceptedTasks")} description="Tasks you've accepted to complete." />; }
function ProviderMessages() { const { t } = useI18n(); return <Section title={t("messages")} description="Direct messages and negotiations." />; }
function ProviderEarnings() { 
  return <ProviderPaymentsTable />;
}
function ProviderProfile() { const { t } = useI18n(); return <Section title={t("profile")} description="Manage your provider profile." />; }
function ProviderSettings() { const { t } = useI18n(); return <Section title={t("settings")} description="Configure your account." />; }

// ----------- Data Explorer TABLE COMPONENTS --------------------

// CUSTOMER tables
function CustomerDataExplorer() {
  return (
    <div>
      <h2 className="text-2xl font-bold mb-3">Customer Demo Data</h2>
      <div className="space-y-8">
        <CustomerTasksTable />
        <CustomerOffersTable />
        <CustomerFavoritesTable />
        <CustomerPaymentsTable />
        <CustomerReviewsTable />
      </div>
    </div>
  );
}
function CustomerTasksTable() {
  const { data, isLoading } = useQuery({
    queryKey: ["Tasks"],
    queryFn: async () => {
      const { data } = await supabase.from("Tasks").select("*").order("created_at", { ascending: false });
      return data ?? [];
    },
  });
  return (
    <div>
      <h3 className="font-bold text-lg mb-1">Tasks</h3>
      {isLoading ? <Loader2 className="animate-spin" /> : (
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
            {data.map((t:any) => (
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
      )}
    </div>
  );
}
function CustomerOffersTable() {
  const { data, isLoading } = useQuery({
    queryKey: ["offers-customer"],
    queryFn: async () => {
      const { data } = await supabase.from("offers").select("*").order("created_at", { ascending: false });
      return data ?? [];
    },
  });
  return (
    <div>
      <h3 className="font-bold text-lg mb-1">Offers</h3>
      {isLoading ? <Loader2 className="animate-spin" /> : (
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
            {data.map((o: any) => (
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
      )}
    </div>
  );
}
function CustomerFavoritesTable() {
  const { data, isLoading } = useQuery({
    queryKey: ["favorites"],
    queryFn: async () => {
      const { data } = await supabase.from("favorites").select("*").order("created_at", { ascending: false });
      return data ?? [];
    },
  });
  return (
    <div>
      <h3 className="font-bold text-lg mb-1">Favorites</h3>
      {isLoading ? <Loader2 className="animate-spin" /> : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Customer ID</TableHead>
              <TableHead>Provider ID</TableHead>
              <TableHead>Created At</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.map((f: any) => (
              <TableRow key={f.id}>
                <TableCell>{f.customer_id}</TableCell>
                <TableCell>{f.provider_id}</TableCell>
                <TableCell>{f.created_at ? new Date(f.created_at).toLocaleString() : "-"}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </div>
  );
}
function CustomerPaymentsTable() {
  const { data, isLoading } = useQuery({
    queryKey: ["payments"],
    queryFn: async () => {
      const { data } = await supabase.from("payments").select("*").order("created_at", { ascending: false });
      return data ?? [];
    },
  });
  return (
    <div>
      <h3 className="font-bold text-lg mb-1">Payments</h3>
      {isLoading ? <Loader2 className="animate-spin" /> : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Task ID</TableHead>
              <TableHead>Customer</TableHead>
              <TableHead>Provider</TableHead>
              <TableHead>Total</TableHead>
              <TableHead>Platform Fee</TableHead>
              <TableHead>Provider Amount</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Created At</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.map((p:any) => (
              <TableRow key={p.id}>
                <TableCell>{p.task_id}</TableCell>
                <TableCell>{p.customer_id}</TableCell>
                <TableCell>{p.provider_id}</TableCell>
                <TableCell>€{p.amount_total}</TableCell>
                <TableCell>€{p.amount_platform_fee}</TableCell>
                <TableCell>€{p.amount_provider}</TableCell>
                <TableCell>{p.status}</TableCell>
                <TableCell>{p.created_at ? new Date(p.created_at).toLocaleString() : "-"}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </div>
  );
}
function CustomerReviewsTable() {
  const { data, isLoading } = useQuery({
    queryKey: ["reviews"],
    queryFn: async () => {
      const { data } = await supabase.from("reviews").select("*").order("created_at", { ascending: false });
      return data ?? [];
    },
  });
  return (
    <div>
      <h3 className="font-bold text-lg mb-1">Reviews</h3>
      {isLoading ? <Loader2 className="animate-spin" /> : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Task ID</TableHead>
              <TableHead>Reviewer ID</TableHead>
              <TableHead>Reviewed User</TableHead>
              <TableHead>Rating</TableHead>
              <TableHead>Comment</TableHead>
              <TableHead>Created At</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.map((r:any) => (
              <TableRow key={r.id}>
                <TableCell>{r.task_id}</TableCell>
                <TableCell>{r.reviewer_id}</TableCell>
                <TableCell>{r.reviewed_user_id}</TableCell>
                <TableCell>{r.rating}</TableCell>
                <TableCell>{r.comment}</TableCell>
                <TableCell>{r.created_at ? new Date(r.created_at).toLocaleString() : "-"}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </div>
  );
}

// PROVIDER tables (reuse task/offers/payments/reviews but could add their own filters)
function ProviderTasksTable() { return <CustomerTasksTable />; }
function ProviderOffersTable() { return <CustomerOffersTable />; }
function ProviderPaymentsTable() { return <CustomerPaymentsTable />; }

// ----------- GENERIC PAGE SECTION -----------
// Change description?: string to description?: React.ReactNode
function Section({ title, description }: { title: string; description?: React.ReactNode }) {
  return (
    <div className="flex flex-col items-center justify-center h-[320px] gap-4 animate-fade-in">
      <h2 className="text-3xl font-bold text-primary">{title}</h2>
      {description && <p className="text-lg text-muted-foreground">{description}</p>}
      <div className="w-20 h-0.5 bg-gradient-to-r from-primary to-accent rounded" />
    </div>
  );
}
