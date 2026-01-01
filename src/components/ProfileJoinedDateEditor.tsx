import React, { useState } from "react";
import { format } from "date-fns";
import { vi } from "date-fns/locale";
import { Calendar as CalendarIcon, Save, Info, CheckCircle2 } from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { Button } from "./Button";
import { Calendar } from "./Calendar";
import { Popover, PopoverContent, PopoverTrigger } from "./Popover";
import { Badge } from "./Badge";
import { postUpdateProfileJoinedDate } from "../endpoints/profile/update-joined-date_POST.schema";
import { PROFILE_QUERY_KEY } from "../helpers/useProfile";
import styles from "./ProfileJoinedDateEditor.module.css";

interface ProfileJoinedDateEditorProps {
  joinedAt: Date | null;
  joinedAtUpdatedByMember: boolean;
}

export const ProfileJoinedDateEditor = ({
  joinedAt,
  joinedAtUpdatedByMember,
}: ProfileJoinedDateEditorProps) => {
  const queryClient = useQueryClient();
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(
    joinedAt || undefined
  );
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);

  const { mutate: updateJoinedDate, isPending } = useMutation({
    mutationFn: postUpdateProfileJoinedDate,
    onSuccess: (data) => {
      toast.success("Đã cập nhật ngày tham gia thành công");
      queryClient.invalidateQueries({ queryKey: PROFILE_QUERY_KEY });
      // Optimistically update if needed, but invalidation is safer
    },
    onError: (error) => {
      toast.error(error.message || "Không thể cập nhật ngày tham gia");
    },
  });

  const handleSave = () => {
    if (!selectedDate) {
      toast.error("Vui lòng chọn ngày tham gia");
      return;
    }
    updateJoinedDate({ joinedAt: selectedDate });
  };

  const formatDate = (date: Date | null | undefined) => {
    if (!date) return "Chưa cập nhật";
    return format(date, "d 'tháng' M, yyyy", { locale: vi });
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h2 className={styles.title}>
          <CalendarIcon size={20} className={styles.icon} />
          Ngày tham gia cộng đồng
        </h2>
        {joinedAtUpdatedByMember && (
          <Badge variant="success" className={styles.badge}>
            <CheckCircle2 size={12} style={{ marginRight: 4 }} />
            Đã cập nhật
          </Badge>
        )}
      </div>

      <div className={styles.content}>
        <p className={styles.currentDate}>
          Tham gia từ: <strong>{formatDate(joinedAt)}</strong>
        </p>

        {!joinedAtUpdatedByMember ? (
          <div className={styles.editSection}>
            <div className={styles.infoBox}>
              <Info size={16} className={styles.infoIcon} />
              <span className={styles.infoText}>
                Bạn có thể cập nhật ngày tham gia chính xác <strong>1 lần duy nhất</strong>.
              </span>
            </div>

            <div className={styles.actions}>
              <Popover open={isPopoverOpen} onOpenChange={setIsPopoverOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={styles.dateTrigger}
                    disabled={isPending}
                  >
                    <CalendarIcon size={16} />
                    {selectedDate ? formatDate(selectedDate) : "Chọn ngày"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className={styles.popoverContent} align="start">
                  <Calendar
                    mode="single"
                    selected={selectedDate}
                    onSelect={(date) => {
                      setSelectedDate(date);
                      setIsPopoverOpen(false);
                    }}
                    disabled={(date) =>
                      date > new Date() || date < new Date("1900-01-01")
                    }
                    initialFocus
                  />
                </PopoverContent>
              </Popover>

                            <Button
                onClick={handleSave}
                disabled={isPending || !selectedDate || (joinedAt !== null && selectedDate.getTime() === joinedAt.getTime())}
              >
                <Save size={16} />
                Lưu
              </Button>
            </div>
          </div>
        ) : (
          <p className={styles.readOnlyText}>
            Bạn đã xác nhận ngày tham gia và không thể thay đổi nữa.
          </p>
        )}
      </div>
    </div>
  );
};