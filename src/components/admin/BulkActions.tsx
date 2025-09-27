import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import {
  Users,
  Check,
  Ban,
  MessageCircle,
  Video,
  Mic,
  ChevronDown
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { updateUserById } from "@/api/apihelper";

interface BulkActionsProps {
  selectedCount: number;
  selectedUsers?: string[];
  onSelectAll: () => void;
  onClearSelection: () => void;
  onRefresh: () => void;
  onBulkAction: (action: { type: string; field?: string; value?: string | boolean }) => void;
}

export const BulkActions = ({
  selectedCount,
  selectedUsers = [],
  onSelectAll,
  onClearSelection,
  onRefresh,
  onBulkAction
}: BulkActionsProps) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const { toast } = useToast();
  
  // ✅ Optimistic update + fast API call
 // simple parser for strings like "approve_photo1"



  if (selectedCount === 0) {
    return (
      <div className="bg-muted/20 border rounded-lg p-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <p className="text-muted-foreground">No users selected</p>
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" size="sm" onClick={onSelectAll}>
              Select All
            </Button>
            <Button variant="outline" size="sm" onClick={onRefresh}>
              Refresh
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-primary/10 border border-primary/20 rounded-lg p-4 space-y-4">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center space-x-3 flex-wrap">
          <Badge variant="secondary" className="bg-primary text-primary-foreground">
            <Users className="h-3 w-3 mr-1" />
            {selectedCount} selected
          </Badge>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsExpanded(!isExpanded)}
          >
            Bulk Actions
            <ChevronDown className={`h-4 w-4 ml-1 transition-transform ${isExpanded ? "rotate-180" : ""}`} />
          </Button>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="ghost" size="sm" onClick={onClearSelection}>
            Clear Selection
          </Button>
        </div>
      </div>

      {/* Expanded Bulk Actions */}
      {isExpanded && (
        <div className="space-y-4">
          {/* Status Actions */}
          <div className="flex flex-wrap gap-2">
            <Button size="sm" className="bg-success hover:bg-success/90" onClick={() => onBulkAction({ type: "status", value: "active" })}>
              <Check className="h-3 w-3 mr-1" /> Approve All
            </Button>
            <Button size="sm" variant="destructive" onClick={() => onBulkAction({ type: "status", value: "banned" })}>
              <Ban className="h-3 w-3 mr-1" /> Ban All
            </Button>
            <Button size="sm" variant="outline" onClick={() => onBulkAction(  { type: "status", value: "pending" })}>
              Pending
            </Button>
          </div>

          {/* Membership Actions */}
          {/* <div className="space-y-2">
            <h4 className="text-sm font-medium">Change Membership:</h4>
            <div className="flex gap-2 flex-wrap">
              <Select onValueChange={(value) => handleBulkAction("memtype", value)}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Select Plan" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Free">Free</SelectItem>
                  <SelectItem value="basic_chat_pack">Basic Chat Pack</SelectItem>
                  <SelectItem value="standard_pack">Standard Pack</SelectItem>
                  <SelectItem value="weekly_pack">Weekly Pack</SelectItem>
                  <SelectItem value="12-day_pack">12-Day Pack</SelectItem>
                  <SelectItem value="monthly_pack">Monthly Pack</SelectItem>
                  <SelectItem value="exclusive_member">Exclusive Member</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div> */}

          {/* Content Approval */}
          <div className="space-y-2">
            <h4 className="text-sm font-medium">Content Approval:</h4>
            <div className="flex flex-wrap gap-2">
              <Button size="sm" variant="outline" onClick={() => onBulkAction({type:"approve", field:"photo1"})}>Approve Photo 1</Button>
              <Button size="sm" variant="outline" onClick={() => onBulkAction({type:"approve",field:"photo2"})}>Approve Photo 2</Button>
              <Button size="sm" variant="outline" onClick={() => onBulkAction({type:"approve",field:"bio"})}>Approve Bio</Button>
              <Button size="sm" variant="outline" onClick={() => onBulkAction({type:"approve", field:"expectations"})}>Approve Expectations</Button>
            </div>
          </div>

          <div className="space-y-2">
            <h4 className="text-sm font-medium">Content DisApproval:</h4>
            <div className="flex flex-wrap gap-2">
              <Button size="sm" variant="outline" onClick={() => onBulkAction({type:"disapprove", field:"photo1"})}>DisApproval Photo 1</Button>
              <Button size="sm" variant="outline" onClick={() => onBulkAction({type:"disapprove",field:"photo1"})}>DisApproval Photo 2</Button>
              <Button size="sm" variant="outline" onClick={() => onBulkAction({type:"disapprove",field:"bio"})}>DisApproval Bio</Button>
              <Button size="sm" variant="outline" onClick={() => onBulkAction({type:"disapprove", field:"expectations"})}>DisApproval Expectations</Button>
            </div>
          </div>

          {/* Communication Permissions */}
     {/* <div className="space-y-2">
  <h4 className="text-sm font-medium">Communication Permissions:</h4>
  <div className="flex flex-wrap gap-4">
   
    <div className="flex items-center gap-2">
      <label className="text-sm font-medium w-16">Chat</label>
      <input
        type="number"
        min="0"
        className="border rounded-md px-2 py-1 w-24 text-sm"
        placeholder="e.g. 50"
        onChange={(e) => handleBulkAction("chat_msg", e.target.value)}
      />
    </div>

   
    <div className="flex items-center gap-2">
      <label className="text-sm font-medium w-16">Video</label>
      <input
        type="number"
        min="0"
        className="border rounded-md px-2 py-1 w-24 text-sm"
        placeholder="e.g. 30"
        onChange={(e) => handleBulkAction("video_min", e.target.value)}
      />
    </div>

    
    <div className="flex items-center gap-2">
      <label className="text-sm font-medium w-16">Audio</label>
      <input
        type="number"
        min="0"
        className="border rounded-md px-2 py-1 w-24 text-sm"
        placeholder="e.g. 20"
        onChange={(e) => handleBulkAction("voice_min", e.target.value)}
      />
    </div>
  </div>
</div> */}

        </div>
      )}
    </div>
  );
};
