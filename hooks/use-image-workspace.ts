"use client";

import { useCallback, useMemo, useState } from "react";
import { toast } from "sonner";
import type { ImageFile } from "@/lib/types";
import { generateId } from "@/lib/image-utils";

export interface UseImageWorkspaceResult {
  images: ImageFile[];
  setImages: React.Dispatch<React.SetStateAction<ImageFile[]>>;
  handleAddImages: (files: File[]) => void;
  handleRemoveImage: (id: string) => void;
  handleClearAll: () => void;
  handleRetryFailed: () => void;
  pendingCount: number;
  completedImages: ImageFile[];
  errorCount: number;
}

export function useImageWorkspace(): UseImageWorkspaceResult {
  const [images, setImages] = useState<ImageFile[]>([]);

  const handleAddImages = useCallback((files: File[]) => {
    const newImages: ImageFile[] = files.map((file) => ({
      id: generateId(),
      file,
      preview: URL.createObjectURL(file),
      status: "pending" as const,
    }));

    setImages((prev) => [...prev, ...newImages]);

    toast.success(
      `Added ${files.length} image${files.length !== 1 ? "s" : ""}`,
    );
  }, []);

  const handleRemoveImage = useCallback((id: string) => {
    setImages((prev) => {
      const img = prev.find((i) => i.id === id);
      if (img) URL.revokeObjectURL(img.preview);
      return prev.filter((i) => i.id !== id);
    });
  }, []);

  const handleClearAll = useCallback(() => {
    images.forEach((img) => URL.revokeObjectURL(img.preview));
    setImages([]);
    toast.success("Cleared all images");
  }, [images]);

  const handleRetryFailed = useCallback(() => {
    setImages((prev) =>
      prev.map((img) =>
        img.status === "error"
          ? { ...img, status: "pending" as const, error: undefined }
          : img,
      ),
    );
  }, []);

  const pendingCount = useMemo(
    () => images.filter((img) => img.status === "pending").length,
    [images],
  );

  const completedImages = useMemo(
    () => images.filter((img) => img.status === "complete"),
    [images],
  );

  const errorCount = useMemo(
    () => images.filter((img) => img.status === "error").length,
    [images],
  );

  return {
    images,
    setImages,
    handleAddImages,
    handleRemoveImage,
    handleClearAll,
    handleRetryFailed,
    pendingCount,
    completedImages,
    errorCount,
  };
}
