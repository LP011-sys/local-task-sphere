
import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

export function useProfileCompletion() {
  const [loading, setLoading] = useState(true);
  const [profileComplete, setProfileComplete] = useState(false);
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

        if (error) {
          console.error('Profile check error:', error);
          setLoading(false);
          return;
        }

        if (!profile) {
          setLoading(false);
          return;
        }

        const userRole = profile.active_role || profile.role;

        // Check if profile is complete
        if (!profile.profile_completed) {
          if (userRole === 'customer') {
            navigate('/complete-profile/customer', { replace: true });
            return;
          } else if (userRole === 'provider') {
            // For providers, check if basic profile is complete
            if (!profile.basic_profile_completed) {
              navigate('/complete-profile/provider', { replace: true });
              return;
            } else {
              navigate('/complete-profile/provider/verify', { replace: true });
              return;
            }
          }
        }

        setProfileComplete(true);
      } catch (error) {
        console.error('Profile completion check error:', error);
      } finally {
        setLoading(false);
      }
    };

    checkProfileCompletion();
  }, [navigate, location.pathname]);

  return { loading, profileComplete };
}
