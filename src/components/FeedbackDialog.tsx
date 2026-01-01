import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "./Dialog";
import { Button } from "./Button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./Select";
import { Textarea } from "./Textarea";
import { Checkbox } from "./Checkbox";
import { Star } from "lucide-react";
import { usePublicTopics } from "../helpers/usePublicTopics";
import { useSubmitFeedback } from "../helpers/useMemberActivities";
import { Skeleton } from "./Skeleton";
import styles from "./FeedbackDialog.module.css";

interface FeedbackDialogProps {
  activityId: number;
  activityTitle: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const FeedbackDialog = ({
  activityId,
  activityTitle,
  open,
  onOpenChange,
}: FeedbackDialogProps) => {
  const [topicId, setTopicId] = useState<string>("");
  const [rating, setRating] = useState<number>(0);
  const [comment, setComment] = useState("");
  const [isAnonymous, setIsAnonymous] = useState(false);

  const { data: topicsData, isFetching: isLoadingTopics } = usePublicTopics();
  const submitFeedback = useSubmitFeedback();

  const handleSubmit = async () => {
    if (!topicId || topicId === "__empty" || rating === 0) {
      return;
    }

    await submitFeedback.mutateAsync({
      activityId,
      topicId: parseInt(topicId),
      rating,
      comment: comment.trim() || undefined,
      isAnonymous,
    });

    // Reset form and close dialog
    setTopicId("");
    setRating(0);
    setComment("");
    setIsAnonymous(false);
    onOpenChange(false);
  };

  const isValid = topicId && topicId !== "__empty" && rating > 0;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Gửi phản hồi</DialogTitle>
          <DialogDescription>
            Chia sẻ trải nghiệm của bạn về hoạt động "{activityTitle}"
          </DialogDescription>
        </DialogHeader>

        <div className={styles.form}>
          <div className={styles.field}>
            <label className={styles.label}>Chủ đề phản hồi</label>
            {isLoadingTopics ? (
              <Skeleton style={{ height: "2.5rem" }} />
            ) : (
              <Select value={topicId} onValueChange={setTopicId}>
                <SelectTrigger>
                  <SelectValue placeholder="Chọn chủ đề" />
                </SelectTrigger>
                <SelectContent>
                  {topicsData?.topics.map((topic) => (
                    <SelectItem key={topic.id} value={topic.id.toString()}>
                      {topic.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>

          <div className={styles.field}>
            <label className={styles.label}>Đánh giá</label>
            <div className={styles.ratingContainer}>
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  className={styles.starButton}
                  onClick={() => setRating(star)}
                  aria-label={`Đánh giá ${star} sao`}
                >
                  <Star
                    size={32}
                    className={
                      star <= rating ? styles.starFilled : styles.starEmpty
                    }
                    fill={star <= rating ? "currentColor" : "none"}
                  />
                </button>
              ))}
            </div>
          </div>

          <div className={styles.field}>
            <label className={styles.label}>Nhận xét (tùy chọn)</label>
            <Textarea
              placeholder="Chia sẻ suy nghĩ của bạn..."
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              rows={4}
            />
          </div>

          <div className={styles.checkboxField}>
            <Checkbox
              id="anonymous"
              checked={isAnonymous}
              onChange={(e) => setIsAnonymous(e.target.checked)}
            />
            <label htmlFor="anonymous" className={styles.checkboxLabel}>
              Gửi phản hồi ẩn danh
            </label>
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={submitFeedback.isPending}
          >
            Hủy
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={!isValid || submitFeedback.isPending}
          >
            {submitFeedback.isPending ? "Đang gửi..." : "Gửi phản hồi"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};