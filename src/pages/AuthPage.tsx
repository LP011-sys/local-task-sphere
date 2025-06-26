
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { useAuthRedirect } from "@/hooks/useAuthRedirect";
import RoleSelector from "@/components/signup/RoleSelector";

type Role = "customer" | "provider";

export default function AuthPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [name, setName] = useState("");
  const [selectedRole, setSelectedRole] = useState<Role>("customer");
  const [loading, setLoading] = useState(false);
  const [authTimeout, setAuthTimeout] = useState<NodeJS.Timeout | null>(null);
  const navigate = useNavigate();
  const { redirectAfterAuth } = useAuthRedirect();

  useEffect(() => {
    // Check if user is already authenticated
    const checkAuth = async () => {
      console.log('AuthPage: Checking existing auth state');
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        console.log('AuthPage: User already authenticated, redirecting');
        await redirectAfterAuth();
      }
    };
    checkAuth();
  }, [redirectAfterAuth]);

  // Handle auth state changes for sign-in only
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('AuthPage: Auth state changed:', event);
      
      if (event === 'SIGNED_IN' && session?.user) {
        console.log('AuthPage: User signed in, processing...');
        
        // Set timeout protection
        const timeout = setTimeout(() => {
          console.warn('AuthPage: Auth processing timeout');
          setLoading(false);
          toast.error('Authentication is taking longer than expected. You can try refreshing the page.');
        }, 10000);
        
        setAuthTimeout(timeout);
        
        try {
          await redirectAfterAuth();
        } catch (error) {
          console.error('AuthPage: Redirect error:', error);
          toast.error('Authentication error occurred');
        } finally {
          clearTimeout(timeout);
          setLoading(false);
        }
      } else if (event === 'SIGNED_OUT') {
        setLoading(false);
        if (authTimeout) {
          clearTimeout(authTimeout);
        }
      }
    });

    return () => {
      subscription.unsubscribe();
      if (authTimeout) {
        clearTimeout(authTimeout);
      }
    };
  }, [redirectAfterAuth, authTimeout]);

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (password !== confirmPassword) {
      toast.error("Passwords don't match");
      return;
    }

    if (password.length < 6) {
      toast.error("Password must be at least 6 characters long");
      return;
    }

    setLoading(true);
    try {
      console.log('AuthPage: Signing up user with role:', selectedRole);
      
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
          data: {
            name,
            roles: [selectedRole],
            active_role: selectedRole
          }
        }
      });

      if (error) {
        console.error('AuthPage: Sign up error:', error);
        throw error;
      }

      console.log('AuthPage: Sign up response:', { 
        user: data.user?.id, 
        session: !!data.session, 
        role: selectedRole 
      });

      if (data.user && !data.session) {
        toast.success("Account created! Please check your email for a confirmation link.");
        // Reset form
        setEmail("");
        setPassword("");
        setConfirmPassword("");
        setName("");
      } else if (data.session) {
        toast.success("Account created successfully!");
        // Auth state change will handle redirect
      }
    } catch (error: any) {
      console.error('AuthPage: Sign up error:', error);
      
      // Provide specific error messages
      if (error.message?.includes('already registered')) {
        toast.error("An account with this email already exists. Please sign in instead.");
      } else if (error.message?.includes('invalid email')) {
        toast.error("Please enter a valid email address.");
      } else if (error.message?.includes('weak password')) {
        toast.error("Password is too weak. Please choose a stronger password.");
      } else {
        toast.error(error.message || "Failed to create account. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      console.log('AuthPage: Signing in user');
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        console.error('AuthPage: Sign in error:', error);
        throw error;
      }

      console.log('AuthPage: Sign in successful');
      toast.success("Signed in successfully!");
    } catch (error: any) {
      console.error('AuthPage: Sign in error:', error);
      
      // Provide specific error messages
      if (error.message?.includes('Invalid login credentials')) {
        toast.error("Invalid email or password. Please check your credentials and try again.");
      } else if (error.message?.includes('Email not confirmed')) {
        toast.error("Please check your email and click the confirmation link before signing in.");
      } else {
        toast.error(error.message || "Failed to sign in. Please try again.");
      }
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-white via-blue-50 to-slate-100 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold text-primary">Welcome</CardTitle>
          <CardDescription>Sign in to your account or create a new one</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="signin" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="signin">Sign In</TabsTrigger>
              <TabsTrigger value="signup">Sign Up</TabsTrigger>
            </TabsList>
            
            <TabsContent value="signin">
              <form onSubmit={handleSignIn} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="signin-email">Email</Label>
                  <Input
                    id="signin-email"
                    type="email"
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    disabled={loading}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="signin-password">Password</Label>
                  <Input
                    id="signin-password"
                    type="password"
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    disabled={loading}
                  />
                </div>
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? "Signing in..." : "Sign In"}
                </Button>
              </form>
            </TabsContent>
            
            <TabsContent value="signup">
              <form onSubmit={handleSignUp} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="signup-name">Full Name</Label>
                  <Input
                    id="signup-name"
                    type="text"
                    placeholder="Enter your full name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    disabled={loading}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="signup-email">Email</Label>
                  <Input
                    id="signup-email"
                    type="email"
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    disabled={loading}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="signup-password">Password</Label>
                  <Input
                    id="signup-password"
                    type="password"
                    placeholder="Create a password (min 6 characters)"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    disabled={loading}
                    minLength={6}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirm-password">Confirm Password</Label>
                  <Input
                    id="confirm-password"
                    type="password"
                    placeholder="Confirm your password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    disabled={loading}
                  />
                </div>
                
                <RoleSelector 
                  selectedRole={selectedRole}
                  onRoleChange={setSelectedRole}
                />
                
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? "Creating account..." : `Sign Up as ${selectedRole === 'customer' ? 'Customer' : 'Provider'}`}
                </Button>
              </form>
            </TabsContent>
          </Tabs>
          
          {loading && (
            <div className="mt-4 text-center text-sm text-muted-foreground">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary mx-auto mb-2"></div>
              Processing... This may take a moment.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
