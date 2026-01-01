import React, { useState } from "react";
import { Button } from "./Button";
import { Input } from "./Input";
import { Popover, PopoverContent, PopoverTrigger } from "./Popover";
import { useAdminUpdateBookCover } from "../helpers/useAdminUpdateBookCover";
import { Image as ImageIcon, Loader2 } from "lucide-react";
import styles from "./AdminBookCoverCell.module.css";

interface AdminBookCoverCellProps {
  bookId: number;
  currentCoverUrl: string | null;
  bookTitle: string;
}

export const AdminBookCoverCell = ({
  bookId,
  currentCoverUrl,
  bookTitle,
}: AdminBookCoverCellProps) => {
  const [open, setOpen] = useState(false);
  const [url, setUrl] = useState(currentCoverUrl || "");
  const updateMutation = useAdminUpdateBookCover();

  const handleOpenChange = (newOpen: boolean) => {
    setOpen(newOpen);
    if (newOpen) {
      setUrl(currentCoverUrl || "");
    }
  };

  const handleSave = async () => {
    await updateMutation.mutateAsync({
      bookId,
      coverUrl: url.trim() === "" ? null : url.trim(),
    });
    setOpen(false);
  };

  const isValidUrl = url.trim().length > 0;

  return (
    <Popover open={open} onOpenChange={handleOpenChange}>
      <PopoverTrigger asChild>
        <button className={styles.triggerButton} type="button">
          {currentCoverUrl ? (
            <img
              src={currentCoverUrl}
              alt={bookTitle}
              className={styles.thumbnail}
            />
          ) : (
            <div className={styles.placeholder}>
              <ImageIcon size={20} className={styles.placeholderIcon} />
            </div>
          )}
        </button>
      </PopoverTrigger>
      <PopoverContent className={styles.popoverContent} align="start">
        <div className={styles.popoverHeader}>
          <h4 className={styles.popoverTitle}>Cập nhật ảnh bìa</h4>
        </div>
        <div className={styles.popoverBody}>
          <div className={styles.inputWrapper}>
            <Input
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://..."
              className={styles.urlInput}
            />
          </div>
          
          {isValidUrl && (
            <div className={styles.previewContainer}>
              <img 
                src={url} 
                alt="Preview" 
                className={styles.previewImage}
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = 'none';
                }}
                onLoad={(e) => {
                  (e.target as HTMLImageElement).style.display = 'block';
                }}
              />
            </div>
          )}
        </div>
        <div className={styles.popoverFooter}>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => setOpen(false)}
          >
            Hủy
          </Button>
          <Button 
            size="sm" 
            onClick={handleSave} 
            disabled={updateMutation.isPending}
          >
            {updateMutation.isPending && <Loader2 className="animate-spin" size={14} />}
            Lưu
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
};