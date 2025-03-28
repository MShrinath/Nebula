import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { getProfile, updateProfile, getUserPosts, createPost } from "@/lib/api";
import type { Post } from "@/lib/api";

const MyProfilePage = () => {
  const [bio, setBio] = useState("");
  const [email, setEmail] = useState("");
  const [posts, setPosts] = useState<Post[]>([]);
  const [newPost, setNewPost] = useState("");
  const [loading, setLoading] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isPosting, setIsPosting] = useState(false);
  const [user, setUser] = useState<any>(null);
  const navigate = useNavigate();
  const { toast } = useToast();
  const userId = localStorage.getItem("userId");

  useEffect(() => {
    const fetchProfile = async () => {
      if (!userId) {
        navigate("/login");
        return;
      }

      setLoading(true);
      try {
        const profile = await getProfile(parseInt(userId));
        setUser(profile);
        setBio(profile.bio || "");
        setEmail(profile.email);
        const userPosts = await getUserPosts(parseInt(userId));
        setPosts(userPosts);
      } catch (error) {
        toast({ 
          title: "Error fetching profile",
          description: "Please try again later",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [userId, navigate, toast]);

  const handleUpdateProfile = async () => {
    if (!userId) return;
    
    setIsUpdating(true);
    try {
      await updateProfile(parseInt(userId), bio, email);
      toast({ 
        title: "Success",
        description: "Profile updated successfully"
      });
    } catch (error) {
      toast({ 
        title: "Error updating profile",
        description: "Please try again later",
        variant: "destructive"
      });
    } finally {
      setIsUpdating(false);
    }
  };

  const handleCreatePost = async () => {
    if (!userId || !newPost.trim()) {
      toast({ 
        title: "Empty post",
        description: "Please enter some content for your post",
        variant: "destructive"
      });
      return;
    }

    setIsPosting(true);
    try {
      const post = await createPost(parseInt(userId), newPost);
      setPosts([post, ...posts]);
      setNewPost("");
      toast({ 
        title: "Success",
        description: "Post created successfully"
      });
    } catch (error) {
      toast({ 
        title: "Error creating post",
        description: "Please try again later",
        variant: "destructive"
      });
    } finally {
      setIsPosting(false);
    }
  };

  if (!userId) {
    return (
      <div className="min-h-screen bg-gray-900 text-white">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto">
            <Card className="bg-gray-800 border-gray-700">
              <CardHeader>
                <CardTitle>Please Log In</CardTitle>
              </CardHeader>
              <CardContent>
                <p>You need to be logged in to view your profile.</p>
                <Button onClick={() => navigate("/login")} className="mt-4 bg-blue-600 hover:bg-blue-700">
                  Go to Login
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 text-white">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto">
            <Card className="bg-gray-800 border-gray-700">
              <CardContent className="p-4">
                <p className="text-center text-gray-300">Loading profile...</p>
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
            <h1 className="text-3xl font-bold">My <span className="text-blue-500">Nebula</span> Profile</h1>
            <Button onClick={() => navigate("/feed")} className="bg-blue-600 hover:bg-blue-700">
              Back to Feed
            </Button>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            <Card className="bg-gray-800 border-gray-700">
              <CardHeader>
                <CardTitle>My Profile</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium">Username</label>
                    <Input value={user?.username} disabled className="bg-gray-700 border-gray-600" />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Email</label>
                    <Input
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="Enter your email"
                      className="bg-gray-700 border-gray-600"
                      disabled={isUpdating}
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Bio</label>
                    <Textarea
                      value={bio}
                      onChange={(e) => setBio(e.target.value)}
                      placeholder="Tell us about yourself"
                      className="bg-gray-700 border-gray-600"
                      disabled={isUpdating}
                    />
                  </div>
                  <Button 
                    onClick={handleUpdateProfile} 
                    disabled={isUpdating}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    {isUpdating ? "Updating..." : "Update Profile"}
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gray-800 border-gray-700">
              <CardHeader>
                <CardTitle>Create New Post</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <Textarea
                    value={newPost}
                    onChange={(e) => setNewPost(e.target.value)}
                    placeholder="What's on your mind?"
                    className="min-h-[100px] bg-gray-700 border-gray-600"
                    disabled={isPosting}
                  />
                  <Button 
                    onClick={handleCreatePost} 
                    disabled={isPosting || !newPost.trim()}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    {isPosting ? "Posting..." : "Post"}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card className="mt-6 bg-gray-800 border-gray-700">
            <CardHeader>
              <CardTitle>My Posts</CardTitle>
            </CardHeader>
            <CardContent>
              {posts.length === 0 ? (
                <p className="text-center text-gray-400">No posts yet. Create your first post!</p>
              ) : (
                <div className="space-y-4">
                  {posts.map((post) => (
                    <Card key={post.id} className="bg-gray-700 border-gray-600">
                      <CardContent className="p-4">
                        <p className="text-sm text-gray-400">
                          Posted on {new Date(post.createdAt).toLocaleDateString()}
                        </p>
                        <p className="mt-2 text-gray-200">{post.content}</p>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default MyProfilePage;
