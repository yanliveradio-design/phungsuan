import React, { useState } from "react";
import { Button } from "./Button";
import { Badge } from "./Badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./Select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "./Dialog";
import { Textarea } from "./Textarea";
import { Skeleton } from "./Skeleton";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationNext,
  PaginationPrevious,
} from "./Pagination";
import {
  useAdminBorrowsList,
  useUpdateBorrowStatus,
  useGetOwnerPhone,
} from "../helpers/useAdminBorrows";
import { BorrowStatus } from "../helpers/schema";
import { Phone } from "lucide-react";
import styles from "./AdminLibraryBorrowsManager.module.css";

export const AdminLibraryBorrowsManager = ({ className }: { className?: string }) => {
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState<BorrowStatus | "all">("all");
  const [completionDialogOpen, setCompletionDialogOpen] = useState(false);
  const [selectedBorrowId, setSelectedBorrowId] = useState<number | null>(null);
  const [completionNote, setCompletionNote] = useState("");
  const [revealedPhones, setRevealedPhones] = useState<Record<number, string>>({});

  const { data, isFetching } = useAdminBorrowsList({
    page,
    pageSize: 20,
    status: statusFilter === "all" ? undefined : statusFilter,
  });

  const updateStatusMutation = useUpdateBorrowStatus();
  const getPhoneMutation = useGetOwnerPhone();

  const borrows = data?.borrows || [];
  const totalPages = data?.totalPages || 1;

  const handleStatusChange = async (borrowId: number, newStatus: BorrowStatus) => {
    if (newStatus === "completed") {
      setSelectedBorrowId(borrowId);
      setCompletionNote("");
      setCompletionDialogOpen(true);
    } else {
      if (confirm(`Xác nhận đổi trạng thái sang ${newStatus}?`)) {
        await updateStatusMutation.mutateAsync({
          borrowId,
          status: newStatus,
        });
      }
    }
  };

  const confirmCompletion = async () => {
    if (selectedBorrowId) {
      await updateStatusMutation.mutateAsync({
        borrowId: selectedBorrowId,
        status: "completed",
        completionNote,
      });
      setCompletionDialogOpen(false);
      setSelectedBorrowId(null);
    }
  };

  const handleRevealPhone = async (borrowId: number) => {
    if (revealedPhones[borrowId]) return;
    
    try {
      const result = await getPhoneMutation.mutateAsync({ borrowId });
      setRevealedPhones(prev => ({ ...prev, [borrowId]: result.phone }));
    } catch (e) {
      // Error handled by mutation
    }
  };

  const formatDate = (date: Date | null) => {
    if (!date) return "—";
    return new Date(date).toLocaleDateString("vi-VN");
  };

  return (
    <div className={`${styles.container} ${className || ""}`}>
      <div className={styles.actionsBar}>
        <div className={styles.filters}>
          <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as any)}>
            <SelectTrigger className={styles.filterSelect}>
              <SelectValue placeholder="Trạng thái mượn" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tất cả trạng thái</SelectItem>
              <SelectItem value="pending">Chờ duyệt</SelectItem>
              <SelectItem value="approved">Đã duyệt</SelectItem>
              <SelectItem value="borrowed">Đang mượn</SelectItem>
              <SelectItem value="return_requested">Yêu cầu trả</SelectItem>
              <SelectItem value="completed">Hoàn thành</SelectItem>
              <SelectItem value="cancelled">Đã hủy</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className={styles.tableContainer}>
        {isFetching ? (
          <div className={styles.loadingState}>
            {[...Array(5)].map((_, i) => <Skeleton key={i} className={styles.rowSkeleton} />)}
          </div>
        ) : (
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Sách</th>
                <th>Người mượn</th>
                <th>Ngày tạo</th>
                <th>Trạng thái</th>
                <th>Liên hệ chủ sách</th>
                <th>Hành động</th>
              </tr>
            </thead>
            <tbody>
              {borrows.map((borrow) => (
                <tr key={borrow.id}>
                  <td className={styles.titleCell}>
                    <div className={styles.bookInfo}>
                      <span className={styles.bookTitle}>{borrow.bookTitle}</span>
                      <span className={styles.bookAuthor}>{borrow.bookAuthor}</span>
                    </div>
                  </td>
                  <td>
                    <div className={styles.userInfo}>
                      <span>{borrow.borrowerName}</span>
                      <span className={styles.userEmail}>{borrow.borrowerEmail}</span>
                    </div>
                  </td>
                  <td>{formatDate(borrow.createdAt)}</td>
                  <td>
                    <Badge variant={
                      borrow.status === "completed" ? "success" :
                      borrow.status === "cancelled" ? "destructive" :
                      borrow.status === "borrowed" ? "warning" : "default"
                    }>
                      {borrow.status}
                    </Badge>
                  </td>
                  <td>
                    {revealedPhones[borrow.id] ? (
                      <span className={styles.phoneText}>{revealedPhones[borrow.id]}</span>
                    ) : (
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => handleRevealPhone(borrow.id)}
                        disabled={!["approved", "borrowed", "return_requested", "completed"].includes(borrow.status)}
                      >
                        <Phone size={14} /> Hiện SĐT
                      </Button>
                    )}
                  </td>
                  <td>
                    <Select 
                      value={borrow.status} 
                      onValueChange={(v) => handleStatusChange(borrow.id, v as BorrowStatus)}
                    >
                      <SelectTrigger className={styles.statusSelect}>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="pending">Chờ duyệt</SelectItem>
                        <SelectItem value="approved">Đã duyệt</SelectItem>
                        <SelectItem value="borrowed">Đang mượn</SelectItem>
                        <SelectItem value="return_requested">Yêu cầu trả</SelectItem>
                        <SelectItem value="completed">Hoàn thành</SelectItem>
                        <SelectItem value="cancelled">Hủy</SelectItem>
                      </SelectContent>
                    </Select>
                  </td>
                </tr>
              ))}
              {borrows.length === 0 && (
                <tr>
                  <td colSpan={6} className={styles.emptyState}>Không có dữ liệu mượn trả</td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>

      {totalPages > 1 && (
        <Pagination>
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious 
                href="#" 
                onClick={(e) => { e.preventDefault(); if(page > 1) setPage(page - 1); }} 
              />
            </PaginationItem>
            <span className={styles.pageInfo}>Trang {page} / {totalPages}</span>
            <PaginationItem>
              <PaginationNext 
                href="#" 
                onClick={(e) => { e.preventDefault(); if(page < totalPages) setPage(page + 1); }} 
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      )}

      <Dialog open={completionDialogOpen} onOpenChange={setCompletionDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Xác nhận hoàn thành</DialogTitle>
          </DialogHeader>
          <div className={styles.completionForm}>
            <p>Vui lòng nhập ghi chú hoàn thành (tình trạng sách, v.v.)</p>
            <Textarea 
              value={completionNote}
              onChange={(e) => setCompletionNote(e.target.value)}
              placeholder="Ghi chú..."
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCompletionDialogOpen(false)}>Hủy</Button>
            <Button onClick={confirmCompletion} disabled={!completionNote}>Xác nhận</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};