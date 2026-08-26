"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/components/ui/toast";
import {
  UploadCloud,
  X,
  RefreshCw,
  FileImage,
} from "lucide-react";

interface ImageUploaderProps {
  value?: string;
  onChange: (value: string) => void;
  label?: string;
  description?: string;
  aspectRatio?: "square" | "video" | "wide";
  className?: string;
}

export function ImageUploader({
  value,
  onChange,
  label = "Click to upload or drag & drop photo",
  description = "PNG, JPG, WEBP or AVIF up to 10MB",
  aspectRatio = "square",
  className = "",
}: ImageUploaderProps) {
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = React.useState(false);
  const [fileName, setFileName] = React.useState<string>("");
  const [fileSize, setFileSize] = React.useState<string>("");
  const [isProcessing, setIsProcessing] = React.useState(false);

  const handleFile = (file: File) => {
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Invalid File Type", "Please upload a PNG, JPG, WEBP, or AVIF image.");
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      toast.error("File Too Large", "Image size exceeds the 10MB limit.");
      return;
    }

    setIsProcessing(true);
    setFileName(file.name);
    setFileSize((file.size / 1024).toFixed(1) + " KB");

    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      onChange(result || "");
      setIsProcessing(false);
      toast.success("Image Uploaded", `${file.name} loaded successfully.`);
    };
    reader.onerror = () => {
      toast.error("Upload Error", "Failed to read image file.");
      setIsProcessing(false);
    };
    reader.readAsDataURL(file);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange("");
    setFileName("");
    setFileSize("");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
    toast.info("Image Removed", "Editorial photography cleared.");
  };

  const triggerUpload = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className={`space-y-2.5 ${className}`}>
      {/* Hidden native file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/png,image/jpeg,image/webp,image/avif"
        className="hidden"
        onChange={(e) => {
          if (e.target.files && e.target.files.length > 0) {
            handleFile(e.target.files[0]);
          }
        }}
      />

      {/* Main Upload / Preview Area */}
      {value ? (
        <div className="border border-border rounded-xs p-3 bg-background space-y-2.5">
          <div className="flex items-start gap-3">
            {/* Image Preview Container */}
            <div
              className={`relative rounded-xs border border-border overflow-hidden bg-muted/20 shrink-0 ${
                aspectRatio === "wide"
                  ? "w-36 h-20"
                  : aspectRatio === "video"
                  ? "w-28 h-18"
                  : "size-20"
              }`}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={value}
                alt="Uploaded Photography Preview"
                className="size-full object-cover"
                onError={(e) => {
                  (e.target as HTMLImageElement).src =
                    "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80&w=200&auto=format&fit=crop";
                }}
              />
            </div>

            {/* Info & Replace/Remove Actions */}
            <div className="flex-1 min-w-0 space-y-1.5">
              <div className="flex items-center justify-between gap-1">
                <div className="flex items-center gap-1.5 min-w-0">
                  <FileImage className="size-3.5 text-muted-foreground shrink-0" />
                  <span className="text-xs font-medium text-foreground truncate">
                    {fileName || "Editorial Photography Active"}
                  </span>
                </div>
                <Badge variant="outline" className="text-[10px] font-mono border-emerald-500/40 text-emerald-600 dark:text-emerald-400 shrink-0">
                  Uploaded
                </Badge>
              </div>

              {fileSize && (
                <span className="text-[11px] font-mono text-muted-foreground block">
                  Size: {fileSize}
                </span>
              )}

              <div className="flex items-center gap-2 pt-1">
                <Button
                  type="button"
                  variant="outline"
                  size="xs"
                  onClick={triggerUpload}
                  className="h-7 text-xs px-2.5 border-border gap-1"
                >
                  <RefreshCw className="size-3" /> Replace Photo
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="xs"
                  onClick={handleClear}
                  className="h-7 text-xs px-2 text-destructive hover:bg-destructive/10 hover:text-destructive gap-1"
                >
                  <X className="size-3" /> Remove
                </Button>
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* Dropzone Box */
        <div
          onClick={triggerUpload}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          className={`border border-dashed rounded-xs p-4 cursor-pointer transition-colors text-center flex flex-col items-center justify-center gap-2 ${
            isDragging
              ? "border-foreground bg-muted/40"
              : "border-border hover:border-foreground/60 hover:bg-muted/10 bg-background"
          }`}
        >
          <div className="size-10 rounded-full border border-border flex items-center justify-center bg-muted/20 text-foreground">
            {isProcessing ? (
              <RefreshCw className="size-5 animate-spin text-muted-foreground" />
            ) : (
              <UploadCloud className="size-5" />
            )}
          </div>

          <div className="space-y-0.5">
            <span className="text-xs font-medium text-foreground block">
              {label}
            </span>
            <span className="text-[11px] font-mono text-muted-foreground block">
              {description}
            </span>
          </div>

          <Button
            type="button"
            variant="outline"
            size="xs"
            className="h-7 text-xs px-3 border-border mt-1 pointer-events-none"
          >
            Select Image File
          </Button>
        </div>
      )}
    </div>
  );
}
