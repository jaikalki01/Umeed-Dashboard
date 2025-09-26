import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { Edit, Trash, Plus, Eye } from "lucide-react";
import { getAuthToken } from "@/api/auth";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
type Banner = {
  id: number;
  banner_name: string;
  banner_url?: string | null;
};
const bannerUrl = "https://fastapi.umeed.app";

type BannerType = "banner1" | "banner2";

const PLACEHOLDER = "/placeholder.svg";
const API_BASES: Record<BannerType, string> = {
  banner1: "https://fastapi.umeed.app/api/v1/admin/admin/banner1",
  banner2: "https://fastapi.umeed.app/api/v1/admin/admin/banner2",
};

export const BannerManager: React.FC = () => {
  const token = getAuthToken();
  const { toast } = useToast();

  const [activeTab, setActiveTab] = useState<BannerType>("banner1");

  const [banner1, setBanner1] = useState<Banner[]>([]);
  const [banner2, setBanner2] = useState<Banner[]>([]);
  const [loading, setLoading] = useState(false);

  // dialog / form state
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<{ type: BannerType; item: Banner | null } | null>(null);
  const [formName, setFormName] = useState("");
  const [formFile, setFormFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // fetch lists
  const fetchList = useCallback(
    async (type: BannerType) => {
      const path = API_BASES[type] + "/";
      try {
        if (type === "banner1") setLoading(true);
        else setLoading(true);
        const res = await fetch(path, {
          headers: {
            Authorization: token ? `Bearer ${token}` : "",
          },
        });
        const json = await res.json();
        if (!res.ok) throw new Error(json?.detail || json?.message || "Failed to fetch banners");
        if (type === "banner1") setBanner1(json || []);
        else setBanner2(json || []);
      } catch (err: any) {
        console.error("fetchList error", err);
        toast({ title: "Error", description: String(err?.message || err), variant: "destructive" });
      } finally {
        setLoading(false);
      }
    },
    [token, toast]
  );

  const fetchAll = useCallback(async () => {
    await Promise.all([fetchList("banner1"), fetchList("banner2")]);
  }, [fetchList]);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  // open modal helpers
  const openCreate = (type: BannerType) => {
    setEditing({ type, item: null });
    setFormName("");
    setFormFile(null);
    setPreviewUrl(null);
    setModalOpen(true);
  };

  const openEdit = (type: BannerType, item: Banner) => {
    setEditing({ type, item });
    setFormName(item.banner_name || "");
    setFormFile(null);
    setPreviewUrl(item.banner_url || null);
    setModalOpen(true);
  };

  // preview file selected
  useEffect(() => {
    if (!formFile) {
      // keep previewUrl if editing and existing url present
      return;
    }
    const url = URL.createObjectURL(formFile);
    setPreviewUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [formFile]);

  // create or update
  const handleSubmit = useCallback(
    async (type: BannerType) => {
      if (!formName || String(formName).trim().length < 2) {
        toast({ title: "Validation", description: "Banner name is required", variant: "destructive" });
        return;
      }
      setSubmitting(true);
      try {
        const isEdit = !!(editing && editing.item);
        const basePath = API_BASES[type] + (isEdit ? `/${editing!.item!.id}` : "/");
        // FormData because endpoints accept file in form
        const fd = new FormData();
        fd.append("banner_name", formName);
        if (formFile) fd.append("file", formFile);

        const res = await fetch(basePath, {
          method: isEdit ? "PUT" : "POST",
          body: fd,
          headers: {
            Authorization: token ? `Bearer ${token}` : "",
          } as any, // don't set Content-Type for FormData
        });

        const json = await res.json();
        if (!res.ok) throw new Error(json?.detail || json?.message || "Save failed");

        toast({ title: "Saved", description: isEdit ? "Banner updated" : "Banner created" });
        setModalOpen(false);
        await fetchList(type);
      } catch (err: any) {
        console.error("save error", err);
        toast({ title: "Error", description: String(err?.message || err), variant: "destructive" });
      } finally {
        setSubmitting(false);
      }
    },
    [formName, formFile, editing, token, toast, fetchList]
  );

  // delete
  const handleDelete = useCallback(
    async (type: BannerType, id: number, name?: string) => {
      if (!confirm(`Delete ${name || "banner"}?`)) return;
      setLoading(true);
      try {
        const res = await fetch(`${API_BASES[type]}/${id}`, {
          method: "DELETE",
          headers: { Authorization: token ? `Bearer ${token}` : "" },
        });
        const json = await res.json();
        if (!res.ok) throw new Error(json?.detail || json?.message || "Delete failed");
        toast({ title: "Deleted", description: json?.message || "Banner deleted" });
        await fetchList(type);
      } catch (err: any) {
        console.error("delete error", err);
        toast({ title: "Error", description: String(err?.message || err), variant: "destructive" });
      } finally {
        setLoading(false);
      }
    },
    [token, toast, fetchList]
  );

  // simple image element with fallback on error
  const ImgWithFallback: React.FC<{ src?: string | null; alt?: string; className?: string }> = ({ src, alt, className }) => {
    const [error, setError] = useState(false);
    const effective = src && !error ? src : PLACEHOLDER;
    return (
      <img
        src={effective}
        alt={alt || "banner image"}
        className={className}
        onError={() => setError(true)}
        style={{ maxWidth: "100%", maxHeight: 120, objectFit: "cover", borderRadius: 8 }}
      />
    );
  };

  const activeList = activeTab === "banner1" ? banner1 : banner2;

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
        <h1 className="text-2xl font-bold">Banners</h1>
        <div className="flex gap-2">
          <Button variant={activeTab === "banner1" ? "default" : "outline"} onClick={() => setActiveTab("banner1")}>
            Banner1
          </Button>
          <Button variant={activeTab === "banner2" ? "default" : "outline"} onClick={() => setActiveTab("banner2")}>
            Banner2
          </Button>
          <Button onClick={() => openCreate(activeTab)}>
            <Plus className="h-4 w-4 mr-2" /> New
          </Button>
          <Button onClick={() => fetchList(activeTab)} disabled={loading}>
            Refresh
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{activeTab === "banner1" ? "Banner1 List" : "Banner2 List"}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {activeList.length === 0 && <div className="text-muted-foreground p-4">No banners found</div>}
            {activeList.map((b) => (
              <div key={b.id} className="border rounded-lg p-3 flex flex-col gap-3">
                <div className="h-28 w-full flex items-center justify-center bg-muted rounded">
                  <ImgWithFallback src={`${bannerUrl}${b.banner_url}` || null} alt={b.banner_name} />
                </div>
                <div className="flex-1">
                  <div className="font-medium">{b.banner_name}</div>
                </div>
                <div className="flex gap-2 justify-end">
                  <Button variant="ghost" size="sm" onClick={() => openEdit(activeTab, b)}>
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      // quick preview in new tab if url exists
                      if (b.banner_url) window.open(`${bannerUrl}${b.banner_url}`, "_blank");
                      else toast({ title: "No image", description: "No image available to preview", variant: "destructive" });
                    }}
                  >
                    <Eye className="h-4 w-4" />
                  </Button>
                  <Button variant="destructive" size="sm" onClick={() => handleDelete(activeTab, b.id, b.banner_name)}>
                    <Trash className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Modal for create/edit */}
      <Dialog open={modalOpen} onOpenChange={() => setModalOpen(false)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{editing && editing.item ? "Edit Banner" : `Create ${activeTab === "banner1" ? "Banner1" : "Banner2"}`}</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <Label>Banner Name</Label>
              <Input value={formName} onChange={(e) => setFormName(e.target.value)} placeholder="Enter banner name" />
            </div>

            <div>
              <Label>Upload File (optional)</Label>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => {
                  const f = e.target.files?.[0] ?? null;
                  setFormFile(f);
                  if (!f && editing && editing.item) setPreviewUrl(editing.item.banner_url || null);
                }}
              />
            </div>

            <div>
              <Label>Preview</Label>
              <div className="mt-2">
                {previewUrl ? (
                  <img
                    src={previewUrl}
                    alt="preview"
                    className="w-full max-h-60 object-contain rounded"
                    onError={(e) => {
                      (e.currentTarget as HTMLImageElement).src = PLACEHOLDER;
                    }}
                  />
                ) : (
                  <div className="bg-muted rounded p-6 text-center text-sm text-muted-foreground">No image selected</div>
                )}
              </div>
            </div>

            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setModalOpen(false)} disabled={submitting}>
                Cancel
              </Button>
              <Button
                onClick={() => {
                  // decide type from editing or activeTab
                  const type = (editing && editing.type) || activeTab;
                  handleSubmit(type);
                }}
                disabled={submitting}
              >
                {submitting ? "Saving..." : editing && editing.item ? "Update" : "Create"}
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
