
import React, { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { LanguageSelector } from "@/components/LanguageSelector";
import { VerifiedBadge } from "@/components/ui/verified-badge";
import { useCurrentUserProfile, useUpdateCurrentUserProfile } from "@/hooks/useCurrentUserProfile";
import { useVerificationPayment } from "@/hooks/useVerificationPayment";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { CheckCircle, Shield } from "lucide-react";

export default function ProfileSettings() {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<string>("");

  // Get current user
  useEffect(() => {
    const getCurrentUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user?.id) {
        setCurrentUserId(user.id);
      }
    };
    getCurrentUser();
  }, []);

  const { data: profile, isLoading: profileLoading } = useCurrentUserProfile(currentUserId);
  const updateProfile = useUpdateCurrentUserProfile(currentUserId);
  const verificationPayment = useVerificationPayment();

  const [formData, setFormData] = useState({
    name: profile?.name || "",
    email: profile?.email || "",
    phone: profile?.phone || "",
    bio: profile?.bio || "",
    preferred_language: profile?.preferred_language || "en",
  });

  // Update form data when profile loads
  React.useEffect(() => {
    if (profile) {
      setFormData({
        name: profile.name || "",
        email: profile.email || "",
        phone: profile.phone || "",
        bio: profile.bio || "",
        preferred_language: profile.preferred_language || "en",
      });
    }
  }, [profile]);

  // Check for verification success from URL params
  React.useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('verified') === 'success') {
      toast({
        title: "Verification Complete!",
        description: "Your provider badge has been activated.",
        duration: 5000,
      });
      // Clean up URL
      window.history.replaceState({}, '', '/profile-settings');
    }
  }, [toast]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      await updateProfile.mutateAsync(formData);
      toast({
        title: "Success",
        description: "Profile updated successfully!",
      });
    } catch (error) {
      console.error("Error updating profile:", error);
      toast({
        title: "Error",
        description: "Failed to update profile. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerificationPayment = () => {
    if (currentUserId) {
      verificationPayment.mutate(currentUserId);
    }
  };

  if (profileLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Loading profile...</div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">Profile Settings</h1>

      {/* Verification Card - only show for providers */}
      {profile?.role === 'provider' && (
        <Card className="p-6 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Shield className="w-6 h-6 text-blue-600" />
              <div>
                <h3 className="text-lg font-semibold">Provider Verification</h3>
                <p className="text-sm text-gray-600">
                  Get verified to build trust with customers
                </p>
              </div>
              {profile.is_verified && (
                <VerifiedBadge isVerified={true} />
              )}
            </div>
            
            {!profile.is_verified ? (
              <Button
                onClick={handleVerificationPayment}
                disabled={verificationPayment.isPending}
                className="bg-blue-600 hover:bg-blue-700"
              >
                {verificationPayment.isPending ? "Processing..." : "Verify for €3.99"}
              </Button>
            ) : (
              <div className="flex items-center text-green-600">
                <CheckCircle className="w-5 h-5 mr-2" />
                <span className="font-medium">Verified</span>
              </div>
            )}
          </div>
          
          {!profile.is_verified && (
            <div className="mt-4 p-3 bg-blue-50 rounded-lg">
              <p className="text-sm text-blue-800">
                ✓ Stand out from other providers<br />
                ✓ Build customer trust<br />
                ✓ One-time payment of €3.99
              </p>
            </div>
          )}
        </Card>
      )}

      <Card className="p-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Full Name</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone">Phone Number</Label>
            <Input
              id="phone"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="bio">Bio</Label>
            <Textarea
              id="bio"
              value={formData.bio}
              onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
              placeholder="Tell us about yourself..."
              rows={4}
            />
          </div>

          <LanguageSelector
            value={formData.preferred_language}
            onChange={(value) => setFormData({ ...formData, preferred_language: value })}
            label="Preferred Language"
          />

          <Button
            type="submit"
            disabled={isLoading}
            className="w-full"
          >
            {isLoading ? "Updating..." : "Update Profile"}
          </Button>
        </form>
      </Card>
    </div>
  );
}
