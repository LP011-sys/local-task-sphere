
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export default function AuthCallbackPage() {
  const [isProcessing, setIsProcessing] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        console.log('AuthCallback: Processing authentication callback');
        console.log('Current URL:', window.location.href);
        
        // Get session from URL hash (for email confirmations)
        const { data, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('AuthCallback: Session error:', error);
          setError('Authentication failed: ' + error.message);
          return;
        }

        if (data.session?.user) {
          console.log('AuthCallback: User authenticated:', data.session.user.id);
          
          // Ensure user profile exists
          await ensureUserProfile(data.session.user);
          
          // Clear URL parameters
          window.history.replaceState(null, '', window.location.pathname);
          
          // Redirect based on role
          redirectUser(data.session.user);
        } else {
          console.log('AuthCallback: No session found, redirecting to auth');
          navigate('/auth', { replace: true });
        }
      } catch (error) {
        console.error('AuthCallback: Unexpected error:', error);
        setError('Authentication error occurred');
      } finally {
        setIsProcessing(false);
      }
    };

    const ensureUserProfile = async (user: any) => {
      try {
        console.log('AuthCallback: Checking user profile for:', user.id);
        
        // Check if profile exists
        const { data: existingProfile, error: checkError } = await supabase
          .from('app_users')
          .select('id')
          .eq('auth_user_id', user.id)
          .single();

        if (checkError && checkError.code !== 'PGRST116') {
          console.error('AuthCallback: Profile check error:', checkError);
          throw checkError;
        }

        // Create profile if it doesn't exist
        if (!existingProfile) {
          const userRole = user.user_metadata?.active_role || user.user_metadata?.roles?.[0] || 'customer';
          const userRoles = user.user_metadata?.roles || [userRole];

          console.log('AuthCallback: Creating profile with role:', userRole);

          const { error: insertError } = await supabase.from('app_users').insert({
            auth_user_id: user.id,
            email: user.email,
            name: user.user_metadata?.name || '',
            roles: userRoles,
            active_role: userRole,
            role: userRole // For backward compatibility
          });

          if (insertError) {
            console.error('AuthCallback: Profile creation error:', insertError);
            // Don't block - user can complete profile later
            toast.error('Profile setup incomplete. You can complete it in settings.');
          } else {
            console.log('AuthCallback: Profile created successfully');
          }
        }
      } catch (error) {
        console.error('AuthCallback: Profile creation error:', error);
        // Don't block - show warning but allow continuation
        toast.error('Profile setup incomplete. You can complete it in settings.');
      }
    };

    const redirectUser = (user: any) => {
      try {
        const userRole = user.user_metadata?.active_role || user.user_metadata?.roles?.[0] || 'customer';
        
        console.log('AuthCallback: Redirecting user with role:', userRole);

        if (userRole === "provider") {
          navigate("/dashboard/provider", { replace: true });
        } else if (userRole === "admin") {
          navigate("/admin", { replace: true });
        } else {
          navigate("/dashboard/customer", { replace: true });
        }

        toast.success('Welcome back! Email confirmed successfully.');
      } catch (error) {
        console.error("AuthCallback: Redirect error:", error);
        // Default redirect
        navigate("/dashboard/customer", { replace: true });
        toast.success('Welcome back!');
      }
    };

    // Set timeout to prevent infinite loading
    const timeout = setTimeout(() => {
      console.warn('AuthCallback: Processing timeout');
      setError('Email confirmation is taking longer than expected. Please try signing in directly.');
      setIsProcessing(false);
    }, 10000);

    handleAuthCallback();

    return () => clearTimeout(timeout);
  }, [navigate]);

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-white via-blue-50 to-slate-100">
        <div className="text-center max-w-md">
          <div className="text-red-500 text-lg mb-4">Authentication Error</div>
          <p className="text-muted-foreground mb-4">{error}</p>
          <button 
            onClick={() => navigate('/auth', { replace: true })}
            className="bg-primary text-white px-4 py-2 rounded hover:bg-primary/90"
          >
            Return to Sign In
          </button>
        </div>
      </div>
    );
  }

  if (isProcessing) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-white via-blue-50 to-slate-100">
        <div className="text-center max-w-md">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-lg text-muted-foreground">Confirming your email...</p>
        </div>
      </div>
    );
  }

  return null;
}
