
import React from "react";
import { supabase } from "@/integrations/supabase/client";
import { Heart } from "lucide-react";
import { Button } from "@/components/ui/button";

// Props:
// - providerId: uuid of the provider to favorite
// - customerId: uuid of the current customer user (from user session/profile)
// - className (optional): for styling
export function FavoriteButton({
  providerId,
  customerId,
  className = "",
}: {
  providerId: string;
  customerId: string;
  className?: string;
}) {
  const [isFavorited, setIsFavorited] = React.useState(false);
  const [loading, setLoading] = React.useState(true);
  const [favId, setFavId] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (!providerId || !customerId) return;
    setLoading(true);
    supabase
      .from("favorites")
      .select("id")
      .eq("provider_id", providerId)
      .eq("customer_id", customerId)
      .single()
      .then(({ data, error }) => {
        if (data) {
          setIsFavorited(true);
          setFavId(data.id);
        } else {
          setIsFavorited(false);
          setFavId(null);
        }
        setLoading(false);
      });
  }, [providerId, customerId]);

  const handleToggle = async () => {
    setLoading(true);
    if (isFavorited && favId) {
      // Unfavorite: delete
      await supabase.from("favorites").delete().eq("id", favId);
      setIsFavorited(false);
      setFavId(null);
    } else {
      // Favorite: insert
      const { data, error } = await supabase.from("favorites").insert([
        {
          customer_id: customerId,
          provider_id: providerId,
        },
      ]).select().single();
      if (data) {
        setIsFavorited(true);
        setFavId(data.id);
      }
    }
    setLoading(false);
  };

  return (
    <Button
      variant="ghost"
      onClick={handleToggle}
      disabled={loading}
      className={className + " flex items-center"}
      aria-label={isFavorited ? "Unfavorite provider" : "Favorite provider"}
      type="button"
    >
      <Heart
        className={isFavorited ? "text-red-500 fill-red-400" : "text-gray-400"}
        fill={isFavorited ? "#f87171" : "none"}
      />
      <span className="ml-2 text-sm">{isFavorited ? "Saved" : "Save Provider"}</span>
    </Button>
  );
}
