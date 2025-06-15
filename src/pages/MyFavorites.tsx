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
  avatar_url?: string | null;
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
    // Remove non-existent avatar_url column from join hint!
    supabase
      .from("favorites")
      .select("id, provider_id, created_at, provider:app_users!favorites_provider_id_fkey(id,name)")
      .eq("customer_id", profile.id)
      .order("created_at", { ascending: false })
      .then(({ data }) => {
        if (Array.isArray(data)) {
          setFavorites(
            // Only keep when provider exists with required fields
            data.filter((fav) => fav.provider && fav.provider.id && fav.provider.name)
          );
        } else {
          setFavorites([]);
        }
        setLoading(false);
      });
  }, [profile?.id]);

  if (isLoading || loading) {
    return <div className="text-center py-12">Loading...</div>;
  }

  if (!favorites.length) {
    return (
      <div className="max-w-xl mx-auto pt-12 text-center">
        <h2 className="text-2xl font-bold mb-3">No Saved Providers</h2>
        <p className="text-muted-foreground max-w-sm mx-auto">
          When you save a provider as a favorite, they’ll appear here so you can message or quickly rehire them.
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-2 py-8">
      <h1 className="text-3xl font-bold mb-6">My Favorite Providers</h1>
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
    <Card className="flex items-center gap-4 p-5">
      <div className="flex-shrink-0">
        {/* No avatar_url from backend, always use fallback */}
        <div className="w-14 h-14 rounded-full bg-gray-200 flex items-center justify-center text-2xl">
          {provider.name?.[0]?.toUpperCase() || "P"}
        </div>
      </div>
      <div className="flex-1 min-w-0">
        <div className="font-bold text-lg truncate">{provider.name || "(No Name)"}</div>
        <div className="flex items-center gap-1 text-sm text-yellow-600 mt-1">
          <Star className="h-4 w-4 text-yellow-400 fill-yellow-300" />
          <span>{avgRating !== null ? avgRating : "-"}</span>
          <span className="ml-1 text-xs text-gray-400">(avg rating)</span>
        </div>
      </div>
      <Button
        variant="secondary"
        className="shrink-0"
        onClick={onNewTask}
        type="button"
      >
        Post New Task
      </Button>
    </Card>
  );
}
