import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft } from "lucide-react";
import PageTransition from "@/components/layout/PageTransition";
import { getProfile, getUserPosts } from "@/lib/api";
import type { Post } from "@/lib/api";

const ProfilePage = () => {
  const { id } = useParams<{ id: string }>();
  const [user, setUser] = useState<any>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const userData = await getProfile(Number(id));
        setUser(userData);
        const userPosts = await getUserPosts(Number(id));
        setPosts(userPosts);
      } catch (error) {
        setError("Failed to fetch user profile.");
        toast({ title: "An error occurred while fetching the profile." });
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [id, toast]);

  if (loading) {
    return (
      <PageTransition>
        <div className="container mx-auto max-w-md px-4 py-8">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-center">
                <div className="text-gray-400">Loading profile...</div>
              </div>
            </CardContent>
          </Card>
        </div>
      </PageTransition>
    );
  }

  if (error) {
    return (
      <PageTransition>
        <div className="container mx-auto max-w-md px-4 py-8">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-center text-red-400">
                {error}
              </div>
            </CardContent>
          </Card>
        </div>
      </PageTransition>
    );
  }

  return (
    <PageTransition>
      <div className="container mx-auto max-w-md px-4 py-8">
        <Card>
          <CardHeader>
            <CardTitle>User Profile</CardTitle>
            <CardDescription>View the profile of another user.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold">{user?.username}</h3>
                <p className="text-sm text-gray-500">{user?.email}</p>
              </div>
              <div>
                <h4 className="font-medium">Bio</h4>
                <p>{user?.bio || "No bio available"}</p>
              </div>
              <div>
                <h4 className="font-medium">Posts</h4>
                {posts.length === 0 ? (
                  <p className="text-gray-500">No posts yet</p>
                ) : (
                  <div className="space-y-2 mt-2">
                    {posts.map((post) => (
                      <div key={post.id} className="p-3 bg-gray-700 rounded-lg">
                        <p className="text-sm text-gray-400">
                          {new Date(post.createdAt).toLocaleDateString()}
                        </p>
                        <p className="mt-1">{post.content}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </CardContent>
          <CardFooter>
            <Button onClick={() => navigate(-1)}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back
            </Button>
          </CardFooter>
        </Card>
      </div>
    </PageTransition>
  );
};

export default ProfilePage;
