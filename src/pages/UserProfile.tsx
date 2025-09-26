import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getUserById, updateUserById,deleteUserById } from "@/api/apihelper";
import type { User } from "@/types/user";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { PhotoModal } from "@/components/admin/PhotoModal";
import {
  ArrowLeft,
  Edit,
  Phone,
  Mail,
  MapPin,
  Calendar,
  Crown,
  Check,
  X,
  Eye,
  MessageCircle,
  Video,
  Mic,
  Key,
} from "lucide-react";
import { getAuthToken } from "@/api/auth";
import { AvatarImageUser } from "@/api/apihelper";

/**
 * Refactored UserProfile with:
 * - Added Paid & Exclusive status options
 * - membershipExpiryDate input + save
 * - improved photo preview handling (unchanged)
 */
export default function UserProfile() {
  const { userId } = useParams<{ userId: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const token = getAuthToken();

  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [savingField, setSavingField] = useState<Record<string, boolean>>({});
  const [expiryDate, setExpiryDate] = useState<string>("");

  const [photoModal, setPhotoModal] = useState<{ isOpen: boolean; photoType: "photo1" | "photo2"; photoUrl: string }>(
    { isOpen: false, photoType: "photo1", photoUrl: "" }
  );

  // --- Helpers ---
  const isInvalidPhoto = useCallback((p?: string | null) => {
    if (!p) return true;
    const s = String(p).trim().toLowerCase();
    return s === "" || s === "nophoto.gif" || s === "none" || s === "null" || s === "undefined";
  }, []);

  // build a usable photo URL or return null
  const getPhotoUrl = useCallback(
    (type: "photo1" | "photo2", filename?: string | null) => {
      if (!filename || isInvalidPhoto(filename)) return null;
      const base = `${AvatarImageUser}`;
      return `${base}/${filename}`;
    },
    [isInvalidPhoto]
  );

  const DEFAULT_AVATAR = `${AvatarImageUser}/umeedc00145b6-a62e-4cc0-a258-7d35443c8fb4newlogo.png`;

  // map status to classes (added Paid & Exclusive)
  const statusClass = useCallback((s?: string) => {
    switch ((s || "").toLowerCase()) {
      case "active":
        return "bg-green-500 text-white";
      case "paid":
        return "bg-blue-600 text-white";
      case "exclusive":
        return "bg-gradient-to-r from-yellow-500 to-orange-500 text-white";
      case "banned":
        return "bg-red-500 text-white";
      case "pending":
        return "bg-yellow-500 text-black";
      case "deleted":
        return "bg-gray-400 text-white";
      default:
        return "bg-gray-400 text-white";
    }
  }, []);

  const memClass = useCallback((m?: string) => {
    switch ((m || "").toLowerCase()) {
      case "free":
        return "bg-gray-300 text-gray-800";
      case "paid":
        return "bg-blue-500 text-white";
      case "exclusive":
        return "bg-gradient-to-r from-yellow-500 to-orange-500 text-white";
      default:
        return "bg-gray-300 text-gray-800";
    }
  }, []);

  // --- API / data load ---
  useEffect(() => {
    let mounted = true;
    const load = async () => {
      if (!userId) return;
      setLoading(true);
      try {
        const res = await getUserById(userId);
        if (!mounted) return;
        if (res && res.success && res.data) {
          setUser(res.data);
          // initialize expiryDate from server value if present
          const serverExpiry = (res.data as any).membershipExpiryDate || "";
          // If server sends ISO timestamp (e.g. 2025-09-13T...), extract YYYY-MM-DD for date input
          const iso = typeof serverExpiry === "string" && serverExpiry.includes("T") ? serverExpiry.split("T")[0] : serverExpiry;
          setExpiryDate(iso || "");
        } else {
          toast({ title: "Error", description: res?.message || "Failed to fetch user details", variant: "destructive" });
        }
      } catch (err) {
        console.error("getUserById error", err);
        toast({ title: "Error", description: "Failed to fetch user details", variant: "destructive" });
      } finally {
        if (mounted) setLoading(false);
      }
    };

    load();
    return () => {
      mounted = false;
    };
  }, [userId, toast]);

  // --- Update helper ---
  const updateUserField = useCallback(
    async (field: string, value: string | number | boolean) => {
      if (!userId) return;
      setSavingField((s) => ({ ...s, [field]: true }));
      try {
        await updateUserById(userId, token, { [field]: String(value) });
        setUser((prev) => (prev ? ({ ...prev, [field]: value } as any) : prev));
      } catch (err) {
        console.error("updateUserField error", err);
        toast({ title: "Error", description: "Failed to update user", variant: "destructive" });
      } finally {
        setSavingField((s) => {
          const copy = { ...s };
          delete copy[field];
          return copy;
        });
      }
    },
    [userId, token, toast]
  );

  // --- Action handlers ---
  const handleStatusChange = useCallback(
    async (status: "Active" | "Paid" | "Exclusive" | "Banned" | "Pending" | "Deleted") => {
      setUser((u) => (u ? { ...u, status } : u));
      await updateUserField("status", status);
      toast({ title: "Status Updated", description: `User status changed to ${status}` });
    },
    [updateUserField, toast]
  );

  const handleApproval = useCallback(
    async (type: "photo1" | "photo2" | "bio" | "expectations", approved: boolean) => {
      const keyMap: Record<string, string> = {
        photo1: "photo1Approve",
        photo2: "photo2Approve",
        bio: "bio_approval",
        expectations: "partnerExpectations_approval",
      };
      const key = keyMap[type];
      setUser((u) => (u ? { ...u, [key]: approved } as any : u));
      await updateUserField(key, approved ? "1" : "0");
      toast({ title: "Approval Updated", description: `${type} ${approved ? "approved" : "rejected"}` });
    },
    [updateUserField, toast]
  );

  const removedPhoto = useCallback(
    async (type: "RemovePhoto1" | "RemovePhoto2", string: string) => {
      const keyMap: Record<string, string> = {
        RemovePhoto1: "photo1",
        RemovePhoto2: "photo2",
       
      };
      const key = keyMap[type];
      setUser((u) => (u ? { ...u, [key]: string } as any : u));
      await updateUserField(key, string ? "nophoto.gif" : "nophoto.gif");
      toast({ title: "Photo Removed Success", description: `${type} ${string ? "nophoto.gif" : "nophoto.gif"}` });
    },
    [updateUserField, toast]
  );

  const handeMembershipTypeChange = useCallback(
    async (memtype: "Free" | "basic_chat_pack" | "standard_pack" | "weekly_pack" | "12_day_pack" | "monthly_pack" | "exclusive_member_pack" | "exclusive_member_pack") => {
      
      setUser((u) => (u ? { ...(u as any), memtype } as any : u));
      await updateUserField("memtype", memtype);
      toast({ title: "Membership Type Updated", description: `Membership type changed to ${memtype}` });
    },
    [updateUserField, toast]
  );
  const handlePermissionChange = useCallback(
    async (permission: "chat" | "video" | "audio", value: string | number | boolean) => {
      const keyMap: Record<string, string> = { chat: "chat_msg", video: "video_min", audio: "voice_min" };
      const key = keyMap[permission];
      setUser((u) => (u ? { ...(u as any), [key]: value } as any : u));
      await updateUserField(key, value);
      toast({ title: "Permission Updated", description: `${permission} updated` });
    },
    [updateUserField, toast]
  );

  const handlePhotoView = useCallback(
    (photoType: "photo1" | "photo2") => {
      const filename = photoType === "photo1" ? (user as any)?.photo1 : (user as any)?.photo2;
      const url = getPhotoUrl(photoType, filename);
      if (!url) {
        setPhotoModal({ isOpen: true, photoType, photoUrl: "" });
        return;
      }
      setPhotoModal({ isOpen: true, photoType, photoUrl: url });
    },
    [getPhotoUrl, user]
  );

  const handlePhotoApproval = useCallback(
    async (approved: boolean) => {
      const type = photoModal.photoType;
      await handleApproval(type, approved);
      setPhotoModal((p) => ({ ...p, isOpen: false }));
    },
    [photoModal.photoType, handleApproval]
  );

  // Save expiry date (string). Use the date string as-is (YYYY-MM-DD).
  const saveExpiryDate = useCallback(async () => {
    await updateUserField("membershipExpiryDate", expiryDate || "");
    toast({ title: "Expiry Saved", description: expiryDate ? `Set to ${expiryDate}` : "Cleared expiry date" });
  }, [expiryDate, updateUserField, toast]);

 const handleParmanetDeleteUser = useCallback(
    async () => {
      if (!userId) return;
      //setSavingField((s) => ({ ...s, "permanentDelete": true }));
      try {
        await deleteUserById(userId);
        //setUser((prev) => (prev ? ({ ...prev, "status": "Deleted" } as any) : prev));
        toast({ title: "User Permanently Deleted", description: `User has been permanently deleted` });
        navigate("/");
      } catch (err) {
        console.error("handleParmanetDeleteUser error", err);
        toast({ title: "Error", description: "Failed to permanently delete user", variant: "destructive" });
      } 
    },
    [userId, toast, navigate]
  );

  // --- Render guards ---
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Loading user...</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center p-4">
          <h1 className="text-xl sm:text-2xl font-bold text-foreground mb-2">User Not Found</h1>
          <p className="text-muted-foreground mb-4">The requested user could not be found.</p>
          <Button onClick={() => navigate("/")}>
            <ArrowLeft className="h-4 w-4 mr-2" /> Back to Dashboard
          </Button>
        </div>
      </div>
    );
  }

  // --- UI ---
  const photo1Url = getPhotoUrl("photo1", (user as any)?.photo1);
  const photo2Url = getPhotoUrl("photo2", (user as any)?.photo2);

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 sm:px-6 py-4 sm:py-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4 sm:mb-6 gap-3">
          <Button variant="ghost" onClick={() => navigate("/")} className="w-full sm:w-auto">
            <ArrowLeft className="h-4 w-4 mr-2" /> Back to Dashboard
          </Button>

          <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
            <Button variant="outline" onClick={() => navigate(`/user/${userId}/edit`)} className="w-full sm:w-auto">
              <Edit className="h-4 w-4 mr-2" /> Edit Profile
            </Button>
            <Button variant="outline" onClick={() => navigate(`/user/${userId}/password`)} className="w-full sm:w-auto">
              <Key className="h-4 w-4 mr-2" /> Change Password
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
          {/* Profile Overview */}
          <aside className="lg:col-span-1">
            <Card>
              <CardHeader className="text-center">
                <Avatar className="h-20 w-20 sm:h-24 sm:w-24 mx-auto">
                  {photo1Url ? (
                    <AvatarImage
                      src={photo1Url}
                      alt={`${user.name} photo`}
                      onError={(e) => ((e.currentTarget as HTMLImageElement).src = DEFAULT_AVATAR)}
                    />
                  ) : (
                    <AvatarFallback className="bg-primary text-primary-foreground text-lg sm:text-xl">No image</AvatarFallback>
                  )}
                </Avatar>

                <CardTitle className="text-lg sm:text-xl mt-2">{user.name}</CardTitle>
                <p className="text-sm text-muted-foreground">ID: {user.id}</p>

                <div className="flex flex-wrap justify-center gap-2 mt-3">
                  <Badge className={statusClass(user.status)}>{user.status}</Badge>
                  <Badge className={memClass(user.memtype)}>
                    {user.memtype?.toLowerCase() === "exclusive" && <Crown className="h-3 w-3 mr-1" />}
                    {user.memtype}
                  </Badge>
                </div>
              </CardHeader>

              <CardContent>
                <div className="space-y-2 text-sm sm:text-base">
                  <div className="flex items-center space-x-2">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <span className="truncate">{user.email}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <span>
                      +{user.mobilecode} {user.mobile}
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    <span className="truncate">
                      {user.state}, {user.country}
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span>{user.age} years old</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </aside>

          {/* Profile Details */}
          <main className="lg:col-span-2 space-y-4 sm:space-y-6">
            {/* Status Management */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base sm:text-lg">Status Management</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2 items-center">
                  <Button
                    variant={user.status === "Active" ? "default" : "outline"}
                    onClick={() => handleStatusChange("Active")}
                    disabled={!!savingField["status"]}
                  >
                    <Check className="h-4 w-4 mr-2" /> Approve
                  </Button>

                  <Button
                    variant={user.status === "Paid" ? "default" : "outline"}
                    onClick={() => handleStatusChange("Paid")}
                    disabled={!!savingField["status"]}
                  >
                    Paid
                  </Button>

                  <Button
                    variant={user.status === "Exclusive" ? "default" : "outline"}
                    onClick={() => handleStatusChange("Exclusive")}
                    disabled={!!savingField["status"]}
                  >
                    <Crown className="h-4 w-4 mr-2" /> Exclusive
                  </Button>

                  <Button
                    variant={user.status === "Pending" ? "default" : "outline"}
                    onClick={() => handleStatusChange("Pending")}
                    disabled={!!savingField["status"]}
                  >
                    Pending
                  </Button>

                  <Button
                    variant={user.status === "Banned" ? "destructive" : "outline"}
                    onClick={() => handleStatusChange("Banned")}
                    disabled={!!savingField["status"]}
                  >
                    Ban User
                  </Button>

                  <Button
                    variant={user.status === "Deleted" ? "destructive" : "outline"}
                    onClick={() => handleStatusChange("Deleted")}
                    disabled={!!savingField["status"]}
                  >
                    Delete User
                  </Button>
                  <Separator orientation="vertical" className="h-6" />
                  <span className="text-sm text-muted-foreground">Change Membership Type:</span>
                  {/* Membership Type Buttons */}
                  <Separator orientation="vertical" className="h-6" />
                  <Button variant={user.memtype === "Free" ? "destructive" : "outline"} onClick={() => handeMembershipTypeChange("Free")} disabled={!!savingField["memtype"]}>
                    Free
                  </Button>
                  <Button variant={user.memtype === "basic_chat_pack" ? "destructive" : "outline"} onClick={() => handeMembershipTypeChange("basic_chat_pack")} disabled={!!savingField["memtype"]}>
                    Basic Chat
                  </Button>
                  <Button variant={user.memtype === "standard_pack" ? "destructive" : "outline"}  
                   onClick={() => handeMembershipTypeChange("standard_pack")} disabled={!!savingField["memtype"]}>
                    Standard
                  </Button>
                  <Button variant={user.memtype === "weekly_pack" ? "destructive" : "outline"}  
                   onClick={() => handeMembershipTypeChange("weekly_pack")} disabled={!!savingField["memtype"]}>
                    Weekly
                  </Button>
                  <Button variant={user.memtype === "12_day_pack" ? "destructive" : "outline"  }
                    onClick={() => handeMembershipTypeChange("12_day_pack")} disabled={!!savingField["memtype"]}>
                    12 Day
                  </Button>
                  <Button variant={user.memtype === "monthly_pack" ? "destructive" : "outline"  }
                  
                  onClick={() => handeMembershipTypeChange("monthly_pack")} disabled={!!savingField["memtype"]}>
                    Monthly
                  </Button>
                  <Button variant={user.memtype === "exclusive_member_pack" ? "destructive" : "outline"  }
                    onClick={() => handeMembershipTypeChange("exclusive_member_pack")} disabled={!!savingField["memtype"]}>
                    Exclusive
                  </Button>

                  <Separator orientation="vertical" className="h-6" />
                  <Button
                    variant="destructive"
                    onClick={handleParmanetDeleteUser}
                    //disabled={!!savingField["permanentDelete"]}
                  >
                    <X className="h-4 w-4 mr-2" /> Permanently Delete User
                  </Button>
                
                </div>
              </CardContent>
            </Card>

            {/* Photo Management */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base sm:text-lg">Photo Management</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <h4 className="font-medium text-sm sm:text-base">Primary Photo</h4>
                    <div className="flex flex-col sm:flex-row gap-2">
                      <Button variant="outline" onClick={() => handlePhotoView("photo1")}>
                        <Eye className="h-4 w-4 mr-2" /> View
                      </Button>
                      <Button
                        variant={((user as any).photo1Approve ? "default" : "outline")}
                        onClick={() => handleApproval("photo1", !(user as any).photo1Approve)}
                        disabled={!!savingField["photo1Approve"]}
                      >
                        {(user as any).photo1Approve ? <Check className="h-4 w-4 mr-2" /> : <X className="h-4 w-4 mr-2" />}
                        {(user as any).photo1Approve ? "Approved" : "Approve"}
                      </Button>
                      <Button
                        variant="destructive"
                        onClick={() => removedPhoto("RemovePhoto1", "")}
                        disabled={!!savingField["photo1"]}
                      >
                        <X className="h-4 w-4 mr-2" /> Remove Photo1
                      </Button>
                    </div>
                    {!photo1Url && <p className="text-xs text-muted-foreground">No primary photo available</p>}
                  </div>

                  <div className="space-y-2">
                    <h4 className="font-medium text-sm sm:text-base">Secondary Photo</h4>
                    <div className="flex flex-col sm:flex-row gap-2">
                      <Button variant="outline" onClick={() => handlePhotoView("photo2")}>
                        <Eye className="h-4 w-4 mr-2" /> View
                      </Button>
                      <Button
                        variant={((user as any).photo2Approve ? "default" : "outline")}
                        onClick={() => handleApproval("photo2", !(user as any).photo2Approve)}
                        disabled={!!savingField["photo2Approve"]}
                      >
                        {(user as any).photo2Approve ? <Check className="h-4 w-4 mr-2" /> : <X className="h-4 w-4 mr-2" />}
                        {(user as any).photo2Approve ? "Approved" : "Approve"}
                      </Button>
                      <Button
                        variant="destructive"
                        onClick={() => removedPhoto("RemovePhoto2", "")}
                        disabled={!!savingField["photo2"]}
                      >
                        <X className="h-4 w-4 mr-2" /> Remove Photo2
                      </Button>
                    </div>
                    {!photo2Url && <p className="text-xs text-muted-foreground">No secondary photo available</p>}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Content Approval */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base sm:text-lg">Content Approval</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-2 gap-2">
                    <h4 className="font-medium text-sm sm:text-base">Bio</h4>
                    <Button
                      size="sm"
                      variant={(user as any).bio_approval ? "default" : "outline"}
                      onClick={() => handleApproval("bio", !(user as any).bio_approval)}
                      disabled={!!savingField["bio_approval"]}
                    >
                      {(user as any).bio_approval ? <Check className="h-4 w-4 mr-1" /> : <X className="h-4 w-4 mr-1" />}
                      {(user as any).bio_approval ? "Approved" : "Approve"}
                    </Button>
                  </div>
                  <p className="text-sm text-muted-foreground bg-muted p-3 rounded max-h-32 overflow-y-auto">{user.bio || "No bio available."}</p>
                </div>
                <Separator />
                <div>
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-2 gap-2">
                    <h4 className="font-medium text-sm sm:text-base">Partner Expectations</h4>
                    <Button
                      size="sm"
                      variant={(user as any).partnerExpectations_approval ? "default" : "outline"}
                      onClick={() => handleApproval("expectations", !(user as any).partnerExpectations_approval)}
                      disabled={!!savingField["partnerExpectations_approval"]}
                    >
                      {(user as any).partnerExpectations_approval ? <Check className="h-4 w-4 mr-1" /> : <X className="h-4 w-4 mr-1" />}
                      {(user as any).partnerExpectations_approval ? "Approved" : "Approve"}
                    </Button>
                  </div>
                  <p className="text-sm text-muted-foreground bg-muted p-3 rounded max-h-32 overflow-y-auto">{user.partnerExpectations || "No expectations provided."}</p>
                </div>
                <Separator />
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 items-end">
                  <div className="space-y-1">
                    <label htmlFor="expiryDate" className="block text-sm font-medium">
                      Membership Expiry Date
                    </label>
                    <input
                      type="date"
                      id="expiryDate"
                      value={expiryDate}
                      onChange={(e) => setExpiryDate(e.target.value)}
                      className="w-full border rounded-md px-2 py-1 text-sm"
                    />
                  </div>
                  <Button onClick={saveExpiryDate} disabled={!!savingField["membershipExpiryDate"] || !expiryDate}>
                    Save Expiry Date
                  </Button>
                </div>

                
             
              </CardContent>
            </Card>

            {/* Communication Permissions */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base sm:text-lg">Communication Permissions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {/* Chat Messages */}
                  <div className="text-center space-y-2">
                    <MessageCircle className="h-8 w-8 mx-auto text-muted-foreground" />
                    <h4 className="font-medium">Chat Messages</h4>
                    <input
                      type="number"
                      min={0}
                      defaultValue={(user as any).chat_msg ?? 0}
                      className="border rounded-md px-2 py-1 w-full text-center text-sm"
                      placeholder="Enter count"
                      onBlur={async (e) => {
                        const value = e.target.value;
                        await updateUserField("chat_msg", value);
                        toast({ title: "Chat Limit Updated", description: `Chat messages set to ${value}` });
                      }}
                    />
                  </div>

                  {/* Video Minutes */}
                  <div className="text-center space-y-2">
                    <Video className="h-8 w-8 mx-auto text-muted-foreground" />
                    <h4 className="font-medium">Video Minutes</h4>
                    <input
                      type="number"
                      min={0}
                      defaultValue={(user as any).video_min ?? 0}
                      className="border rounded-md px-2 py-1 w-full text-center text-sm"
                      placeholder="Enter minutes"
                      onBlur={async (e) => {
                        const value = e.target.value;
                        await updateUserField("video_min", value);
                        toast({ title: "Video Limit Updated", description: `Video minutes set to ${value}` });
                      }}
                    />
                  </div>

                  {/* Audio Minutes */}
                  <div className="text-center space-y-2">
                    <Mic className="h-8 w-8 mx-auto text-muted-foreground" />
                    <h4 className="font-medium">Audio Minutes</h4>
                    <input
                      type="number"
                      min={0}
                      defaultValue={(user as any).voice_min ?? 0}
                      className="border rounded-md px-2 py-1 w-full text-center text-sm"
                      placeholder="Enter minutes"
                      onBlur={async (e) => {
                        const value = e.target.value;
                        await updateUserField("voice_min", value);
                        toast({ title: "Audio Limit Updated", description: `Audio minutes set to ${value}` });
                      }}
                    />
                  </div>

                    {/* membership expiry date input */}
               
                </div>
              </CardContent>
            </Card>
          </main>
        </div>
      </div>

      <PhotoModal
        isOpen={photoModal.isOpen}
        onClose={() => setPhotoModal((p) => ({ ...p, isOpen: false }))}
        photoUrl={photoModal.photoUrl}
        photoType={photoModal.photoType}
        userName={user.name}
        isApproved={photoModal.photoType === "photo1" ? (user as any).photo1Approve : (user as any).photo2Approve}
        onApprove={handlePhotoApproval}
      />
    </div>
  );
}
