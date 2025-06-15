
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

export default function AuthPage() {
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    // If user is already logged in, redirect home
    supabase.auth.getUser().then(({ data }) => {
      if (data?.user) navigate("/");
    });
  }, [navigate]);

  async function handleAuth(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true); setError(null);
    if (!email || !password) {
      setError("Please enter email and password.");
      setLoading(false);
      return;
    }
    try {
      if (mode === "login") {
        const { error } = await supabase.auth.signInWithPassword({
          email, password,
        });
        if (error) {
          setError(error.message);
          setLoading(false);
          return;
        }
        toast({ title: "Logged in!", description: "Welcome back 😊" });
        navigate("/ProfileSettings");
        return;
      } else {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: window.location.origin + "/",
          }
        });
        if (error) {
          setError(error.message);
          setLoading(false);
          return;
        }
        toast({ title: "Check your email!", description: "A confirmation link was sent." });
      }
    } catch (err: any) {
      setError(err.message ?? "An error occurred");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-white via-blue-50 to-slate-100">
      <div className="bg-white/90 p-8 rounded-2xl shadow-xl w-full max-w-md space-y-7 animate-fade-in">
        <h1 className="text-2xl font-bold text-primary text-center">{mode === "login" ? "Log in" : "Sign up"}</h1>
        <form className="space-y-4" onSubmit={handleAuth}>
          <div>
            <label className="block mb-1 font-medium text-sm">Email</label>
            <Input type="email" autoFocus value={email} onChange={e => setEmail(e.target.value)} />
          </div>
          <div>
            <label className="block mb-1 font-medium text-sm">Password</label>
            <Input type="password" value={password} onChange={e => setPassword(e.target.value)} />
          </div>
          <Button type="submit" className="w-full" disabled={loading}>{loading ? "Loading..." : mode === "login" ? "Log in" : "Sign up"}</Button>
          {error && <div className="text-destructive text-sm text-center mt-2">{error}</div>}
        </form>
        <div className="flex flex-col items-center gap-1">
          <Button
            variant="link"
            type="button"
            onClick={() => setMode(mode === "login" ? "signup" : "login")}
            className="px-0"
          >
            {mode === "login" ? "Don't have an account? Sign up" : "Have an account? Log in"}
          </Button>
        </div>
      </div>
    </div>
  );
}
