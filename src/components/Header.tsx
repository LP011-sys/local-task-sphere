
import React, { useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import EnhancedLanguagePicker from "@/components/EnhancedLanguagePicker";
import AdminRoleSwitcher from "@/components/AdminRoleSwitcher";
import { useAdminRole } from "@/contexts/AdminRoleContext";

interface HeaderProps {
  navLinks: Array<{ path: string; label: string; }>;
}

export default function Header({ navLinks }: HeaderProps) {
  const { t } = useTranslation();
  const { isAdmin } = useAdminRole();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b bg-white/90 backdrop-blur shadow-sm">
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center justify-between h-16">
        {/* Logo - clickable link to home */}
        <NavLink
          to="/"
          className="flex items-center gap-2 font-bold text-heading-2 tracking-tight text-primary hover:text-primary/80 focus:outline-none transition-colors"
          aria-label={t("appName")}
        >
          {t("appName")}
        </NavLink>
        
        {/* Desktop Navigation */}
        <div className="hidden lg:flex gap-1 items-center">
          {navLinks.map(link => (
            <NavLink
              key={link.path}
              to={link.path}
              className={({ isActive }) =>
                `inline-block px-card py-2 rounded-md transition-all font-medium text-body-sm hover:bg-accent hover:text-primary ${
                  isActive 
                    ? "bg-primary text-primary-foreground shadow-card font-semibold" 
                    : "text-muted-foreground"
                }`
              }
              end={link.path === "/"}
            >
              {link.label}
            </NavLink>
          ))}
        </div>

        {/* Desktop Right side controls */}
        <div className="hidden lg:flex items-center gap-4">
          {/* Admin Role Switcher */}
          {isAdmin && (
            <div className="border-l border-gray-200 pl-4">
              <AdminRoleSwitcher />
            </div>
          )}
          
          <EnhancedLanguagePicker compact showLabel={false} />
        </div>

        {/* Mobile Menu Button */}
        <div className="flex lg:hidden items-center gap-2">
          {isAdmin && <AdminRoleSwitcher />}
          <Button
            variant="ghost"
            size="sm"
            onClick={toggleMobileMenu}
            className="p-2"
            aria-label="Toggle mobile menu"
          >
            {isMobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </Button>
        </div>
      </nav>

      {/* Mobile Navigation Menu */}
      {isMobileMenuOpen && (
        <div className="lg:hidden border-t bg-white/95 backdrop-blur">
          <div className="max-w-7xl mx-auto px-4 py-4 space-y-2">
            {navLinks.map(link => (
              <NavLink
                key={link.path}
                to={link.path}
                className={({ isActive }) =>
                  `block px-card py-3 rounded-md transition-all font-medium text-body-sm hover:bg-accent hover:text-primary ${
                    isActive 
                      ? "bg-primary text-primary-foreground shadow-card font-semibold" 
                      : "text-muted-foreground"
                  }`
                }
                end={link.path === "/"}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                {link.label}
              </NavLink>
            ))}
            
            {/* Mobile Language Picker */}
            <div className="pt-4 border-t">
              <EnhancedLanguagePicker compact={false} showLabel={true} />
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
