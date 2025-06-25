
import React, { useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import LanguageButtons from "@/components/LanguageButtons";
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

  // Filter out the home link since we're already on the home page
  const filteredNavLinks = navLinks.filter(link => link.path !== "/");

  return (
    <header className="sticky top-0 z-40 w-full border-b bg-white/90 backdrop-blur shadow-sm" role="banner">
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center justify-between h-16" role="navigation" aria-label="Main navigation">
        {/* Logo - clickable link to home */}
        <NavLink
          to="/"
          className="flex items-center gap-2 font-bold text-heading-2 tracking-tight text-primary hover:text-primary/80 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 transition-colors"
          aria-label={`${t("appName")} - Go to homepage`}
        >
          {t("appName")}
        </NavLink>
        
        {/* Desktop Navigation */}
        <div className="hidden lg:flex gap-1 items-center" role="menubar">
          {filteredNavLinks.map(link => (
            <NavLink
              key={link.path}
              to={link.path}
              className={({ isActive }) =>
                `inline-block px-card py-2 rounded-md transition-all font-medium text-body-sm hover:bg-accent hover:text-primary focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 ${
                  isActive 
                    ? "bg-primary text-primary-foreground shadow-card font-semibold" 
                    : "text-muted-foreground"
                }`
              }
              end={link.path === "/"}
              role="menuitem"
            >
              {({ isActive }) => (
                <span aria-current={isActive ? 'page' : undefined} className="uppercase">
                  {link.label}
                </span>
              )}
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
          
          <LanguageButtons compact />
        </div>

        {/* Mobile Menu Button */}
        <div className="flex lg:hidden items-center gap-2">
          {isAdmin && <AdminRoleSwitcher />}
          <Button
            variant="ghost"
            size="sm"
            onClick={toggleMobileMenu}
            className="p-2 focus:ring-2 focus:ring-primary focus:ring-offset-2"
            aria-label={isMobileMenuOpen ? "Close mobile menu" : "Open mobile menu"}
            aria-expanded={isMobileMenuOpen}
            aria-controls="mobile-menu"
          >
            {isMobileMenuOpen ? (
              <X size={20} aria-hidden="true" />
            ) : (
              <Menu size={20} aria-hidden="true" />
            )}
          </Button>
        </div>
      </nav>

      {/* Mobile Navigation Menu */}
      {isMobileMenuOpen && (
        <div 
          id="mobile-menu"
          className="lg:hidden border-t bg-white/95 backdrop-blur"
          role="menu"
          aria-label="Mobile navigation menu"
        >
          <div className="max-w-7xl mx-auto px-4 py-4 space-y-2">
            {filteredNavLinks.map(link => (
              <NavLink
                key={link.path}
                to={link.path}
                className={({ isActive }) =>
                  `block px-card py-3 rounded-md transition-all font-medium text-body-sm hover:bg-accent hover:text-primary focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 ${
                    isActive 
                      ? "bg-primary text-primary-foreground shadow-card font-semibold" 
                      : "text-muted-foreground"
                  }`
                }
                end={link.path === "/"}
                onClick={() => setIsMobileMenuOpen(false)}
                role="menuitem"
              >
                {({ isActive }) => (
                  <span aria-current={isActive ? 'page' : undefined} className="uppercase">
                    {link.label}
                  </span>
                )}
              </NavLink>
            ))}
            
            {/* Mobile Language Picker */}
            <div className="pt-4 border-t">
              <LanguageButtons compact={false} />
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
