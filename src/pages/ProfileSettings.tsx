import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCurrentUserProfile } from '@/hooks/useCurrentUserProfile';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { useUpdateCurrentUserProfile } from "@/hooks/useCurrentUserProfile";
import { useToast } from "@/hooks/use-toast";
import { ReloadIcon } from "@radix-ui/react-icons"

import RoleManagement from "@/components/RoleManagement";

export default function ProfileSettings() {
  const navigate = useNavigate();
  const [session, setSession] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  const [fullName, setFullName] = useState('');
  const [profilePhoto, setProfilePhoto] = useState('');
  const [website, setWebsite] = useState('');
  const [isAvailable, setIsAvailable] = useState(false);
  const { data: userProfile } = useCurrentUserProfile(session?.user?.id);
  const { mutate: updateProfile, isLoading: isUpdating } = useUpdateCurrentUserProfile(userProfile?.id);

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

  useEffect(() => {
    if (userProfile) {
      setFullName(userProfile.full_name || '');
      setProfilePhoto(userProfile.profile_photo || '');
      setWebsite(userProfile.website || '');
      setIsAvailable(userProfile.is_available || false);
    }
  }, [userProfile]);

  if (isLoading || !session) {
    return null;
  }

  const user = session.user;

  const handleUpdateProfile = async () => {
    try {
      updateProfile({
        full_name: fullName,
        profile_photo: profilePhoto,
        website: website,
        is_available: isAvailable,
      });
      toast({
        title: "Profile updated successfully!",
      })
    } catch (error: any) {
      console.error('Error updating profile:', error);
      toast({
        variant: "destructive",
        title: "Uh oh! Something went wrong.",
        description: error.message,
      })
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-primary">Profile Settings</h1>
          <p className="text-muted-foreground mt-1">Manage your profile information</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Personal Information</CardTitle>
          <CardDescription>Update your basic profile details</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="full_name">Full Name</Label>
              <Input
                id="full_name"
                placeholder="Your full name"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="profile_photo">Profile Photo URL</Label>
              <Input
                id="profile_photo"
                placeholder="URL to your profile photo"
                type="url"
                value={profilePhoto}
                onChange={(e) => setProfilePhoto(e.target.value)}
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="website">Website</Label>
            <Input
              id="website"
              placeholder="Your website URL"
              type="url"
              value={website}
              onChange={(e) => setWebsite(e.target.value)}
            />
          </div>
        </CardContent>
      </Card>

      <RoleManagement />

      <Card>
        <CardHeader>
          <CardTitle>Availability</CardTitle>
          <CardDescription>Set your availability status</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <Label htmlFor="is_available">Available for tasks</Label>
            <Switch
              id="is_available"
              checked={isAvailable}
              onCheckedChange={(checked) => setIsAvailable(checked)}
            />
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button onClick={handleUpdateProfile} disabled={isUpdating}>
          {isUpdating && <ReloadIcon className="mr-2 h-4 w-4 animate-spin" />}
          Update Profile
        </Button>
      </div>
    </div>
  );
}
