import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getUserById, updateUserById } from "@/api/apihelper";
import type { User } from "@/types/user";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Save } from "lucide-react";
import { getAuthToken } from "@/api/auth";

// NOTE: This refactor focuses on clarity, type-safety and smaller helper functions.
export default function EditUserProfile() {
  const { userId } = useParams<{ userId: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const token = getAuthToken();

  const [originalUser, setOriginalUser] = useState<User | null>(null);
  const [formData, setFormData] = useState<Partial<User>>({});
  const [loading, setLoading] = useState<boolean>(true);
  const [isSaving, setIsSaving] = useState<boolean>(false);

  // --- Options (memoized to avoid re-creation) ---
  const genderOptions = useMemo(
    () => [
      
      "Nonbinary",
      "Transgender Woman",
      "Transgender Man",
      "Intersex",
      "Queer",
      "Asexual",
      "Bisexual (Man)",
      "Bisexual (Woman)",
      "Gay",
      "Lesbian",
      "Other",
    ],
    []
  );

  const statusOptions = useMemo(() => ["Paid", "Active", "Pending", "Banned", "Deleted", "Exclusive"], []);
  const countryOptions = useMemo(() => ["India", "USA", "UK", "Canada", "Australia"], []);

  // --- Fetch user ---
  useEffect(() => {
    let mounted = true;
    const load = async () => {
      if (!userId) return;
      setLoading(true);
      try {
        const res = await getUserById(userId);
        if (!mounted) return;

        if (res && res.success && res.data) {
          setOriginalUser(res.data);
          setFormData(res.data);
        } else {
          toast({ title: "Error", description: res?.message || "Failed to load user", variant: "destructive" });
        }
      } catch (err) {
        console.error("getUserById error:", err);
        toast({ title: "Error", description: "Failed to load user details.", variant: "destructive" });
      } finally {
        if (mounted) setLoading(false);
      }
    };

    load();
    return () => {
      mounted = false;
    };
  }, [userId, toast]);

  // --- Helpers ---
  const updateField = useCallback(<K extends keyof User>(field: K, value: User[K] | string | number) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  }, []);

  const hasChanges = useMemo(() => {
    if (!originalUser) return false;
    // simple shallow diff: any top-level key changed
    const keys = Object.keys(formData) as Array<keyof User>;
    return keys.some((k) => {
      // undefined means not touched
      if (formData[k] === undefined) return false;
      return String((originalUser as any)[k]) !== String((formData as any)[k]);
    });
  }, [formData, originalUser]);

  // Basic client-side validation (extend as needed)
  const isValid = useMemo(() => {
    if (!formData) return false;
    if (!formData.name || String(formData.name).trim().length < 2) return false;
    if (formData.email && !String(formData.email).includes("@")) return false;
    return true;
  }, [formData]);

  // --- Save handler ---
  const handleSave = useCallback(async () => {
    if (!userId) {
      toast({ title: "No user", description: "Missing user id", variant: "destructive" });
      return;
    }

    if (!isValid) {
      toast({ title: "Invalid data", description: "Please fix validation errors before saving.", variant: "destructive" });
      return;
    }

    setIsSaving(true);

    try {
      // Prepare payload: convert undefined -> empty string, keep booleans/numbers as-is
      const payload: Record<string, string> = Object.fromEntries(
        Object.entries(formData || {}).map(([k, v]) => [k, v === undefined || v === null ? "" : String(v)])
      );

      const res = await updateUserById(userId, token, payload);

      const ok = res 
      if (ok) {
        toast({ title: "Profile Updated", description: res?.message || "User profile updated" });
        // navigate back to profile page
        navigate(`/user/${userId}`);
      } else {
        const message = res?.message || res?.error || "Update failed";
        throw new Error(message);
      }
    } catch (err: any) {
      console.error("updateUserById error:", err);
      const msg = err?.message || err?.response?.data?.message || "Failed to update user";
      toast({ title: "Update Failed", description: msg, variant: "destructive" });
    } finally {
      setIsSaving(false);
    }
  }, [userId, formData, token, navigate, toast, isValid]);

  // --- Loading / Not found states ---
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-lg">Loading user details…</p>
      </div>
    );
  }

  if (!originalUser) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-foreground mb-2">User Not Found</h1>
          <Button onClick={() => navigate("/")}>Back to Dashboard</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-6 py-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex gap-2 items-center">
            <Button variant="ghost" onClick={() => navigate(`/user/${userId}`)}>
              <ArrowLeft className="h-4 w-4 mr-2" /> Back to Profile
            </Button>
          </div>

          <div className="flex gap-2">
            <Button variant="ghost" onClick={() => { setFormData(originalUser); }} disabled={isSaving || !hasChanges}>
              Reset
            </Button>

            <Button onClick={handleSave} disabled={isSaving || !hasChanges || !isValid}>
              {isSaving ? (
                <span className="flex items-center gap-2"><svg className="animate-spin h-4 w-4" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle><path className="opacity-75" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" fill="currentColor"></path></svg> Saving...</span>
              ) : (
                <><Save className="h-4 w-4 mr-2" /> Save Changes</>
              )}
            </Button>
          </div>
        </div>

        <div className="max-w-4xl mx-auto">
          <Card>
            <CardHeader>
              <CardTitle>Edit User Profile</CardTitle>
            </CardHeader>

            <CardContent className="space-y-6">
              {/* Basic Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">Full Name</Label>
                  <Input id="name" value={formData.name || ""} onChange={(e) => updateField("name", e.target.value)} />
                </div>

                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" type="email" value={formData.email || ""} onChange={(e) => updateField("email", e.target.value)} placeholder="Enter email address" />
                </div>

                <div>
                  <Label htmlFor="mobile">Mobile</Label>
                  <Input id="mobile" value={formData.mobile || ""} onChange={(e) => updateField("mobile", e.target.value)} />
                </div>

                <div>
                  <Label htmlFor="age">Age</Label>
                  <Input id="age" type="number" value={formData.age ?? ""} onChange={(e) => updateField("age", e.target.value ? Number(e.target.value) : "")} />
                </div>
              </div>

              {/* Location */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="city">City</Label>
                  <Input id="city" value={formData.city_name || ""} onChange={(e) => updateField("city_name", e.target.value)} />
                </div>

                <div>
                  <Label htmlFor="state">State</Label>
                  <Input id="state" value={formData.state || ""} onChange={(e) => updateField("state", e.target.value)} />
                </div>

                <div>
                  <Label htmlFor="country">Country</Label>
                  <Select value={formData.country || ""} onValueChange={(v) => updateField("country", v)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select country" />
                    </SelectTrigger>
                    <SelectContent>
                      {countryOptions.map((c) => (
                        <SelectItem key={c} value={c}>{c}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Profile Details */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="gender">Gender</Label>
                  <Select value={formData.gender || ""} onValueChange={(v) => updateField("gender", v)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select gender" />
                    </SelectTrigger>
                    <SelectContent>
                      {genderOptions.map((g) => (
                        <SelectItem key={g} value={g}>{g}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="status">Status</Label>
                  <Select value={formData.status || ""} onValueChange={(v) => updateField("status", v)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      {statusOptions.map((s) => (
                        <SelectItem key={s} value={s}>{s}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="memtype">Membership Type</Label>
                  <Select value={formData.memtype || ""} onValueChange={(v) => updateField("memtype", v)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select membership" />
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
              </div>

              {/* Additional Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="occupation">Occupation</Label>
                  <Input id="occupation" value={formData.occupation || ""} onChange={(e) => updateField("occupation", e.target.value)} />
                </div>

                <div>
                  <Label htmlFor="education">Education</Label>
                  <Input id="education" value={formData.education || ""} onChange={(e) => updateField("education", e.target.value)} />
                </div>
              </div>

              {/* Bio */}
              <div>
                <Label htmlFor="bio">Bio</Label>
                <Textarea id="bio" rows={4} value={formData.bio || ""} onChange={(e) => updateField("bio", e.target.value)} placeholder="Tell us about yourself..." />
              </div>

              <div>
                <Label htmlFor="expectations">Partner Expectations</Label>
                <Textarea id="expectations" rows={4} value={formData.partnerExpectations || ""} onChange={(e) => updateField("partnerExpectations", e.target.value)} placeholder="Describe your expectations..." />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
