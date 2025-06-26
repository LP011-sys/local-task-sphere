
import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { User, RefreshCw, LogOut, Badge } from 'lucide-react';
import { useCurrentUserProfile } from '@/hooks/useCurrentUserProfile';
import { useAdminRole } from '@/contexts/AdminRoleContext';
import { toast } from 'sonner';

export default function ProfileAvatar() {
  const navigate = useNavigate();
  const [session, setSession] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSwitching, setIsSwitching] = useState(false);
  const { currentRole, setCurrentRole } = useAdminRole();
  const { data: userProfile } = useCurrentUserProfile(session?.user?.id);

  useEffect(() => {
    const getSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setSession(session);
      setIsLoading(false);
    };

    getSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setIsLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  if (isLoading || !session) {
    return null;
  }

  const user = session.user;
  const userRoles = user.user_metadata?.roles || [];
  const hasProviderRole = userRoles.includes('provider');
  const hasCustomerRole = userRoles.includes('customer');
  
  // Get user name for fallback
  const userName = user.user_metadata?.full_name || user.email?.split('@')[0] || 'User';
  const initials = userName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);

  const handleRoleSwitch = async (newRole: 'customer' | 'provider') => {
    if (isSwitching) return;
    
    setIsSwitching(true);
    try {
      // Update active_role in user metadata
      const { error } = await supabase.auth.updateUser({
        data: { active_role: newRole }
      });

      if (error) throw error;

      // Update local state
      setCurrentRole(newRole);
      
      // Navigate to appropriate dashboard
      if (newRole === 'provider') {
        navigate('/dashboard/provider');
      } else {
        navigate('/dashboard/customer');
      }

      toast.success(`Switched to ${newRole} account`);
    } catch (error) {
      console.error('Error switching role:', error);
      toast.error('Failed to switch account');
    } finally {
      setIsSwitching(false);
    }
  };

  const handleSignOut = async () => {
    try {
      await supabase.auth.signOut();
      navigate('/auth');
      toast.success('Signed out successfully');
    } catch (error) {
      console.error('Error signing out:', error);
      toast.error('Failed to sign out');
    }
  };

  const getCurrentRoleLabel = () => {
    return currentRole === 'provider' ? 'Provider' : 'Customer';
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-10 w-10 rounded-full">
          <Avatar className="h-9 w-9">
            <AvatarImage 
              src={userProfile?.profile_photo} 
              alt={userName}
            />
            <AvatarFallback className="bg-primary text-primary-foreground font-semibold">
              {initials}
            </AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      
      <DropdownMenuContent className="w-64" align="end" forceMount>
        {/* User info header */}
        <div className="flex flex-col space-y-1 p-2">
          <p className="text-sm font-medium leading-none">{userName}</p>
          <p className="text-xs leading-none text-muted-foreground">
            {user.email}
          </p>
          <div className="flex items-center gap-2 mt-2">
            <Badge variant="secondary" className="text-xs">
              {getCurrentRoleLabel()}
            </Badge>
            {userProfile?.loyalty_tier && (
              <Badge variant="outline" className="text-xs">
                {userProfile.loyalty_tier}
              </Badge>
            )}
          </div>
        </div>
        
        <DropdownMenuSeparator />
        
        {/* My Profile */}
        <DropdownMenuItem onClick={() => navigate('/profile')}>
          <User className="mr-2 h-4 w-4" />
          My Profile
        </DropdownMenuItem>
        
        {/* Role switching options */}
        {hasProviderRole && currentRole === 'customer' && (
          <DropdownMenuItem 
            onClick={() => handleRoleSwitch('provider')}
            disabled={isSwitching}
          >
            <RefreshCw className={`mr-2 h-4 w-4 ${isSwitching ? 'animate-spin' : ''}`} />
            Switch to Provider Account
          </DropdownMenuItem>
        )}
        
        {hasCustomerRole && currentRole === 'provider' && (
          <DropdownMenuItem 
            onClick={() => handleRoleSwitch('customer')}
            disabled={isSwitching}
          >
            <RefreshCw className={`mr-2 h-4 w-4 ${isSwitching ? 'animate-spin' : ''}`} />
            Switch to Customer Account
          </DropdownMenuItem>
        )}
        
        <DropdownMenuSeparator />
        
        {/* Sign Out */}
        <DropdownMenuItem onClick={handleSignOut}>
          <LogOut className="mr-2 h-4 w-4" />
          Sign Out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
