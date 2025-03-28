import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertTriangle, Lock, ShieldAlert } from "lucide-react";
import PageTransition from "@/components/layout/PageTransition";
import { getAllUsers, getProfile } from "@/lib/api";

const AdminPage = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [user, setUser] = useState<any>(null);
  const navigate = useNavigate();
  const { toast } = useToast();
  const userId = localStorage.getItem("userId");

  useEffect(() => {
    const fetchUsers = async () => {
      if (!userId) {
        setError("Please log in to access this page");
        navigate("/login");
        return;
      }

      try {
        const userData = await getProfile(parseInt(userId));
        setUser(userData);
        
        if (!userData.isAdmin) {
          setError("Access denied. Admin privileges required.");
          navigate("/feed");
          return;
        }

        const usersData = await getAllUsers(parseInt(userId));
        setUsers(usersData);
      } catch (error) {
        setError("Failed to fetch users");
        toast({ title: "An error occurred while fetching users." });
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, [userId, navigate, toast]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 text-white">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto">
            <Card className="bg-gray-800 border-gray-700">
              <CardContent className="p-4">
                <p className="text-center text-gray-300">Loading users...</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-900 text-white">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto">
            <Card className="bg-gray-800 border-gray-700">
              <CardHeader>
                <CardTitle className="text-red-600">Access Denied</CardTitle>
                <CardDescription>{error}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col items-center justify-center py-6">
                  <Lock className="h-16 w-16 text-red-100 mb-4" />
                  <p className="text-center mb-4">
                    This area is restricted to administrators only.
                  </p>
                  <Button variant="outline" onClick={() => navigate("/feed")}>
                    Return to Feed
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <h1 className="text-3xl font-bold"><span className="text-blue-500">Nebula</span> Admin</h1>
            <Button onClick={() => navigate("/feed")} className="bg-blue-600 hover:bg-blue-700">
              Back to Feed
            </Button>
          </div>
          <Card className="bg-gray-800 border-gray-700">
            <CardHeader>
              <CardTitle>Admin Dashboard</CardTitle>
              <CardDescription>View all users and their details.</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableCaption>List of all users.</TableCaption>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID</TableHead>
                    <TableHead>Username</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Admin</TableHead>
                    <TableHead>Registered At</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {users.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell>{user.id}</TableCell>
                      <TableCell>
                        <Link to={`/profile/${user.id}`} className="text-blue-400 hover:text-blue-300">
                          {user.username}
                        </Link>
                      </TableCell>
                      <TableCell>{user.email}</TableCell>
                      <TableCell>
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          user.isAdmin 
                            ? "bg-red-100 text-red-800" 
                            : "bg-blue-100 text-blue-800"
                        }`}>
                          {user.isAdmin ? "Admin" : "User"}
                        </span>
                      </TableCell>
                      <TableCell>{new Date(user.registeredAt).toLocaleDateString()}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default AdminPage;
