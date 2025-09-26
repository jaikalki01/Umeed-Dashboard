import { useEffect, useState } from "react";
import { PhotoModal } from "./PhotoModal";
import { getUserById, updatePhotoApproval } from "@/api/apihelper";

interface PhotoModalContainerProps {
  userId: string;
  token: string;
}

const PhotoModalContainer = ({ userId, token }: PhotoModalContainerProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [photoUrl, setPhotoUrl] = useState("");
  const [photoType, setPhotoType] = useState<"photo1" | "photo2">("photo1");
  const [userName, setUserName] = useState("");
  const [isApproved, setIsApproved] = useState(false);

  useEffect(() => {
    if (!isOpen) return;

    const fetchData = async () => {
      try {
        const response = await getUserById(userId);
        if (response.success && response.data) {
          const user = response.data;
          setUserName(user.name);
          setPhotoUrl(photoType === "photo1" ? user.photo1 : user.photo2);
          setIsApproved(photoType === "photo1" ? user.photo1Approve : user.photo2Approve);
        }
      } catch (err) {
        console.error(err);
      }
    };

    fetchData();
  }, [isOpen, userId, photoType, token]);

  const handleApprove = async (approved: boolean) => {
    try {
      await updatePhotoApproval(userId, token, photoType, approved);
      setIsApproved(approved);
      // ✅ Optional: Close modal after approval
      setTimeout(() => setIsOpen(false), 800);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <>
      <div className="flex gap-3">
        <button
          onClick={() => {
            setPhotoType("photo1");
            setIsOpen(true);
          }}
          className="bg-blue-500 text-white px-4 py-2 rounded"
        >
          View Primary Photo
        </button>
        <button
          onClick={() => {
            setPhotoType("photo2");
            setIsOpen(true);
          }}
          className="bg-green-500 text-white px-4 py-2 rounded"
        >
          View Secondary Photo
        </button>
      </div>

      <PhotoModal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        photoUrl={photoUrl}
        photoType={photoType}
        userName={userName}
        isApproved={isApproved}
        onApprove={handleApprove}
      />
    </>
  );
};

export default PhotoModalContainer;
