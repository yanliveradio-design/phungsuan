import React, { useState } from "react";
import {
  useFeedbackList,
  useRetagFeedback,
  usePublishFeedback,
  useFlagFeedback,
} from "../helpers/useAdminFeedback";
import { useTopicsList, useCreateTopic } from "../helpers/useAdminTopics";
import { useAdminActivitiesList } from "../helpers/useAdminActivities";
import { Badge } from "./Badge";
import { Button } from "./Button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "./Dialog";
import {
  Form,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
  useForm,
} from "./Form";
import { Input } from "./Input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./Select";
import { Skeleton } from "./Skeleton";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "./Tabs";
import { Eye, Flag, Check, Plus } from "lucide-react";
import { z } from "zod";
import styles from "./AdminFeedbackTab.module.css";

const topicFormSchema = z.object({
  name: z.string().min(1, "Tên chủ đề là bắt buộc"),
});

export const AdminFeedbackTab = ({ className }: { className?: string }) => {
  const [currentTab, setCurrentTab] = useState<
    "ai_suggested" | "ai_flagged" | "all"
  >("ai_suggested");
  const [activityFilter, setActivityFilter] = useState<number | undefined>();
  const [viewingFeedback, setViewingFeedback] = useState<number | null>(null);
  const [retaggingFeedback, setRetaggingFeedback] = useState<{
    id: number;
    currentTopic: string;
  } | null>(null);
  const [selectedTopicId, setSelectedTopicId] = useState<number | undefined>();
  const [topicDialogOpen, setTopicDialogOpen] = useState(false);

  const { data: feedbackData, isFetching: feedbackLoading } = useFeedbackList(
    currentTab,
    activityFilter
  );
  const { data: topicsData } = useTopicsList();
  const { data: activitiesData } = useAdminActivitiesList({});

  const retagMutation = useRetagFeedback();
  const publishMutation = usePublishFeedback();
  const flagMutation = useFlagFeedback();
  const createTopicMutation = useCreateTopic();

  const feedbackList = feedbackData?.feedback || [];
  const topics = topicsData?.topics || [];
  const activities = activitiesData?.activities || [];

  const viewedFeedback = viewingFeedback
    ? feedbackList.find((f) => f.id === viewingFeedback)
    : null;

  const topicForm = useForm({
    defaultValues: {
      name: "",
    },
    schema: topicFormSchema,
  });

  const handleRetag = async () => {
    if (retaggingFeedback && selectedTopicId) {
      await retagMutation.mutateAsync({
        feedbackId: retaggingFeedback.id,
        newTopicId: selectedTopicId,
      });
      setRetaggingFeedback(null);
      setSelectedTopicId(undefined);
    }
  };

  const handlePublish = async (feedbackId: number) => {
    if (confirm("Bạn có chắc chắn muốn xuất bản phản hồi này?")) {
      await publishMutation.mutateAsync({ feedbackId });
    }
  };

  const handleFlag = async (feedbackId: number, flagged: boolean) => {
    await flagMutation.mutateAsync({ feedbackId, flagged });
  };

  const handleCreateTopic = async (values: { name: string }) => {
    await createTopicMutation.mutateAsync(values);
    setTopicDialogOpen(false);
    topicForm.setValues({ name: "" });
  };

  const renderStars = (rating: number) => {
    return "★".repeat(rating) + "☆".repeat(5 - rating);
  };

  return (
    <div className={`${styles.container} ${className || ""}`}>
      <div className={styles.header}>
        <h2 className={styles.title}>Quản lý Feedback</h2>
      </div>

      <div className={styles.filters}>
        <div className={styles.filterItem}>
          <label className={styles.filterLabel}>Lọc theo hoạt động</label>
          <Select
            value={activityFilter?.toString() || "__empty"}
            onValueChange={(value) =>
              setActivityFilter(
                value === "__empty" ? undefined : parseInt(value)
              )
            }
          >
            <SelectTrigger>
              <SelectValue placeholder="Tất cả hoạt động" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="__empty">Tất cả hoạt động</SelectItem>
              {activities.map((activity) => (
                <SelectItem key={activity.id} value={activity.id.toString()}>
                  {activity.title}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <Tabs value={currentTab} onValueChange={(v) => setCurrentTab(v as any)}>
        <TabsList>
          <TabsTrigger value="ai_suggested">AI Đề xuất</TabsTrigger>
          <TabsTrigger value="ai_flagged">Bị đánh dấu</TabsTrigger>
          <TabsTrigger value="all">Tất cả</TabsTrigger>
        </TabsList>

        <TabsContent value={currentTab}>
          <div className={styles.tableContainer}>
            {feedbackLoading ? (
              <div className={styles.loadingState}>
                {[...Array(5)].map((_, i) => (
                  <Skeleton key={i} style={{ height: "3rem" }} />
                ))}
              </div>
            ) : (
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th>Người dùng</th>
                    <th>Hoạt động</th>
                    <th>Chủ đề</th>
                    <th>Đánh giá</th>
                    <th>Bình luận</th>
                    <th>Trạng thái</th>
                    <th>Hành động</th>
                  </tr>
                </thead>
                <tbody>
                  {feedbackList.map((feedback) => (
                    <tr key={feedback.id}>
                      <td>
                        {feedback.isAnonymous ? (
                          <em className={styles.anonymous}>Ẩn danh</em>
                        ) : (
                          feedback.userFullName
                        )}
                      </td>
                      <td className={styles.activityCell}>
                        {feedback.activityTitle}
                      </td>
                      <td>
                        <div className={styles.topicCell}>
                          <span>{feedback.originalTopicName}</span>
                          {feedback.displayTopicId &&
                            feedback.displayTopicId !==
                              feedback.originalTopicId && (
                              <>
                                <span className={styles.topicArrow}>→</span>
                                <span className={styles.displayTopic}>
                                  {feedback.displayTopicName}
                                </span>
                              </>
                            )}
                        </div>
                      </td>
                      <td className={styles.ratingCell}>
                        <span className={styles.stars}>
                          {renderStars(feedback.rating)}
                        </span>
                      </td>
                      <td className={styles.commentCell}>
                        {feedback.comment
                          ? feedback.comment.substring(0, 50) +
                            (feedback.comment.length > 50 ? "..." : "")
                          : "—"}
                      </td>
                      <td>
                        <div className={styles.badges}>
                          {feedback.aiSuggested && (
                            <Badge variant="default">AI</Badge>
                          )}
                          {feedback.aiFlagged && (
                            <Badge variant="warning">Cờ</Badge>
                          )}
                          {feedback.isPublished && (
                            <Badge variant="success">Đã xuất bản</Badge>
                          )}
                        </div>
                      </td>
                      <td>
                        <div className={styles.actions}>
                          <Button
                            variant="ghost"
                            size="icon-sm"
                            onClick={() => setViewingFeedback(feedback.id)}
                          >
                            <Eye size={14} />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() =>
                              setRetaggingFeedback({
                                id: feedback.id,
                                currentTopic: feedback.originalTopicName,
                              })
                            }
                          >
                            Chủ đề
                          </Button>
                          {!feedback.isPublished && (
                            <Button
                              variant="primary"
                              size="sm"
                              onClick={() => handlePublish(feedback.id)}
                              disabled={publishMutation.isPending}
                            >
                              Xuất bản
                            </Button>
                          )}
                          <Button
                            variant={feedback.aiFlagged ? "destructive" : "ghost"}
                            size="icon-sm"
                            onClick={() =>
                              handleFlag(feedback.id, !feedback.aiFlagged)
                            }
                          >
                            <Flag size={14} />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </TabsContent>
      </Tabs>

      <div className={styles.topicsSection}>
        <div className={styles.topicsHeader}>
          <h3 className={styles.topicsTitle}>Quản lý Chủ đề</h3>
          <Button size="sm" onClick={() => setTopicDialogOpen(true)}>
            <Plus size={16} />
            Thêm chủ đề
          </Button>
        </div>
        <div className={styles.topicsList}>
          {topics.map((topic) => (
            <div key={topic.id} className={styles.topicChip}>
              {topic.name}
            </div>
          ))}
        </div>
      </div>

      <Dialog
        open={!!viewingFeedback}
        onOpenChange={() => setViewingFeedback(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Chi tiết Feedback</DialogTitle>
          </DialogHeader>
          {viewedFeedback && (
            <div className={styles.feedbackDetails}>
              <div className={styles.detailRow}>
                <span className={styles.detailLabel}>Người dùng:</span>
                <span>
                  {viewedFeedback.isAnonymous
                    ? "Ẩn danh"
                    : viewedFeedback.userFullName}
                </span>
              </div>
              <div className={styles.detailRow}>
                <span className={styles.detailLabel}>Hoạt động:</span>
                <span>{viewedFeedback.activityTitle}</span>
              </div>
              <div className={styles.detailRow}>
                <span className={styles.detailLabel}>Đánh giá:</span>
                <span className={styles.stars}>
                  {renderStars(viewedFeedback.rating)}
                </span>
              </div>
              <div className={styles.detailRow}>
                <span className={styles.detailLabel}>Chủ đề gốc:</span>
                <span>{viewedFeedback.originalTopicName}</span>
              </div>
              {viewedFeedback.displayTopicId &&
                viewedFeedback.displayTopicId !==
                  viewedFeedback.originalTopicId && (
                  <div className={styles.detailRow}>
                    <span className={styles.detailLabel}>Chủ đề hiển thị:</span>
                    <span>{viewedFeedback.displayTopicName}</span>
                  </div>
                )}
              {viewedFeedback.comment && (
                <div className={styles.detailColumn}>
                  <span className={styles.detailLabel}>Bình luận:</span>
                  <p className={styles.commentText}>
                    {viewedFeedback.comment}
                  </p>
                </div>
              )}
              {viewedFeedback.aiReason && (
                <div className={styles.detailColumn}>
                  <span className={styles.detailLabel}>Lý do AI:</span>
                  <p className={styles.aiReason}>{viewedFeedback.aiReason}</p>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      <Dialog
        open={!!retaggingFeedback}
        onOpenChange={() => setRetaggingFeedback(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Thay đổi chủ đề</DialogTitle>
          </DialogHeader>
          {retaggingFeedback && (
            <div className={styles.retagContent}>
              <p className={styles.currentTopic}>
                Chủ đề hiện tại:{" "}
                <strong>{retaggingFeedback.currentTopic}</strong>
              </p>
              <div className={styles.topicSelect}>
                <label className={styles.filterLabel}>Chọn chủ đề mới</label>
                <Select
                  value={selectedTopicId?.toString() || "__empty"}
                  onValueChange={(value) =>
                    setSelectedTopicId(
                      value === "__empty" ? undefined : parseInt(value)
                    )
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Chọn chủ đề" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="__empty">Chọn chủ đề</SelectItem>
                    {topics.map((topic) => (
                      <SelectItem key={topic.id} value={topic.id.toString()}>
                        {topic.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className={styles.dialogActions}>
                <Button
                  variant="outline"
                  onClick={() => setRetaggingFeedback(null)}
                >
                  Hủy
                </Button>
                <Button
                  onClick={handleRetag}
                  disabled={!selectedTopicId || retagMutation.isPending}
                >
                  <Check size={16} />
                  Xác nhận
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={topicDialogOpen} onOpenChange={setTopicDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Thêm chủ đề mới</DialogTitle>
          </DialogHeader>
          <Form {...topicForm}>
            <form onSubmit={topicForm.handleSubmit(handleCreateTopic)}>
              <FormItem name="name">
                <FormLabel>Tên chủ đề</FormLabel>
                <FormControl>
                  <Input
                    value={topicForm.values.name}
                    onChange={(e) =>
                      topicForm.setValues((prev) => ({
                        ...prev,
                        name: e.target.value,
                      }))
                    }
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
              <div className={styles.dialogActions}>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setTopicDialogOpen(false)}
                >
                  Hủy
                </Button>
                <Button type="submit" disabled={createTopicMutation.isPending}>
                  Tạo mới
                </Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
};