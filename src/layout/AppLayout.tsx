
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
      <header className="sticky top-0 z-40 w-full border-b bg-white/90 backdrop-blur">
        <nav className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center justify-between h-16">
          <div className="flex items-center gap-2 font-bold text-2xl tracking-tight text-primary">
            Task Hub
          </div>
          <div className="flex gap-1 sm:gap-3">
            {navLinks.map(link => (
              <NavLink
                key={link.path}
                to={link.path}
                className={({ isActive }) =>
                  `inline-block px-3 py-2 rounded-md transition font-medium hover:bg-accent hover:text-primary ${isActive ? "bg-primary text-primary-foreground shadow" : ""}`
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
