import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Save } from "lucide-react";
import PageTransition from "@/components/layout/PageTransition";
import { getProfile, updateProfile } from "@/lib/api";

const EditProfilePage = () => {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [email, setEmail] = useState("");
  const [bio, setBio] = useState("");
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const userData = await getProfile(1); // Assuming user ID is 1 for demo
        setUser(userData);
        setEmail(userData.email);
        setBio(userData.bio);
      } catch (error) {
        toast({ title: "An error occurred while fetching your profile." });
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [toast]);

  const handleSave = async () => {
    setSaving(true);
    try {
      const response = await updateProfile(1, bio, email); // Assuming user ID is 1 for demo
      if (response.message) {
        toast({ title: "Profile updated successfully!" });
        navigate("/myprofile");
      } else {
        toast({ title: "Failed to update profile." });
      }
    } catch (error) {
      toast({ title: "An error occurred while updating your profile." });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <PageTransition>
      <div className="container mx-auto max-w-md px-4 py-8">
        <Card>
          <CardHeader>
            <CardTitle>Edit Profile</CardTitle>
            <CardDescription>Update your profile information.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center space-x-4">
                <Avatar>
                  <AvatarImage src={user?.profilePicture} />
                  <AvatarFallback>{user?.username?.charAt(0)}</AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="font-semibold">{user?.username}</h3>
                </div>
              </div>
              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                />
              </div>
              <div>
                <Label htmlFor="bio">Bio</Label>
                <Textarea
                  id="bio"
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  placeholder="Enter your bio"
                />
              </div>
            </div>
          </CardContent>
          <CardFooter>
            <Button onClick={handleSave} disabled={saving}>
              {saving ? "Saving..." : "Save Changes"}
            </Button>
          </CardFooter>
        </Card>
      </div>
    </PageTransition>
  );
};

export default EditProfilePage;
