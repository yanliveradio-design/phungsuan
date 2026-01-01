import React, { useState } from "react";
import { Button } from "./Button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger } from "./Dialog";
import { Textarea } from "./Textarea";
import { CheckCircle2, AlertTriangle } from "lucide-react";
import { useBorrowAction, useReportBook } from "../helpers/useMemberLibrary";
import { MemberBorrowItem } from "../endpoints/library/my-borrows_GET.schema";
import { toast } from "sonner";
import styles from "./BorrowItemActions.module.css";

interface BorrowItemActionsProps {
  item: MemberBorrowItem;
  role: "borrower" | "owner";
  onAction: (id: number, action: string, note?: string) => void;
}

export const BorrowItemActions = ({ item, role, onAction }: BorrowItemActionsProps) => {
  const [showReport, setShowReport] = useState(false);
  const [showComplete, setShowComplete] = useState(false);
  const [note, setNote] = useState("");
  const [reportReason, setReportReason] = useState("");
  const [reportDetails, setReportDetails] = useState("");
  
  const { mutate: reportBook, isPending: isReporting } = useReportBook();

  const handleReport = () => {
    if (!reportReason) return;
    reportBook(
      { bookId: item.bookId, reason: reportReason, details: reportDetails },
      {
        onSuccess: () => {
          toast.success("Đã gửi báo cáo thành công");
          setShowReport(false);
        },
        onError: (err) => toast.error(err.message)
      }
    );
  };

  const handleComplete = () => {
    if (!note) {
      toast.error("Vui lòng nhập ghi chú đánh giá");
      return;
    }
    onAction(item.id, "confirm_returned", note);
    setShowComplete(false);
  };

  return (
    <div className={styles.actions}>
      {role === "owner" && item.status === "pending" && (
        <>
          <Button size="sm" onClick={() => onAction(item.id, "approve")}>Duyệt</Button>
          <Button size="sm" variant="destructive" onClick={() => onAction(item.id, "reject")}>Từ chối</Button>
        </>
      )}

      {role === "owner" && (item.status === "borrowed" || item.status === "return_requested") && (
        <Dialog open={showComplete} onOpenChange={setShowComplete}>
          <DialogTrigger asChild>
            <Button size="sm" variant="primary">
              <CheckCircle2 size={14} /> Xác nhận trả sách
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Xác nhận nhận lại sách</DialogTitle>
            </DialogHeader>
            <div className={styles.formGroup}>
              <label className={styles.label}>Ghi chú / Đánh giá (Bắt buộc)</label>
              <Textarea 
                placeholder="Sách còn nguyên vẹn không? Người mượn có đúng hẹn không?"
                value={note}
                onChange={(e) => setNote(e.target.value)}
              />
            </div>
            <DialogFooter>
              <Button variant="ghost" onClick={() => setShowComplete(false)}>Hủy</Button>
              <Button onClick={handleComplete}>Xác nhận hoàn tất</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {["borrowed", "approved", "return_requested"].includes(item.status) && (
        <Dialog open={showReport} onOpenChange={setShowReport}>
          <DialogTrigger asChild>
            <Button size="sm" variant="ghost" className={styles.reportBtn}>
              <AlertTriangle size={14} /> Báo cáo
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Báo cáo vấn đề</DialogTitle>
            </DialogHeader>
            <div className={styles.formGroup}>
              <label className={styles.label}>Lý do</label>
              <select 
                className={styles.select}
                value={reportReason}
                onChange={(e) => setReportReason(e.target.value)}
              >
                <option value="">Chọn lý do...</option>
                <option value="damaged">Sách bị hư hại</option>
                <option value="lost">Làm mất sách</option>
                <option value="late">Trả sách quá hạn</option>
                <option value="wrong_item">Sai sách</option>
                <option value="other">Khác</option>
              </select>
            </div>
            <div className={styles.formGroup}>
              <label className={styles.label}>Chi tiết</label>
              <Textarea 
                value={reportDetails}
                onChange={(e) => setReportDetails(e.target.value)}
                placeholder="Mô tả chi tiết vấn đề..."
              />
            </div>
            <DialogFooter>
              <Button variant="ghost" onClick={() => setShowReport(false)}>Hủy</Button>
              <Button variant="destructive" onClick={handleReport} disabled={isReporting}>
                Gửi báo cáo
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};