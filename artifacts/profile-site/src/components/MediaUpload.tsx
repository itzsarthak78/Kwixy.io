import React, { useState } from 'react';
import { supabase } from '../lib/supabase';
import { Button } from '@/components/ui/button';
import { Loader2, UploadCloud, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';

interface MediaUploadProps {
  bucket: string;
  onUploadSuccess: (url: string, mimeType: string) => void;
  accept?: string;
  label?: string;
}

export function MediaUpload({
  bucket,
  onUploadSuccess,
  accept = 'image/*,video/*',
  label = 'Upload File',
}: MediaUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [uploaded, setUploaded] = useState(false);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setIsUploading(true);
      setUploaded(false);
      const fileExt = file.name.split('.').pop();
      const fileName = `${crypto.randomUUID()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from(bucket)
        .upload(fileName, file, { upsert: true });

      if (uploadError) throw uploadError;

      const { data } = supabase.storage.from(bucket).getPublicUrl(fileName);
      setUploaded(true);
      onUploadSuccess(data.publicUrl, file.type);
      toast.success('Uploaded successfully');
    } catch (error: any) {
      toast.error(error.message || 'Upload failed');
    } finally {
      setIsUploading(false);
      e.target.value = '';
    }
  };

  return (
    <div className="relative">
      <input
        type="file"
        accept={accept}
        onChange={handleFileChange}
        disabled={isUploading}
        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed z-10"
      />
      <Button
        type="button"
        variant="outline"
        disabled={isUploading}
        className="w-full h-28 border-dashed border-white/20 bg-white/5 hover:bg-white/10 transition-colors flex flex-col items-center justify-center gap-2"
      >
        {isUploading ? (
          <>
            <Loader2 className="w-6 h-6 animate-spin text-primary" />
            <span className="text-muted-foreground text-sm">Uploading…</span>
          </>
        ) : uploaded ? (
          <>
            <CheckCircle2 className="w-6 h-6 text-green-400" />
            <span className="text-green-400 text-sm">Uploaded — click to replace</span>
          </>
        ) : (
          <>
            <UploadCloud className="w-7 h-7 text-muted-foreground" />
            <span className="text-muted-foreground text-sm">{label}</span>
          </>
        )}
      </Button>
    </div>
  );
}
