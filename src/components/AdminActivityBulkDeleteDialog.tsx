import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "./Dialog";
import { Button } from "./Button";
import styles from "./AdminActivityBulkDeleteDialog.module.css";

interface AdminActivityBulkDeleteDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedCount: number;
  onConfirm: () => Promise<void>;
  isDeleting: boolean;
}

export const AdminActivityBulkDeleteDialog = ({
  open,
  onOpenChange,
  selectedCount,
  onConfirm,
  isDeleting,
}: AdminActivityBulkDeleteDialogProps) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Xác nhận xóa hoạt động</DialogTitle>
        </DialogHeader>
        <p>
          Bạn có chắc chắn muốn xóa {selectedCount} hoạt động đã chọn? Hành
          động này không thể hoàn tác.
        </p>
        <div className={styles.dialogActions}>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Hủy
          </Button>
          <Button
            variant="destructive"
            onClick={onConfirm}
            disabled={isDeleting}
          >
            Xóa
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};