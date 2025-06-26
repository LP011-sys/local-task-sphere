
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
import AuthCallback from "@/components/auth/AuthCallback";

type Role = "customer" | "provider";

export default function AuthPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [name, setName] = useState("");
  const [selectedRole, setSelectedRole] = useState<Role>("customer");
  const [loading, setLoading] = useState(false);
  const [isProcessingAuth, setIsProcessingAuth] = useState(false);
  const navigate = useNavigate();
  const { redirectAfterAuth } = useAuthRedirect();

  useEffect(() => {
    // Check if user is already authenticated
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        await redirectAfterAuth();
      }
    };
    checkAuth();
  }, [redirectAfterAuth]);

  // Handle auth state changes for email confirmation and sign-in
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('Auth state changed:', event, session?.user?.id);
      
      if (event === 'SIGNED_IN' && session?.user) {
        setIsProcessingAuth(true);
        
        try {
          // Check if profile exists
          const { data: existingProfile } = await supabase
            .from('app_users')
            .select('id, profile_completed')
            .eq('auth_user_id', session.user.id)
            .single();

          // If no profile exists, create one with user metadata
          if (!existingProfile) {
            console.log('Creating profile for user:', session.user.id);
            const userMetadata = session.user.user_metadata;
            const userRole = userMetadata?.active_role || userMetadata?.roles?.[0] || 'customer';
            const userRoles = userMetadata?.roles || [userRole];

            const { error: profileError } = await supabase
              .from('app_users')
              .insert({
                auth_user_id: session.user.id,
                email: session.user.email,
                name: userMetadata?.name || '',
                roles: userRoles,
                active_role: userRole,
                role: userRole // For backward compatibility
              });

            if (profileError) {
              console.error('Profile creation error:', profileError);
              toast.error('Failed to create user profile');
              return;
            }

            console.log('Profile created successfully with role:', userRole);
          }

          // Redirect after successful authentication and profile creation
          await redirectAfterAuth();
        } catch (error) {
          console.error('Error handling auth state change:', error);
          toast.error('Authentication error occurred');
        } finally {
          setIsProcessingAuth(false);
        }
      }
    });

    return () => subscription.unsubscribe();
  }, [redirectAfterAuth]);

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (password !== confirmPassword) {
      toast.error("Passwords don't match");
      return;
    }

    setLoading(true);
    try {
      console.log('Signing up user with role:', selectedRole);
      
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name,
            roles: [selectedRole],
            active_role: selectedRole
          }
        }
      });

      if (error) throw error;

      if (data.user && !data.session) {
        // User needs to confirm email
        toast.success("Account created! Please check your email for a confirmation link.");
      } else if (data.session) {
        // User is immediately signed in (email confirmation disabled)
        toast.success("Account created successfully!");
      }
    } catch (error: any) {
      console.error('Sign up error:', error);
      toast.error(error.message || "Failed to create account");
    } finally {
      setLoading(false);
    }
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      toast.success("Signed in successfully!");
    } catch (error: any) {
      console.error('Sign in error:', error);
      toast.error(error.message || "Failed to sign in");
    } finally {
      setLoading(false);
    }
  };

  const handleAuthSuccess = async () => {
    setIsProcessingAuth(true);
    try {
      await redirectAfterAuth();
    } catch (error) {
      console.error('Error redirecting after auth:', error);
    } finally {
      setIsProcessingAuth(false);
    }
  };

  if (isProcessingAuth) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-white via-blue-50 to-slate-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-lg text-muted-foreground">Processing authentication...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-white via-blue-50 to-slate-100 p-4">
      <AuthCallback onAuthSuccess={handleAuthSuccess} />
      
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
                  {loading ? "Creating account..." : "Sign Up"}
                </Button>
              </form>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
