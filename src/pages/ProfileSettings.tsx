
import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useCurrentUserProfile, useUpdateCurrentUserProfile } from "@/hooks/useCurrentUserProfile";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import NotificationSettings from "@/components/NotificationSettings";
import { ProfileLanguageSelector } from "@/components/ProfileLanguageSelector";
import { LoyaltyTierCard } from "@/components/LoyaltyTierCard";
import { Camera } from "lucide-react";

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
  const [profilePhoto, setProfilePhoto] = React.useState<File | null>(null);
  const [profilePhotoPreview, setProfilePhotoPreview] = React.useState<string>("");

  React.useEffect(() => {
    if (profile) {
      setName(profile.name || "");
      setBio(profile.bio || "");
      setLanguage(profile.language || "en");
      setProfilePhotoPreview(profile.profile_photo || "");
    }
  }, [profile]);

  const handleProfilePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setProfilePhoto(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfilePhotoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const uploadProfilePhoto = async (file: File): Promise<string | null> => {
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${userId}-${Math.random()}.${fileExt}`;
      const filePath = `profile-photos/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file);

      if (uploadError) {
        console.error('Upload error:', uploadError);
        return null;
      }

      const { data } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);

      return data.publicUrl;
    } catch (error) {
      console.error('Error uploading photo:', error);
      return null;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      let photoUrl = profile?.profile_photo;
      
      if (profilePhoto) {
        photoUrl = await uploadProfilePhoto(profilePhoto);
        if (!photoUrl) {
          toast({ 
            title: "Failed to upload profile photo", 
            description: "Please try again with a different image.",
            variant: "destructive" 
          });
          return;
        }
      }

      await updateProfile.mutateAsync({ 
        name, 
        bio, 
        language,
        profile_photo: photoUrl
      });
      
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

  return (
    <div className="max-w-2xl mx-auto p-6 space-y-6">
      <h1 className="text-2xl font-bold mb-6">Profile Settings</h1>
      
      {/* Profile Information Card */}
      <Card>
        <CardHeader>
          <CardTitle>Profile Information</CardTitle>
          <CardDescription>Update your personal details and profile photo.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4">
          <form onSubmit={handleSubmit} className="grid gap-4">
            {/* Profile Photo Section */}
            <div className="flex flex-col items-center gap-4">
              <div className="relative">
                <Avatar className="w-24 h-24">
                  <AvatarImage src={profilePhotoPreview} alt="Profile photo" />
                  <AvatarFallback className="text-lg">
                    {name ? name.charAt(0).toUpperCase() : 'U'}
                  </AvatarFallback>
                </Avatar>
                <Label 
                  htmlFor="profile-photo"
                  className="absolute bottom-0 right-0 bg-primary text-primary-foreground rounded-full p-2 cursor-pointer hover:bg-primary/90 transition-colors"
                >
                  <Camera size={16} />
                </Label>
                <Input
                  id="profile-photo"
                  type="file"
                  accept="image/*"
                  onChange={handleProfilePhotoChange}
                  className="hidden"
                />
              </div>
              <p className="text-sm text-muted-foreground text-center">
                Click the camera icon to upload a new profile photo
              </p>
            </div>

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
                placeholder="Tell others about yourself..."
              />
            </div>
            <Button type="submit" disabled={updateProfile.isPending}>
              {updateProfile.isPending ? "Updating..." : "Update Profile"}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Enhanced Loyalty Tier Card */}
      <LoyaltyTierCard tasksCompleted={profile.tasks_completed || 0} />

      {/* Add Notification Settings Card */}
      <NotificationSettings />

      {/* Language & Preferences Card */}
      <Card>
        <CardHeader>
          <CardTitle>Language & Preferences</CardTitle>
          <CardDescription>Set your preferred language for live chat translation and interface.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4">
          <ProfileLanguageSelector
            value={language}
            onChange={setLanguage}
            label="Preferred Language for Live Chat Translation"
          />
          <p className="text-sm text-muted-foreground">
            This setting will be used to automatically translate messages in live chat when communicating with users who speak different languages.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
