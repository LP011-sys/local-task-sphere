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
      case "admin":
        switch (activeTab) {
          case "user-manager": return <AdminUserManager />;
          case "task-oversight": return <AdminTaskOversight />;
          case "disputes": return <AdminDisputes />;
          case "reports": return <AdminReports />;
          case "broadcasts": return <AdminBroadcasts />;
          case "category-manager": return <AdminCategoryManager />;
          default: return <AdminUserManager />;
        }
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

  return (
    <I18nProvider>
      <div className="min-h-screen bg-gradient-to-br from-white via-blue-50 to-slate-100">
        {!selectedRole ? (
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

// ----------- CUSTOMER PAGE STUBS -----------
function CustomerDashboard() { const { t } = useI18n(); return <Section title={t("dashboard")} description="Your summary and new tasks." />; }
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
function CustomerMyTasks() { const { t } = useI18n(); return <Section title={t("myTasks")} description="All tasks you've posted." />; }
function CustomerOffers() { const { t } = useI18n(); return <Section title={t("offers")} description="Review offers from providers." />; }
function CustomerMessages() { const { t } = useI18n(); return <Section title={t("messages")} description="Direct messages and negotiations." />; }
function CustomerProfile() { const { t } = useI18n(); return <Section title={t("profile")} description="View and edit your customer profile." />; }
function CustomerSettings() { const { t } = useI18n(); return <Section title={t("settings")} description="Configure your account." />; }

// ----------- PROVIDER PAGE STUBS -----------
function ProviderTaskFeed() { const { t } = useI18n(); return <Section title={t("taskFeed")} description="Feed of open tasks in your area." />; }
function ProviderMyOffers() { const { t } = useI18n(); return <Section title={t("myOffers")} description="Your offers for tasks." />; }
function ProviderAcceptedTasks() { const { t } = useI18n(); return <Section title={t("acceptedTasks")} description="Tasks you've accepted to complete." />; }
function ProviderMessages() { const { t } = useI18n(); return <Section title={t("messages")} description="Direct messages and negotiations." />; }
function ProviderEarnings() { const { t } = useI18n(); return <Section title={t("earnings")} description="Earnings and payment history." />; }
function ProviderProfile() { const { t } = useI18n(); return <Section title={t("profile")} description="Manage your provider profile." />; }
function ProviderSettings() { const { t } = useI18n(); return <Section title={t("settings")} description="Configure your account." />; }

// ----------- ADMIN PAGE STUBS -----------
function AdminUserManager() { const { t } = useI18n(); return <Section title={t("userManager")} description="Manage users, roles, and permissions." />; }
function AdminTaskOversight() { const { t } = useI18n(); return <Section title={t("taskOversight")} description="Oversee and monitor all tasks on the platform." />; }
function AdminDisputes() { const { t } = useI18n(); return <Section title={t("disputes")} description="Handle disputes between customers and providers." />; }
function AdminReports() { const { t } = useI18n(); return <Section title={t("reports")} description="Review reports and analytics." />; }
function AdminBroadcasts() { const { t } = useI18n(); return <Section title={t("broadcasts")} description="Broadcast urgent notices or updates." />; }
function AdminCategoryManager() { const { t } = useI18n(); return <Section title={t("categoryManager")} description="Manage service categories." />; }

// ----------- GENERIC PAGE SECTION -----------
function Section({ title, description }: { title: string; description?: string }) {
  return (
    <div className="flex flex-col items-center justify-center h-[320px] gap-4 animate-fade-in">
      <h2 className="text-3xl font-bold text-primary">{title}</h2>
      {description && <p className="text-lg text-muted-foreground">{description}</p>}
      <div className="w-20 h-0.5 bg-gradient-to-r from-primary to-accent rounded" />
    </div>
  );
}
