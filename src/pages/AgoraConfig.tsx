import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { Edit, Trash, Plus } from "lucide-react";
import { getAuthToken } from "@/api/auth";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
type AgoraConfig = {
  id: number;
  app_id: string;
  app_certificate?: string | null;
  app_name?: string | null;
  environment?: string | null; // e.g. "prod" or "dev"
  status?: boolean;
  created_at?: string;
  updated_at?: string;
};

const API_BASE = "https://fastapi.umeed.app/api/v1/admin/admin/agora_config"; // list + create
// other endpoints:
// GET  /agora_config              -> list
// GET  /agora_config_list/{id}   -> get single
// POST /agora_config             -> create
// PUT  /agora_config_upadte/{id} -> update (kept spelling from backend)
// DELETE /agora_config_del/{id}  -> delete

export default function AgoraConfigPage(): JSX.Element {
  const { toast } = useToast();
  const token = getAuthToken();

  const [configs, setConfigs] = useState<AgoraConfig[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  // Modal / form state
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<AgoraConfig | null>(null);
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState({
    app_id: "",
    app_certificate: "",
    app_name: "",
    environment: "prod",
    status: true,
  });

  const environmentOptions = useMemo(() => ["prod", "dev", "staging"], []);

  // --- Helpers: API calls (inline) ---
  const headers = useMemo(() => {
    const h: Record<string, string> = {};
    if (token) h["Authorization"] = `Bearer ${token}`;
    h["Content-Type"] = "application/json";
    return h;
  }, [token]);

  const handleResponse = async (res: Response) => {
    const text = await res.text();
    try {
      return { ok: res.ok, body: text ? JSON.parse(text) : null, status: res.status };
    } catch {
      return { ok: res.ok, body: text, status: res.status };
    }
  };

  const fetchConfigs = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}`, { method: "GET", headers: { Authorization: token ? `Bearer ${token}` : "" } });
      const { ok, body } = await handleResponse(res);
      if (!ok) throw new Error(body?.detail || body?.message || "Failed to fetch configs");
      setConfigs(body || []);
    } catch (err: any) {
      console.error("fetchConfigs:", err);
      toast({ title: "Error", description: String(err?.message || err), variant: "destructive" });
    } finally {
      setLoading(false);
    }
  }, [token, toast, refreshKey]);

  useEffect(() => {
    fetchConfigs();
  }, [fetchConfigs, refreshKey]);

  // --- UI flow helpers ---
  const openCreate = useCallback(() => {
    setEditing(null);
    setForm({ app_id: "", app_certificate: "", app_name: "", environment: "prod", status: true });
    setOpen(true);
  }, []);

  const openEdit = useCallback(async (cfg: AgoraConfig) => {
    // If you want to fetch fresh single record, you can call the GET single endpoint here.
    setEditing(cfg);
    setForm({
      app_id: cfg.app_id,
      app_certificate: cfg.app_certificate ?? "",
      app_name: cfg.app_name ?? "",
      environment: cfg.environment ?? "prod",
      status: cfg.status ?? true,
    });
    setOpen(true);
  }, []);

  // --- Validation ---
  const validateForm = useCallback(() => {
    if (!form.app_id || String(form.app_id).trim().length < 2) {
      toast({ title: "Validation", description: "App ID is required", variant: "destructive" });
      return false;
    }
    return true;
  }, [form, toast]);

  // --- Create / Update ---
  const handleSave = useCallback(async () => {
    if (!validateForm()) return;
    setSaving(true);
    try {
      const payload = {
        app_id: form.app_id,
        app_certificate: form.app_certificate || undefined,
        app_name: form.app_name || undefined,
        environment: form.environment || undefined,
        status: form.status,
      };

      let res: Response;
      if (editing) {
        // update (partial allowed)
        res = await fetch(`${API_BASE}_upadte/${editing.id}`, {
          method: "PUT",
          headers,
          body: JSON.stringify(payload),
        });
      } else {
        // create
        res = await fetch(`${API_BASE}`, {
          method: "POST",
          headers,
          body: JSON.stringify(payload),
        });
      }

      const { ok, body } = await handleResponse(res);
      if (!ok) {
        throw new Error(body?.detail || body?.message || `Failed to ${editing ? "update" : "create"}`);
      }

      toast({ title: editing ? "Updated" : "Created", description: body?.message || "Operation successful" });
      setOpen(false);
      setRefreshKey((k) => k + 1);
    } catch (err: any) {
      console.error("handleSave:", err);
      toast({ title: "Error", description: String(err?.message || err), variant: "destructive" });
    } finally {
      setSaving(false);
    }
  }, [editing, form, headers, validateForm, toast]);

  // --- Delete ---
  const handleDelete = useCallback(
    async (id: number, appId?: string) => {
      if (!confirm(`Delete Agora config ${appId ?? id}?`)) return;
      setLoading(true);
      try {
        const res = await fetch(`${API_BASE}_del/${id}`, { method: "DELETE", headers: { Authorization: token ? `Bearer ${token}` : "" } });
        const { ok, body } = await handleResponse(res);
        if (!ok) throw new Error(body?.detail || body?.message || "Delete failed");
        toast({ title: "Deleted", description: body?.message || "Config deleted" });
        setRefreshKey((k) => k + 1);
      } catch (err: any) {
        console.error("handleDelete:", err);
        toast({ title: "Error", description: String(err?.message || err), variant: "destructive" });
      } finally {
        setLoading(false);
      }
    },
    [token, toast]
  );

  // small table row renderer (keeps markup readable)
  const renderRow = (c: AgoraConfig) => (
    <tr key={c.id} className="border-t">
      <td className="p-2">{c.id}</td>
      <td className="p-2 font-medium">{c.app_id}</td>
      <td className="p-2">{c.app_name || "—"}</td>
      <td className="p-2">{c.app_certificate ? "Yes" : "No"}</td>
      <td className="p-2">{c.environment || "prod"}</td>
      <td className="p-2">{c.status ? "Enabled" : "Disabled"}</td>
      <td className="p-2">
        <div className="flex items-center gap-2">
          <Button size="sm" variant="ghost" onClick={() => openEdit(c)}>
            <Edit className="h-4 w-4" />
          </Button>
          <Button size="sm" variant="destructive" onClick={() => handleDelete(c.id, c.app_id)}>
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
       <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Agora Configs</h1>
        <div className="flex gap-2">
          <Button onClick={() => fetchConfigs()} disabled={loading}>
            Refresh
          </Button>
          <Button onClick={openCreate}>
            <Plus className="h-4 w-4 mr-2" /> New Config
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Configured Apps</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full table-auto border-collapse">
              <thead>
                <tr className="text-left">
                  <th className="p-2">#</th>
                  <th className="p-2">App ID</th>
                  <th className="p-2">App Name</th>
                  <th className="p-2">Has Cert</th>
                  <th className="p-2">Environment</th>
                  <th className="p-2">Status</th>
                  <th className="p-2">Actions</th>
                </tr>
              </thead>
              <tbody>
                {configs.map(renderRow)}
                {configs.length === 0 && (
                  <tr>
                    <td colSpan={7} className="p-4 text-center text-muted-foreground">
                      No configs found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Create / Edit Modal */}
      <Dialog open={open} onOpenChange={() => setOpen(false)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{editing ? `Edit ${editing.app_id}` : "Create Agora Config"}</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <Label>App ID</Label>
              <Input
                value={form.app_id}
                onChange={(e) => setForm((s) => ({ ...s, app_id: e.target.value }))}
                placeholder="Unique app id (required)"
                disabled={!!editing} // typically app_id is unique; avoid editing it
              />
            </div>

            <div>
              <Label>App Certificate (optional)</Label>
              <Input value={form.app_certificate} onChange={(e) => setForm((s) => ({ ...s, app_certificate: e.target.value }))} />
            </div>

            <div>
              <Label>App Name (optional)</Label>
              <Input value={form.app_name} onChange={(e) => setForm((s) => ({ ...s, app_name: e.target.value }))} />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-end">
              <div>
                <Label>Environment</Label>
                <Select value={form.environment} onValueChange={(v: string) => setForm((s) => ({ ...s, environment: v }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select environment" />
                  </SelectTrigger>
                  <SelectContent>
                    {environmentOptions.map((env) => (
                      <SelectItem key={env} value={env}>
                        {env}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Status</Label>
                <div className="flex items-center gap-3 mt-1">
                  <label className="flex items-center gap-2">
                    <input type="radio" name="status" checked={form.status === true} onChange={() => setForm((s) => ({ ...s, status: true }))} />
                    <span>Enabled</span>
                  </label>
                  <label className="flex items-center gap-2">
                    <input type="radio" name="status" checked={form.status === false} onChange={() => setForm((s) => ({ ...s, status: false }))} />
                    <span>Disabled</span>
                  </label>
                </div>
              </div>
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
}
