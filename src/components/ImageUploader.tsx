import React, { useState, useRef } from "react";
import { Upload, Image as ImageIcon, Loader2 } from "lucide-react";
import { supabase } from "@/lib/supabase";

interface ImageUploaderProps {
  currentUrl?: string;
  onUploadComplete: (url: string) => void;
  folderPath?: string;
  className?: string;
  label?: string;
}

export const ImageUploader: React.FC<ImageUploaderProps> = ({
  currentUrl,
  onUploadComplete,
  folderPath = "uploads",
  className = "",
  label = "Upload Image",
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleUpload = async (file: File) => {
    if (!file.type.startsWith("image/")) {
      alert("Please upload an image file.");
      return;
    }

    try {
      setUploading(true);
      const fileExt = file.name.split(".").pop();
      const fileName = `${folderPath}/${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from("site-assets")
        .upload(fileName, file, { upsert: true });

      if (uploadError) throw uploadError;

      const { data } = supabase.storage
        .from("site-assets")
        .getPublicUrl(fileName);

      onUploadComplete(data.publicUrl);
    } catch (err: any) {
      console.error("Error uploading image:", err.message);
      alert("Upload failed: " + err.message);
    } finally {
      setUploading(false);
      setIsDragging(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleUpload(e.dataTransfer.files[0]);
    }
  };

  return (
    <div
      className={`relative border-2 border-dashed rounded-md p-4 text-center cursor-pointer transition-colors ${
        isDragging
          ? "border-ember bg-ember/10"
          : "border-olive/40 hover:border-olive"
      } ${className}`}
      onDragOver={(e) => {
        e.preventDefault();
        setIsDragging(true);
      }}
      onDragLeave={() => setIsDragging(false)}
      onDrop={handleDrop}
      onClick={() => fileInputRef.current?.click()}
    >
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          if (e.target.files && e.target.files[0]) {
            handleUpload(e.target.files[0]);
          }
        }}
      />

      {uploading ? (
        <div className="flex flex-col items-center justify-center py-4">
          <Loader2 className="animate-spin text-ember mb-2" size={24} />
          <p className="text-xs font-body text-ink/70 dark:text-cream/70">
            Uploading...
          </p>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-2">
          {currentUrl ? (
            <div className="relative group w-full h-32 mb-2 overflow-hidden rounded">
              <img
                src={currentUrl}
                alt="Uploaded preview"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white text-xs font-body transition-opacity">
                Click or Drop to replace
              </div>
            </div>
          ) : (
            <Upload className="text-olive mb-2" size={24} />
          )}
          <p className="text-xs font-body font-medium text-ink dark:text-cream">
            {label}
          </p>
          <p className="text-[10px] text-gray-500 mt-1">
            Drag & drop or click to upload
          </p>
        </div>
      )}
    </div>
  );
};