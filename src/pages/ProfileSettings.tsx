
import React, { useRef } from "react";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { useCurrentUserProfile, useUpdateCurrentUserProfile } from "@/hooks/useCurrentUserProfile";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";

const LANGUAGES = [
  { label: "English", value: "en" },
  { label: "Serbian", value: "sr" },
  { label: "Spanish", value: "es" },
  // Add more as needed
];

type FormValues = {
  name: string,
  email: string,
  bio: string,
  language: string,
  notification_preferences: {
    email_notifications?: boolean
  },
  profile_photo?: FileList
};

function getUserId() {
  // This method assumes Supabase Auth is used; adjust as needed!
  const auth = supabase.auth.getUser();
  // This will not work directly outside of async. You'll handle it in useEffect.
  return auth;
}

const ProfileSettings: React.FC = () => {
  const [userId, setUserId] = React.useState<string | undefined>();
  const { toast } = useToast();
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Get current user id on mount
  React.useEffect(() => {
    // Supabase Auth: get current user ID
    (async () => {
      const { data } = await supabase.auth.getUser();
      if (!data?.user) {
        navigate("/onboarding"); // not logged in: redirect
        return;
      }
      setUserId(data.user.id);
    })();
  }, [navigate]);

  const { data, isLoading } = useCurrentUserProfile(userId);
  const updateProfile = useUpdateCurrentUserProfile(userId);

  const { register, setValue, handleSubmit, watch, reset } = useForm<FormValues>({
    defaultValues: {
      name: "",
      email: "",
      bio: "",
      language: "en",
      notification_preferences: { email_notifications: true },
      profile_photo: undefined
    }
  });

  // When data is fetched, reset the form
  React.useEffect(() => {
    if (data) {
      reset({
        name: data.name || "",
        email: data.email || "",
        bio: data.bio || "",
        language: data.language || "en",
        notification_preferences: data.notification_preferences || { email_notifications: true },
        // profile_photo left empty
      });
    }
  }, [data, reset]);

  const profilePhotoUrl = data?.profile_photo
    ? data.profile_photo
    : "https://ui-avatars.com/api/?name=" + encodeURIComponent(data?.name ?? "U");

  async function onSubmit(values: FormValues) {
    let photoUrl = data?.profile_photo || "";
    // Handle file upload
    if (values.profile_photo && values.profile_photo.length > 0) {
      const file = values.profile_photo[0];
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from("profile-pictures")
        .upload(`${userId}/${file.name}`, file, {
          upsert: true
        });
      if (uploadError) {
        toast({
          title: "Error uploading image",
          description: uploadError.message,
          variant: "destructive"
        });
        return;
      }
      const { data: publicUrlData } = supabase
        .storage
        .from("profile-pictures")
        .getPublicUrl(`${userId}/${file.name}`);
      photoUrl = publicUrlData.publicUrl;
    }

    // Update profile fields in Supabase
    updateProfile.mutate({
      name: values.name,
      bio: values.bio,
      language: values.language,
      profile_photo: photoUrl,
      notification_preferences: values.notification_preferences
    }, {
      onSuccess: () => {
        toast({
          title: "Profile updated successfully",
        });
      },
      onError: (err: any) => {
        toast({
          title: "Update failed",
          description: String(err.message),
          variant: "destructive"
        });
      }
    });
  }

  if (!userId || isLoading) {
    return (
      <div className="flex items-center justify-center py-10 text-gray-500">
        Loading profile...
      </div>
    );
  }

  return (
    <div className="max-w-xl mx-auto bg-white rounded-lg shadow-md p-6 my-8 sm:my-10">
      <h1 className="text-2xl font-bold mb-4">Profile Settings</h1>
      <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>

        {/* --- Account Info Section --- */}
        <div>
          <h2 className="font-semibold text-lg mb-2">Account Info</h2>
          <div className="flex flex-col gap-4 sm:flex-row sm:gap-6">
            <div className="flex flex-col items-center sm:items-start">
              <img
                src={profilePhotoUrl}
                alt="Profile"
                className="rounded-full w-24 h-24 object-cover border"
              />
              <input
                type="file"
                accept="image/*"
                {...register("profile_photo")}
                ref={fileInputRef}
                className="mt-2"
              />
            </div>
            <div className="flex-1 flex flex-col gap-3">
              <div>
                <label className="block text-sm font-medium mb-1">Full Name</label>
                <Input {...register("name", { required: true })} />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Email (read-only)</label>
                <Input value={watch("email")} readOnly className="opacity-60"/>
              </div>
            </div>
          </div>
        </div>

        {/* --- Preferences Section --- */}
        <div>
          <h2 className="font-semibold text-lg mb-2">Preferences</h2>
          <div className="flex flex-col gap-3">
            <div>
              <label className="block text-sm font-medium mb-1">Bio / Description</label>
              <textarea
                {...register("bio")}
                className="w-full rounded-md border px-3 py-2"
                rows={3}
                maxLength={300}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Language Preference</label>
              <select
                {...register("language")}
                className="w-full rounded-md border px-3 py-2"
              >
                {LANGUAGES.map(lang => (
                  <option key={lang.value} value={lang.value}>{lang.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Email Notifications</label>
              <input
                type="checkbox"
                checked={!!watch("notification_preferences.email_notifications")}
                onChange={e =>
                  setValue("notification_preferences", {
                    ...watch("notification_preferences"),
                    email_notifications: e.target.checked
                  })
                }
                className="mr-2"
              />
              <span>Enable email notifications</span>
            </div>
          </div>
        </div>

        {/* --- Save Button --- */}
        <div className="flex justify-end">
          <Button type="submit" disabled={updateProfile.isLoading}>Save Changes</Button>
        </div>
      </form>
    </div>
  );
};

export default ProfileSettings;
