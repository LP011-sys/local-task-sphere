
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export default function AuthCallbackPage() {
  const [isProcessing, setIsProcessing] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        console.log('AuthCallbackPage: Processing email confirmation callback');
        console.log('Current URL:', window.location.href);
        
        // Get the session from the URL hash
        const { data, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('AuthCallbackPage: Error getting session:', error);
          toast.error('Authentication failed: ' + error.message);
          navigate('/auth', { replace: true });
          return;
        }

        if (data.session?.user) {
          console.log('AuthCallbackPage: Email confirmed successfully for user:', data.session.user.id);
          
          // Handle profile creation if needed
          await handleProfileCreation(data.session.user);
          
          // Clear the URL hash
          window.history.replaceState(null, '', window.location.pathname);
          
          // Redirect based on user role
          await redirectAfterConfirmation(data.session.user);
        } else {
          console.log('AuthCallbackPage: No session found, redirecting to auth');
          navigate('/auth', { replace: true });
        }
      } catch (error) {
        console.error('AuthCallbackPage: Unexpected error:', error);
        toast.error('Authentication error occurred');
        navigate('/auth', { replace: true });
      } finally {
        setIsProcessing(false);
      }
    };

    const handleProfileCreation = async (user: any) => {
      try {
        // Check if profile exists
        const { data: existingProfile } = await supabase
          .from('app_users')
          .select('id')
          .eq('auth_user_id', user.id)
          .single();

        // If no profile exists, create one
        if (!existingProfile) {
          console.log('AuthCallbackPage: Creating profile for user:', user.id);
          const userMetadata = user.user_metadata;
          const userRole = userMetadata?.active_role || userMetadata?.roles?.[0] || 'customer';
          const userRoles = userMetadata?.roles || [userRole];

          const { error: profileError } = await supabase
            .from('app_users')
            .insert({
              auth_user_id: user.id,
              email: user.email,
              name: userMetadata?.name || '',
              roles: userRoles,
              active_role: userRole,
              role: userRole
            });

          if (profileError) {
            console.error('AuthCallbackPage: Profile creation error:', profileError);
            // Don't throw - let the user proceed even if profile creation fails
            toast.error('Profile setup incomplete, please update your profile');
          } else {
            console.log('AuthCallbackPage: Profile created successfully');
          }
        }
      } catch (error) {
        console.error('AuthCallbackPage: Error in profile creation:', error);
        // Don't throw - let the user proceed
      }
    };

    const redirectAfterConfirmation = async (user: any) => {
      try {
        console.log('AuthCallbackPage: Redirecting user after confirmation:', user.id);

        // Get user profile to determine role
        const { data: profile } = await supabase
          .from("app_users")
          .select("roles, active_role")
          .eq("auth_user_id", user.id)
          .single();

        let userRole = 'customer';
        
        if (profile) {
          userRole = profile.active_role || profile.roles?.[0] || 'customer';
        } else {
          // Fallback to metadata if no profile
          userRole = user.user_metadata?.active_role || user.user_metadata?.roles?.[0] || 'customer';
        }

        console.log('AuthCallbackPage: Redirecting to dashboard for role:', userRole);

        // Redirect based on role
        if (userRole === "provider") {
          navigate("/dashboard/provider", { replace: true });
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
      }
    };

    // Set up timeout protection
    const timeout = setTimeout(() => {
      console.warn('AuthCallbackPage: Processing timeout reached');
      setIsProcessing(false);
      toast.error('Authentication timeout. Please try signing in again.');
      navigate('/auth', { replace: true });
    }, 10000);

    handleAuthCallback();

    return () => clearTimeout(timeout);
  }, [navigate]);

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
