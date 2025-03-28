import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Shield, MessageSquare, Users, Lock, Globe } from "lucide-react";
import PageTransition from "@/components/layout/PageTransition";

const HomePage = () => {
  const userId = localStorage.getItem("userId");
  const navigate = useNavigate();

  return (
    <PageTransition>
      <div className="container mx-auto p-4">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-white mb-4">Welcome to <span className="text-blue-500">Nebula</span></h1>
          <p className="text-xl text-gray-300 mb-8">Your secure space for sharing thoughts, connecting with others, and exploring ideas.</p>
          {!userId ? (
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                onClick={() => navigate("/login")} 
                className="bg-blue-600 hover:bg-blue-700"
              >
                Get Started
              </Button>
              <Button 
                onClick={() => navigate("/register")} 
                variant="outline" 
                className="border-gray-700 text-gray-300 hover:bg-gray-800"
              >
                Create Account
              </Button>
            </div>
          ) : (
            <Button 
              onClick={() => navigate("/feed")} 
              className="bg-blue-600 hover:bg-blue-700"
            >
              Go to Feed
            </Button>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card className="bg-gray-800 border-gray-700">
            <CardHeader>
              <Shield className="h-8 w-8 text-blue-500 mb-2" />
              <CardTitle>Secure Platform</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-300">Your data is protected with state-of-the-art security measures.</p>
            </CardContent>
          </Card>

          <Card className="bg-gray-800 border-gray-700">
            <CardHeader>
              <MessageSquare className="h-8 w-8 text-blue-500 mb-2" />
              <CardTitle>Share Thoughts</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-300">Connect with others and share your ideas in a safe environment.</p>
            </CardContent>
          </Card>

          <Card className="bg-gray-800 border-gray-700">
            <CardHeader>
              <Users className="h-8 w-8 text-blue-500 mb-2" />
              <CardTitle>Build Community</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-300">Join a growing community of like-minded individuals.</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </PageTransition>
  );
};

export default HomePage; 