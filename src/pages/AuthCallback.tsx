
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
        console.log('AuthCallbackPage: Processing email confirmation callback');
        console.log('Current URL:', window.location.href);
        
        // Get the session from URL
        const { data, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('AuthCallbackPage: Error getting session:', error);
          setError('Authentication failed: ' + error.message);
          return;
        }

        if (data.session?.user) {
          console.log('AuthCallbackPage: Email confirmed successfully for user:', data.session.user.id);
          console.log('AuthCallbackPage: User metadata:', data.session.user.user_metadata);
          
          // Try to create/ensure profile exists
          await handleProfileCreation(data.session.user);
          
          // Clear URL hash
          window.history.replaceState(null, '', window.location.pathname);
          
          // Redirect based on role
          await redirectAfterConfirmation(data.session.user);
        } else {
          console.log('AuthCallbackPage: No session found, redirecting to auth');
          navigate('/auth', { replace: true });
        }
      } catch (error) {
        console.error('AuthCallbackPage: Unexpected error:', error);
        setError('Authentication error occurred');
      } finally {
        setIsProcessing(false);
      }
    };

    const handleProfileCreation = async (user: any) => {
      try {
        console.log('AuthCallbackPage: Ensuring profile exists for user:', user.id);
        
        // Use the new database function for safe profile creation
        const { error } = await supabase.rpc('get_or_create_user_profile', {
          user_id: user.id,
          user_email: user.email,
          user_name: user.user_metadata?.name || '',
          user_roles: user.user_metadata?.roles || ['customer'],
          user_active_role: user.user_metadata?.active_role || user.user_metadata?.roles?.[0] || 'customer'
        });

        if (error) {
          console.error('AuthCallbackPage: Profile creation error:', error);
          toast.error('Profile setup incomplete. You can complete it later in settings.');
        } else {
          console.log('AuthCallbackPage: Profile ensured successfully');
        }
      } catch (error) {
        console.error('AuthCallbackPage: Error in profile creation:', error);
        // Don't block user - they can complete profile later
      }
    };

    const redirectAfterConfirmation = async (user: any) => {
      try {
        console.log('AuthCallbackPage: Determining redirect for user:', user.id);

        // Get user role from metadata first (more reliable during email confirmation)
        let userRole = user.user_metadata?.active_role || user.user_metadata?.roles?.[0] || 'customer';
        
        console.log('AuthCallbackPage: Using role from metadata:', userRole);

        // Redirect based on role
        if (userRole === "provider") {
          navigate("/complete-profile/provider", { replace: true });
        } else if (userRole === "admin") {
          navigate("/admin", { replace: true });
        } else {
          navigate("/dashboard/customer", { replace: true });
        }

        toast.success('Email confirmed successfully! Welcome!');
      } catch (error) {
        console.error("AuthCallbackPage: Redirect error:", error);
        // Default redirect on error
        navigate("/dashboard/customer", { replace: true });
        toast.success('Welcome! Please complete your profile if needed.');
      }
    };

    // Set up timeout protection
    const timeout = setTimeout(() => {
      console.warn('AuthCallbackPage: Processing timeout reached');
      setError('Email confirmation is taking longer than expected. Please try signing in directly.');
      setIsProcessing(false);
    }, 15000);

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
          <p className="text-sm text-muted-foreground mt-2">This should only take a moment</p>
        </div>
      </div>
    );
  }

  return null;
}
