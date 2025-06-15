
// Date and helper formatting utilities
import { format } from "date-fns";

// Returns "7h 44m" etc.
export function formatTimeRemaining(iso: string) {
  const deadline = new Date(iso).getTime();
  const now = Date.now();
  if (now > deadline) return "Expired";
  const mins = Math.floor((deadline - now) / (1000 * 60));
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return `${h}h ${m}m`;
}

export function formatDate(date: string) {
  try {
    return format(new Date(date), "dd MMM yyyy, HH:mm");
  } catch {
    return date;
  }
}
