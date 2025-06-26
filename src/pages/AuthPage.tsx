
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
  const [isProcessingAuth, setIsProcessingAuth] = useState(false);
  const [processingTimeout, setProcessingTimeout] = useState<NodeJS.Timeout | null>(null);
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

  // Handle auth state changes for regular sign-in (not email confirmation)
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('AuthPage: Auth state changed:', event, session?.user?.id);
      
      // Only handle SIGNED_IN events that are NOT from email confirmation
      if (event === 'SIGNED_IN' && session?.user && !window.location.hash.includes('access_token')) {
        console.log('AuthPage: Regular sign-in detected, processing...');
        setIsProcessingAuth(true);
        
        // Set timeout protection
        const timeout = setTimeout(() => {
          console.warn('AuthPage: Processing timeout reached, clearing state');
          setIsProcessingAuth(false);
          toast.error('Authentication took too long. Please try again.');
        }, 8000);
        
        setProcessingTimeout(timeout);
        
        try {
          console.log('AuthPage: Triggering redirect after regular sign-in');
          await redirectAfterAuth();
        } catch (error) {
          console.error('AuthPage: Error handling regular sign-in:', error);
          toast.error('Authentication error occurred');
        } finally {
          clearTimeout(timeout);
          setIsProcessingAuth(false);
        }
      }
    });

    return () => subscription.unsubscribe();
  }, [redirectAfterAuth]);

  // Clear processing timeout on unmount
  useEffect(() => {
    return () => {
      if (processingTimeout) {
        clearTimeout(processingTimeout);
      }
    };
  }, [processingTimeout]);

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (password !== confirmPassword) {
      toast.error("Passwords don't match");
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

      if (error) throw error;

      console.log('AuthPage: Sign up response:', { user: data.user?.id, session: !!data.session, role: selectedRole });

      if (data.user && !data.session) {
        // User needs to confirm email
        console.log('AuthPage: User needs to confirm email');
        toast.success("Account created! Please check your email for a confirmation link.");
      } else if (data.session) {
        // User is immediately signed in (email confirmation disabled)
        console.log('AuthPage: User immediately signed in');
        toast.success("Account created successfully!");
        // The auth state change will handle the redirect
      }
    } catch (error: any) {
      console.error('AuthPage: Sign up error:', error);
      toast.error(error.message || "Failed to create account");
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

      if (error) throw error;

      console.log('AuthPage: Sign in successful');
      toast.success("Signed in successfully!");
      // The auth state change will handle the redirect
    } catch (error: any) {
      console.error('AuthPage: Sign in error:', error);
      toast.error(error.message || "Failed to sign in");
    } finally {
      setLoading(false);
    }
  };

  const handleRetryAuth = async () => {
    console.log('AuthPage: Retrying authentication');
    setIsProcessingAuth(false);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        await redirectAfterAuth();
      } else {
        toast.error('No active session found. Please sign in again.');
      }
    } catch (error) {
      console.error('AuthPage: Retry auth error:', error);
      toast.error('Failed to retry authentication');
    }
  };

  const handleForceSignOut = async () => {
    console.log('AuthPage: Force signing out');
    setIsProcessingAuth(false);
    await supabase.auth.signOut();
    toast.info('Signed out. Please try signing in again.');
  };

  if (isProcessingAuth) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-white via-blue-50 to-slate-100">
        <div className="text-center max-w-md">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-lg text-muted-foreground mb-4">Processing authentication...</p>
          <div className="space-y-2">
            <Button 
              variant="outline" 
              onClick={handleRetryAuth}
              className="w-full"
            >
              Retry Authentication
            </Button>
            <Button 
              variant="ghost" 
              onClick={handleForceSignOut}
              className="w-full text-sm"
            >
              Sign Out & Try Again
            </Button>
          </div>
        </div>
      </div>
    );
  }

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
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="signup-password">Password</Label>
                  <Input
                    id="signup-password"
                    type="password"
                    placeholder="Create a password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
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
        </CardContent>
      </Card>
    </div>
  );
}
