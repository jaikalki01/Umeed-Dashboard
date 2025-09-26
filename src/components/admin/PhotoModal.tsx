import React, { useCallback, useMemo, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check, X, Eye, Download, Copy } from "lucide-react";

interface PhotoModalProps {
  isOpen: boolean;
  onClose: () => void;
  photoUrl: string; // can be empty string to indicate missing image
  photoType: "photo1" | "photo2";
  userName: string;
  isApproved: boolean;
  onApprove: (approved: boolean) => Promise<void>;
}

const PLACEHOLDER = "/placeholder.svg";

export const PhotoModal: React.FC<PhotoModalProps> = ({
  isOpen,
  onClose,
  photoUrl,
  photoType,
  userName,
  isApproved,
  onApprove,
}) => {
  const [loading, setLoading] = useState(false);
  const [imgLoading, setImgLoading] = useState(true);
  const [imgError, setImgError] = useState(false);

  const title = useMemo(
    () => `${userName} — ${photoType === "photo1" ? "Primary" : "Secondary"} Photo`,
    [userName, photoType]
  );

  const effectiveSrc = useMemo(() => (photoUrl && !imgError ? photoUrl : PLACEHOLDER), [photoUrl, imgError]);

  const handleAction = useCallback(
    async (approved: boolean) => {
      setLoading(true);
      try {
        await onApprove(approved);
      } finally {
        setLoading(false);
      }
    },
    [onApprove]
  );

  const handleImgError = useCallback(() => {
    setImgError(true);
    setImgLoading(false);
  }, []);

  const handleImgLoad = useCallback(() => {
    setImgLoading(false);
    setImgError(false);
  }, []);

  const handleDownload = useCallback(() => {
    if (!photoUrl || imgError) return;
    const a = document.createElement("a");
    a.href = photoUrl;
    a.download = `${userName.replace(/\s+/g, "_")}_${photoType}`;
    document.body.appendChild(a);
    a.click();
    a.remove();
  }, [photoUrl, imgError, userName, photoType]);

  const handleCopyUrl = useCallback(async () => {
    if (!photoUrl || imgError) return;
    try {
      await navigator.clipboard.writeText(photoUrl);
      // lightweight feedback - your app has toast hook, prefer using it externally
      // e.g. toast({ title: 'Copied', description: 'Image URL copied' })
    } catch {
      // ignore clipboard errors silently
    }
  }, [photoUrl, imgError]);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 justify-between">
            <div className="flex items-center gap-2">
              <Eye className="h-5 w-5" />
              <span className="font-medium">{title}</span>
              <Badge variant={isApproved ? "default" : "secondary"}>{isApproved ? "Approved" : "Pending"}</Badge>
            </div>
            <div className="flex items-center gap-2">
              <Button size="sm" variant="ghost" onClick={handleDownload} disabled={!photoUrl || imgError} aria-label="Download image">
                <Download className="h-4 w-4" />
              </Button>
              <Button size="sm" variant="ghost" onClick={handleCopyUrl} disabled={!photoUrl || imgError} aria-label="Copy image URL">
                <Copy className="h-4 w-4" />
              </Button>
            </div>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="relative flex items-center justify-center bg-muted rounded-lg overflow-hidden" style={{ minHeight: 220 }}>
            {imgLoading && (
              <div className="absolute inset-0 flex items-center justify-center">
                <svg className="animate-spin h-6 w-6" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" fill="currentColor" />
                </svg>
              </div>
            )}

            {effectiveSrc === PLACEHOLDER ? (
              <div className="p-6 text-center">
                <p className="text-sm text-muted-foreground">No image available</p>
              </div>
            ) : (
              <img
                src={effectiveSrc}
                alt={`${userName} ${photoType}`}
                className="w-full h-full object-contain"
                onLoad={handleImgLoad}
                onError={handleImgError}
                aria-hidden={imgLoading}
              />
            )}
          </div>

          <div className="flex gap-2 justify-end">
            <Button variant="outline" onClick={() => handleAction(false)} className="flex items-center gap-2" disabled={loading}>
              <X className="h-4 w-4" /> Reject
            </Button>

            <Button onClick={() => handleAction(true)} className="flex items-center gap-2" disabled={loading}>
              <Check className="h-4 w-4" /> Approve
            </Button>

            <Button variant="ghost" onClick={onClose}>
              Close
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
