import React from "react";
import { useMemberTitles } from "../helpers/useMemberTitles";
import { useTitlesList, useAssignTitle, useUnassignTitle } from "../helpers/useAdminTitles";
import { MemberListItem } from "../endpoints/admin/members/list_GET.schema";
import { MemberTitleBadge } from "./MemberTitleBadge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "./Dialog";
import { Checkbox } from "./Checkbox";
import { Skeleton } from "./Skeleton";

import styles from "./AdminMemberTitlesDialog.module.css";

interface AdminMemberTitlesDialogProps {
  member: MemberListItem;
  isOpen: boolean;
  onClose: () => void;
}

export const AdminMemberTitlesDialog = ({
  member,
  isOpen,
  onClose,
}: AdminMemberTitlesDialogProps) => {
  const { data: titlesData, isFetching: isFetchingTitles } = useTitlesList();
  const { data: memberTitlesData, isFetching: isFetchingMemberTitles } = useMemberTitles(member.id);
  
  const assignMutation = useAssignTitle();
  const unassignMutation = useUnassignTitle();

  const allTitles = titlesData?.titles.filter((t) => t.isActive) || [];
  const assignedTitleIds = new Set(memberTitlesData?.titles.map((t) => t.id) || []);

  const handleToggleTitle = (titleId: number, isChecked: boolean) => {
    if (isChecked) {
      assignMutation.mutate({ userId: member.id, titleId });
    } else {
      unassignMutation.mutate({ userId: member.id, titleId });
    }
  };

  const isLoading = isFetchingTitles || isFetchingMemberTitles;
  const isPending = assignMutation.isPending || unassignMutation.isPending;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Quản lý danh hiệu</DialogTitle>
          <DialogDescription>
            Quản lý danh hiệu cho <strong>{member.fullName}</strong>. 
            Chọn hoặc bỏ chọn danh hiệu để gán hoặc thu hồi.
          </DialogDescription>
        </DialogHeader>

        <div className={styles.titlesContainer}>
          {isLoading ? (
            <div className={styles.skeletonList}>
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className={styles.skeletonItem}>
                  <Skeleton style={{ width: "20px", height: "20px" }} />
                  <Skeleton style={{ width: "120px", height: "20px" }} />
                </div>
              ))}
            </div>
          ) : allTitles.length === 0 ? (
            <div className={styles.emptyState}>
              Chưa có danh hiệu nào trong hệ thống
            </div>
          ) : (
            <div className={styles.titlesList}>
              {allTitles.map((title) => {
                const isAssigned = assignedTitleIds.has(title.id);
                return (
                  <label key={title.id} className={styles.titleItem}>
                    <Checkbox
                      checked={isAssigned}
                      disabled={isPending}
                      onChange={(e) => handleToggleTitle(title.id, e.target.checked)}
                    />
                    <MemberTitleBadge
                      name={title.name}
                      color={title.color}
                      size="md"
                      className={styles.badge}
                    />
                    {title.description && (
                      <span className={styles.description}>{title.description}</span>
                    )}
                  </label>
                );
              })}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};