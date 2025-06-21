
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { User, Mail, Phone, MapPin, LogOut } from "lucide-react";

export default function ProfileSettings() {
  const [profile, setProfile] = useState({
    name: "",
    email: "",
    phone: "",
    location: "",
    bio: ""
  });
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        navigate("/auth");
        return;
      }

      const { data: profileData } = await supabase
        .from("app_users")
        .select("*")
        .eq("id", user.id)
        .single();

      if (profileData) {
        setProfile({
          name: profileData.name || "",
          email: user.email || "",
          phone: profileData.phone || "",
          location: profileData.location || "",
          bio: profileData.bio || ""
        });
      }
    } catch (error: any) {
      toast({ 
        title: "Failed to load profile", 
        description: error.message,
        variant: "destructive" 
      });
    } finally {
      setInitialLoading(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) return;

      const { error } = await supabase
        .from("app_users")
        .upsert({
          id: user.id,
          name: profile.name,
          phone: profile.phone,
          location: profile.location,
          bio: profile.bio
        });

      if (error) throw error;

      toast({ title: "Profile updated successfully!" });
    } catch (error: any) {
      toast({ 
        title: "Failed to update profile", 
        description: error.message,
        variant: "destructive" 
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate("/auth");
  };

  if (initialLoading) {
    return (
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8">
        <div className="bg-white rounded-xl shadow-md p-6 border text-center">
          <p className="text-muted-foreground">Loading profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8 space-y-6">
      <div className="bg-white rounded-xl shadow-md p-6 border">
        <div className="flex items-center gap-3 mb-6">
          <User className="text-primary" size={24} />
          <div>
            <h1 className="text-xl font-bold">Profile Settings</h1>
            <p className="text-xs text-muted-foreground">Manage your account information</p>
          </div>
        </div>

        <form onSubmit={handleSave} className="space-y-6">
          <div>
            <Label className="text-sm font-medium text-gray-700">Full Name</Label>
            <Input
              value={profile.name}
              onChange={(e) => setProfile({ ...profile, name: e.target.value })}
              placeholder="Enter your full name"
              className="w-full px-4 py-2 border rounded-md text-sm mt-1"
            />
          </div>

          <div>
            <Label className="text-sm font-medium text-gray-700">Email</Label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
              <Input
                value={profile.email}
                disabled
                className="w-full pl-10 pr-4 py-2 border rounded-md text-sm mt-1 bg-gray-50"
              />
            </div>
            <p className="text-xs text-muted-foreground mt-1">Email cannot be changed</p>
          </div>

          <div>
            <Label className="text-sm font-medium text-gray-700">Phone Number</Label>
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
              <Input
                value={profile.phone}
                onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                placeholder="+1 (555) 123-4567"
                className="w-full pl-10 pr-4 py-2 border rounded-md text-sm mt-1"
              />
            </div>
          </div>

          <div>
            <Label className="text-sm font-medium text-gray-700">Location</Label>
            <div className="relative">
              <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
              <Input
                value={profile.location}
                onChange={(e) => setProfile({ ...profile, location: e.target.value })}
                placeholder="City, Country"
                className="w-full pl-10 pr-4 py-2 border rounded-md text-sm mt-1"
              />
            </div>
          </div>

          <div>
            <Label className="text-sm font-medium text-gray-700">Bio</Label>
            <textarea
              value={profile.bio}
              onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
              placeholder="Tell others about yourself..."
              rows={4}
              className="w-full px-4 py-2 border rounded-md text-sm mt-1 resize-none"
            />
          </div>

          <div className="flex gap-3 pt-4">
            <Button
              type="submit"
              disabled={loading}
              className="min-w-[120px] bg-primary text-white hover:bg-primary/90 px-4 py-2 rounded-md"
            >
              {loading ? "Saving..." : "Save Changes"}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate("/")}
              className="min-w-[120px] border rounded-md px-4 py-2 hover:bg-gray-100"
            >
              Cancel
            </Button>
          </div>
        </form>
      </div>

      <div className="bg-white rounded-xl shadow-md p-6 border">
        <h2 className="text-xl font-bold mb-4 text-red-600">Danger Zone</h2>
        <p className="text-xs text-muted-foreground mb-4">
          Once you sign out, you'll need to log in again to access your account.
        </p>
        <Button
          onClick={handleSignOut}
          variant="destructive"
          className="min-w-[120px] flex items-center gap-2"
        >
          <LogOut size={16} />
          Sign Out
        </Button>
      </div>
    </div>
  );
}
