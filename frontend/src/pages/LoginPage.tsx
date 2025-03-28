import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Lock } from "lucide-react";
import PageTransition from "@/components/layout/PageTransition";
import { login, logout } from "@/lib/api";

const LoginPage = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();
  const userId = localStorage.getItem("userId");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await handleLogin();
  };

  const handleLogin = async () => {
    setLoading(true);
    try {
      console.log('Starting login process...');
      const user = await login(username, password);
      console.log('Login successful, user:', user);
      if (user) {
        localStorage.setItem("userId", user.id.toString());
        toast({ title: "Login successful!" });
        navigate("/feed");
      } else {
        toast({ 
          title: "Login failed", 
          description: "No user data received",
          variant: "destructive"
        });
      }
    } catch (error: any) {
      console.error('Login error:', error);
      toast({ 
        title: "Login failed", 
        description: error.message || "Please check your credentials",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      localStorage.removeItem("userId");
      navigate("/login");
    } catch (err) {
      toast({ title: "Error logging out" });
    }
  };

  if (userId) {
    return (
      <PageTransition>
        <div className="h-screen bg-gray-900 flex items-start justify-center pt-12 p-4 overflow-hidden">
          <div className="w-full max-w-md">
            <Card className="bg-gray-800 border-gray-700">
              <CardHeader>
                <CardTitle className="text-2xl font-bold text-center">Already Logged In</CardTitle>
              </CardHeader>
              <CardContent>
                <Button onClick={handleLogout} className="w-full bg-blue-600 hover:bg-blue-700">
                  Logout
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </PageTransition>
    );
  }

  return (
    <PageTransition>
      <div className="h-screen bg-gray-900 flex items-start justify-center pt-12 p-4 overflow-hidden">
        <div className="w-full max-w-md">
          <Card className="bg-gray-800 border-gray-700">
            <CardHeader>
              <CardTitle className="text-2xl font-bold text-center">Welcome to <span className="text-blue-500">Nebula</span></CardTitle>
              <CardDescription className="text-center text-gray-400">
                Sign in to your account
              </CardDescription>
            </CardHeader>
            <form onSubmit={handleSubmit}>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="username">Username</Label>
                  <Input
                    id="username"
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="Enter your username"
                    className="bg-gray-700 border-gray-600"
                    disabled={loading}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    className="bg-gray-700 border-gray-600"
                    disabled={loading}
                  />
                </div>
              </CardContent>
              <CardFooter className="flex flex-col gap-4">
                <Button 
                  type="submit"
                  className="w-full bg-blue-600 hover:bg-blue-700"
                  disabled={loading}
                >
                  {loading ? "Signing in..." : "Sign In"}
                </Button>
                <div className="text-center text-sm text-gray-400">
                  Don't have an account?{" "}
                  <a href="/register" className="text-blue-500 hover:text-blue-400">
                    Sign up
                  </a>
                </div>
              </CardFooter>
            </form>
          </Card>
        </div>
      </div>
    </PageTransition>
  );
};

export default LoginPage;
