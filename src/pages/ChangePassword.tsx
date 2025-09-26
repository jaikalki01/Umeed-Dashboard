import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getUserById, changeUserPassword } from "@/api/apihelper";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Key, Save } from "lucide-react";

export const ChangePassword = () => {
  const { userId } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [passwords, setPasswords] = useState({
    newPassword: "",
    confirmPassword: "",
  });

  // ✅ Fetch user details
  useEffect(() => {
    if (!userId) return;

    async function fetchUser() {
      setLoading(true);
      setError(null);
      try {
        const response = await getUserById(userId);
        if (response.success && response.data) {
          setUser(response.data);
        } else {
          setError("Failed to fetch user details.");
        }
      } catch (err) {
        console.error("Error fetching user:", err);
        setError("Failed to fetch user details.");
      } finally {
        setLoading(false);
      }
    }

    fetchUser();
  }, [userId]);

  const handleInputChange = (field: string, value: string) => {
    setPasswords((prev) => ({ ...prev, [field]: value }));
  };

  // ✅ Apply API call for changing password
  const handleSave = async () => {
    if (passwords.newPassword !== passwords.confirmPassword) {
      toast({
        title: "Password Mismatch",
        description: "New password and confirm password do not match.",
        variant: "destructive",
      });
      return;
    }

    if (passwords.newPassword.length < 6) {
      toast({
        title: "Password Too Short",
        description: "Password must be at least 6 characters long.",
        variant: "destructive",
      });
      return;
    }

    try {
      console.log('Changing password for user:', userId);
      const response = await changeUserPassword(userId!, passwords.newPassword);
      console.log('Password change response:', response);

      // Check if the response indicates success
      if (response && (response.success || response.status === 'success' || response.message?.includes('success'))) {
        toast({
          title: "Password Changed",
          description: "User password has been successfully updated.",
        });
        
        // Clear the form
        setPasswords({
          newPassword: "",
          confirmPassword: "",
        });
        
        // Navigate to user profile
        navigate(`/user/${userId}`);
      } else {
        toast({
          title: "Error",
          description: response?.message || "Failed to update password.",
          variant: "destructive",
        });
      }
    } catch (err: any) {
      console.error("Error updating password:", err);
      toast({
        title: "Error",
        description: err?.message || "Failed to update password.",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Loading user...</p>
      </div>
    );
  }

  if (error || !user) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-foreground mb-2">
            {error || "User Not Found"}
          </h1>
          <Button onClick={() => navigate("/")}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-6 py-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <Button variant="ghost" onClick={() => navigate(`/user/${userId}`)}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Profile
          </Button>
        </div>

        <div className="max-w-md mx-auto">
          <Card>
            <CardHeader className="text-center">
              <Key className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <CardTitle>Change Password</CardTitle>
              <p className="text-sm text-muted-foreground">
                Change password for {user.name} (ID: {user.id})
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="newPassword">New Password</Label>
                <Input
                  id="newPassword"
                  type="password"
                  value={passwords.newPassword}
                  onChange={(e) => handleInputChange("newPassword", e.target.value)}
                  placeholder="Enter new password"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm New Password</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  value={passwords.confirmPassword}
                  onChange={(e) => handleInputChange("confirmPassword", e.target.value)}
                  placeholder="Confirm new password"
                />
              </div>

              <div className="bg-muted p-3 rounded text-sm text-muted-foreground">
                <h4 className="font-medium mb-2">Password Requirements:</h4>
                <ul className="list-disc list-inside space-y-1">
                  <li>At least 6 characters long</li>
                  <li>Must match the confirmation</li>
                </ul>
              </div>

              <Button
                onClick={handleSave}
                className="w-full"
                disabled={!passwords.newPassword || !passwords.confirmPassword}
              >
                <Save className="h-4 w-4 mr-2" />
                Change Password
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};