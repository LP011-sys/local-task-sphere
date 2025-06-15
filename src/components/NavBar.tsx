
import React from "react";
import { useI18n } from "@/contexts/I18nContext";
import LanguagePicker from "./LanguagePicker";
import { roles } from "./RoleSelector";
import { User, List, Settings, FileText, Folder, Users, MessageSquare, FolderPlus, DollarSign, FilePlus, CircleUserRound } from "lucide-react";

// Locally define TranslationKey to match I18nContext.tsx
type TranslationKey =
  | "customer"
  | "provider"
  | "admin"
  | "dashboard"
  | "postTask"
  | "myTasks"
  | "offers"
  | "messages"
  | "profile"
  | "settings"
  | "taskFeed"
  | "myOffers"
  | "acceptedTasks"
  | "earnings"
  | "userManager"
  | "taskOversight"
  | "disputes"
  | "reports"
  | "broadcasts"
  | "categoryManager"
  | "selectRole"
  | "appName"
  | "language";

type Role = "customer" | "provider" | "admin";

interface NavBarProps {
  role: Role;
  activeTab: string;
  onTabChange: (tab: string) => void;
  onRoleChange: (role: Role) => void;
}

// Re-type menuConfig and ensure the keys are valid
const menuConfig: Record<Role, { key: string; labelKey: TranslationKey; icon: React.ReactNode }[]> = {
  customer: [
    { key: "dashboard", labelKey: "dashboard", icon: <List size={20} /> },
    { key: "post-task", labelKey: "postTask", icon: <FilePlus size={20} /> },
    { key: "my-tasks", labelKey: "myTasks", icon: <Folder size={20} /> },
    { key: "offers", labelKey: "offers", icon: <FileText size={20} /> },
    { key: "messages", labelKey: "messages", icon: <MessageSquare size={20} /> },
    { key: "profile", labelKey: "profile", icon: <User size={20} /> },
    { key: "settings", labelKey: "settings", icon: <Settings size={20} /> },
  ],
  provider: [
    { key: "task-feed", labelKey: "taskFeed", icon: <List size={20} /> },
    { key: "my-offers", labelKey: "myOffers", icon: <FileText size={20} /> },
    { key: "accepted-tasks", labelKey: "acceptedTasks", icon: <FolderPlus size={20} /> },
    { key: "messages", labelKey: "messages", icon: <MessageSquare size={20} /> },
    { key: "earnings", labelKey: "earnings", icon: <DollarSign size={20} /> },
    { key: "profile", labelKey: "profile", icon: <User size={20} /> },
    { key: "settings", labelKey: "settings", icon: <Settings size={20} /> },
  ],
  admin: [
    { key: "user-manager", labelKey: "userManager", icon: <Users size={20} /> },
    { key: "task-oversight", labelKey: "taskOversight", icon: <Folder size={20} /> },
    { key: "disputes", labelKey: "disputes", icon: <CircleUserRound size={20} /> },
    { key: "reports", labelKey: "reports", icon: <FileText size={20} /> },
    { key: "broadcasts", labelKey: "broadcasts", icon: <MessageSquare size={20} /> },
    { key: "category-manager", labelKey: "categoryManager", icon: <FolderPlus size={20} /> },
  ]
};

export default function NavBar({ role, activeTab, onTabChange, onRoleChange }: NavBarProps) {
  const { t } = useI18n();
  return (
    <header className="sticky top-0 z-30 bg-white/90 backdrop-blur shadow-sm border-b">
      <div className="flex items-center justify-between gap-4 px-4 py-3 max-w-7xl mx-auto">
        <div className="flex items-center gap-4">
          <span className="font-bold text-2xl tracking-tight text-primary">{t("appName")}</span>
          <nav className="ml-10 hidden md:flex gap-2">
            {menuConfig[role].map(tab => (
              <button
                key={tab.key}
                className={`flex items-center gap-2 px-3 py-2 rounded-full transition-colors font-medium hover:bg-accent hover:shadow ${activeTab === tab.key ? "bg-primary text-primary-foreground shadow" : ""}`}
                onClick={() => onTabChange(tab.key)}
              >
                {tab.icon}
                <span>{t(tab.labelKey)}</span>
              </button>
            ))}
          </nav>
        </div>
        <div className="flex items-center gap-3">
          <div className="hidden md:flex gap-2">
            <LanguagePicker />
          </div>
          <div className="flex gap-2">
            <select
              className="border bg-transparent px-2 py-1 rounded text-base"
              onChange={e => onRoleChange(e.target.value as Role)}
              value={role}
            >
              {/* For roles, ensure the type matches TranslationKey */}
              {roles.map(r => (
                <option key={r.role} value={r.role}>{t(r.role as TranslationKey)}</option>
              ))}
            </select>
          </div>
        </div>
      </div>
      {/* Mobile nav */}
      <nav className="flex md:hidden justify-center gap-1 pb-2 pt-1">
        {menuConfig[role].map(tab => (
          <button
            key={tab.key}
            className={`flex flex-col items-center justify-center px-2 py-1 gap-0.5 rounded-md transition font-medium text-xs hover:bg-accent ${activeTab === tab.key ? "bg-primary text-primary-foreground shadow" : ""}`}
            onClick={() => onTabChange(tab.key)}
          >
            {tab.icon}
            <span className="hidden xs:inline">{t(tab.labelKey)}</span>
          </button>
        ))}
      </nav>
    </header>
  );
}

