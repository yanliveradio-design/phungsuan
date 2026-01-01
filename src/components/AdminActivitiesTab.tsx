import React, { useState } from "react";
import {
  useAdminActivitiesList,
  useCreateActivity,
  useUpdateActivity,
  useToggleCheckin,
  useCloseActivity,
  useBulkDeleteActivities,
} from "../helpers/useAdminActivities";
import { Button } from "./Button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./Select";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "./Pagination";
import { Calendar as CalendarIcon, Plus, Trash2 } from "lucide-react";
import { ActivityStatus } from "../helpers/schema";
import { Popover, PopoverContent, PopoverTrigger } from "./Popover";
import { Calendar } from "./Calendar";
import { AdminActivityFormDialog, ActivityFormValues } from "./AdminActivityFormDialog";
import { AdminActivityBulkDeleteDialog } from "./AdminActivityBulkDeleteDialog";
import { AdminActivitiesTable } from "./AdminActivitiesTable";
import styles from "./AdminActivitiesTab.module.css";

export const AdminActivitiesTab = ({ className }: { className?: string }) => {
  const [statusFilter, setStatusFilter] = useState<ActivityStatus | "all">(
    "all"
  );
  const [startDateFilter, setStartDateFilter] = useState<Date | undefined>();
  const [endDateFilter, setEndDateFilter] = useState<Date | undefined>();
  const [currentPage, setCurrentPage] = useState(1);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [bulkDeleteDialogOpen, setBulkDeleteDialogOpen] = useState(false);
  const [editingActivity, setEditingActivity] = useState<number | null>(null);
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());

  const itemsPerPage = 10;

  const { data, isFetching } = useAdminActivitiesList({
    status: statusFilter === "all" ? undefined : statusFilter,
    startDate: startDateFilter,
    endDate: endDateFilter,
  });

  const createMutation = useCreateActivity();
  const updateMutation = useUpdateActivity();
  const toggleCheckinMutation = useToggleCheckin();
  const closeMutation = useCloseActivity();
  const bulkDeleteMutation = useBulkDeleteActivities();

  const activities = data?.activities || [];
  const totalPages = Math.ceil(activities.length / itemsPerPage);
  const paginatedActivities = activities.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const activityToEdit = editingActivity
    ? activities.find((a) => a.id === editingActivity)
    : null;

  const handleSubmit = async (values: ActivityFormValues) => {
    // Convert empty string to undefined for optional URL field
    const imageUrl = values.imageUrl?.trim() || undefined;
    
    if (editingActivity) {
      await updateMutation.mutateAsync({
        id: editingActivity,
        ...values,
        imageUrl,
      });
    } else {
      await createMutation.mutateAsync({
        ...values,
        imageUrl,
      });
    }
    setDialogOpen(false);
    setEditingActivity(null);
  };

  const handleOpenDialog = (activityId?: number) => {
    if (activityId) {
      setEditingActivity(activityId);
    } else {
      setEditingActivity(null);
    }
    setDialogOpen(true);
  };

  const handleToggleCheckin = async (activityId: number, enabled: boolean) => {
    await toggleCheckinMutation.mutateAsync({ activityId, enabled });
  };

  const handleCloseActivity = async (activityId: number) => {
    if (
      confirm(
        "Bạn có chắc chắn muốn đóng hoạt động này? Hành động này không thể hoàn tác."
      )
    ) {
      await closeMutation.mutateAsync({ activityId });
    }
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedIds(new Set(paginatedActivities.map((a) => a.id)));
    } else {
      setSelectedIds(new Set());
    }
  };

  const handleSelectOne = (activityId: number, checked: boolean) => {
    const newSelected = new Set(selectedIds);
    if (checked) {
      newSelected.add(activityId);
    } else {
      newSelected.delete(activityId);
    }
    setSelectedIds(newSelected);
  };

  const handleBulkDelete = async () => {
    await bulkDeleteMutation.mutateAsync({
      activityIds: Array.from(selectedIds),
    });
    setSelectedIds(new Set());
    setBulkDeleteDialogOpen(false);
  };

  const handleClearSelection = () => {
    setSelectedIds(new Set());
  };

  return (
    <div className={`${styles.container} ${className || ""}`}>
      <div className={styles.header}>
        <h2 className={styles.title}>Quản lý Hoạt động</h2>
        <Button onClick={() => handleOpenDialog()}>
          <Plus size={16} />
          Tạo hoạt động mới
        </Button>
      </div>

      <div className={styles.filters}>
        <div className={styles.filterItem}>
          <label className={styles.filterLabel}>Trạng thái</label>
          <Select
            value={statusFilter}
            onValueChange={(value) =>
              setStatusFilter(value as ActivityStatus | "all")
            }
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tất cả</SelectItem>
              <SelectItem value="draft">Nháp</SelectItem>
              <SelectItem value="open">Đang mở</SelectItem>
              <SelectItem value="closed">Đã đóng</SelectItem>
              <SelectItem value="cancelled">Đã hủy</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className={styles.filterItem}>
          <label className={styles.filterLabel}>Từ ngày</label>
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline">
                <CalendarIcon size={16} />
                {startDateFilter
                  ? startDateFilter.toLocaleDateString("vi-VN")
                  : "Chọn ngày"}
              </Button>
            </PopoverTrigger>
            <PopoverContent removeBackgroundAndPadding>
              <Calendar
                mode="single"
                selected={startDateFilter}
                onSelect={setStartDateFilter}
              />
            </PopoverContent>
          </Popover>
        </div>

        <div className={styles.filterItem}>
          <label className={styles.filterLabel}>Đến ngày</label>
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline">
                <CalendarIcon size={16} />
                {endDateFilter
                  ? endDateFilter.toLocaleDateString("vi-VN")
                  : "Chọn ngày"}
              </Button>
            </PopoverTrigger>
            <PopoverContent removeBackgroundAndPadding>
              <Calendar
                mode="single"
                selected={endDateFilter}
                onSelect={setEndDateFilter}
              />
            </PopoverContent>
          </Popover>
        </div>
      </div>

      {selectedIds.size > 0 && (
        <div className={styles.bulkActionsBar}>
          <span className={styles.selectedCount}>
            Đã chọn {selectedIds.size} hoạt động
          </span>
          <div className={styles.bulkActions}>
            <Button variant="outline" size="sm" onClick={handleClearSelection}>
              Bỏ chọn
            </Button>
            <Button
              variant="destructive"
              size="sm"
              onClick={() => setBulkDeleteDialogOpen(true)}
            >
              <Trash2 size={14} />
              Xóa đã chọn
            </Button>
          </div>
        </div>
      )}

      <AdminActivitiesTable
        activities={paginatedActivities}
        isFetching={isFetching}
        selectedIds={selectedIds}
        onSelectAll={handleSelectAll}
        onSelectOne={handleSelectOne}
        onEdit={handleOpenDialog}
        onToggleCheckin={handleToggleCheckin}
        onClose={handleCloseActivity}
      />

      {totalPages > 1 && (
        <Pagination>
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  if (currentPage > 1) setCurrentPage(currentPage - 1);
                }}
              />
            </PaginationItem>
            {[...Array(totalPages)].map((_, i) => (
              <PaginationItem key={i}>
                <PaginationLink
                  href="#"
                  isActive={currentPage === i + 1}
                  onClick={(e) => {
                    e.preventDefault();
                    setCurrentPage(i + 1);
                  }}
                >
                  {i + 1}
                </PaginationLink>
              </PaginationItem>
            ))}
            <PaginationItem>
              <PaginationNext
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  if (currentPage < totalPages) setCurrentPage(currentPage + 1);
                }}
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      )}

      <AdminActivityFormDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        activity={activityToEdit}
        onSubmit={handleSubmit}
        isSubmitting={createMutation.isPending || updateMutation.isPending}
      />

      <AdminActivityBulkDeleteDialog
        open={bulkDeleteDialogOpen}
        onOpenChange={setBulkDeleteDialogOpen}
        selectedCount={selectedIds.size}
        onConfirm={handleBulkDelete}
        isDeleting={bulkDeleteMutation.isPending}
      />
    </div>
  );
};