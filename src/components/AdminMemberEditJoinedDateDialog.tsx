import React, { useState } from "react";
import { MemberListItem } from "../endpoints/admin/members/list_GET.schema";
import { useUpdateMemberJoinedDate } from "../helpers/useAdminMembers";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "./Dialog";
import { Button } from "./Button";
import { Calendar } from "./Calendar";
import styles from "./AdminMemberEditJoinedDateDialog.module.css";

interface AdminMemberEditJoinedDateDialogProps {
  member: MemberListItem;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export function AdminMemberEditJoinedDateDialog({
  member,
  open,
  onOpenChange,
  onSuccess,
}: AdminMemberEditJoinedDateDialogProps) {
  const [date, setDate] = useState<Date | undefined>(
    member.joinedAt ? new Date(member.joinedAt) : undefined
  );
  const updateJoinedMutation = useUpdateMemberJoinedDate();

  const handleSave = () => {
    if (date) {
      updateJoinedMutation.mutate(
        { userId: member.id, joinedAt: date },
        {
          onSuccess: () => {
            onSuccess();
            onOpenChange(false);
          },
        }
      );
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className={styles.smallDialog}>
        <DialogHeader>
          <DialogTitle>Sửa ngày tham gia</DialogTitle>
          <DialogDescription>
            Cập nhật ngày tham gia cho <strong>{member.fullName}</strong>
          </DialogDescription>
        </DialogHeader>
        <div className={styles.calendarWrapper}>
          <Calendar
            mode="single"
            selected={date}
            onSelect={setDate}
            disabled={(d) => d > new Date() || d < new Date("1900-01-01")}
          />
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Hủy
          </Button>
          <Button
            onClick={handleSave}
            disabled={!date || updateJoinedMutation.isPending}
          >
            {updateJoinedMutation.isPending ? "Đang lưu..." : "Lưu"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}