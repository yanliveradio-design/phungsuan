import React from "react";
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
import { Textarea } from "./Textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./Select";
import { Button } from "./Button";
import { z } from "zod";
import styles from "./AdminActivityFormDialog.module.css";

const activityFormSchema = z.object({
  title: z.string().min(1, "Tiêu đề là bắt buộc"),
  description: z.string().optional(),
  imageUrl: z.string().url("URL không hợp lệ").optional().or(z.literal("")),
  startTime: z.date(),
  endTime: z.date().optional(),
  location: z.string().optional(),
  maxParticipants: z.coerce.number().min(1).optional(),
  status: z.enum(["draft", "open"]),
});

export type ActivityFormValues = z.infer<typeof activityFormSchema>;

interface AdminActivityFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  activity?: {
    id: number;
    title: string;
    description: string | null;
    imageUrl: string | null;
    startTime: Date;
    endTime: Date | null;
    location: string | null;
    maxParticipants: number | null;
    status: string;
  } | null;
  onSubmit: (values: ActivityFormValues) => Promise<void>;
  isSubmitting: boolean;
}

export const AdminActivityFormDialog = ({
  open,
  onOpenChange,
  activity,
  onSubmit,
  isSubmitting,
}: AdminActivityFormDialogProps) => {
  const form = useForm({
    defaultValues: {
      title: "",
      description: "",
      imageUrl: "",
      startTime: new Date(),
      endTime: undefined,
      location: "",
      maxParticipants: undefined,
      status: "draft" as "draft" | "open",
    },
    schema: activityFormSchema,
  });

  // Reset form values when dialog opens or activity changes
  React.useEffect(() => {
    if (open) {
      if (activity) {
        form.setValues({
          title: activity.title,
          description: activity.description || "",
          imageUrl: activity.imageUrl || "",
          startTime: new Date(activity.startTime),
          endTime: activity.endTime ? new Date(activity.endTime) : undefined,
          location: activity.location || "",
          maxParticipants: activity.maxParticipants || undefined,
          status: activity.status === "open" ? "open" : "draft",
        });
      } else {
        form.setValues({
          title: "",
          description: "",
          imageUrl: "",
          startTime: new Date(),
          endTime: undefined,
          location: "",
          maxParticipants: undefined,
          status: "draft",
        });
      }
    }
  }, [open, activity]);

  const handleSubmit = async (values: ActivityFormValues) => {
    await onSubmit(values);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {activity ? "Chỉnh sửa hoạt động" : "Tạo hoạt động mới"}
          </DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)}>
            <FormItem name="title">
              <FormLabel>Tiêu đề</FormLabel>
              <FormControl>
                <Input
                  value={form.values.title}
                  onChange={(e) =>
                    form.setValues((prev) => ({
                      ...prev,
                      title: e.target.value,
                    }))
                  }
                />
              </FormControl>
              <FormMessage />
            </FormItem>

            <FormItem name="imageUrl">
              <FormLabel>Ảnh đại diện (URL)</FormLabel>
              <FormControl>
                <Input
                  value={form.values.imageUrl}
                  onChange={(e) =>
                    form.setValues((prev) => ({
                      ...prev,
                      imageUrl: e.target.value,
                    }))
                  }
                  placeholder="https://example.com/image.jpg"
                />
              </FormControl>
              <FormMessage />
            </FormItem>

            <FormItem name="description">
              <FormLabel>Mô tả</FormLabel>
              <FormControl>
                <Textarea
                  value={form.values.description}
                  onChange={(e) =>
                    form.setValues((prev) => ({
                      ...prev,
                      description: e.target.value,
                    }))
                  }
                />
              </FormControl>
              <FormMessage />
            </FormItem>

            <FormItem name="startTime">
              <FormLabel>Thời gian bắt đầu</FormLabel>
              <FormControl>
                <Input
                  type="datetime-local"
                  value={
                    form.values.startTime
                      ? new Date(
                          form.values.startTime.getTime() -
                            form.values.startTime.getTimezoneOffset() * 60000
                        )
                          .toISOString()
                          .slice(0, 16)
                      : ""
                  }
                  onChange={(e) => {
                    const date = e.target.value
                      ? new Date(e.target.value)
                      : new Date();
                    form.setValues((prev) => ({
                      ...prev,
                      startTime: date,
                    }));
                  }}
                />
              </FormControl>
              <FormMessage />
            </FormItem>

            <FormItem name="endTime">
              <FormLabel>Thời gian kết thúc</FormLabel>
              <FormControl>
                <Input
                  type="datetime-local"
                  value={
                    form.values.endTime
                      ? new Date(
                          form.values.endTime.getTime() -
                            form.values.endTime.getTimezoneOffset() * 60000
                        )
                          .toISOString()
                          .slice(0, 16)
                      : ""
                  }
                  onChange={(e) => {
                    const date = e.target.value
                      ? new Date(e.target.value)
                      : undefined;
                    form.setValues((prev) => ({
                      ...prev,
                      endTime: date,
                    }));
                  }}
                />
              </FormControl>
              <FormMessage />
            </FormItem>

            <FormItem name="location">
              <FormLabel>Địa điểm</FormLabel>
              <FormControl>
                <Input
                  value={form.values.location}
                  onChange={(e) =>
                    form.setValues((prev) => ({
                      ...prev,
                      location: e.target.value,
                    }))
                  }
                />
              </FormControl>
              <FormMessage />
            </FormItem>

            <FormItem name="maxParticipants">
              <FormLabel>Số người tối đa</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  value={form.values.maxParticipants || ""}
                  onChange={(e) =>
                    form.setValues((prev) => ({
                      ...prev,
                      maxParticipants: e.target.value
                        ? parseInt(e.target.value)
                        : undefined,
                    }))
                  }
                />
              </FormControl>
              <FormMessage />
            </FormItem>

            <FormItem name="status">
              <FormLabel>Trạng thái</FormLabel>
              <FormControl>
                <Select
                  value={form.values.status}
                  onValueChange={(value) =>
                    form.setValues((prev) => ({
                      ...prev,
                      status: value as "draft" | "open",
                    }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="draft">Nháp</SelectItem>
                    <SelectItem value="open">Đang mở</SelectItem>
                  </SelectContent>
                </Select>
              </FormControl>
              <FormMessage />
            </FormItem>

            <div className={styles.dialogActions}>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                Hủy
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {activity ? "Cập nhật" : "Tạo mới"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};