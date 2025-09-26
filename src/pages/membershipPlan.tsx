import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { Edit, Trash, Plus } from "lucide-react";
import { getAuthToken } from "@/api/auth";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
type Membership = {
  id: number;
  membership_name: string;
  inr_price: number;
  usd_price: number;
  video_mins: number;
  voice_mins: number;
  chat_no: number;
  days: number;
  status?: string;
  is_active?: boolean;
};

const API_BASE = "https://fastapi.umeed.app/api/v1/admin/admin/memberships";

export const MembershipsManager: React.FC = () => {
  const token = getAuthToken();
  const { toast } = useToast();

  const [memberships, setMemberships] = useState<Membership[]>([]);
  const [loading, setLoading] = useState(false);

  // modal / form state
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Membership | null>(null);
  const [saving, setSaving] = useState(false);

  const initialForm = {
    membership_name: "",
    inr_price: 0,
    usd_price: 0,
    video_mins: 0,
    voice_mins: 0,
    chat_no: 0,
    days: 0,
    status: "active",
    is_active: true,
  };

  const [form, setForm] = useState<Partial<Membership>>(initialForm);

  // Fetch list
  const fetchList = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(API_BASE, {
        headers: { Authorization: token ? `Bearer ${token}` : "" },
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json?.detail || json?.message || "Failed to fetch memberships");
      setMemberships(json || []);
    } catch (err: any) {
      console.error("fetch memberships error:", err);
      toast({ title: "Error", description: String(err?.message || err), variant: "destructive" });
    } finally {
      setLoading(false);
    }
  }, [token, toast]);

  useEffect(() => {
    fetchList();
  }, [fetchList]);

  // Open create modal
  const openCreate = useCallback(() => {
    setEditing(null);
    setForm(initialForm);
    setOpen(true);
  }, []);

  // Open edit modal
  const openEdit = useCallback((m: Membership) => {
    setEditing(m);
    setForm({
      membership_name: m.membership_name,
      inr_price: m.inr_price,
      usd_price: m.usd_price,
      video_mins: m.video_mins,
      voice_mins: m.voice_mins,
      chat_no: m.chat_no,
      days: m.days,
      status: m.status ?? "active",
      is_active: !!m.is_active,
    });
    setOpen(true);
  }, []);

  // Basic validation
  const validate = useCallback(() => {
    if (!form.membership_name || String(form.membership_name).trim().length < 2) {
      toast({ title: "Validation", description: "Membership name is required", variant: "destructive" });
      return false;
    }
    // numeric sanity checks
    const nums = ["inr_price", "usd_price", "video_mins", "voice_mins", "chat_no", "days"] as const;
    for (const k of nums) {
      const v = (form as any)[k];
      if (v === undefined || v === null || Number.isNaN(Number(v))) {
        toast({ title: "Validation", description: `Please provide a valid value for ${k}`, variant: "destructive" });
        return false;
      }
    }
    return true;
  }, [form, toast]);

  // Save (create or update)
  const handleSave = useCallback(async () => {
    if (!validate()) return;
    setSaving(true);
    try {
      const payload = {
        membership_name: String(form.membership_name),
        inr_price: Number(form.inr_price),
        usd_price: Number(form.usd_price),
        video_mins: Number(form.video_mins),
        voice_mins: Number(form.voice_mins),
        chat_no: Number(form.chat_no),
        days: Number(form.days),
        status: form.status ?? "active",
        is_active: !!form.is_active,
      };

      let res: Response;
      if (editing) {
        res = await fetch(`${API_BASE}/${editing.id}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: token ? `Bearer ${token}` : "",
          },
          body: JSON.stringify(payload),
        });
      } else {
        res = await fetch(API_BASE, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: token ? `Bearer ${token}` : "",
          },
          body: JSON.stringify(payload),
        });
      }

      const json = await res.json();
      if (!res.ok) throw new Error(json?.detail || json?.message || "Save failed");

      toast({ title: "Success", description: editing ? "Membership updated" : "Membership created" });
      setOpen(false);
      await fetchList();
    } catch (err: any) {
      console.error("save membership error:", err);
      toast({ title: "Error", description: String(err?.message || err), variant: "destructive" });
    } finally {
      setSaving(false);
    }
  }, [editing, form, token, toast, fetchList, validate]);

  const handleDelete = useCallback(
    async (m: Membership) => {
      if (!confirm(`Delete membership "${m.membership_name}"?`)) return;
      setLoading(true);
      try {
        const res = await fetch(`${API_BASE}/${m.id}`, {
          method: "DELETE",
          headers: { Authorization: token ? `Bearer ${token}` : "" },
        });
        const json = await res.json();
        if (!res.ok) throw new Error(json?.detail || json?.message || "Delete failed");
        toast({ title: "Deleted", description: json?.message || "Membership deleted" });
        await fetchList();
      } catch (err: any) {
        console.error("delete membership error:", err);
        toast({ title: "Error", description: String(err?.message || err), variant: "destructive" });
      } finally {
        setLoading(false);
      }
    },
    [token, toast, fetchList]
  );

  // helpers to render features / quick summary
  const renderRow = (m: Membership) => (
    <tr key={m.id} className="border-t">
      <td className="p-2">{m.id}</td>
      <td className="p-2">{m.membership_name}</td>
      <td className="p-2">₹{m.inr_price.toFixed(2)}</td>
      <td className="p-2">${m.usd_price.toFixed(2)}</td>
      <td className="p-2">{m.video_mins}</td>
      <td className="p-2">{m.voice_mins}</td>
      <td className="p-2">{m.chat_no}</td>
      <td className="p-2">{m.days}</td>
      <td className="p-2">{m.is_active ? "Yes" : "No"}</td>
      <td className="p-2">
        <div className="flex items-center gap-2">
          <Button size="sm" variant="ghost" onClick={() => openEdit(m)}>
            <Edit className="h-4 w-4" />
          </Button>
          <Button size="sm" variant="destructive" onClick={() => handleDelete(m)}>
            <Trash className="h-4 w-4" />
          </Button>
        </div>
      </td>
    </tr>
  );

  return (
      <SidebarProvider>
  <div className="min-h-screen flex w-full">
    <AdminSidebar />
    <div className="flex-1 flex flex-col">
      {/* Sticky Header */}
      <header className="h-14 flex items-center border-b bg-background px-4 sticky top-0 z-50">
        <SidebarTrigger />
        <div className="ml-4">
          <h1 className="text-lg font-semibold">Admin Dashboard</h1>
        </div>
      </header>

      <main className="flex-1 p-6 bg-muted/20 overflow-auto">
        <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Membership Plans</h1>
        <div className="flex gap-2">
          <Button onClick={() => fetchList()} disabled={loading}>
            Refresh
          </Button>
          <Button onClick={openCreate}>
            <Plus className="h-4 w-4 mr-2" /> New Plan
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Available Plans</CardTitle>
        </CardHeader>

        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full table-auto border-collapse">
              <thead>
                <tr className="text-left">
                  <th className="p-2">#</th>
                  <th className="p-2">Name</th>
                  <th className="p-2">INR</th>
                  <th className="p-2">USD</th>
                  <th className="p-2">Video (min)</th>
                  <th className="p-2">Audio (min)</th>
                  <th className="p-2">Chat no</th>
                  <th className="p-2">Days</th>
                  <th className="p-2">Active</th>
                  <th className="p-2">Actions</th>
                </tr>
              </thead>
              <tbody>
                {memberships.map(renderRow)}
                {memberships.length === 0 && (
                  <tr>
                    <td colSpan={10} className="p-4 text-center text-muted-foreground">
                      No memberships found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Create / Edit modal */}
      <Dialog open={open} onOpenChange={() => setOpen(false)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{editing ? "Edit Membership" : "Create Membership"}</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label>Membership Name</Label>
                <Input value={form.membership_name ?? ""} onChange={(e) => setForm((s) => ({ ...s, membership_name: e.target.value }))} />
              </div>

              <div>
                <Label>INR Price</Label>
                <Input type="number" value={String(form.inr_price ?? 0)} onChange={(e) => setForm((s) => ({ ...s, inr_price: Number(e.target.value) }))} />
              </div>

              <div>
                <Label>USD Price</Label>
                <Input type="number" value={String(form.usd_price ?? 0)} onChange={(e) => setForm((s) => ({ ...s, usd_price: Number(e.target.value) }))} />
              </div>

              <div>
                <Label>Days</Label>
                <Input type="number" value={String(form.days ?? 0)} onChange={(e) => setForm((s) => ({ ...s, days: Number(e.target.value) }))} />
              </div>

              <div>
                <Label>Video Minutes</Label>
                <Input type="number" value={String(form.video_mins ?? 0)} onChange={(e) => setForm((s) => ({ ...s, video_mins: Number(e.target.value) }))} />
              </div>

              <div>
                <Label>Audio Minutes</Label>
                <Input type="number" value={String(form.voice_mins ?? 0)} onChange={(e) => setForm((s) => ({ ...s, voice_mins: Number(e.target.value) }))} />
              </div>

              <div>
                <Label>Chat No</Label>
                <Input type="number" value={String(form.chat_no ?? 0)} onChange={(e) => setForm((s) => ({ ...s, chat_no: Number(e.target.value) }))} />
              </div>

              <div>
                <Label>Status</Label>
                <Input value={form.status ?? "active"} onChange={(e) => setForm((s) => ({ ...s, status: e.target.value }))} />
              </div>
            </div>

            <div>
              <Label>Description (optional)</Label>
              <Textarea value={(form as any).description ?? ""} onChange={(e) => setForm((s) => ({ ...s, description: e.target.value }))} />
            </div>

            <div className="flex items-center gap-2">
              <input id="is_active" type="checkbox" checked={!!form.is_active} onChange={(e) => setForm((s) => ({ ...s, is_active: e.target.checked }))} />
              <Label htmlFor="is_active">Active</Label>
            </div>

            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setOpen(false)} disabled={saving}>
                Cancel
              </Button>
              <Button onClick={handleSave} disabled={saving}>
                {saving ? "Saving..." : editing ? "Update" : "Create"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
      </main>
    </div>
  </div>
</SidebarProvider>
   
  );
};
