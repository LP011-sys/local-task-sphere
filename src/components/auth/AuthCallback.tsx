
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
        // Check if we have auth tokens in the URL fragment
        const hashParams = new URLSearchParams(window.location.hash.substring(1));
        const accessToken = hashParams.get('access_token');
        const refreshToken = hashParams.get('refresh_token');
        
        if (accessToken && refreshToken) {
          console.log('Processing email confirmation tokens');
          
          // Set the session with the tokens from email confirmation
          const { data, error } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken
          });
          
          if (error) {
            console.error('Error setting session:', error);
            toast.error('Email confirmation failed');
            return;
          }
          
          if (data.user) {
            console.log('Email confirmed successfully for user:', data.user.id);
            toast.success('Email confirmed successfully!');
            
            // Clear the URL hash
            window.history.replaceState(null, '', window.location.pathname);
            
            // Trigger auth success callback
            onAuthSuccess();
          }
        }
      } catch (error) {
        console.error('Auth callback error:', error);
        toast.error('Authentication error occurred');
      }
    };

    handleAuthCallback();
  }, [onAuthSuccess]);

  return null;
}
