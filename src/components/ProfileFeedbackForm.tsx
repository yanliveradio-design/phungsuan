import React from "react";
import { Button } from "./Button";
import { Input } from "./Input";
import { Textarea } from "./Textarea";
import { MessageSquare, Send } from "lucide-react";
import { useSendFeedback } from "../helpers/useProfile";
import { useForm, Form, FormItem, FormLabel, FormControl, FormMessage } from "./Form";
import { z } from "zod";
import styles from "./ProfileFeedbackForm.module.css";

const feedbackSchema = z.object({
  subject: z.string().min(1, "Vui lòng nhập tiêu đề"),
  message: z.string().min(1, "Vui lòng nhập nội dung phản hồi"),
});

export const ProfileFeedbackForm = () => {
  const { mutate: sendFeedback, isPending } = useSendFeedback();

  const form = useForm({
    defaultValues: {
      subject: "",
      message: "",
    },
    schema: feedbackSchema,
  });

  const handleSubmit = (values: z.infer<typeof feedbackSchema>) => {
    sendFeedback(values, {
      onSuccess: () => {
        form.setValues({ subject: "", message: "" });
      },
    });
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h2 className={styles.title}>
          <MessageSquare size={20} className={styles.icon} />
          Gửi phản hồi
        </h2>
        <p className={styles.subtitle}>
          Đóng góp ý kiến để giúp chúng tôi cải thiện cộng đồng tốt hơn.
        </p>
      </div>

      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(handleSubmit)}
          className={styles.form}
        >
          <FormItem name="subject">
            <FormLabel>Tiêu đề</FormLabel>
            <FormControl>
              <Input
                placeholder="Ví dụ: Đề xuất tính năng mới..."
                value={form.values.subject}
                onChange={(e) =>
                  form.setValues((prev) => ({
                    ...prev,
                    subject: e.target.value,
                  }))
                }
              />
            </FormControl>
            <FormMessage />
          </FormItem>

          <FormItem name="message">
            <FormLabel>Nội dung</FormLabel>
            <FormControl>
              <Textarea
                placeholder="Chia sẻ ý kiến của bạn..."
                value={form.values.message}
                onChange={(e) =>
                  form.setValues((prev) => ({
                    ...prev,
                    message: e.target.value,
                  }))
                }
                rows={4}
              />
            </FormControl>
            <FormMessage />
          </FormItem>

          <div className={styles.actions}>
            <Button type="submit" disabled={isPending}>
              <Send size={16} /> Gửi phản hồi
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
};