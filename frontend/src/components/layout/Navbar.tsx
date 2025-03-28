import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Menu, X, Home, Shield, ScrollText, Users } from "lucide-react";
import { useState, useEffect } from "react";
import { getProfile } from "@/lib/api";

const Navbar = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [user, setUser] = useState<any>(null);
  const userId = localStorage.getItem("userId");

  useEffect(() => {
    const fetchUser = async () => {
      if (userId) {
        try {
          const userData = await getProfile(parseInt(userId));
          setUser(userData);
        } catch (error) {
          console.error("Error fetching user data:", error);
        }
      }
    };

    fetchUser();
  }, [userId]);

  const handleLogout = async () => {
    try {
      localStorage.removeItem("userId");
      setUser(null);
      toast({ title: "Logged out successfully" });
      navigate("/");
    } catch (error) {
      toast({ title: "Error logging out" });
    }
  };

  return (
    <nav className="fixed top-0 left-0 right-0 bg-gray-900 border-b border-gray-800 z-50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center">
            <Link to="/" className="flex items-center space-x-2">
              <Shield className="h-6 w-6 text-blue-500" />
              <span className="text-xl font-bold text-white">Nebula</span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-4">
            <Link to="/" className="text-gray-300 hover:text-white">
              <Home className="h-5 w-5" />
            </Link>
            <Link to="/feed" className="text-gray-300 hover:text-white">
              <ScrollText className="h-5 w-5" />
            </Link>
            {user?.isAdmin && (
              <Link to="/admin" className="text-gray-300 hover:text-white">
                <Users className="h-5 w-5" />
              </Link>
            )}
            {userId ? (
              <>
                <Link to="/myprofile" className="text-gray-300 hover:text-white">
                  @{user?.username}
                </Link>
                <Button variant="outline" onClick={handleLogout} className="text-gray-300 border-gray-700 hover:bg-gray-800">
                  Logout
                </Button>
              </>
            ) : (
              <>
                <Link to="/login">
                  <Button variant="ghost" className="text-gray-300 hover:text-white hover:bg-gray-800">
                    Login
                  </Button>
                </Link>
                <Link to="/register">
                  <Button className="bg-blue-600 hover:bg-blue-700">
                    Register
                  </Button>
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="text-gray-300 hover:text-white hover:bg-gray-800"
            >
              {isMobileMenuOpen ? (
                <X className="h-5 w-5" />
              ) : (
                <Menu className="h-5 w-5" />
              )}
            </Button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden py-2 border-t border-gray-800">
            <div className="flex flex-col space-y-2">
              <Link
                to="/"
                className="px-4 py-2 text-gray-300 hover:text-white hover:bg-gray-800 rounded-md"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Home
              </Link>
              <Link
                to="/feed"
                className="px-4 py-2 text-gray-300 hover:text-white hover:bg-gray-800 rounded-md"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Feed
              </Link>
              {user?.isAdmin && (
                <Link
                  to="/admin"
                  className="px-4 py-2 text-gray-300 hover:text-white hover:bg-gray-800 rounded-md"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <Users className="h-5 w-5" />
                </Link>
              )}
              {userId ? (
                <>
                  <Link
                    to="/myprofile"
                    className="px-4 py-2 text-gray-300 hover:text-white hover:bg-gray-800 rounded-md"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    @{user?.username}
                  </Link>
                  <button
                    onClick={() => {
                      handleLogout();
                      setIsMobileMenuOpen(false);
                    }}
                    className="px-4 py-2 text-left text-gray-300 hover:text-white hover:bg-gray-800 rounded-md"
                  >
                    Logout
                  </button>
                </>
              ) : (
                <>
                  <Link
                    to="/login"
                    className="px-4 py-2 text-gray-300 hover:text-white hover:bg-gray-800 rounded-md"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    Login
                  </Link>
                  <Link
                    to="/register"
                    className="px-4 py-2 text-gray-300 hover:text-white hover:bg-gray-800 rounded-md"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    Register
                  </Link>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
