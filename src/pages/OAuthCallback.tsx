import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

export default function OAuthCallback() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { setAuthFromOAuth } = useAuth();

  useEffect(() => {
    const handleOAuthCallback = async () => {
      try {
        // Extract token and user from URL parameters
        const token = searchParams.get("token");
        const userJson = searchParams.get("user");
        const error = searchParams.get("error");

        if (error) {
          console.error("OAuth error:", error);
          toast.error(`OAuth login failed: ${error}`);
          navigate("/login?error=" + error);
          return;
        }

        if (token && userJson) {
          try {
            const user = JSON.parse(decodeURIComponent(userJson));

            // Store in auth context
            setAuthFromOAuth(token, user);

            toast.success("Login successful!");

            // Clean URL by removing query parameters
            window.history.replaceState({}, document.title, "/dashboard");

            // Redirect to dashboard
            navigate("/dashboard");
          } catch (parseError) {
            console.error("Failed to parse OAuth callback data:", parseError);
            toast.error("Failed to process login");
            navigate("/login?error=parse_failed");
          }
        } else {
          console.error("Missing token or user data in OAuth callback");
          toast.error("OAuth login incomplete - missing credentials");
          navigate("/login?error=missing_credentials");
        }
      } catch (error) {
        console.error("OAuth callback error:", error);
        toast.error("An error occurred during login");
        navigate("/login?error=callback_error");
      }
    };

    handleOAuthCallback();
  }, [searchParams, navigate, setAuthFromOAuth]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-primary/5">
      <div className="text-center space-y-4">
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-lg bg-primary/10 animate-spin">
          <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full"></div>
        </div>
        <p className="text-muted-foreground">Processing login... please wait</p>
      </div>
    </div>
  );
}
