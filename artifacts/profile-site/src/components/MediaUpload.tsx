import React, { useState } from 'react';
import { supabase } from '../lib/supabase';
import { Button } from '@/components/ui/button';
import { Loader2, UploadCloud } from 'lucide-react';
import { toast } from 'sonner';

interface MediaUploadProps {
  bucket: string;
  onUploadSuccess: (url: string) => void;
  accept?: string;
  label?: string;
}

export function MediaUpload({ bucket, onUploadSuccess, accept = 'image/*,video/*', label = 'Upload File' }: MediaUploadProps) {
  const [isUploading, setIsUploading] = useState(false);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setIsUploading(true);
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random().toString(36).substring(2, 15)}_${Date.now()}.${fileExt}`;
      const filePath = `${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from(bucket)
        .upload(filePath, file, { upsert: true });

      if (uploadError) throw uploadError;

      const { data } = supabase.storage.from(bucket).getPublicUrl(filePath);
      onUploadSuccess(data.publicUrl);
      toast.success('Upload successful');
    } catch (error: any) {
      toast.error(error.message || 'Error uploading file');
    } finally {
      setIsUploading(false);
      // Reset input
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
        className="w-full h-32 border-dashed border-white/20 bg-white/5 hover:bg-white/10 transition-colors flex flex-col items-center justify-center gap-2"
      >
        {isUploading ? (
          <>
            <Loader2 className="w-6 h-6 animate-spin text-primary" />
            <span className="text-muted-foreground">Uploading...</span>
          </>
        ) : (
          <>
            <UploadCloud className="w-8 h-8 text-muted-foreground" />
            <span className="text-muted-foreground">{label}</span>
          </>
        )}
      </Button>
    </div>
  );
}
