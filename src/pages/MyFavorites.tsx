
import React from "react";
import { supabase } from "@/integrations/supabase/client";
import { useCurrentUserProfile } from "@/hooks/useCurrentUserProfile";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Star } from "lucide-react";
import { useNavigate } from "react-router-dom";

// Type for a provider
type Provider = {
  id: string;
  name: string | null;
};

// Type for a favorite entry
type Favorite = {
  id: string;
  provider_id: string;
  created_at: string;
  provider: Provider;
};

export default function MyFavoritesPage() {
  // Get currently logged in user's id via Supabase auth
  const [userId, setUserId] = React.useState<string | null>(null);

  React.useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setUserId(data?.user?.id ?? null);
    });
  }, []);

  // Use the hook with userId
  const { data: profile, isLoading } = useCurrentUserProfile(userId ?? undefined);
  const [favorites, setFavorites] = React.useState<Favorite[]>([]);
  const [loading, setLoading] = React.useState(true);
  const navigate = useNavigate();

  React.useEffect(() => {
    if (!profile?.id) return;
    setLoading(true);
    supabase
      .from("favorites")
      .select("id, provider_id, created_at, provider:app_users!favorites_provider_id_fkey(id,name)")
      .eq("customer_id", profile.id)
      .order("created_at", { ascending: false })
      .then(({ data }) => {
        if (Array.isArray(data)) {
          setFavorites(
            data.filter((fav) => fav.provider && fav.provider.id && fav.provider.name)
          );
        } else {
          setFavorites([]);
        }
        setLoading(false);
      });
  }, [profile?.id]);

  if (isLoading || loading) {
    return (
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8 flex justify-center items-center h-80">
        <div className="text-center text-muted-foreground text-lg">Loading...</div>
      </div>
    );
  }

  if (!favorites.length) {
    return (
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8">
        <div className="bg-white rounded-xl shadow-md p-6 border flex flex-col gap-4 items-center">
          <h2 className="text-xl font-bold mb-1">No Saved Providers</h2>
          <p className="text-sm text-muted-foreground max-w-md mx-auto">
            When you save a provider as a favorite, they’ll appear here so you can message or quickly rehire them.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8 space-y-6">
      <h1 className="text-xl font-bold mb-4">My Favorite Providers</h1>
      <div className="flex flex-col gap-6">
        {favorites.map(fav => (
          <ProviderCard
            key={fav.id}
            provider={fav.provider}
            onNewTask={() => {
              navigate(`/task-create?provider_id=${fav.provider.id}`);
            }}
          />
        ))}
      </div>
    </div>
  );
}

// Helper to fetch average rating
async function getProviderAverageRating(providerId: string): Promise<number | null> {
  const { data } = await supabase
    .from("reviews")
    .select("rating")
    .eq("reviewed_user_id", providerId);

  if (data && data.length > 0) {
    const avg =
      data.reduce((sum, r) => sum + (r.rating || 0), 0) / data.length;
    return Number(avg.toFixed(2));
  }
  return null;
}

function ProviderCard({
  provider,
  onNewTask,
}: {
  provider: Provider;
  onNewTask: () => void;
}) {
  const [avgRating, setAvgRating] = React.useState<number | null>(null);

  React.useEffect(() => {
    getProviderAverageRating(provider.id).then(setAvgRating);
  }, [provider.id]);

  return (
    <div className="bg-white rounded-xl shadow-md p-6 border flex items-center gap-4 w-full">
      <div className="flex-shrink-0">
        {/* Fallback avatar with initial */}
        <div className="w-14 h-14 rounded-full bg-gray-200 flex items-center justify-center text-2xl text-primary font-bold border">
          {provider.name?.[0]?.toUpperCase() || "P"}
        </div>
      </div>
      <div className="flex-1 min-w-0 space-y-1">
        <div className="font-bold text-lg truncate">{provider.name || "(No Name)"}</div>
        <div className="flex items-center gap-1 text-yellow-600 mt-1">
          <Star className="h-4 w-4 text-yellow-400 fill-yellow-300" />
          <span className="font-medium">{avgRating !== null ? avgRating : "-"}</span>
          <span className="ml-1 text-xs text-muted-foreground">(avg rating)</span>
        </div>
      </div>
      <Button
        variant="default"
        className="shrink-0 min-w-[120px] ml-auto"
        onClick={onNewTask}
        type="button"
      >
        Post New Task
      </Button>
    </div>
  );
}

