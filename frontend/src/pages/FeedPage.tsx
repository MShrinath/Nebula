import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { getPosts, createPost, getProfile } from "@/lib/api";
import type { Post } from "@/lib/api";

const FeedPage = () => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [newPost, setNewPost] = useState("");
  const [isPosting, setIsPosting] = useState(false);
  const [user, setUser] = useState<any>(null);
  const navigate = useNavigate();
  const { toast } = useToast();
  const userId = localStorage.getItem("userId");

  useEffect(() => {
    fetchPosts();
    if (userId) {
      fetchUserProfile();
    }
  }, [userId]);

  const fetchUserProfile = async () => {
    try {
      const userData = await getProfile(parseInt(userId!));
      setUser(userData);
    } catch (error) {
      console.error("Error fetching user profile:", error);
    }
  };

  const fetchPosts = async () => {
    try {
      const fetchedPosts = await getPosts();
      setPosts(fetchedPosts);
    } catch (error) {
      toast({ 
        title: "Error fetching posts",
        description: "Please try again later",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCreatePost = async () => {
    if (!newPost.trim()) {
      toast({ 
        title: "Empty post",
        description: "Please enter some content for your post",
        variant: "destructive"
      });
      return;
    }

    setIsPosting(true);
    try {
      const post = await createPost(parseInt(userId!), newPost);
      setPosts([post, ...posts]);
      setNewPost("");
      toast({ 
        title: "Success",
        description: "Your post has been created"
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

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 text-white">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto">
            <Card className="bg-gray-800 border-gray-700">
              <CardContent className="p-4">
                <p className="text-center text-gray-300">Loading posts...</p>
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
            <h1 className="text-3xl font-bold"><span className="text-blue-500">Nebula</span> Feed</h1>
            {userId && (
              <Button onClick={() => navigate("/myprofile")} className="bg-blue-600 hover:bg-blue-700">
                My Profile
              </Button>
            )}
          </div>

          {userId && (
            <Card className="mb-6 bg-gray-800 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white">Create Post</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <Textarea
                    value={newPost}
                    onChange={(e) => setNewPost(e.target.value)}
                    placeholder="What's on your mind?"
                    className="min-h-[100px] bg-gray-700 border-gray-600 text-white placeholder:text-gray-400"
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
          )}

          <Card className="bg-gray-800 border-gray-700">
            <CardContent className="p-4">
              {posts.length === 0 ? (
                <p className="text-center text-gray-400">
                  No posts yet. {userId ? "Create your first post!" : "Login to be the first to post!"}
                </p>
              ) : (
                <div className="space-y-4">
                  {posts.map((post) => (
                    <Card key={post.id} className="hover:shadow-md transition-shadow bg-gray-700 border-gray-600">
                      <CardContent className="p-4">
                        <div className="flex justify-between items-start">
                          <div>
                            <Link to={`/profile/${post.userId}`} className="font-medium text-blue-400 hover:text-blue-300">
                              @{post.username}
                            </Link>
                            <p className="text-sm text-gray-400">
                              Posted on {new Date(post.createdAt).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
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

export default FeedPage; 