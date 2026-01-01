import React from "react";
import { useNavigate } from "react-router-dom";
import { Badge } from "./Badge";
import { Button } from "./Button";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "./DropdownMenu";
import { Checkbox } from "./Checkbox";
import { Skeleton } from "./Skeleton";
import {
  Edit2,
  MoreHorizontal,
  ToggleLeft,
  ToggleRight,
  XCircle,
} from "lucide-react";
import { ActivityStatus } from "../helpers/schema";
import styles from "./AdminActivitiesTable.module.css";

interface Activity {
  id: number;
  title: string;
  startTime: Date;
  location: string | null;
  status: ActivityStatus;
  registrationCount: number;
  checkinCount: number;
  feedbackCount: number;
  checkinEnabled: boolean;
}

interface AdminActivitiesTableProps {
  activities: Activity[];
  isFetching: boolean;
  selectedIds: Set<number>;
  onSelectAll: (checked: boolean) => void;
  onSelectOne: (activityId: number, checked: boolean) => void;
  onEdit: (activityId: number) => void;
  onToggleCheckin: (activityId: number, enabled: boolean) => Promise<void>;
  onClose: (activityId: number) => Promise<void>;
}

export const AdminActivitiesTable = ({
  activities,
  isFetching,
  selectedIds,
  onSelectAll,
  onSelectOne,
  onEdit,
  onToggleCheckin,
  onClose,
}: AdminActivitiesTableProps) => {
  const navigate = useNavigate();

  const allSelected =
    activities.length > 0 && activities.every((a) => selectedIds.has(a.id));

  const getStatusBadgeVariant = (
    status: ActivityStatus
  ): "default" | "success" | "warning" | "destructive" => {
    switch (status) {
      case "open":
        return "success";
      case "draft":
        return "default";
      case "closed":
        return "warning";
      case "cancelled":
        return "destructive";
      default:
        return "default";
    }
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (isFetching) {
    return (
      <div className={styles.loadingState}>
        {[...Array(5)].map((_, i) => (
          <Skeleton key={i} style={{ height: "3rem" }} />
        ))}
      </div>
    );
  }

  return (
    <div className={styles.tableContainer}>
      <table className={styles.table}>
        <thead>
          <tr>
            <th className={styles.checkboxCell}>
              <Checkbox
                checked={allSelected}
                onChange={(e) => onSelectAll(e.target.checked)}
              />
            </th>
            <th>Tiêu đề</th>
            <th>Thời gian</th>
            <th>Địa điểm</th>
            <th>Trạng thái</th>
            <th>Đăng ký</th>
            <th>Check-in</th>
            <th>Feedback</th>
            <th>Hành động</th>
          </tr>
        </thead>
        <tbody>
          {activities.map((activity) => (
            <tr
              key={activity.id}
              onClick={() => navigate(`/admin/activities/${activity.id}`)}
            >
              <td
                className={styles.checkboxCell}
                onClick={(e) => e.stopPropagation()}
              >
                <Checkbox
                  checked={selectedIds.has(activity.id)}
                  onChange={(e) =>
                    onSelectOne(activity.id, e.target.checked)
                  }
                />
              </td>
              <td className={styles.titleCell}>{activity.title}</td>
              <td>{formatDate(activity.startTime)}</td>
              <td>{activity.location || "—"}</td>
              <td>
                <Badge variant={getStatusBadgeVariant(activity.status)}>
                  {activity.status}
                </Badge>
              </td>
              <td className={styles.countCell}>
                {activity.registrationCount}
              </td>
              <td className={styles.countCell}>{activity.checkinCount}</td>
              <td className={styles.countCell}>{activity.feedbackCount}</td>
              <td onClick={(e) => e.stopPropagation()}>
                <div className={styles.actions}>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon-sm">
                        <MoreHorizontal size={16} />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => onEdit(activity.id)}>
                        <Edit2 size={14} style={{ marginRight: 8 }} />
                        Chỉnh sửa
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() =>
                          onToggleCheckin(
                            activity.id,
                            !activity.checkinEnabled
                          )
                        }
                        disabled={activity.status !== "open"}
                      >
                        {activity.checkinEnabled ? (
                          <>
                            <ToggleRight
                              size={14}
                              style={{ marginRight: 8 }}
                            />
                            Tắt Check-in
                          </>
                        ) : (
                          <>
                            <ToggleLeft size={14} style={{ marginRight: 8 }} />
                            Bật Check-in
                          </>
                        )}
                      </DropdownMenuItem>
                      {activity.status === "open" && (
                        <DropdownMenuItem onClick={() => onClose(activity.id)}>
                          <XCircle size={14} style={{ marginRight: 8 }} />
                          Đóng hoạt động
                        </DropdownMenuItem>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};