
import React, { useState } from "react";
import { Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";

// Helper for star picker
function StarSelect({ value, onChange }: { value: number, onChange: (n: number)=>void }) {
  return (
    <div className="flex flex-row gap-1 mb-4">
      {[1,2,3,4,5].map(n => (
        <button
          type="button"
          key={n}
          className={`group`}
          onClick={() => onChange(n)}
          aria-label={`Set rating ${n}`}
        >
          <Star className={`
            w-7 h-7
            ${value >= n ? "text-yellow-400 fill-yellow-300" : "text-gray-300"}
            transition-all duration-100
            group-hover:scale-110
          `}/>
        </button>
      ))}
    </div>
  );
}

// Sanitize input to avoid basic bad words or XSS (simple, demo purpose)
function sanitizeComment(text: string): string {
  // Replace < and > to avoid html/script
  let safe = text.replace(/</g, "&lt;").replace(/>/g, "&gt;");
  // Remove rudimentary inappropriate words (expand as needed)
  safe = safe.replace(/\b(fuck|shit|asshole|bitch)\b/gi, "***");
  return safe;
}

type Props = {
  taskId: string,
  reviewedUserId: string,
  onSuccess?: () => void
};

export default function ReviewForm({ taskId, reviewedUserId, onSuccess }: Props) {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [loading, setLoading] = useState(false);

  // Assume you have access to logged-in user's id through supabase.auth.getUser()
  const [reviewerId, setReviewerId] = useState<string | null>(null);

  React.useEffect(() => {
    supabase.auth.getUser().then((res) => {
      setReviewerId(res.data?.user?.id ?? null);
    });
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!rating) {
      toast({ title: "Please select a star rating.", variant: "destructive" });
      return;
    }
    if (!reviewerId) {
      toast({ title: "You must be logged in to submit a review.", variant: "destructive" });
      return;
    }
    setLoading(true);
    // Insert review (unique per reviewer+task in code)
    const { data, error } = await supabase
      .from("reviews")
      .insert([{
        task_id: taskId,
        reviewer_id: reviewerId,
        reviewed_user_id: reviewedUserId,
        rating,
        comment: sanitizeComment(comment),
      }]);
    setLoading(false);
    if (error) {
      toast({ title: "Error submitting review.", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Review submitted!" });
      setRating(0);
      setComment("");
      onSuccess && onSuccess();
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <label className="font-medium text-lg mb-2 block">Your rating</label>
      <StarSelect value={rating} onChange={setRating} />
      <label className="font-medium mt-4 block">Comment (optional)</label>
      <textarea
        className="w-full min-h-[60px] border border-gray-200 rounded p-2 mt-1 mb-5"
        value={comment}
        onChange={e => setComment(e.target.value)}
        placeholder="Add a comment..."
        maxLength={400}
      ></textarea>
      <Button type="submit" disabled={loading} className="w-full mt-2">
        {loading ? "Submitting..." : "Submit Review"}
      </Button>
    </form>
  );
}
