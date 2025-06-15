
export type Provider = {
  id: string;
  name: string | null;
  avatar_url?: string | null;
};

export type Favorite = {
  id: string;
  provider_id: string;
  created_at: string;
  provider: Provider;
};

export type TaskStatus = "open" | "in_progress" | "done" | "completed" | "cancelled";
