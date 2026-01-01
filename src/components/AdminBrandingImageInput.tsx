import React, { useState, useEffect } from "react";
import { FileDropzone } from "./FileDropzone";
import { Input } from "./Input";
import { Button } from "./Button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "./Tabs";
import { Upload, Link as LinkIcon, Trash2, Image as ImageIcon } from "lucide-react";
import styles from "./AdminBrandingImageInput.module.css";
import { toast } from "sonner";

interface AdminBrandingImageInputProps {
  value: string;
  onChange: (value: string) => void;
  maxSize?: number; // bytes
  placeholder?: string;
  className?: string;
}

const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = (error) => reject(error);
  });
};

export const AdminBrandingImageInput = ({
  value,
  onChange,
  maxSize = 1024 * 1024, // 1MB default
  placeholder = "https://example.com/image.png",
  className,
}: AdminBrandingImageInputProps) => {
  const isBase64 = value?.startsWith("data:");
  const [mode, setMode] = useState<"upload" | "url">(
    isBase64 ? "upload" : "url"
  );

  // Sync mode when value changes externally (e.g. Reset)
  // We only force mode switch if the value type contradicts current mode significantly
  useEffect(() => {
    if (value?.startsWith("data:")) {
      if (mode !== "upload") setMode("upload");
    } else if (value && !value.startsWith("data:")) {
      if (mode !== "url") setMode("url");
    } else if (!value) {
      // If value is cleared, keep current mode
    }
  }, [value]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleFiles = async (files: File[]) => {
    if (files.length > 0) {
      try {
        const file = files[0];
        if (file.size > maxSize) {
          toast.error(
            `Kích thước file quá lớn. Tối đa ${Math.round(maxSize / 1024)}KB`
          );
          return;
        }
        const base64 = await fileToBase64(file);
        onChange(base64);
        setMode("upload");
      } catch (e) {
        console.error("Error converting file", e);
        toast.error("Có lỗi khi xử lý file");
      }
    }
  };

  const handleUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(e.target.value);
  };

  const handleClear = () => {
    onChange("");
  };

  return (
    <div className={`${styles.container} ${className || ""}`}>
      <div className={styles.header}>
        <Tabs
          value={mode}
          onValueChange={(v) => setMode(v as "upload" | "url")}
          className="w-full"
        >
          <div className="flex justify-between items-center mb-2">
            <TabsList data-variant="pill">
              <TabsTrigger value="upload" className="flex gap-2 items-center">
                <Upload size={14} /> Tải ảnh
              </TabsTrigger>
              <TabsTrigger value="url" className="flex gap-2 items-center">
                <LinkIcon size={14} /> URL
              </TabsTrigger>
            </TabsList>

            {value && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleClear}
                className={styles.clearButton}
                title="Xóa ảnh hiện tại"
              >
                <Trash2 size={14} className="text-error" />
                <span className="text-error text-xs">Xóa ảnh</span>
              </Button>
            )}
          </div>

          <TabsContent value="upload" className="mt-0">
            <FileDropzone
              maxFiles={1}
              maxSize={maxSize}
              accept=".png,.jpg,.jpeg,.gif,.webp"
              onFilesSelected={handleFiles}
              title="Kéo thả ảnh hoặc click để chọn"
              subtitle={`Hỗ trợ PNG, JPG, GIF, WebP (Tối đa ${Math.round(
                maxSize / 1024
              )}KB)`}
              className={styles.dropzone}
              icon={<ImageIcon size={32} />}
            />
          </TabsContent>

          <TabsContent value="url" className="mt-0">
            <Input
              value={isBase64 ? "" : value}
              onChange={handleUrlChange}
              placeholder={
                isBase64
                  ? "Đang sử dụng ảnh tải lên. Nhập URL để thay thế..."
                  : placeholder
              }
              className={styles.input}
            />
            {isBase64 && (
              <div className={styles.helperText}>
                Đang sử dụng ảnh tải lên (base64)
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};