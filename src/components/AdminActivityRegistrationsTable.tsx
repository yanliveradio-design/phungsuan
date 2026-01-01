import React, { useState, useMemo } from "react";
import { CheckCircle } from "lucide-react";
import {
  ActivityRegistrationItem,
  OutputType,
} from "../endpoints/admin/activities/registrations_GET.schema";
import { useConfirmRegistrations } from "../helpers/useConfirmRegistrations";
import { Button } from "./Button";
import { Checkbox } from "./Checkbox";
import { Badge } from "./Badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "./Dialog";
import { Skeleton } from "./Skeleton";
import styles from "./AdminActivityRegistrationsTable.module.css";

interface AdminActivityRegistrationsTableProps {
  data?: OutputType;
  isLoading: boolean;
}

export const AdminActivityRegistrationsTable = ({
  data,
  isLoading,
}: AdminActivityRegistrationsTableProps) => {
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
  const [isConfirmDialogOpen, setIsConfirmDialogOpen] = useState(false);
  
  const confirmMutation = useConfirmRegistrations();

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Filter only pending registrations as candidates for selection
  const pendingRegistrations = useMemo(() => {
    return data?.registrations.filter((reg) => reg.status === "pending") || [];
  }, [data?.registrations]);

  const allPendingSelected =
    pendingRegistrations.length > 0 &&
    pendingRegistrations.every((reg) => selectedIds.has(reg.id));

  const isIndeterminate =
    pendingRegistrations.some((reg) => selectedIds.has(reg.id)) &&
    !allPendingSelected;

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      const newSelected = new Set(pendingRegistrations.map((reg) => reg.id));
      setSelectedIds(newSelected);
    } else {
      setSelectedIds(new Set());
    }
  };

  const handleSelectRow = (id: number, checked: boolean) => {
    const newSelected = new Set(selectedIds);
    if (checked) {
      newSelected.add(id);
    } else {
      newSelected.delete(id);
    }
    setSelectedIds(newSelected);
  };

  const handleConfirmRegistrations = () => {
    confirmMutation.mutate(
      { registrationIds: Array.from(selectedIds) },
      {
        onSuccess: () => {
          setIsConfirmDialogOpen(false);
          setSelectedIds(new Set());
        },
      }
    );
  };

  if (isLoading) {
    return (
      <div className={styles.tableContainer}>
        <div className={styles.loadingState}>
          {[...Array(5)].map((_, i) => (
            <Skeleton key={i} style={{ height: "3rem" }} />
          ))}
        </div>
      </div>
    );
  }

  if (!data || data.registrations.length === 0) {
    return (
      <div className={styles.tableContainer}>
        <div className={styles.emptyState}>
          <p>Chưa có thành viên nào đăng ký tham gia hoạt động này.</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className={styles.wrapper}>
        {selectedIds.size > 0 && (
          <div className={styles.bulkActions}>
            <span className={styles.selectedCount}>
              {selectedIds.size} đã chọn
            </span>
            <Button
              size="sm"
              variant="primary"
              onClick={() => setIsConfirmDialogOpen(true)}
              disabled={confirmMutation.isPending}
            >
              <CheckCircle size={16} />
              Xác nhận đăng ký
            </Button>
          </div>
        )}

        <div className={styles.tableContainer}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th className={styles.checkboxCell}>
                  <Checkbox
                    checked={allPendingSelected}
                    onChange={(e) => handleSelectAll(e.target.checked)}
                    disabled={pendingRegistrations.length === 0}
                  />
                </th>
                <th>Tên thành viên</th>
                <th>Email</th>
                <th>Thời gian đăng ký</th>
                <th>Trạng thái</th>
              </tr>
            </thead>
            <tbody>
              {data.registrations.map((reg) => {
                const isPending = reg.status === "pending";
                const isSelected = selectedIds.has(reg.id);

                return (
                  <tr key={reg.id} className={isSelected ? styles.selectedRow : ""}>
                    <td className={styles.checkboxCell}>
                      {isPending && (
                        <Checkbox
                          checked={isSelected}
                          onChange={(e) =>
                            handleSelectRow(reg.id, e.target.checked)
                          }
                        />
                      )}
                    </td>
                    <td className={styles.nameCell}>{reg.fullName}</td>
                    <td>{reg.email}</td>
                    <td>{formatDate(reg.registeredAt)}</td>
                    <td>
                      {reg.status === "confirmed" ? (
                        <Badge variant="success">Đã xác nhận</Badge>
                      ) : (
                        <Badge variant="warning">Chờ xác nhận</Badge>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      <Dialog open={isConfirmDialogOpen} onOpenChange={setIsConfirmDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Xác nhận đăng ký</DialogTitle>
            <DialogDescription>
              Bạn có chắc muốn xác nhận {selectedIds.size} đăng ký đã chọn không?
              Hành động này sẽ cập nhật trạng thái của các thành viên thành "Đã xác nhận".
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="secondary"
              onClick={() => setIsConfirmDialogOpen(false)}
              disabled={confirmMutation.isPending}
            >
              Hủy
            </Button>
            <Button
              variant="primary"
              onClick={handleConfirmRegistrations}
              disabled={confirmMutation.isPending}
            >
              {confirmMutation.isPending ? "Đang xử lý..." : "Xác nhận"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};