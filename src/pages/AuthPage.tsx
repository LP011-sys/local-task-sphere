import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useAuthRedirect } from "@/hooks/useAuthRedirect";
import { FcGoogle } from "react-icons/fc";
import { SiApple } from "react-icons/si";
import RoleSelector from "@/components/signup/RoleSelector";

type Role = "customer" | "provider";

export default function AuthPage() {
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [emailSent, setEmailSent] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();
  const { redirectAfterAuth } = useAuthRedirect();

  useEffect(() => {
    // If user is already logged in, redirect them
    supabase.auth.getUser().then(({ data }) => {
      if (data?.user) {
        redirectAfterAuth();
      }
    });

    // Listen for auth state changes to handle email confirmation and profile creation
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('Auth state change:', event, session?.user?.id);
      
      if (event === 'SIGNED_IN' && session?.user) {
        try {
          // Check if user profile exists
          const { data: existingProfile, error: profileError } = await supabase
            .from('app_users')
            .select('id, role, roles, active_role, profile_completed, basic_profile_completed')
            .eq('auth_user_id', session.user.id)
            .single();

          console.log('Existing profile:', existingProfile, 'Error:', profileError);

          if (!existingProfile) {
            // Create user profile with role information from metadata or default to customer
            const userMetadata = session.user.user_metadata || {};
            const roles = userMetadata.roles || ['customer'];
            const activeRole = userMetadata.active_role || roles[0] || 'customer';

            console.log('Creating profile with roles:', roles, 'active_role:', activeRole);

            const { error: insertError } = await supabase
              .from('app_users')
              .insert({
                auth_user_id: session.user.id,
                email: session.user.email,
                name: session.user.user_metadata?.full_name || session.user.user_metadata?.name || null,
                role: activeRole,
                roles: roles,
                active_role: activeRole,
                profile_completed: false,
                basic_profile_completed: false
              });

            if (insertError) {
              console.error('Profile creation error:', insertError);
              toast({ 
                title: "Profile creation failed", 
                description: insertError.message, 
                variant: "destructive" 
              });
              return;
            }

            console.log('Profile created successfully');
            
            // Redirect to profile completion
            setTimeout(() => {
              if (activeRole === 'customer') {
                navigate('/complete-profile/customer');
              } else if (activeRole === 'provider') {
                navigate('/complete-profile/provider');
              } else {
                redirectAfterAuth();
              }
            }, 500);
          } else {
            // Profile exists, check if completed
            if (!existingProfile.profile_completed) {
              const userRole = existingProfile.active_role || existingProfile.role;
              if (userRole === 'customer') {
                navigate('/complete-profile/customer');
              } else if (userRole === 'provider') {
                if (!existingProfile.basic_profile_completed) {
                  navigate('/complete-profile/provider');
                } else {
                  navigate('/complete-profile/provider/verify');
                }
              }
            } else {
              // Profile complete, redirect to dashboard
              setTimeout(() => {
                redirectAfterAuth();
              }, 500);
            }
          }

        } catch (error) {
          console.error('Error handling auth state change:', error);
          toast({ 
            title: "Authentication error", 
            description: "There was an issue setting up your profile", 
            variant: "destructive" 
          });
        }
      }
    });

    return () => subscription.unsubscribe();
  }, [redirectAfterAuth, toast, navigate]);

  async function handleAuth(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true); 
    setError(null);
    
    if (!email || !password) {
      setError("Please enter email and password.");
      setLoading(false);
      return;
    }

    // For signup, require role selection
    if (mode === "signup" && !selectedRole) {
      setError("Please select whether you're a Customer or Provider.");
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
        // The auth state change listener will handle the redirect
        return;
      } else {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: window.location.origin + "/",
            data: {
              roles: [selectedRole!],
              active_role: selectedRole!
            }
          }
        });
        
        if (error) {
          setError(error.message);
          setLoading(false);
          return;
        }
        
        setEmailSent(true);
        toast({ title: "Check your email!", description: "A confirmation link was sent." });
      }
    } catch (err: any) {
      setError(err.message ?? "An error occurred");
    } finally {
      setLoading(false);
    }
  }

  async function handleOAuth(provider: "google" | "apple") {
    setLoading(true); 
    setError(null);
    
    const { error } = await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: window.location.origin + "/",
      }
    });
    
    if (error) {
      setError(error.message);
      setLoading(false);
    }
    // Supabase will redirect on success
  }

  // Show email confirmation message after successful signup
  if (emailSent) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-white via-blue-50 to-slate-100">
        <div className="bg-white/90 p-8 rounded-2xl shadow-xl w-full max-w-md space-y-7 animate-fade-in text-center">
          <a
            href="/"
            className="self-center font-bold text-2xl tracking-tight text-primary hover:underline focus:outline-none mb-2 block"
            aria-label="Task Hub Home"
          >
            Task Hub
          </a>
          <div className="space-y-4">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
              <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-primary">Check your email</h1>
            <p className="text-muted-foreground">
              We've sent a confirmation link to <strong>{email}</strong>
            </p>
            <p className="text-sm text-muted-foreground">
              Click the link in your email to verify your account and complete the signup process.
            </p>
          </div>
          <Button
            variant="outline"
            onClick={() => {
              setEmailSent(false);
              setMode("login");
            }}
            className="w-full"
          >
            Back to Login
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-white via-blue-50 to-slate-100">
      <div className="bg-white/90 p-8 rounded-2xl shadow-xl w-full max-w-md space-y-7 animate-fade-in">
        {/* Clickable logo to home */}
        <a
          href="/"
          className="self-center font-bold text-2xl tracking-tight text-primary hover:underline focus:outline-none mb-2 block text-center"
          aria-label="Task Hub Home"
          tabIndex={0}
        >
          Task Hub
        </a>
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
          
          {/* Role selection for signup */}
          {mode === "signup" && (
            <RoleSelector 
              selectedRole={selectedRole}
              onRoleChange={setSelectedRole}
            />
          )}
          
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Loading..." : mode === "login" ? "Log in" : "Sign up"}
          </Button>
          {error && <div className="text-destructive text-sm text-center mt-2">{error}</div>}
        </form>

        <div className="flex items-center gap-3 my-2">
          <div className="flex-1 h-px bg-muted-foreground/20"/>
          <span className="text-xs text-muted-foreground">or</span>
          <div className="flex-1 h-px bg-muted-foreground/20"/>
        </div>
        <div className="flex flex-col gap-2">
          <Button
            variant="outline"
            className="w-full flex items-center justify-center gap-2"
            type="button"
            disabled={loading}
            onClick={() => handleOAuth("google")}
          >
            <span><FcGoogle /></span>Sign {mode === "login" ? "in" : "up"} with Google
          </Button>
          <Button
            variant="outline"
            className="w-full flex items-center justify-center gap-2"
            type="button"
            disabled={loading}
            onClick={() => handleOAuth("apple")}
          >
            <span><SiApple /></span>Sign {mode === "login" ? "in" : "up"} with Apple
          </Button>
        </div>
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
