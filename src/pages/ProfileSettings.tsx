
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
import { Loader2 } from "lucide-react"

import RoleManagement from "@/components/RoleManagement";

export default function ProfileSettings() {
  const navigate = useNavigate();
  const [session, setSession] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  const [name, setName] = useState('');
  const [bio, setBio] = useState('');
  const [phone, setPhone] = useState('');
  const { data: userProfile } = useCurrentUserProfile(session?.user?.id);
  const { mutate: updateProfile, isPending: isUpdating } = useUpdateCurrentUserProfile(userProfile?.id);

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
      setName(userProfile.name || '');
      setBio(userProfile.bio || '');
      setPhone(userProfile.phone || '');
    }
  }, [userProfile]);

  if (isLoading || !session) {
    return null;
  }

  const user = session.user;

  const handleUpdateProfile = async () => {
    try {
      updateProfile({
        name: name,
        bio: bio,
        phone: phone,
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
          <div className="space-y-2">
            <Label htmlFor="name">Full Name</Label>
            <Input
              id="name"
              placeholder="Your full name"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="phone">Phone Number</Label>
            <Input
              id="phone"
              placeholder="Your phone number"
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="bio">Bio</Label>
            <Textarea
              id="bio"
              placeholder="Tell us about yourself"
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              rows={4}
            />
          </div>
        </CardContent>
      </Card>

      <RoleManagement />

      <div className="flex justify-end">
        <Button onClick={handleUpdateProfile} disabled={isUpdating}>
          {isUpdating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Update Profile
        </Button>
      </div>
    </div>
  );
}
