
import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

export function useProfileCompletion() {
  const [loading, setLoading] = useState(true);
  const [profileComplete, setProfileComplete] = useState(true); // Default to true for emergency access
  const [userRole, setUserRole] = useState<string>('customer');
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const checkProfileCompletion = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        
        if (!user) {
          setLoading(false);
          return;
        }

        // Skip check if already on profile completion pages
        if (location.pathname.startsWith('/complete-profile')) {
          setLoading(false);
          return;
        }

        const { data: profile, error } = await supabase
          .from('app_users')
          .select('profile_completed, basic_profile_completed, active_role, role')
          .eq('auth_user_id', user.id)
          .single();

        if (error || !profile) {
          console.log('Profile check error or no profile found:', error);
          // Allow access with defaults instead of blocking
          setProfileComplete(true);
          setUserRole('customer');
          setLoading(false);
          return;
        }

        // Use active_role if available, otherwise fall back to role, then default to customer
        const resolvedRole = profile.active_role || profile.role || 'customer';
        setUserRole(resolvedRole);

        // Check if profile is actually complete
        const isComplete = profile.profile_completed === true;
        setProfileComplete(isComplete);

        // Only redirect to completion if profile is severely incomplete AND user is trying to access protected features
        if (!isComplete && !profile.basic_profile_completed) {
          const protectedPaths = ['/post-task', '/offers', '/favorites'];
          if (protectedPaths.some(path => location.pathname.startsWith(path))) {
            if (resolvedRole === 'customer') {
              navigate('/complete-profile/customer', { replace: true });
              return;
            } else if (resolvedRole === 'provider') {
              navigate('/complete-profile/provider', { replace: true });
              return;
            }
          }
        }

      } catch (error) {
        console.error('Profile completion check error:', error);
        // Allow access on error instead of blocking
        setProfileComplete(true);
        setUserRole('customer');
      } finally {
        setLoading(false);
      }
    };

    checkProfileCompletion();
  }, [navigate, location.pathname]);

  return { loading, profileComplete, userRole };
}
