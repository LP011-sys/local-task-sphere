
import React from "react";
import { useI18n } from "@/contexts/I18nContext";

type Role = "customer" | "provider" | "admin";
type RoleSelectorProps = { value: Role; onChange: (role: Role) => void };

export const roles: { role: Role; icon: string }[] = [
  { role: "customer", icon: "🧑‍💼" },
  { role: "provider", icon: "🛠️" },
  { role: "admin", icon: "🧑‍💻" },
];

export default function RoleSelector({ value, onChange }: RoleSelectorProps) {
  const { t } = useI18n();
  return (
    <div className="flex flex-col items-center justify-center gap-6 py-10">
      <h2 className="text-2xl font-semibold mb-4">{t("selectRole")}</h2>
      <div className="flex gap-8">
        {roles.map(({ role, icon }) => (
          <button
            type="button"
            className={`flex flex-col items-center gap-2 px-8 py-6 rounded-2xl bg-secondary shadow-md hover:bg-primary hover:text-primary-foreground text-lg font-medium transition-colors duration-200 ${value === role ? "ring-4 ring-primary" : ""}`}
            key={role}
            onClick={() => onChange(role)}
          >
            <span className="text-4xl">{icon}</span>
            <span>{t(role)}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
