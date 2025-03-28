import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { User } from "lucide-react";
import PageTransition from "@/components/layout/PageTransition";
import { register } from "@/lib/api";

const RegisterPage = () => {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await handleRegister();
  };

  const handleRegister = async () => {
    if (password !== confirmPassword) {
      toast({ 
        title: "Passwords do not match",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    try {
      const user = await register(username, password, email);
      if (user) {
        toast({ title: "Registration successful! Please log in." });
        navigate("/login");
      }
    } catch (error: any) {
      toast({ 
        title: error.message || "Registration failed",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <PageTransition>
      <div className="h-screen bg-gray-900 flex items-start justify-center pt-12 p-4 overflow-hidden">
        <div className="w-full max-w-md">
          <Card className="bg-gray-800 border-gray-700">
            <CardHeader>
              <CardTitle className="text-2xl font-bold text-center">Create <span className="text-blue-500">Nebula</span> Account</CardTitle>
              <CardDescription className="text-center text-gray-400">
                Join our community today
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
                    placeholder="Choose a username"
                    className="bg-gray-700 border-gray-600"
                    disabled={loading}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email"
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
                    placeholder="Create a password"
                    className="bg-gray-700 border-gray-600"
                    disabled={loading}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirm Password</Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Confirm your password"
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
                  {loading ? "Creating account..." : "Create Account"}
                </Button>
                <div className="text-center text-sm text-gray-400">
                  Already have an account?{" "}
                  <a href="/login" className="text-blue-500 hover:text-blue-400">
                    Sign in
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

export default RegisterPage;
