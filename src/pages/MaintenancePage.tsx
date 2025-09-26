// src/pages/admin/MaintenancePage.tsx
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { getAuthToken } from "@/api/auth"; // adjust import to your project
import { Clipboard, Download, Play } from "lucide-react";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AdminSidebar } from "@/components/admin/AdminSidebar";

/**
 * Minimal API helper for hitting the maintenance endpoint.
 * Adjust path or token header keys to match your backend auth.
 */
async function runMaintenanceApi(): Promise<any> {
  const token = getAuthToken?.() || localStorage.getItem("access_token") || "";
  const res = await fetch("https://fastapi.umeed.app/api/v1/admin/admin/run_maintenance_tasks", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    // no body needed for this endpoint
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    let err;
    try {
      err = JSON.parse(text);
    } catch {
      err = { message: text || res.statusText };
    }
    throw new Error(err?.detail || err?.message || `HTTP ${res.status}`);
  }
  return res.json();
}

export default function MaintenancePage(): JSX.Element {
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState<any | null>(null);
  const [error, setError] = useState<string | null>(null);

  const runNow = async () => {
    setError(null);
    setResponse(null);
    setLoading(true);
    try {
      const data = await runMaintenanceApi();
      setResponse(data);
    } catch (err: any) {
      console.error("Maintenance API error:", err);
      setError(err?.message || "Unknown error");
    } finally {
      setLoading(false);
    }
  };

  const copyJson = async () => {
    if (!response) return;
    try {
      await navigator.clipboard.writeText(JSON.stringify(response, null, 2));
      alert("JSON copied to clipboard");
    } catch {
      alert("Failed to copy");
    }
  };

  const downloadJson = () => {
    if (!response) return;
    const blob = new Blob([JSON.stringify(response, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `maintenance-result-${new Date().toISOString()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // convenience safe getters for the response structure you returned
  const tasks = response?.tasks ?? null;
  const chatDeleted = tasks?.chat_messages_deleted?.deleted_count ?? null;
  const mrDeleted = tasks?.pending_match_requests_deleted?.deleted_count ?? null;
  const usersActivated = tasks?.users_activated?.updated_count ?? null;
  const timestamp = response?.timestamp ?? null;

  // New fields from the updated backend response
  const usersMarked = tasks?.users_marked_for_permanent_deletion?.matched_count ?? null;
  const usersPermanentlyDeleted = tasks?.users_marked_for_permanent_deletion?.permanently_deleted ?? null;

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
            <div className="p-6 max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Run Maintenance Tasks</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Runs cleanup jobs (delete old chat messages, delete stale match requests, activate users with valid membership).
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button onClick={runNow} disabled={loading} className="flex items-center gap-2">
            <Play className="w-4 h-4" />
            {loading ? "Running..." : "Run Maintenance"}
          </Button>
        </div>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Card>
          <CardHeader>
            <CardTitle>Chat messages deleted</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-3xl font-semibold">{chatDeleted !== null ? chatDeleted : "-"}</p>
                <p className="text-sm text-muted-foreground">Messages older than 3 days</p>
              </div>
              <Badge>{chatDeleted !== null ? "Done" : "—"}</Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Pending match requests deleted</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-3xl font-semibold">{mrDeleted !== null ? mrDeleted : "-"}</p>
                <p className="text-sm text-muted-foreground">Pending older than 15 days</p>
              </div>
              <Badge>{mrDeleted !== null ? "Done" : "—"}</Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Users activated</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-3xl font-semibold">{usersActivated !== null ? usersActivated : "-"}</p>
                <p className="text-sm text-muted-foreground">Activated by membershipExpiryDate</p>
              </div>
              <Badge>{usersActivated !== null ? "Done" : "—"}</Badge>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* New user deletion cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <Card>
          <CardHeader>
            <CardTitle>Users flagged for permanent deletion</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-3xl font-semibold">{usersMarked !== null ? usersMarked : "-"}</p>
                <p className="text-sm text-muted-foreground">Users with status 'deleted' & lastSeen &gt; 30 days</p>
              </div>
              <Badge>{usersMarked !== null ? "Queued" : "—"}</Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Users permanently deleted</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-3xl font-semibold">{usersPermanentlyDeleted !== null ? usersPermanentlyDeleted : "-"}</p>
                <p className="text-sm text-muted-foreground">Count permanently removed during this run</p>
              </div>
              <Badge>{usersPermanentlyDeleted !== null ? "Done" : "—"}</Badge>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Response metadata */}
      <div className="mb-4 flex items-center gap-4">
        <div>
          <p className="text-sm text-muted-foreground">Last run:</p>
          <p className="text-sm">{timestamp ? new Date(timestamp).toLocaleString() : "Not run yet"}</p>
        </div>

        <div className="ml-auto flex gap-2">
          <Button variant="outline" onClick={copyJson} disabled={!response}>
            <Clipboard className="w-4 h-4" /> Copy JSON
          </Button>
          <Button variant="outline" onClick={downloadJson} disabled={!response}>
            <Download className="w-4 h-4" /> Download JSON
          </Button>
        </div>
      </div>

      {/* Raw JSON output */}
      <div className="bg-white border rounded p-4">
        {error && (
          <div className="mb-4 text-red-600">
            <strong>Error:</strong> {error}
          </div>
        )}

        <pre className="text-xs max-h-[40vh] overflow-auto bg-slate-50 p-3 rounded">
          {response ? JSON.stringify(response, null, 2) : "// Response will appear here after you run the job"}
        </pre>
      </div>

      <div className="mt-4 text-sm text-muted-foreground">
        Note: this endpoint should be accessible only to Admin users. The page sends your auth token in `Authorization: Bearer ...` header.
      </div>
    </div>
          </main>
        </div>
      </div>
    </SidebarProvider>
    
  );
}
