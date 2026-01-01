import React from "react";
import { Link } from "react-router-dom";
import { 
  BookOpenCheck, 
  Clock, 
  CheckCircle2, 
  XCircle, 
  RotateCcw, 
  MessageCircle,
  LogIn,
  ShieldAlert
} from "lucide-react";
import { Button } from "./Button";
import { Badge } from "./Badge";
import { useAuth } from "../helpers/useAuth";
import { useRequestBorrow, useBorrowAction, useMyBorrows } from "../helpers/useMemberLibrary";
import { BookDetail } from "../endpoints/library/book-detail_GET.schema";
import { Selectable } from "kysely";
import { BorrowRecord } from "../helpers/schema";
import { toast } from "sonner";
import styles from "./BorrowFlowCard.module.css";

interface BorrowFlowCardProps {
  book: BookDetail;
  activeBorrow?: Selectable<BorrowRecord>;
}

export const BorrowFlowCard = ({ book, activeBorrow }: BorrowFlowCardProps) => {
  const { authState } = useAuth();
  const { mutate: requestBorrow, isPending: isRequesting } = useRequestBorrow();
  const { mutate: borrowAction, isPending: isActionPending } = useBorrowAction();
  
  // Fetch full borrow details including phone number when needed
  const needsPhoneNumber = activeBorrow && 
    (activeBorrow.status === "approved" || activeBorrow.status === "borrowed" || activeBorrow.status === "return_requested");
  
  const { data: myBorrowsData } = useMyBorrows(
    { role: "borrower" },
    { enabled: needsPhoneNumber && authState.type === "authenticated" }
  );
  
  // Find the current borrow record with phone number
  const fullBorrowRecord = myBorrowsData?.borrows.find(
    (b) => b.id === activeBorrow?.id
  );

  const handleRequestBorrow = () => {
    requestBorrow(
      { bookId: book.id },
      {
        onSuccess: () => {
          toast.success("Đã gửi yêu cầu mượn sách thành công!");
        },
        onError: (error) => {
          toast.error(`Gửi yêu cầu thất bại: ${error.message}`);
        },
      }
    );
  };

  const handleAction = (action: "cancel" | "confirm_received" | "request_return") => {
    if (!activeBorrow) return;
    
    borrowAction(
      { borrowId: activeBorrow.id, action },
      {
        onSuccess: () => {
          toast.success("Cập nhật trạng thái thành công!");
        },
        onError: (error) => {
          toast.error(`Thao tác thất bại: ${error.message}`);
        },
      }
    );
  };

  // 1. Not logged in
  if (authState.type !== "authenticated") {
    return (
      <div className={styles.card}>
        <div className={styles.iconWrapper}>
          <LogIn size={24} />
        </div>
        <h3 className={styles.title}>Bạn muốn mượn sách này?</h3>
        <p className={styles.description}>
          Vui lòng đăng nhập để gửi yêu cầu mượn sách và tham gia cộng đồng.
        </p>
        <Button asChild className={styles.fullWidth}>
          <Link to="/login">Đăng nhập ngay</Link>
        </Button>
      </div>
    );
  }

  const user = authState.user;
  const isOwner = user.id === book.ownerId;

  // 2. Own book
  if (isOwner) {
    return (
      <div className={`${styles.card} ${styles.ownerCard}`}>
        <div className={styles.iconWrapper}>
          <BookOpenCheck size={24} />
        </div>
        <h3 className={styles.title}>Sách của bạn</h3>
        <p className={styles.description}>
          Đây là sách bạn đã đóng góp cho cộng đồng. Cảm ơn bạn đã chia sẻ tri thức!
        </p>
        {book.status === "borrowed" && (
          <div className={styles.statusAlert}>
            <Badge variant="secondary">Đang được mượn</Badge>
          </div>
        )}
      </div>
    );
  }

  // 3. No active borrow (for this user)
  if (!activeBorrow) {
    if (book.status === "borrowed") {
      return (
        <div className={styles.card}>
          <div className={styles.iconWrapper}>
            <Clock size={24} />
          </div>
          <h3 className={styles.title}>Sách đang được mượn</h3>
          <p className={styles.description}>
            Cuốn sách này hiện đang được thành viên khác mượn. Vui lòng quay lại sau.
          </p>
          <Button disabled variant="secondary" className={styles.fullWidth}>
            Tạm thời không có sẵn
          </Button>
        </div>
      );
    }

    return (
      <div className={styles.card}>
        <div className={styles.iconWrapper}>
          <BookOpenCheck size={24} />
        </div>
        <h3 className={styles.title}>Mượn sách này</h3>
        <p className={styles.description}>
          Gửi yêu cầu mượn sách đến chủ sở hữu. Bạn sẽ nhận được thông báo khi yêu cầu được chấp nhận.
        </p>
        <Button 
          onClick={handleRequestBorrow} 
          disabled={isRequesting}
          className={styles.fullWidth}
        >
          {isRequesting ? "Đang gửi..." : "Yêu cầu mượn sách"}
        </Button>
      </div>
    );
  }

  // 4. Has active borrow (User is borrower)
  // We assume activeBorrow returned by API is for the current user if they are not owner
  // But let's be safe and check logic if needed. The API spec says activeBorrow is returned.
  
  const status = activeBorrow.status;

  return (
    <div className={styles.card}>
      {/* Status Header */}
      <div className={styles.statusHeader}>
        <span className={styles.statusLabel}>Trạng thái:</span>
        <Badge 
          variant={
            status === "approved" || status === "borrowed" ? "success" :
            status === "pending" || status === "return_requested" ? "warning" :
            status === "cancelled" ? "destructive" : "default"
          }
        >
          {status === "pending" && "Đang chờ duyệt"}
          {status === "approved" && "Đã được duyệt"}
          {status === "borrowed" && "Đang mượn"}
          {status === "return_requested" && "Chờ xác nhận trả"}
          {status === "completed" && "Đã hoàn thành"}
          {status === "cancelled" && "Đã hủy"}
        </Badge>
      </div>

      {/* Content based on status */}
      {status === "pending" && (
        <>
          <p className={styles.description}>
            Yêu cầu của bạn đang chờ chủ sách phê duyệt. Bạn có thể hủy yêu cầu nếu đổi ý.
          </p>
          <Button 
            variant="destructive" 
            onClick={() => handleAction("cancel")}
            disabled={isActionPending}
            className={styles.fullWidth}
          >
            <XCircle size={16} /> Hủy yêu cầu
          </Button>
        </>
      )}

      {(status === "approved" || status === "borrowed") && (
        <>
          <div className={styles.contactInfo}>
            <div className={styles.contactLabel}>
              <MessageCircle size={16} />
              <span>Liên hệ chủ sách:</span>
            </div>
            <div className={styles.phoneBox}>
              {fullBorrowRecord?.ownerPhoneFull || "Đang tải số điện thoại..."}
            </div>
            <p className={styles.hint}>
              Hãy liên hệ để {status === "approved" ? "nhận" : "trả"} sách nhé!
            </p>
          </div>

          {status === "approved" && (
            <Button 
              variant="primary" 
              onClick={() => handleAction("confirm_received")}
              disabled={isActionPending}
              className={styles.fullWidth}
            >
              <CheckCircle2 size={16} /> Xác nhận đã nhận sách
            </Button>
          )}

          {status === "borrowed" && (
            <Button 
              variant="outline" 
              onClick={() => handleAction("request_return")}
              disabled={isActionPending}
              className={styles.fullWidth}
            >
              <RotateCcw size={16} /> Yêu cầu trả sách
            </Button>
          )}
        </>
      )}

      {status === "return_requested" && (
        <p className={styles.description}>
          Bạn đã gửi yêu cầu trả sách. Vui lòng đợi chủ sách xác nhận đã nhận lại sách.
        </p>
      )}

      {status === "completed" && (
        <div className={styles.completedNote}>
          <CheckCircle2 size={24} className={styles.successIcon} />
          <p>Quá trình mượn sách đã hoàn tất.</p>
          {activeBorrow.completionNote && (
            <div className={styles.noteBox}>
              "{activeBorrow.completionNote}"
            </div>
          )}
        </div>
      )}

      {status === "cancelled" && (
        <div className={styles.cancelledNote}>
          <ShieldAlert size={24} className={styles.errorIcon} />
          <p>Yêu cầu mượn sách đã bị hủy.</p>
        </div>
      )}
    </div>
  );
};