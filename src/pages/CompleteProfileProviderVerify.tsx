
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Upload, FileText, ArrowLeft } from "lucide-react";
import { Progress } from "@/components/ui/progress";

export default function CompleteProfileProviderVerify() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [idFile, setIdFile] = useState<File | null>(null);
  const [licenseFile, setLicenseFile] = useState<File | null>(null);
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

      // Check if basic profile is completed
      const { data: profile } = await supabase
        .from('app_users')
        .select('basic_profile_completed')
        .eq('auth_user_id', user.id)
        .single();

      if (!profile?.basic_profile_completed) {
        navigate("/complete-profile/provider");
      }
    };
    getUser();
  }, [navigate]);

  const uploadDocument = async (file: File, type: 'id' | 'license') => {
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}/${type}_verification.${fileExt}`;
      
      // Try 'documents' bucket first, fallback to 'avatars' if it doesn't exist
      let bucket = 'documents';
      let { error } = await supabase.storage
        .from(bucket)
        .upload(fileName, file, { upsert: true });

      if (error && error.message.includes('Bucket not found')) {
        console.log('Documents bucket not found, trying avatars bucket');
        bucket = 'avatars';
        const result = await supabase.storage
          .from(bucket)
          .upload(fileName, file, { upsert: true });
        error = result.error;
      }

      if (error) throw error;

      const { data } = supabase.storage
        .from(bucket)
        .getPublicUrl(fileName);

      return data.publicUrl;
    } catch (error) {
      console.error(`Error uploading ${type} document:`, error);
      throw error;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!idFile) {
      toast({ title: "ID verification document is required", variant: "destructive" });
      return;
    }

    setLoading(true);

    try {
      let idUrl = null;
      let licenseUrl = null;
      
      try {
        idUrl = await uploadDocument(idFile, 'id');
      } catch (error) {
        console.warn('ID upload failed, but continuing:', error);
        toast({
          title: "Document upload issue",
          description: "We'll process your verification manually. You can continue using the platform.",
          variant: "destructive"
        });
      }
      
      if (licenseFile) {
        try {
          licenseUrl = await uploadDocument(licenseFile, 'license');
        } catch (error) {
          console.warn('License upload failed:', error);
        }
      }

      // Update the app_users table
      const { error } = await supabase
        .from('app_users')
        .update({
          id_verification_url: idUrl,
          drivers_license_url: licenseUrl,
          has_submitted_id: !!idUrl,
          profile_completed: true
        })
        .eq('auth_user_id', user.id);

      if (error) throw error;

      toast({ 
        title: "Profile completed!", 
        description: idUrl ? "We'll review your documents shortly." : "You can upload documents later in your profile settings."
      });
      navigate("/dashboard/provider");
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

  const handleSkip = async () => {
    setLoading(true);
    try {
      const { error } = await supabase
        .from('app_users')
        .update({
          profile_completed: true
        })
        .eq('auth_user_id', user.id);

      if (error) throw error;

      toast({ 
        title: "Profile completed!", 
        description: "You can upload verification documents later in your profile settings." 
      });
      navigate("/dashboard/provider");
    } catch (error: any) {
      console.error("Skip error:", error);
      toast({ 
        title: "Error", 
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
        <div className="text-center space-y-4">
          <Button
            variant="ghost"
            onClick={() => navigate("/complete-profile/provider")}
            className="absolute left-4 top-8"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
          <h1 className="text-3xl font-bold text-primary">Document Verification</h1>
          <div className="space-y-2">
            <p className="text-muted-foreground">Step 2 of 2: Upload your documents</p>
            <Progress value={100} className="w-full max-w-xs mx-auto" />
          </div>
        </div>

        <Card className="p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="id-document" className="flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  ID Verification Document *
                </Label>
                <Input
                  id="id-document"
                  type="file"
                  accept="image/*,.pdf"
                  onChange={(e) => setIdFile(e.target.files?.[0] || null)}
                  required
                />
                <p className="text-sm text-muted-foreground">
                  Upload a clear photo of your government-issued ID (passport, driver's license, or national ID)
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="license-document" className="flex items-center gap-2">
                  <Upload className="h-4 w-4" />
                  Driver's License (Optional)
                </Label>
                <Input
                  id="license-document"
                  type="file"
                  accept="image/*,.pdf"
                  onChange={(e) => setLicenseFile(e.target.files?.[0] || null)}
                />
                <p className="text-sm text-muted-foreground">
                  Upload if you plan to offer delivery or transportation services
                </p>
              </div>
            </div>

            <div className="bg-blue-50 p-4 rounded-lg">
              <h3 className="font-medium text-blue-900 mb-2">Why do we need these documents?</h3>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• To verify your identity and build trust with customers</li>
                <li>• To comply with platform safety requirements</li>
                <li>• To enable secure payments and protect all users</li>
              </ul>
            </div>

            <div className="bg-amber-50 p-4 rounded-lg">
              <p className="text-sm text-amber-800">
                <strong>Note:</strong> If document upload fails due to technical issues, you can still continue and upload them later in your profile settings.
              </p>
            </div>

            <div className="flex gap-4">
              <Button type="submit" className="flex-1" disabled={loading}>
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Processing...
                  </>
                ) : (
                  "Complete Profile"
                )}
              </Button>
              
              <Button 
                type="button" 
                variant="outline" 
                onClick={handleSkip}
                disabled={loading}
                className="flex-1"
              >
                Skip for Now
              </Button>
            </div>

            <p className="text-xs text-muted-foreground text-center">
              You can always upload documents later in your profile settings to increase trust with customers
            </p>
          </form>
        </Card>
      </div>
    </div>
  );
}
