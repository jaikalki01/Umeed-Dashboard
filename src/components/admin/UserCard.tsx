import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import type { User } from "@/types/user";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Checkbox } from "@/components/ui/checkbox";
import { PhotoModal } from "./PhotoModal";
import { getAuthToken } from "@/api/auth";
import {
  User as UserIcon,
  Phone,
  Mail,
  MapPin,
  Calendar,
  Check,
  X,
  Crown,
  Ban,
  MessageCircle,
  Video,
  Mic,
  Eye
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { updateUserById, AvatarImageUser } from "@/api/apihelper";

type PhotoType = "photo1" | "photo2";

type PermissionType = "chat" | "video" | "audio" | "";

interface Props {
  user: User;
  isSelected: boolean;
  onSelectionChange: (userId: string, selected: boolean) => void;
}

const DEFAULT_AVATAR = `${AvatarImageUser}/umeedc00145b6-a62e-4cc0-a258-7d35443c8fb4newlogo.png`;

const isInvalidPhoto = (photo?: string | null) => {
  if (!photo) return true;
  const clean = String(photo).trim().toLowerCase();
  return clean === "" || clean === "nophoto.gif" || clean === "none" || clean === "null" || clean === "undefined";
};

const getInitials = (name?: string) =>
  String(name || "")
    .split(" ")
    .filter(Boolean)
    .map((n) => n[0])
    .join("")
    .toUpperCase();

export default function UserCard({ user, isSelected, onSelectionChange }: Props) {
  const navigate = useNavigate();
  const { toast } = useToast();
  const token = getAuthToken();

  // local editable copy of the user prop
  const [localUser, setLocalUser] = useState<User>(user);

  // Keep localUser in sync when parent updates the `user` prop
  useEffect(() => setLocalUser(user), [user]);

  const [photoModal, setPhotoModal] = useState<{
    isOpen: boolean;
    photoType: PhotoType;
    photoUrl: string;
  }>({ isOpen: false, photoType: "photo1", photoUrl: "" });

  const [isExpanded, setIsExpanded] = useState(false);

  const [permissionModal, setPermissionModal] = useState<{
    isOpen: boolean;
    type: PermissionType;
    value: string | number;
  }>({ isOpen: false, type: "", value: "" });

  const [loadingFields, setLoadingFields] = useState<Record<string, boolean>>({});

  const getInitialSrc = useCallback((u: User) => {
    if (u?.photo1 && !isInvalidPhoto(u.photo1)) return `${AvatarImageUser}/${u.photo1}`;
    if (u?.photo2 && !isInvalidPhoto(u.photo2)) return `${AvatarImageUser}/${u.photo2}`;
    return DEFAULT_AVATAR;
  }, []);

  const statusClasses = useCallback((status?: string) => {
    switch (String(status || "").toLowerCase()) {
      case "active":
        return "bg-success text-success-foreground";
      case "online":
        return "bg-emerald-500 text-white";
      case "banned":
        return "bg-destructive text-destructive-foreground";
      case "pending":
        return "bg-warning text-warning-foreground";
      case "deleted":
        return "bg-muted text-muted-foreground";
      default:
        return "bg-muted text-muted-foreground";
    }
  }, []);

  const membershipClasses = useCallback((memtype?: string) => {
    switch (String(memtype || "").toLowerCase()) {
      case "free":
        return "bg-muted text-muted-foreground";
      case "paid":
        return "bg-blue-500 text-white";
      case "exclusive":
        return "bg-gradient-to-r from-yellow-500 to-orange-500 text-white";
      default:
        return "bg-muted text-muted-foreground";
    }
  }, []);

  // centralised update helper
  const updateUserField = useCallback(async (userId: string, data: Record<string, any>) => {
    try {
      // optimistic loading flag(s)
      const keys = Object.keys(data);
      setLoadingFields((prev) => ({ ...prev, ...Object.fromEntries(keys.map((k) => [k, true])) }));

      await updateUserById(userId, token, data);

      // reflect changes locally
      setLocalUser((prev) => {
        const next = { ...prev } as any;
        for (const [key, value] of Object.entries(data)) {
          // convert 'true'/'false' strings to boolean for local state consistency
          if (value === "true") next[key] = true;
          else if (value === "false") next[key] = false;
          else next[key] = value;
        }
        return next as User;
      });

      toast({ title: "Success", description: "User updated successfully" });
    } catch (err: any) {
      console.error("Update failed:", err);
      toast({ title: "Error", description: err?.message || "Update failed", variant: "destructive" });
    } finally {
      // clear loading flags
      setLoadingFields((prev) => {
        const copy = { ...prev };
        Object.keys(data).forEach((k) => delete copy[k]);
        return copy;
      });
    }
  }, [token, toast]);

  const handlePhotoView = useCallback((photoType: PhotoType, photoUrl: string) => {
    setPhotoModal({ isOpen: true, photoType, photoUrl });
  }, []);

  const handlePhotoApproval = useCallback(async (approved: boolean) => {
    const photoType = photoModal.photoType;
    const updateData: Record<string, any> = {};
    if (photoType === "photo1") updateData.photo1Approve = approved ? "true" : "false";
    else updateData.photo2Approve = approved ? "true" : "false";

    await updateUserField(localUser.id, updateData);
    setPhotoModal((p) => ({ ...p, isOpen: false }));
  }, [photoModal.photoType, localUser.id, updateUserField]);

  const openPermissionModal = useCallback((type: PermissionType, currentValue: string | number) => {
    setPermissionModal({ isOpen: true, type, value: currentValue ?? "" });
  }, []);

  const savePermission = useCallback(async () => {
    let field = "";
    if (permissionModal.type === "chat") field = "chat_msg";
    if (permissionModal.type === "video") field = "video_min";
    if (permissionModal.type === "audio") field = "voice_min";

    if (!field) return setPermissionModal({ isOpen: false, type: "", value: "" });

    const payload: Record<string, any> = { [field]: String(permissionModal.value) };
    await updateUserField(localUser.id, payload);
    setPermissionModal({ isOpen: false, type: "", value: "" });
  }, [permissionModal, localUser.id, updateUserField]);

  // Derived values for rendering
  const avatarSrc = useMemo(() => getInitialSrc(localUser), [localUser, getInitialSrc]);

  return (
    <Card className="relative hover:shadow-lg transition-all duration-200">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-3">
            <Checkbox checked={isSelected} onCheckedChange={(checked) => onSelectionChange(localUser.id, !!checked)} />

            <div className="relative">
              <Avatar className="h-12 w-12">
                <AvatarImage
                  src={avatarSrc}
                  alt={localUser.name}
                  loading="lazy"
                  onError={(e) => {
                    // show fallback image if network/load fails
                    (e.currentTarget as HTMLImageElement).src = DEFAULT_AVATAR;
                  }}
                />
                <AvatarFallback className="bg-primary text-primary-foreground">{getInitials(localUser.name)}</AvatarFallback>
              </Avatar>

              {localUser.onlineUsers && (
                <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full bg-green-500 border-2 border-white" title="Online" />
              )}
            </div>

            <div>
              <h3 className="font-semibold text-foreground">{localUser.name}</h3>
              <p className="text-sm text-muted-foreground">ID: {localUser.id}</p>
            </div>
          </div>

          <div className="flex flex-col items-end space-y-2">
            <Badge className={statusClasses(localUser.status)}>{localUser.status}</Badge>
            <Badge className={membershipClasses(localUser.memtype)}>
              {String(localUser.memtype || "").toLowerCase() === "exclusive" && <Crown className="h-3 w-3 mr-1" />}
              {localUser.memtype}
            </Badge>
            {localUser.gender && <Badge className="bg-pink-500 text-white">{localUser.gender}</Badge>}
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div className="flex items-center space-x-2">
            <Mail className="h-4 w-4 text-muted-foreground" />
            <span className="truncate">{localUser.email}</span>
          </div>

          <div className="flex items-center space-x-2">
            <Phone className="h-4 w-4 text-muted-foreground" />
            <span>
              +{localUser.mobilecode} {localUser.mobile}
            </span>
          </div>

          <div className="flex items-center space-x-2">
            <MapPin className="h-4 w-4 text-muted-foreground" />
            <span>
              {localUser.state}, {localUser.country}
            </span>
          </div>

          <div className="flex items-center space-x-2">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <span>{localUser.age} years old</span>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          <Button
            size="sm"
            variant={String(localUser.status || "").toLowerCase() === "active" ? "default" : "outline"}
            onClick={() => updateUserField(localUser.id, { status: "Active" })}
            aria-label="Approve user"
          >
            <Check className="h-3 w-3 mr-1" /> Approve
          </Button>

          <Button
            size="sm"
            variant={String(localUser.status || "").toLowerCase() === "banned" ? "destructive" : "outline"}
            onClick={() => updateUserField(localUser.id, { status: "Banned" })}
            aria-label="Ban user"
          >
            <Ban className="h-3 w-3 mr-1" /> Ban
          </Button>

          <Button size="sm" variant="outline" onClick={() => navigate(`/user/${localUser.id}`)}>
            <UserIcon className="h-3 w-3 mr-1" /> View Profile
          </Button>

          <Button size="sm" variant="outline" onClick={() => setIsExpanded((s) => !s)}>
            {isExpanded ? "Less" : "More"}
          </Button>
        </div>

        {isExpanded && (
          <div className="space-y-4 pt-4 border-t border-border">
            <div className="space-y-2">
              <h4 className="font-medium text-sm flex items-center gap-2">
                <Eye className="h-4 w-4" /> Photo Management
              </h4>

              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePhotoView("photo1", `${AvatarImageUser}/${localUser.photo1}`)}
                    className="w-full text-xs"
                  >
                    <Eye className="h-3 w-3 mr-1" /> View Photo 1
                  </Button>

                  <Button
                    size="sm"
                    variant={localUser.photo1Approve ? "default" : "outline"}
                    onClick={() => updateUserField(localUser.id, { photo1Approve: (!localUser.photo1Approve).toString() })}
                    className="w-full"
                    disabled={!!loadingFields["photo1Approve"]}
                  >
                    Photo 1 {localUser.photo1Approve ? <Check className="h-3 w-3 ml-1" /> : <X className="h-3 w-3 ml-1" />}
                  </Button>
                </div>

                <div className="space-y-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePhotoView("photo2", `${AvatarImageUser}/${localUser.photo2}`)}
                    className="w-full text-xs"
                  >
                    <Eye className="h-3 w-3 mr-1" /> View Photo 2
                  </Button>

                  <Button
                    size="sm"
                    variant={localUser.photo2Approve ? "default" : "outline"}
                    onClick={() => updateUserField(localUser.id, { photo2Approve: (!localUser.photo2Approve).toString() })}
                    className="w-full"
                    disabled={!!loadingFields["photo2Approve"]}
                  >
                    Photo 2 {localUser.photo2Approve ? <Check className="h-3 w-3 ml-1" /> : <X className="h-3 w-3 ml-1" />}
                  </Button>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <h4 className="font-medium text-sm">Content Approval</h4>
              <div className="flex gap-2">
                 
                <Button
                  size="sm"
                  variant={localUser.bio_approval ? "default" : "outline"}
                  onClick={() => updateUserField(localUser.id, { bio_approval: (!localUser.bio_approval).toString() })}
                >
                  Bio {localUser.bio_approval ? <Check className="h-3 w-3 ml-1" /> : <X className="h-3 w-3 ml-1" />}
                </Button>

                <Button
                  size="sm"
                  variant={localUser.partnerExpectations_approval ? "default" : "outline"}
                  onClick={() => updateUserField(localUser.id, { partnerExpectations_approval: (!localUser.partnerExpectations_approval).toString() })}
                >
                  Expectations {localUser.partnerExpectations_approval ? <Check className="h-3 w-3 ml-1" /> : <X className="h-3 w-3 ml-1" />}
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              <h4 className="font-medium text-sm">Communication Permissions</h4>
              <div className="flex flex-wrap gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  className="flex-1 sm:flex-none min-w-[100px]"
                  onClick={() => openPermissionModal("chat", localUser.chat_msg || 0)}
                >
                  <MessageCircle className="h-3 w-3 mr-1" />Chat({localUser.chat_msg || 0})
                </Button>

                <Button
                  size="sm"
                  variant="outline"
                  className="flex-1 sm:flex-none min-w-[100px]"
                  onClick={() => openPermissionModal("video", localUser.video_min || 0)}
                >
                  <Video className="h-3 w-3 mr-1" />Video({localUser.video_min || 0})
                </Button>

                <Button
                  size="sm"
                  variant="outline"
                  className="flex-1 sm:flex-none min-w-[100px]"
                  onClick={() => openPermissionModal("audio", localUser.voice_min || 0)}
                >
                  <Mic className="h-3 w-3 mr-1" />Audio({localUser.voice_min || 0})
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              <h4 className="font-medium text-sm">Bio</h4>
              <p className="text-sm text-muted-foreground bg-muted p-2 rounded">{localUser.bio}</p>
            </div>

            <div className="space-y-2">
              <h4 className="font-medium text-sm">Partner Expectations</h4>
              <p className="text-sm text-muted-foreground bg-muted p-2 rounded">{localUser.partnerExpectations}</p>
            </div>
          </div>
        )}
      </CardContent>

      <PhotoModal
        isOpen={photoModal.isOpen}
        onClose={() => setPhotoModal((p) => ({ ...p, isOpen: false }))}
        photoUrl={photoModal.photoUrl}
        photoType={photoModal.photoType}
        userName={localUser.name}
        isApproved={photoModal.photoType === "photo1" ? localUser.photo1Approve : localUser.photo2Approve}
        onApprove={handlePhotoApproval}
      />

      {permissionModal.isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg p-6 w-80">
            <h3 className="text-lg font-semibold mb-4">
              Set {permissionModal.type === "chat" ? "Chat Messages" : permissionModal.type === "video" ? "Video Minutes" : "Audio Minutes"}
            </h3>

            <input
              type="number"
              value={String(permissionModal.value)}
              onChange={(e) => setPermissionModal((prev) => ({ ...prev, value: e.target.value }))}
              className="w-full border border-gray-300 rounded px-3 py-2 mb-4 focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder="Enter number"
            />

            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setPermissionModal({ isOpen: false, type: "", value: "" })}>
                Cancel
              </Button>

              <Button onClick={savePermission}>Save</Button>
            </div>
          </div>
        </div>
      )}
    </Card>
  );
}
