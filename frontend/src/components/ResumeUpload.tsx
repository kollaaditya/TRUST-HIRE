import { useState, useEffect } from "react";
import { mongoAPI as supabase } from "@/lib/mongodb-api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Upload, FileText, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { createStorageBuckets } from "@/lib/storage-setup";

interface ResumeUploadProps {
  currentResumeUrl?: string;
  onResumeUpdate: (url: string | null) => void;
}

export const ResumeUpload = ({ currentResumeUrl, onResumeUpdate }: ResumeUploadProps) => {
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    createStorageBuckets();
  }, []);

  const uploadResume = async (event: React.ChangeEvent<HTMLInputElement>) => {
    try {
      setUploading(true);
      
      if (!event.target.files || event.target.files.length === 0) {
        throw new Error('You must select a file to upload.');
      }

      const file = event.target.files[0];
      
      // Validate file type
      if (!file.type.includes('pdf') && !file.type.includes('doc')) {
        throw new Error('Please upload a PDF or DOC file.');
      }

      // Validate file size (5MB max)
      if (file.size > 5 * 1024 * 1024) {
        throw new Error('File size must be less than 5MB.');
      }

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('No user found');

      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}/resume.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('resumes')
        .upload(fileName, file, { upsert: true });

      if (uploadError) throw uploadError;

      const { data } = supabase.storage
        .from('resumes')
        .getPublicUrl(fileName);

      // Update profile with resume URL
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ resume_url: data.publicUrl })
        .eq('id', user.id);

      if (updateError) throw updateError;

      onResumeUpdate(data.publicUrl);
      toast.success('Resume uploaded successfully!');
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setUploading(false);
    }
  };

  const deleteResume = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('No user found');

      // Delete from storage
      const { error: deleteError } = await supabase.storage
        .from('resumes')
        .remove([`${user.id}/resume.pdf`, `${user.id}/resume.doc`, `${user.id}/resume.docx`]);

      // Update profile
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ resume_url: null })
        .eq('id', user.id);

      if (updateError) throw updateError;

      onResumeUpdate(null);
      toast.success('Resume deleted successfully!');
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="w-5 h-5" />
          Resume
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {currentResumeUrl ? (
          <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
            <div className="flex items-center gap-2">
              <FileText className="w-4 h-4" />
              <span className="text-sm">Resume uploaded</span>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => window.open(currentResumeUrl, '_blank')}
              >
                View
              </Button>
              <Button
                variant="destructive"
                size="sm"
                onClick={deleteResume}
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          </div>
        ) : (
          <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6 text-center">
            <Upload className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
            <p className="text-sm text-muted-foreground mb-2">
              Upload your resume (PDF or DOC, max 5MB)
            </p>
            <Input
              type="file"
              accept=".pdf,.doc,.docx"
              onChange={uploadResume}
              disabled={uploading}
              className="hidden"
              id="resume-upload"
            />
            <Button
              variant="outline"
              disabled={uploading}
              onClick={() => document.getElementById('resume-upload')?.click()}
            >
              {uploading ? 'Uploading...' : 'Choose File'}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
