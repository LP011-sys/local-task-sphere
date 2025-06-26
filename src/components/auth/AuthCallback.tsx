
import { useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface AuthCallbackProps {
  onAuthSuccess: () => void;
}

export default function AuthCallback({ onAuthSuccess }: AuthCallbackProps) {
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
            console.log('AuthCallback: User metadata:', data.user.user_metadata);
            toast.success('Email confirmed successfully!');
            
            // Clear the URL hash to clean up the URL
            window.history.replaceState(null, '', window.location.pathname);
            
            // Trigger auth success callback
            onAuthSuccess();
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

    // Only run if we're on a page that might have auth tokens
    if (window.location.hash.includes('access_token')) {
      handleAuthCallback();
    }
  }, [onAuthSuccess]);

  return null;
}
