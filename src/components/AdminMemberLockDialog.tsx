import React, { useState } from "react";
import { useLockMember } from "../helpers/useAdminMembers";
import { MemberListItem } from "../endpoints/admin/members/list_GET.schema";
import { Button } from "./Button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "./Dialog";
import { Textarea } from "./Textarea";

import styles from "./AdminMemberLockDialog.module.css";

interface AdminMemberLockDialogProps {
  member: MemberListItem;
  isOpen: boolean;
  onClose: () => void;
}

export const AdminMemberLockDialog = ({
  member,
  isOpen,
  onClose,
}: AdminMemberLockDialogProps) => {
  const [reason, setReason] = useState("");
  const lockMutation = useLockMember();

  const handleSubmit = () => {
    if (!reason.trim()) return;
    
    lockMutation.mutate(
      { userId: member.id, reason },
      {
        onSuccess: () => {
          onClose();
          setReason("");
        },
      }
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Khóa tài khoản thành viên</DialogTitle>
          <DialogDescription>
            Bạn đang thực hiện khóa tài khoản của <strong>{member.fullName}</strong>. 
            Hành động này sẽ ngăn thành viên đăng nhập và thực hiện các tác vụ trên hệ thống.
          </DialogDescription>
        </DialogHeader>
        
        <div className={styles.dialogForm}>
          <label className={styles.label}>Lý do khóa <span className={styles.required}>*</span></label>
          <Textarea 
            placeholder="Nhập lý do khóa tài khoản (ví dụ: Vi phạm quy định cộng đồng...)"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            rows={4}
          />
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Hủy bỏ</Button>
          <Button 
            variant="destructive" 
            onClick={handleSubmit}
            disabled={!reason.trim() || lockMutation.isPending}
          >
            {lockMutation.isPending ? "Đang xử lý..." : "Xác nhận khóa"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};