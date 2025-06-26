
import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';

interface AuthCallbackProps {
  onAuthSuccess?: () => void;
}

export default function AuthCallback({ onAuthSuccess }: AuthCallbackProps) {
  const [processingTimeout, setProcessingTimeout] = useState<NodeJS.Timeout | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        console.log('AuthCallback: Starting auth callback processing');
        console.log('Current URL:', window.location.href);
        
        // Check if we have auth tokens in the URL fragment
        const hashParams = new URLSearchParams(window.location.hash.substring(1));
        const accessToken = hashParams.get('access_token');
        const refreshToken = hashParams.get('refresh_token');
        const type = hashParams.get('type');
        
        console.log('AuthCallback: Hash params found:', { 
          hasAccessToken: !!accessToken, 
          hasRefreshToken: !!refreshToken, 
          type 
        });
        
        if (accessToken && refreshToken) {
          console.log('AuthCallback: Processing email confirmation tokens');
          
          // Set the session with the tokens from email confirmation
          const { data, error } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken
          });
          
          if (error) {
            console.error('AuthCallback: Error setting session:', error);
            toast.error('Email confirmation failed: ' + error.message);
            return;
          }
          
          if (data.user) {
            console.log('AuthCallback: Email confirmed successfully for user:', data.user.id);
            
            // Handle profile creation for email confirmations
            await handleProfileCreation(data.user, data.session);
            
            // Clear the URL hash to clean up the URL
            window.history.replaceState(null, '', window.location.pathname);
            
            // Redirect based on user role
            await redirectAfterEmailConfirmation(data.user);
          } else {
            console.log('AuthCallback: No user data returned after setting session');
            toast.error('Failed to confirm email - no user data');
          }
        } else {
          console.log('AuthCallback: No auth tokens found in URL');
        }
      } catch (error) {
        console.error('AuthCallback: Auth callback error:', error);
        toast.error('Authentication error occurred');
      }
    };

    const handleProfileCreation = async (user: any, session: any) => {
      try {
        // Check if profile exists
        const { data: existingProfile } = await supabase
          .from('app_users')
          .select('id, profile_completed')
          .eq('auth_user_id', user.id)
          .single();

        console.log('AuthCallback: Existing profile check:', existingProfile);

        // If no profile exists, create one with user metadata
        if (!existingProfile) {
          console.log('AuthCallback: Creating profile for user:', user.id);
          const userMetadata = user.user_metadata;
          const userRole = userMetadata?.active_role || userMetadata?.roles?.[0] || 'customer';
          const userRoles = userMetadata?.roles || [userRole];

          console.log('AuthCallback: Creating profile with role:', userRole, 'and roles:', userRoles);

          const { error: profileError } = await supabase
            .from('app_users')
            .insert({
              auth_user_id: user.id,
              email: user.email,
              name: userMetadata?.name || '',
              roles: userRoles,
              active_role: userRole,
              role: userRole // For backward compatibility
            });

          if (profileError) {
            console.error('AuthCallback: Profile creation error:', profileError);
            toast.error('Failed to create user profile: ' + profileError.message);
            return;
          }

          console.log('AuthCallback: Profile created successfully with role:', userRole);
        }
      } catch (error) {
        console.error('AuthCallback: Error in profile creation:', error);
        throw error;
      }
    };

    const redirectAfterEmailConfirmation = async (user: any) => {
      try {
        console.log('AuthCallback: Redirecting user after email confirmation:', user.id);

        // Get user profile to determine role
        const { data: profile, error } = await supabase
          .from("app_users")
          .select("roles, active_role")
          .eq("auth_user_id", user.id)
          .single();

        if (error || !profile) {
          console.log('AuthCallback: Profile fetch error, using metadata for redirect:', error);
          
          // If no profile exists, check user metadata for role
          const userRole = user.user_metadata?.active_role || user.user_metadata?.roles?.[0] || 'customer';
          console.log('AuthCallback: Using metadata role for redirect:', userRole);
          
          // Redirect based on metadata role
          if (userRole === "provider") {
            navigate("/dashboard/provider", { replace: true });
          } else {
            navigate("/dashboard/customer", { replace: true });
          }
          return;
        }

        console.log('AuthCallback: User profile found for redirect:', profile);

        // Use active_role if available, otherwise fall back to first role, then default to customer
        const userRole = profile.active_role || profile.roles?.[0] || 'customer';

        console.log('AuthCallback: Redirecting to dashboard for role:', userRole);

        // Redirect based on role
        if (userRole === "customer") {
          navigate("/dashboard/customer", { replace: true });
        } else if (userRole === "provider") {
          navigate("/dashboard/provider", { replace: true });
        } else if (userRole === "admin") {
          navigate("/admin", { replace: true });
        } else {
          // Default to customer dashboard
          navigate("/dashboard/customer", { replace: true });
        }

        toast.success('Email confirmed successfully!');
      } catch (error) {
        console.error("AuthCallback: Redirect error:", error);
        // Default redirect on error
        navigate("/dashboard/customer", { replace: true });
      }
    };

    // Set up timeout protection
    const timeout = setTimeout(() => {
      console.warn('AuthCallback: Processing timeout reached');
      if (onAuthSuccess) {
        onAuthSuccess();
      }
    }, 10000); // 10 second timeout

    setProcessingTimeout(timeout);

    // Only run if we're on a page that might have auth tokens
    if (window.location.hash.includes('access_token')) {
      handleAuthCallback();
    }

    return () => {
      if (timeout) {
        clearTimeout(timeout);
      }
    };
  }, [navigate, onAuthSuccess]);

  // Clear timeout when component unmounts
  useEffect(() => {
    return () => {
      if (processingTimeout) {
        clearTimeout(processingTimeout);
      }
    };
  }, [processingTimeout]);

  return null;
}
