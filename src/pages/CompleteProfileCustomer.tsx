
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Card } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";

const INTEREST_CATEGORIES = [
  "Cleaning", "Assembly", "Delivery", "Handyman", "Moving", "Tutoring",
  "Pet Care", "Gardening", "Painting", "Plumbing", "Electrical", "Carpentry"
];

export default function CompleteProfileCustomer() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [phone, setPhone] = useState("");
  const [language, setLanguage] = useState("en");
  const [profilePicture, setProfilePicture] = useState<File | null>(null);
  const [selectedInterests, setSelectedInterests] = useState<string[]>([]);
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [acceptMarketing, setAcceptMarketing] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate("/auth");
        return;
      }
      setUser(user);
    };
    getUser();
  }, [navigate]);

  const handleInterestToggle = (interest: string) => {
    if (selectedInterests.includes(interest)) {
      setSelectedInterests(selectedInterests.filter(i => i !== interest));
    } else if (selectedInterests.length < 3) {
      setSelectedInterests([...selectedInterests, interest]);
    }
  };

  const uploadProfilePicture = async (file: File) => {
    const fileExt = file.name.split('.').pop();
    const fileName = `${user.id}/profile.${fileExt}`;
    
    const { error } = await supabase.storage
      .from('profiles')
      .upload(fileName, file, { upsert: true });

    if (error) throw error;

    const { data } = supabase.storage
      .from('profiles')
      .getPublicUrl(fileName);

    return data.publicUrl;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!acceptTerms) {
      toast({ title: "Please accept terms and conditions", variant: "destructive" });
      return;
    }

    if (selectedInterests.length === 0) {
      toast({ title: "Please select at least one interest category", variant: "destructive" });
      return;
    }

    setLoading(true);

    try {
      let profilePhotoUrl = null;
      if (profilePicture) {
        profilePhotoUrl = await uploadProfilePicture(profilePicture);
      }

      // Update the app_users table
      const { error } = await supabase
        .from('app_users')
        .update({
          phone,
          preferred_language: language,
          profile_photo: profilePhotoUrl,
          customer_interests: selectedInterests,
          accepts_marketing: acceptMarketing,
          profile_completed: true
        })
        .eq('auth_user_id', user.id);

      if (error) throw error;

      toast({ title: "Profile completed successfully!" });
      navigate("/dashboard/customer");
    } catch (error: any) {
      console.error("Profile completion error:", error);
      toast({ 
        title: "Error completing profile", 
        description: error.message, 
        variant: "destructive" 
      });
    } finally {
      setLoading(false);
    }
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-blue-50 to-slate-100 p-4">
      <div className="max-w-2xl mx-auto space-y-6 py-8">
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold text-primary">Complete Your Profile</h1>
          <p className="text-muted-foreground">Help us personalize your experience</p>
        </div>

        <Card className="p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={user.email}
                disabled
                className="bg-muted"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number *</Label>
              <Input
                id="phone"
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="Enter your phone number"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="language">Preferred Language</Label>
              <Select value={language} onValueChange={setLanguage}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="en">English</SelectItem>
                  <SelectItem value="sr">Serbian</SelectItem>
                  <SelectItem value="ru">Russian</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="profile-picture">Profile Picture (Optional)</Label>
              <Input
                id="profile-picture"
                type="file"
                accept="image/*"
                onChange={(e) => setProfilePicture(e.target.files?.[0] || null)}
              />
            </div>

            <div className="space-y-4">
              <Label>Top 3 Interest Categories (Select up to 3) *</Label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {INTEREST_CATEGORIES.map((interest) => (
                  <div
                    key={interest}
                    className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                      selectedInterests.includes(interest)
                        ? 'bg-primary text-primary-foreground border-primary'
                        : 'hover:bg-accent'
                    }`}
                    onClick={() => handleInterestToggle(interest)}
                  >
                    <div className="text-sm font-medium text-center">{interest}</div>
                  </div>
                ))}
              </div>
              <p className="text-sm text-muted-foreground">
                Selected: {selectedInterests.length}/3
              </p>
            </div>

            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="terms"
                  checked={acceptTerms}
                  onCheckedChange={(checked) => setAcceptTerms(checked === true)}
                />
                <Label htmlFor="terms" className="text-sm">
                  I accept the Terms & Conditions *
                </Label>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="marketing"
                  checked={acceptMarketing}
                  onCheckedChange={(checked) => setAcceptMarketing(checked === true)}
                />
                <Label htmlFor="marketing" className="text-sm">
                  I agree to receive marketing emails
                </Label>
              </div>
            </div>

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Completing Profile...
                </>
              ) : (
                "Complete Profile"
              )}
            </Button>
          </form>
        </Card>
      </div>
    </div>
  );
}
