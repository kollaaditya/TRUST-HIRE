import { useState } from "react";
import { mongoAPI as supabase } from "@/lib/mongodb-api";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { toast } from "sonner";
import { Camera, Upload } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

const PRESET_AVATARS = [
  "https://api.dicebear.com/7.x/avataaars/svg?seed=Felix",
  "https://api.dicebear.com/7.x/avataaars/svg?seed=Aneka",
  "https://api.dicebear.com/7.x/avataaars/svg?seed=Precious",
  "https://api.dicebear.com/7.x/avataaars/svg?seed=Bailey",
  "https://api.dicebear.com/7.x/avataaars/svg?seed=Luna",
  "https://api.dicebear.com/7.x/avataaars/svg?seed=Max",
  "https://api.dicebear.com/7.x/avataaars/svg?seed=Charlie",
  "https://api.dicebear.com/7.x/avataaars/svg?seed=Oliver",
];

interface ProfilePictureUploadProps {
  userId: string;
  currentPhotoUrl: string | null;
  onPhotoUpdate: (url: string) => void;
}

export const ProfilePictureUpload = ({ userId, currentPhotoUrl, onPhotoUpdate }: ProfilePictureUploadProps) => {
  const [uploading, setUploading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    try {
      setUploading(true);
      
      if (!event.target.files || event.target.files.length === 0) {
        return;
      }

      const file = event.target.files[0];
      const fileExt = file.name.split('.').pop();
      const filePath = `${userId}/avatar.${fileExt}`;

      // Upload file to Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file, { upsert: true });

      if (uploadError) throw uploadError;

      // Get public URL
      const { data } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);

      // Update profile with new photo URL
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ profile_photo_url: data.publicUrl })
        .eq('id', userId);

      if (updateError) throw updateError;

      onPhotoUpdate(data.publicUrl);
      toast.success("Profile picture updated!");
      setIsOpen(false);
    } catch (error: any) {
      toast.error("Error uploading photo: " + error.message);
    } finally {
      setUploading(false);
    }
  };

  const handleAvatarSelect = async (avatarUrl: string) => {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ profile_photo_url: avatarUrl })
        .eq('id', userId);

      if (error) throw error;

      onPhotoUpdate(avatarUrl);
      toast.success("Avatar updated!");
      setIsOpen(false);
    } catch (error: any) {
      toast.error("Error updating avatar: " + error.message);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <div className="relative group cursor-pointer">
          <Avatar className="w-32 h-32 border-4 border-primary/20 shadow-lg hover:shadow-xl transition-all">
            <AvatarImage src={currentPhotoUrl || undefined} />
            <AvatarFallback className="bg-gradient-to-br from-primary to-accent text-primary-foreground text-3xl">
              <Camera className="w-12 h-12" />
            </AvatarFallback>
          </Avatar>
          <div className="absolute inset-0 bg-background/80 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
            <Camera className="w-8 h-8 text-primary" />
          </div>
        </div>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Update Profile Picture</DialogTitle>
        </DialogHeader>
        <div className="space-y-6">
          <div>
            <label htmlFor="photo-upload">
              <Button
                type="button"
                variant="outline"
                className="w-full"
                disabled={uploading}
                onClick={() => document.getElementById('photo-upload')?.click()}
              >
                <Upload className="w-4 h-4 mr-2" />
                {uploading ? "Uploading..." : "Upload Photo"}
              </Button>
            </label>
            <input
              id="photo-upload"
              type="file"
              accept="image/*"
              onChange={handleFileUpload}
              className="hidden"
            />
          </div>

          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">Or choose a preset avatar:</p>
            <div className="grid grid-cols-4 gap-3">
              {PRESET_AVATARS.map((avatar, index) => (
                <button
                  key={index}
                  onClick={() => handleAvatarSelect(avatar)}
                  className="hover:scale-110 transition-transform"
                >
                  <Avatar className="w-16 h-16 border-2 border-border hover:border-primary">
                    <AvatarImage src={avatar} />
                  </Avatar>
                </button>
              ))}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
