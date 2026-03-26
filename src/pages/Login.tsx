import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Package, Mail, Lock, Eye, EyeOff, Package2, Zap, Shield, TrendingUp } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { Alert, AlertDescription } from "@/components/ui/alert";

export default function Login() {
  const navigate = useNavigate();
  const { login, register } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [isRegister, setIsRegister] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");

  // ✅ Login state
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");

  // ✅ Signup state
  const [signupName, setSignupName] = useState("");
  const [signupEmail, setSignupEmail] = useState("");
  const [signupPassword, setSignupPassword] = useState("");

  // ✅ LOGIN HANDLER
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!loginEmail.trim() || !loginPassword.trim()) {
      setError("Email and password are required");
      return;
    }

    setIsLoading(true);
    try {
      await login(loginEmail, loginPassword);
      toast.success("Login successful!");
      navigate("/dashboard");
    } catch (err: any) {
      const errorMsg = err.response?.data?.message || "Invalid credentials";
      setError(errorMsg);
      toast.error(errorMsg);
    } finally {
      setIsLoading(false);
    }
  };

  // ✅ SIGNUP HANDLER
  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!signupName.trim() || !signupEmail.trim() || !signupPassword.trim()) {
      setError("All fields are required");
      return;
    }

    setIsLoading(true);
    try {
      await register(signupName, signupEmail, signupPassword);
      toast.success("Account created successfully!");
      navigate("/dashboard");
    } catch (err: any) {
      const errorMsg = err.response?.data?.message || "Something went wrong";
      setError(errorMsg);
      toast.error(errorMsg);
    } finally {
      setIsLoading(false);
    }
  };

  const companyName = import.meta.env.VITE_COMPANY_NAME || "AssetFlow";
  const companyTagline = import.meta.env.VITE_COMPANY_TAGLINE || "Asset Lifecycle Management";

  return (
    <div className="min-h-screen flex bg-background">
      {/* LEFT SIDE - BRANDING (Desktop only) */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-primary via-primary to-primary/80 flex-col justify-center px-12 py-8 relative overflow-hidden">
        {/* Background decoration */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-10 w-72 h-72 bg-white rounded-full blur-3xl"></div>
          <div className="absolute bottom-10 right-10 w-96 h-96 bg-white rounded-full blur-3xl"></div>
        </div>

        <div className="relative z-10 space-y-8">
          {/* Logo & Company Name */}
          <div className="space-y-4">
            <div className="inline-flex items-center justify-center w-24 h-24 rounded-3xl bg-white/20 backdrop-blur-md border border-white/30 shadow-lg hover:scale-105 transition-transform">
              <Package className="w-12 h-12 text-white" />
            </div>
            <div>
              <h1 className="text-5xl font-bold text-white">{companyName}</h1>
              <p className="text-white/80 text-lg mt-2">{companyTagline}</p>
            </div>
          </div>

          {/* Features Grid */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-3 bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/20">
              <div className="inline-flex items-center justify-center w-10 h-10 rounded-lg bg-white/20">
                <Package2 className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-white">Asset Tracking</h3>
                <p className="text-sm text-white/70">Real-time monitoring</p>
              </div>
            </div>
            <div className="space-y-3 bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/20">
              <div className="inline-flex items-center justify-center w-10 h-10 rounded-lg bg-white/20">
                <Zap className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-white">Quick Setup</h3>
                <p className="text-sm text-white/70">Get started instantly</p>
              </div>
            </div>
            <div className="space-y-3 bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/20">
              <div className="inline-flex items-center justify-center w-10 h-10 rounded-lg bg-white/20">
                <Shield className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-white">Secure</h3>
                <p className="text-sm text-white/70">Enterprise grade security</p>
              </div>
            </div>
            <div className="space-y-3 bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/20">
              <div className="inline-flex items-center justify-center w-10 h-10 rounded-lg bg-white/20">
                <TrendingUp className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-white">Analytics</h3>
                <p className="text-sm text-white/70">Insights & reports</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* RIGHT SIDE - AUTH FORM */}
      <div className="w-full lg:w-1/2 flex items-center justify-center px-4 py-8 sm:px-6 lg:px-8">
        <div className="w-full max-w-md space-y-8 animate-in fade-in zoom-in-95 duration-500">
          {/* Mobile Header */}
          <div className="lg:hidden space-y-2">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 border border-primary/20">
                <Package className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h1 className="text-2xl font-bold">{companyName}</h1>
                <p className="text-sm text-muted-foreground">{companyTagline}</p>
              </div>
            </div>
          </div>

          {/* Form Header */}
          <div className="space-y-2">
            <h2 className="text-3xl font-bold text-foreground">
              {isRegister ? "Create Account" : "Welcome Back"}
            </h2>
            <p className="text-muted-foreground">
              {isRegister ? "Sign up to get started" : "Sign in to your account"}
            </p>
          </div>

          {/* Error Alert */}
          {error && (
            <Alert className="border-destructive/50 bg-destructive/10 animate-in slide-in-from-top-2">
              <AlertDescription className="text-destructive">{error}</AlertDescription>
            </Alert>
          )}

          {/* Form */}
          <form onSubmit={isRegister ? handleSignup : handleLogin} className="space-y-6">
            {/* Name Field (Register only) */}
            {isRegister && (
              <div className="space-y-2">
                <Label htmlFor="name" className="font-medium">Full Name</Label>
                <Input
                  id="name"
                  type="text"
                  placeholder="John Doe"
                  className="h-11 rounded-lg bg-muted/50 border-border/50 pl-4 placeholder:text-muted-foreground/60 focus:border-primary/50 transition-colors"
                  required
                  value={signupName}
                  onChange={(e) => setSignupName(e.target.value)}
                />
              </div>
            )}

            {/* Email Field */}
            <div className="space-y-2">
              <Label htmlFor="email" className="font-medium">Email Address</Label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/60" />
                <Input
                  id="email"
                  type="email"
                  placeholder="you@company.com"
                  className="h-11 rounded-lg bg-muted/50 border-border/50 pl-11 placeholder:text-muted-foreground/60 focus:border-primary/50 transition-colors"
                  required
                  value={isRegister ? signupEmail : loginEmail}
                  onChange={(e) => isRegister ? setSignupEmail(e.target.value) : setLoginEmail(e.target.value)}
                  autoComplete="email"
                />
              </div>
            </div>

            {/* Password Field */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password" className="font-medium">Password</Label>
                {!isRegister && (
                  <a href="#" className="text-sm text-primary hover:underline">Forgot?</a>
                )}
              </div>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/60" />
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  className="h-11 rounded-lg bg-muted/50 border-border/50 pl-11 pr-11 placeholder:text-muted-foreground/60 focus:border-primary/50 transition-colors"
                  required
                  value={isRegister ? signupPassword : loginPassword}
                  onChange={(e) => isRegister ? setSignupPassword(e.target.value) : setLoginPassword(e.target.value)}
                  autoComplete={isRegister ? "new-password" : "current-password"}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground/60 hover:text-foreground transition-colors"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              disabled={isLoading}
              className="w-full h-11 bg-primary hover:bg-primary/90 text-white rounded-lg font-semibold transition-all duration-200"
            >
              {isLoading ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  {isRegister ? "Creating account..." : "Signing in..."}
                </div>
              ) : isRegister ? "Create Account" : "Sign In"}
            </Button>
          </form>

          {/* Divider */}
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-border/50"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-background text-muted-foreground text-xs font-medium tracking-wider">OR CONTINUE WITH</span>
            </div>
          </div>

          {/* OAuth Buttons */}
          <div className="space-y-3">
            {/* Google Button */}
            <button
              type="button"
              onClick={() => {
                const googleUrl = import.meta.env.VITE_GOOGLE_OAUTH_URL;
                if (googleUrl) {
                  window.location.href = googleUrl;
                } else {
                  toast.error("Google OAuth not configured");
                }
              }}
              className="w-full h-11 flex items-center justify-center gap-3 rounded-lg border border-border/50 hover:border-border hover:bg-muted/50 transition-colors font-medium text-sm text-foreground"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path fill="#EA4335" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#4285F4" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/><path fill="#FBBC05" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              Sign in with Google
            </button>

            {/* Microsoft Button */}
            <button
              type="button"
              onClick={() => {
                const microsoftUrl = import.meta.env.VITE_MICROSOFT_OAUTH_URL;
                if (microsoftUrl) {
                  window.location.href = microsoftUrl;
                } else {
                  toast.error("Microsoft OAuth not configured");
                }
              }}
              className="w-full h-11 flex items-center justify-center gap-3 rounded-lg border border-border/50 hover:border-border hover:bg-muted/50 transition-colors font-medium text-sm text-foreground"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <rect fill="#00A4EF" x="1" y="1" width="10" height="10"/><rect fill="#7FBA00" x="13" y="1" width="10" height="10"/><rect fill="#FFB900" x="13" y="13" width="10" height="10"/><rect fill="#F25022" x="1" y="13" width="10" height="10"/>
              </svg>
              Sign in with Microsoft
            </button>
          </div>

          {/* Toggle Form */}
          <div className="text-center space-y-4">
            <div className="text-sm text-muted-foreground">
              {isRegister ? "Already have an account?" : "Don't have an account?"}{" "}
              <button
                onClick={() => {
                  setIsRegister(!isRegister);
                  setError("");
                }}
                className="text-primary font-semibold hover:underline"
              >
                {isRegister ? "Sign In" : "Sign Up"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
