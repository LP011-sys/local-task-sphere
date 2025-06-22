import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useCurrentUserProfile, useUpdateCurrentUserProfile } from "@/hooks/useCurrentUserProfile";
import { useToast } from "@/hooks/use-toast";
import { getLoyaltyTier, getPlatformFeeDiscount } from "@/hooks/useLoyaltyTier";
import { supabase } from "@/integrations/supabase/client";
import NotificationSettings from "@/components/NotificationSettings";

export default function ProfileSettings() {
  const { toast } = useToast();
  
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

  const { data: profile, isLoading } = useCurrentUserProfile(userId);
  const updateProfile = useUpdateCurrentUserProfile(userId);

  const [name, setName] = React.useState("");
  const [bio, setBio] = React.useState("");
  const [language, setLanguage] = React.useState("en");

  React.useEffect(() => {
    if (profile) {
      setName(profile.name || "");
      setBio(profile.bio || "");
      setLanguage(profile.language || "en");
    }
  }, [profile]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await updateProfile.mutateAsync({ name, bio, language });
      toast({ title: "Profile updated successfully!" });
    } catch (error: any) {
      toast({ title: "Failed to update profile", description: error.message, variant: "destructive" });
    }
  };

  if (isLoading) {
    return <div className="text-center py-10">Loading profile...</div>;
  }

  if (!profile) {
    return <div className="text-center py-10">Failed to load profile.</div>;
  }

  const loyaltyTier = getLoyaltyTier(profile.tasks_completed || 0);
  const discount = getPlatformFeeDiscount(loyaltyTier);

  return (
    <div className="max-w-2xl mx-auto p-6 space-y-6">
      <h1 className="text-2xl font-bold mb-6">Profile Settings</h1>
      
      {/* Profile Information Card */}
      <Card>
        <CardHeader>
          <CardTitle>Profile Information</CardTitle>
          <CardDescription>Update your personal details.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4">
          <form onSubmit={handleSubmit} className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Name</Label>
              <Input
                type="text"
                id="name"
                value={name}
                onChange={e => setName(e.target.value)}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="bio">Bio</Label>
              <Input
                type="text"
                id="bio"
                value={bio}
                onChange={e => setBio(e.target.value)}
              />
            </div>
            <Button type="submit" disabled={updateProfile.isPending}>
              {updateProfile.isPending ? "Updating..." : "Update Profile"}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Loyalty Tier Card */}
      <Card>
        <CardHeader>
          <CardTitle>Loyalty Tier</CardTitle>
          <CardDescription>Your current loyalty status and benefits.</CardDescription>
        </CardHeader>
        <CardContent>
          <p>
            You are currently at <strong>{loyaltyTier}</strong> tier.
          </p>
          <p>
            Platform fee discount: <strong>{discount * 100}%</strong>
          </p>
        </CardContent>
      </Card>

      {/* Add Notification Settings Card */}
      <NotificationSettings />

      {/* Language & Preferences Card */}
      <Card>
        <CardHeader>
          <CardTitle>Language & Preferences</CardTitle>
          <CardDescription>Set your preferred language.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4">
          <div className="grid gap-2">
            <Label htmlFor="language">Language</Label>
            <Input
              type="text"
              id="language"
              value={language}
              onChange={e => setLanguage(e.target.value)}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
