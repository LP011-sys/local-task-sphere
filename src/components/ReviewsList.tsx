
import React from "react";
import { Star } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

type Review = {
  id: string,
  rating: number,
  comment: string,
  created_at: string,
  reviewer_id: string,
  task_id: string
};

type Props = {
  userId: string;
};

export default function ReviewsList({ userId }: Props) {
  const [reviews, setReviews] = React.useState<Review[]>([]);
  const [average, setAverage] = React.useState<number | null>(null);

  React.useEffect(() => {
    // Get all reviews about this user
    supabase
      .from("reviews")
      .select("*")
      .eq("reviewed_user_id", userId)
      .order("created_at", { ascending: false })
      .then(({ data }) => {
        setReviews(data ?? []);
        if (data && data.length)
          setAverage(
            +(data.reduce((acc, r) => acc + (r.rating || 0), 0) / data.length).toFixed(2)
          );
        else setAverage(null);
      });
  }, [userId]);

  if (!reviews.length)
    return <div>No reviews yet.</div>;

  return (
    <div>
      <div className="flex items-center gap-2 mb-4">
        <Star className="text-yellow-400 fill-yellow-300" /> 
        <span className="font-bold text-lg">
          {average ?? "-"}
        </span>
        <span className="text-gray-600 text-sm">
          ({reviews.length} review{reviews.length > 1 ? "s" : ""})
        </span>
      </div>
      <div className="flex flex-col gap-4">
        {reviews.map(r => (
          <div key={r.id} className="border rounded-lg p-4 shadow bg-white">
            <div className="flex items-center gap-2 mb-1">
              {[...Array(r.rating)].map((_,i)=><Star key={i} className="w-5 h-5 text-yellow-400 fill-yellow-300"/>)}
              <span className="ml-2 text-sm text-gray-500">{new Date(r.created_at).toLocaleString()}</span>
            </div>
            <div className="text-gray-700 mb-1">{r.comment}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
