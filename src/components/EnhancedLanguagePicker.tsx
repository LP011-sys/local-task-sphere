
import React from "react";
import { useTranslation } from "react-i18next";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { useCurrentUserProfile, useUpdateCurrentUserProfile } from "@/hooks/useCurrentUserProfile";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const languages = [
  { code: "en", label: "English", flag: "🇺🇸" },
  { code: "sr", label: "Српски", flag: "🇷🇸" },
  { code: "ru", label: "Русский", flag: "🇷🇺" },
];

interface EnhancedLanguagePickerProps {
  showLabel?: boolean;
  compact?: boolean;
}

export default function EnhancedLanguagePicker({ showLabel = true, compact = false }: EnhancedLanguagePickerProps) {
  const { i18n, t } = useTranslation();
  const { toast } = useToast();
  const [userId, setUserId] = React.useState<string | undefined>();
  
  // Get current user
  React.useEffect(() => {
    const getCurrentUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user?.id) {
        const { data: appUser } = await supabase
          .from('app_users')
          .select('id')
          .eq('auth_user_id', user.id)
          .single();
        if (appUser) setUserId(appUser.id);
      }
    };
    getCurrentUser();
  }, []);

  const { data: profile } = useCurrentUserProfile(userId);
  const updateProfile = useUpdateCurrentUserProfile(userId);

  const handleLanguageChange = async (languageCode: string) => {
    try {
      // Update i18next
      await i18n.changeLanguage(languageCode);
      
      // Save to localStorage
      localStorage.setItem('i18nextLng', languageCode);
      
      // Update user profile in Supabase if user is logged in
      if (userId && profile) {
        await updateProfile.mutateAsync({ 
          preferred_language: languageCode 
        });
      }
      
      console.log(`Language changed to: ${languageCode}`);
    } catch (error) {
      console.error('Error changing language:', error);
      toast({
        title: t('error'),
        description: "Failed to change language",
        variant: "destructive",
      });
    }
  };

  // Sync profile language with i18n on load
  React.useEffect(() => {
    if (profile?.preferred_language && profile.preferred_language !== i18n.language) {
      i18n.changeLanguage(profile.preferred_language);
    }
  }, [profile?.preferred_language, i18n]);

  if (compact) {
    return (
      <Select value={i18n.language} onValueChange={handleLanguageChange}>
        <SelectTrigger className="w-20 h-8 text-xs">
          <SelectValue>
            {languages.find(l => l.code === i18n.language)?.flag}
          </SelectValue>
        </SelectTrigger>
        <SelectContent>
          {languages.map((lang) => (
            <SelectItem key={lang.code} value={lang.code} className="text-xs">
              {lang.flag} {lang.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    );
  }

  return (
    <div className="flex items-center gap-2">
      {showLabel && (
        <Label className="text-sm text-muted-foreground">{t("language")}:</Label>
      )}
      <Select value={i18n.language} onValueChange={handleLanguageChange}>
        <SelectTrigger className="w-40">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {languages.map((lang) => (
            <SelectItem key={lang.code} value={lang.code}>
              {lang.flag} {lang.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
