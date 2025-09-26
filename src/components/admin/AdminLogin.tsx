import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Eye, EyeOff, Lock, User } from "lucide-react";
import { getAuthToken, setAuthToken, removeAuthToken } from "@/api/auth";

interface AdminLoginProps {
  onLogin: (isAuthenticated: boolean) => void;
}

export const AdminLogin: React.FC<AdminLoginProps> = ({ onLogin }) => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const { toast } = useToast();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setIsLoading(true);

    try {
      // Build form-urlencoded body
      const body = new URLSearchParams();
    
      body.append("username", username);
      body.append("password", password);
     

      const res = await fetch(
        "https://fastapi.umeed.app/api/v1/admin/admin/login",
        {
          method: "POST",
          headers: {
            "Accept": "application/json",
            "Content-Type": "application/x-www-form-urlencoded",
          },
          body: body.toString(),
        }
      );

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        // Try to pick a helpful message from response
        const msg =
          (data && (data.detail || data.message || data.error)) ||
          `Login failed: ${res.statusText || res.status}`;
        setErrorMsg(msg);
        toast({
          title: "Login Failed",
          description: msg,
          variant: "destructive",
        });
        setIsLoading(false);
        return;
      }

      // Expecting { access_token: "...", token_type: "bearer", ... }
      const accessToken = data?.access_token;
      if (!accessToken) {
        const msg = "Login did not return an access token.";
        setErrorMsg(msg);
        toast({
          title: "Login Failed",
          description: msg,
          variant: "destructive",
        });
        setIsLoading(false);
        return;
      }

      // Save token and notify parent
      setAuthToken(accessToken);

      toast({
        title: "Login Successful",
        description: "Welcome to Umeed Admin Panel",
      });

      onLogin(true);
    } catch (err: any) {
      const msg = err?.message ?? "Network error during login.";
      setErrorMsg(msg);
      toast({
        title: "Login Failed",
        description: msg,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Clear inline error when user types
  const onUsernameChange = (v: string) => {
    setUsername(v);
    if (errorMsg) setErrorMsg(null);
  };
  const onPasswordChange = (v: string) => {
    setPassword(v);
    if (errorMsg) setErrorMsg(null);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/5 via-background to-primary/10 p-4">
      <Card className="w-full max-w-md shadow-2xl border-0 bg-card/80 backdrop-blur">
        <CardHeader className="text-center space-y-4">
          <div className="mx-auto w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
            <Lock className="h-8 w-8 text-primary" />
          </div>
          <CardTitle className="text-2xl font-bold text-foreground">
            Admin Login
          </CardTitle>
          <CardDescription className="text-muted-foreground">
            Enter your credentials to access Umeed Admin Panel
          </CardDescription>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4" noValidate>
            <div className="space-y-2">
              <Label htmlFor="username" className="text-sm font-medium">
                Username (email)
              </Label>
              <div className="relative">
                <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="username"
                  type="email"
                  placeholder="you@example.com"
                  value={username}
                  onChange={(e) => onUsernameChange(e.target.value)}
                  className="pl-9"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-sm font-medium">
                Password
              </Label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter password"
                  value={password}
                  onChange={(e) => onPasswordChange(e.target.value)}
                  className="pl-9 pr-9"
                  required
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-1 top-1 h-8 w-8 p-0"
                  onClick={() => setShowPassword((s) => !s)}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>

            {errorMsg && (
              <p className="text-sm text-destructive mt-1" role="alert">
                {errorMsg}
              </p>
            )}

            <Button
              type="submit"
              className="w-full"
              disabled={isLoading || !username || !password}
            >
              {isLoading ? "Signing in..." : "Sign In"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminLogin;
