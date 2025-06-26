
import React, { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { I18nProvider } from "@/contexts/I18nContext";
import CustomerTasksTable from "./components/CustomerTasksTable";
import CustomerOffersTable from "./components/CustomerOffersTable";
import CustomerFavoritesTable from "./components/CustomerFavoritesTable";
import IndexHero from "./IndexHero";
import ErrorBoundary from "@/components/ErrorBoundary";
import AuthCallback from "@/components/auth/AuthCallback";
import { useAuthRedirect } from "@/hooks/useAuthRedirect";
import { Link } from "react-router-dom";

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
  const { redirectAfterAuth } = useAuthRedirect();

  const handleAuthSuccess = async () => {
    console.log('Index: Auth success callback triggered');
    try {
      await redirectAfterAuth();
    } catch (error) {
      console.error('Index: Error redirecting after auth:', error);
    }
  };

  return (
    <I18nProvider>
      <div className="min-h-screen bg-gradient-to-br from-white via-primary-50 to-slate-100 flex flex-col">
        {/* AuthCallback for handling email confirmations that land on root */}
        <AuthCallback onAuthSuccess={handleAuthSuccess} />
        
        {/* Hero section always visible */}
        <IndexHero authed={authed} />
        
        {/* Main content */}
        <main className="flex-grow w-full max-w-7xl mx-auto px-4 py-section space-y-section-lg" role="main">
          {/* Task Table */}
          <ErrorBoundary>
            <section id="tasks" className="space-y-2" aria-labelledby="tasks-heading">
              <h2 id="tasks-heading" className="text-heading-2 font-bold mb-2 text-primary-700">Latest Tasks</h2>
              <CustomerTasksTable />
              <div className="text-right text-body-sm mt-1">
                <Link 
                  to="/dashboard/customer" 
                  className="text-primary underline underline-offset-4 hover:text-primary-600 transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
                  aria-label="View customer dashboard"
                >
                  View customer dashboard
                </Link>
              </div>
            </section>
          </ErrorBoundary>
          
          {/* Offers */}
          <ErrorBoundary>
            <section id="offers" className="space-y-2" aria-labelledby="offers-heading">
              <h2 id="offers-heading" className="text-heading-2 font-bold mb-2 text-primary-700">Provider Offers</h2>
              <CustomerOffersTable />
              <div className="text-right text-body-sm mt-1">
                <Link 
                  to="/offers" 
                  className="text-primary underline underline-offset-4 hover:text-primary-600 transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
                  aria-label="See more provider offers"
                >
                  See more offers
                </Link>
              </div>
            </section>
          </ErrorBoundary>
          
          {/* Favorites */}
          <ErrorBoundary>
            <section id="favorites" className="space-y-2" aria-labelledby="favorites-heading">
              <h2 id="favorites-heading" className="text-heading-2 font-bold mb-2 text-primary-700">Popular Favorites</h2>
              <CustomerFavoritesTable />
              <div className="text-right text-body-sm mt-1">
                <Link 
                  to="/favorites" 
                  className="text-primary underline underline-offset-4 hover:text-primary-600 transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
                  aria-label="See my favorite providers"
                >
                  See my favorites
                </Link>
              </div>
            </section>
          </ErrorBoundary>
        </main>
      </div>
    </I18nProvider>
  );
}
