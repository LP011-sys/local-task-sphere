
import React from "react";
import { NavLink, useLocation, Outlet } from "react-router-dom";

const navLinks = [
  { path: "/", label: "Home" },
  { path: "/post-task", label: "Post Task" },
  { path: "/inbox", label: "Inbox" },
  { path: "/favorites", label: "Favorites" },
  { path: "/profile", label: "Profile" },
];

export default function AppLayout() {
  const location = useLocation();

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-blue-50 to-slate-100">
      <header className="sticky top-0 z-40 w-full border-b bg-white/90 backdrop-blur shadow-sm">
        <nav className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center justify-between h-16">
          {/* Logo - clickable link to home */}
          <NavLink
            to="/"
            className="flex items-center gap-2 font-bold text-2xl tracking-tight text-primary hover:text-primary/80 focus:outline-none transition-colors"
            aria-label="Task Hub Home"
          >
            Task Hub
          </NavLink>
          
          {/* Desktop Navigation */}
          <div className="hidden md:flex gap-1">
            {navLinks.map(link => (
              <NavLink
                key={link.path}
                to={link.path}
                className={({ isActive }) =>
                  `inline-block px-4 py-2 rounded-md transition-all font-medium text-sm hover:bg-accent hover:text-primary ${
                    isActive 
                      ? "bg-primary text-primary-foreground shadow-md font-semibold" 
                      : "text-muted-foreground"
                  }`
                }
                end={link.path === "/"}
              >
                {link.label}
              </NavLink>
            ))}
          </div>

          {/* Mobile Navigation */}
          <div className="flex md:hidden gap-1">
            {navLinks.slice(0, 3).map(link => (
              <NavLink
                key={link.path}
                to={link.path}
                className={({ isActive }) =>
                  `inline-block px-2 py-1 rounded-md transition-all font-medium text-xs hover:bg-accent hover:text-primary ${
                    isActive 
                      ? "bg-primary text-primary-foreground shadow-md font-semibold" 
                      : "text-muted-foreground"
                  }`
                }
                end={link.path === "/"}
              >
                {link.label}
              </NavLink>
            ))}
          </div>
        </nav>
      </header>
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6 w-full">
        <Outlet />
      </main>
    </div>
  );
}
