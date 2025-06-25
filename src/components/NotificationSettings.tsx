
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Bell, Mail, Smartphone, CheckCircle, AlertCircle } from "lucide-react";
import { useCurrentUserProfile, useUpdateCurrentUserProfile } from "@/hooks/useCurrentUserProfile";
import { useUpdateNotificationTokens } from "@/hooks/useNotificationQueue";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useAdminRole } from "@/contexts/AdminRoleContext";

export default function NotificationSettings() {
  const { toast } = useToast();
  const { isAdmin } = useAdminRole();
  
  // Get current user
  const [userId, setUserId] = React.useState<string | undefined>();
  React.useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) {
        supabase
          .from('app_users')
          .select('id')
          .eq('auth_user_id', user.id)
          .single()
          .then(({ data }) => {
            if (data) setUserId(data.id);
          });
      }
    });
  }, []);

  const { data: profile } = useCurrentUserProfile(userId);
  const updateProfile = useUpdateCurrentUserProfile(userId);
  const updateTokens = useUpdateNotificationTokens();

  const handleToggleEmailNotifications = (enabled: boolean) => {
    updateProfile.mutate({ email_notifications_enabled: enabled });
  };

  const handleTogglePushNotifications = (enabled: boolean) => {
    updateProfile.mutate({ push_notifications_enabled: enabled });
  };

  const handleRegisterPushToken = async () => {
    // This would typically be called from your mobile app
    // For web, you might implement web push notifications
    if ('serviceWorker' in navigator && 'PushManager' in window) {
      try {
        const registration = await navigator.serviceWorker.ready;
        const subscription = await registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: 'YOUR_VAPID_PUBLIC_KEY' // You'll need to set this up
        });
        
        const token = JSON.stringify(subscription);
        
        // Safely handle notification_tokens as JSON
        const currentTokens = Array.isArray(profile?.notification_tokens) 
          ? profile.notification_tokens as string[]
          : [];
        const newTokens = [...currentTokens, token];
        
        updateTokens.mutate({ userId: userId!, tokens: newTokens });
      } catch (error) {
        console.error('Failed to subscribe to push notifications:', error);
        toast({
          title: "Error",
          description: "Failed to enable push notifications. Please try again.",
          variant: "destructive",
        });
      }
    } else {
      toast({
        title: "Not Supported",
        description: "Push notifications are not supported in this browser.",
        variant: "destructive",
      });
    }
  };

  if (!profile) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center text-muted-foreground">Loading...</div>
        </CardContent>
      </Card>
    );
  }

  // Safely get token count
  const tokenCount = Array.isArray(profile.notification_tokens) 
    ? (profile.notification_tokens as string[]).length 
    : 0;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bell className="h-5 w-5" />
          Notification Settings
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Mail className="h-4 w-4 text-muted-foreground" />
            <Label htmlFor="email-notifications">Email Notifications</Label>
          </div>
          <Switch
            id="email-notifications"
            checked={profile.email_notifications_enabled ?? true}
            onCheckedChange={handleToggleEmailNotifications}
            disabled={updateProfile.isPending}
          />
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Smartphone className="h-4 w-4 text-muted-foreground" />
            <Label htmlFor="push-notifications">Push Notifications</Label>
          </div>
          <Switch
            id="push-notifications"
            checked={profile.push_notifications_enabled ?? true}
            onCheckedChange={handleTogglePushNotifications}
            disabled={updateProfile.isPending}
          />
        </div>

        <div className="pt-2 border-t">
          <div className="flex items-center gap-2 mb-2">
            {tokenCount > 0 ? (
              <CheckCircle className="h-4 w-4 text-green-600" />
            ) : (
              <AlertCircle className="h-4 w-4 text-orange-500" />
            )}
            <div className="flex-1">
              {tokenCount > 0 ? (
                <p className="text-sm font-medium text-green-700">
                  This device is registered to receive instant task alerts.
                </p>
              ) : (
                <p className="text-sm font-medium text-orange-700">
                  This device is not yet registered for push alerts.
                </p>
              )}
            </div>
          </div>
          
          {tokenCount === 0 && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleRegisterPushToken}
              disabled={updateTokens.isPending}
              className="w-full"
            >
              Register This Device
            </Button>
          )}
        </div>

        {isAdmin && (
          <div className="pt-2 border-t">
            <div className="text-xs text-muted-foreground">
              <p><strong>Developer Info:</strong> {tokenCount} token(s) registered</p>
            </div>
          </div>
        )}

        <div className="text-xs text-muted-foreground space-y-1">
          <div className="flex items-start gap-2">
            <span className="font-medium">Email notifications:</span>
            <span>New offers, task updates, reminders</span>
          </div>
          <div className="flex items-start gap-2">
            <span className="font-medium">Push notifications:</span>
            <span>Instant alerts on your device</span>
          </div>
          <div className="flex items-start gap-2">
            <span className="font-medium">Reminders:</span>
            <span>Sent 1 hour before task deadlines</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
