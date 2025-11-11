import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Package, Mail, Lock, User, Building2 } from "lucide-react";
import { toast } from "sonner";
import api from "../lib/api";

export default function Login() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);

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

    if (!loginEmail.trim() || !loginPassword.trim()) {
      toast.error("Email and password are required");
      return;
    }

    setIsLoading(true);
    try {
      const res = await api.post("/auth/login", {
        email: loginEmail,
        password: loginPassword,
      });

      const { user, accessToken } = res.data;

      localStorage.setItem("token", accessToken);
      localStorage.setItem("user", JSON.stringify(user));

      toast.success("Login successful!");
      navigate("/assets");
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Invalid credentials");
    } finally {
      setIsLoading(false);
    }
  };

  // ✅ SIGNUP HANDLER
  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!signupName.trim() || !signupEmail.trim() || !signupPassword.trim()) {
      toast.error("All fields are required");
      return;
    }

    setIsLoading(true);
    try {
      const res = await api.post("/auth/register", {
        name: signupName,
        email: signupEmail,
        password: signupPassword,
      });

      const { user, accessToken } = res.data;

      localStorage.setItem("token", accessToken);
      localStorage.setItem("user", JSON.stringify(user));

      toast.success("Account created successfully!");
      navigate("/assets");
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Something went wrong");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-primary/5 p-4">
      <div className="w-full max-w-6xl grid lg:grid-cols-2 gap-8 items-center">

        {/* LEFT SIDE - BRANDING */}
        <div className="hidden lg:flex flex-col justify-center space-y-6">
          <div className="flex items-center gap-3">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary shadow-purple">
              <Package className="h-10 w-10 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-primary-light bg-clip-text text-transparent">
                AssetFlow
              </h1>
              <p className="text-muted-foreground">Asset Lifecycle Management</p>
            </div>
          </div>

          <div className="space-y-4">
            <h2 className="text-3xl font-bold">Manage Your Assets Efficiently</h2>
            <p className="text-lg text-muted-foreground">
              Track, manage, and optimize your organization's assets from procurement to disposal.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {[
              { icon: Package, label: "Asset Tracking" },
              { icon: Building2, label: "Property Management" },
              { icon: User, label: "User Management" },
              { icon: Mail, label: "Smart Notifications" },
            ].map((feature) => (
              <div key={feature.label} className="flex items-center gap-3 rounded-lg border bg-card p-4">
                <div className="rounded-lg bg-primary/10 p-2">
                  <feature.icon className="h-5 w-5 text-primary" />
                </div>
                <span className="font-medium text-sm">{feature.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* RIGHT SIDE - AUTH FORM */}
        <Card className="shadow-2xl">
          <CardHeader className="space-y-1">

            <div className="flex lg:hidden items-center gap-2 mb-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary">
                <Package className="h-6 w-6 text-primary-foreground" />
              </div>
              <div>
                <CardTitle className="text-2xl">AssetFlow</CardTitle>
                <CardDescription>Asset Management</CardDescription>
              </div>
            </div>

            <CardTitle className="text-2xl">Welcome</CardTitle>
            <CardDescription>Sign in or create a new account</CardDescription>
          </CardHeader>

          <CardContent>
            <Tabs defaultValue="login" className="space-y-4">

              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="login">Login</TabsTrigger>
                <TabsTrigger value="signup">Sign Up</TabsTrigger>
              </TabsList>

              {/* ✅ LOGIN TAB */}
              <TabsContent value="login">
                <form onSubmit={handleLogin} className="space-y-4">
                  <div className="space-y-2">
                    <Label>Email</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        type="email"
                        placeholder="rajesh@company.com"
                        className="pl-9"
                        required
                        value={loginEmail}
                        onChange={(e) => setLoginEmail(e.target.value)}
                        autoComplete="email"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Password</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        type="password"
                        placeholder="Enter password"
                        className="pl-9"
                        required
                        value={loginPassword}
                        onChange={(e) => setLoginPassword(e.target.value)}
                        autoComplete="current-password"
                      />
                    </div>
                  </div>

                  <Button type="submit" className="w-full gradient-primary" disabled={isLoading}>
                    {isLoading ? "Signing in..." : "Sign In"}
                  </Button>
                </form>
              </TabsContent>

              {/* ✅ SIGNUP TAB */}
              <TabsContent value="signup">
                <form onSubmit={handleSignup} className="space-y-4">

                  <div className="space-y-2">
                    <Label>Full Name</Label>
                    <div className="relative">
                      <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        type="text"
                        placeholder="John Doe"
                        className="pl-9"
                        required
                        value={signupName}
                        onChange={(e) => setSignupName(e.target.value)}
                        autoComplete="name"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Email</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        type="email"
                        placeholder="john@example.com"
                        className="pl-9"
                        required
                        value={signupEmail}
                        onChange={(e) => setSignupEmail(e.target.value)}
                        autoComplete="email"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Password</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        type="password"
                        placeholder="Create a strong password"
                        className="pl-9"
                        required
                        value={signupPassword}
                        onChange={(e) => setSignupPassword(e.target.value)}
                        autoComplete="new-password"
                      />
                    </div>
                  </div>

                  <Button type="submit" className="w-full gradient-primary" disabled={isLoading}>
                    {isLoading ? "Creating account..." : "Create Account"}
                  </Button>
                </form>
              </TabsContent>

            </Tabs>
          </CardContent>
        </Card>

      </div>
    </div>
  );
}
