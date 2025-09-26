import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { User } from "@/types/user";
import { 
  Users, 
  UserCheck, 
  UserX, 
  Crown, 
  Heart, 
  Image,
  MessageCircle,
  Video,
  Mic
} from "lucide-react";

interface AdminStatsProps {
  users: User[];
  total: number;
  active?: number;
  pending?: number;
  banned?: number;
  //free?: number;
  paid?: number;
  exclusive?: number;
  photo1Pending?: number;
  photo2Pending?: number;
  bioPending?: number;
  expectationsPending?: number;
//  chatEnabled?: number;
  //videoEnabled?: number;
  //audioEnabled?: number;
  // Add other aggregated stats if needed

}

export const AdminStats = ({ users, total, active,pending,banned,paid,exclusive,photo1Pending,photo2Pending, bioPending,expectationsPending

 }: AdminStatsProps) => {
  const stats = {
    total: total,
    active: active,
    pending: pending,
    banned: banned,
    free: users.filter(u => u.memtype === 'Free').length,
    paid: paid,
    exclusive: exclusive,
    photo1Pending: photo1Pending,
    photo2Pending: photo2Pending,
    bioPending: bioPending,
    expectationsPending: expectationsPending,
    chatEnabled: users.filter(u => u.chatAllowed).length,
    videoEnabled: users.filter(u => u.videoCallAllowed).length,
    audioEnabled: users.filter(u => u.audioCallAllowed).length,
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* User Status Stats */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Users</CardTitle>
          <Users className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{total}</div>
          <div className="flex space-x-2 mt-2">
            <Badge variant="secondary" className="text-xs">
              Active: {stats.active}
            </Badge>
            <Badge variant="outline" className="text-xs">
              Pending: {stats.pending}
            </Badge>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Active Users</CardTitle>
          <UserCheck className="h-4 w-4 text-success" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-success">{stats.active}</div>
          <p className="text-xs text-muted-foreground">
            {((stats.active / stats.total) * 100).toFixed(1)}% of total
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Banned Users</CardTitle>
          <UserX className="h-4 w-4 text-destructive" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-destructive">{stats.banned}</div>
          <p className="text-xs text-muted-foreground">
            {((stats.banned / stats.total) * 100).toFixed(1)}% of total
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Pending Approval</CardTitle>
          <Heart className="h-4 w-4 text-warning" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-warning">{stats.pending}</div>
          <p className="text-xs text-muted-foreground">
            Awaiting review
          </p>
        </CardContent>
      </Card>

      {/* Membership Stats */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Membership Plans</CardTitle>
          <Crown className="h-4 w-4 text-primary" />
        </CardHeader>
        <CardContent>
          <div className="space-y-1">
            <div className="flex justify-between text-sm">
              <span>Free:</span>
              <span className="font-medium">{stats.free}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span>Paid:</span>
              <span className="font-medium text-info">{stats.paid}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span>Exclusive:</span>
              <span className="font-medium text-primary">{stats.exclusive}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Photo Approval Stats */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Photo Approvals</CardTitle>
          <Image className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="space-y-1">
            <div className="flex justify-between text-sm">
              <span>Photo 1 Pending:</span>
              <span className="font-medium text-warning">{stats.photo1Pending}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span>Photo 2 Pending:</span>
              <span className="font-medium text-warning">{stats.photo2Pending}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Content Approval Stats */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Content Approvals</CardTitle>
          <Heart className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="space-y-1">
            <div className="flex justify-between text-sm">
              <span>Bio Pending:</span>
              <span className="font-medium text-warning">{stats.bioPending}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span>Expectations Pending:</span>
              <span className="font-medium text-warning">{stats.expectationsPending}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Communication Stats */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Communication</CardTitle>
          <MessageCircle className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="space-y-1">
            <div className="flex justify-between text-sm">
              <span>Chat Enabled:</span>
              <span className="font-medium text-success">{stats.chatEnabled}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span>Video Enabled:</span>
              <span className="font-medium text-info">{stats.videoEnabled}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span>Audio Enabled:</span>
              <span className="font-medium text-primary">{stats.audioEnabled}</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};