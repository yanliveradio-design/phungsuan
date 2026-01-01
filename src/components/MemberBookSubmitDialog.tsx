import React, { useState } from "react";
import { z } from "zod";
import { useForm, Form, FormItem, FormLabel, FormControl, FormMessage, FormDescription } from "./Form";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger, DialogFooter } from "./Dialog";
import { Button } from "./Button";
import { Input } from "./Input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./Select";
import { AdminBrandingImageInput } from "./AdminBrandingImageInput";
import { useSubmitBook } from "../helpers/useMemberBookSubmissions";
import { schema as submitSchema } from "../endpoints/member/book/submit_POST.schema";
import { VIETNAM_LOCATIONS, BOOK_CATEGORIES } from "../helpers/vietnamLocations";
import { Loader2 } from "lucide-react";
import styles from "./MemberBookSubmitDialog.module.css";

interface MemberBookSubmitDialogProps {
  children: React.ReactNode;
}

export const MemberBookSubmitDialog = ({ children }: MemberBookSubmitDialogProps) => {
  const [open, setOpen] = useState(false);
  const submitMutation = useSubmitBook();

  const form = useForm({
    defaultValues: {
      title: "",
      author: "",
      category: "",
      coverUrl: "",
      province: "",
      district: "",
      ownerPhoneFull: "",
    },
    schema: submitSchema,
  });

  const handleSubmit = (values: z.infer<typeof submitSchema>) => {
    submitMutation.mutate(values, {
      onSuccess: () => {
        setOpen(false);
        form.setValues({
          title: "",
          author: "",
          category: "",
          coverUrl: "",
          province: "",
          district: "",
          ownerPhoneFull: "",
        });
      },
    });
  };

  const selectedProvince = form.values.province;
  const districts = VIETNAM_LOCATIONS.find(p => p.province === selectedProvince)?.districts || [];

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className={styles.dialogContent}>
        <DialogHeader>
          <DialogTitle>Đóng góp sách</DialogTitle>
          <DialogDescription>
            Chia sẻ cuốn sách của bạn với cộng đồng. Sách sẽ được hiển thị sau khi admin duyệt.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className={styles.form}>
            <div className={styles.scrollArea}>
              <FormItem name="title">
                <FormLabel>Tên sách <span className={styles.required}>*</span></FormLabel>
                <FormControl>
                  <Input 
                    placeholder="Nhập tên sách" 
                    value={form.values.title}
                    onChange={e => form.setValues(prev => ({ ...prev, title: e.target.value }))}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>

              <div className={styles.row}>
                <FormItem name="author" className={styles.col}>
                  <FormLabel>Tác giả</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="Tên tác giả" 
                      value={form.values.author}
                      onChange={e => form.setValues(prev => ({ ...prev, author: e.target.value }))}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>

                <FormItem name="category" className={styles.col}>
                  <FormLabel>Thể loại</FormLabel>
                  <Select 
                    value={form.values.category || "_empty"} 
                    onValueChange={val => form.setValues(prev => ({ ...prev, category: val === "_empty" ? "" : val }))}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Chọn thể loại" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {BOOK_CATEGORIES.map(cat => (
                        <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              </div>

              <FormItem name="coverUrl">
                <FormLabel>Ảnh bìa</FormLabel>
                <FormControl>
                  <AdminBrandingImageInput
                    value={form.values.coverUrl || ""}
                    onChange={val => form.setValues(prev => ({ ...prev, coverUrl: val }))}
                    placeholder="https://example.com/book-cover.jpg"
                    className={styles.imageInput}
                  />
                </FormControl>
                <FormDescription>Tải lên ảnh bìa hoặc nhập URL ảnh.</FormDescription>
                <FormMessage />
              </FormItem>

              <div className={styles.row}>
                <FormItem name="province" className={styles.col}>
                  <FormLabel>Tỉnh / Thành phố</FormLabel>
                  <Select 
                    value={form.values.province || "_empty"} 
                    onValueChange={val => {
                      form.setValues(prev => ({ 
                        ...prev, 
                        province: val === "_empty" ? "" : val,
                        district: "" // Reset district when province changes
                      }));
                    }}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Chọn tỉnh/thành" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {VIETNAM_LOCATIONS.map(loc => (
                        <SelectItem key={loc.province} value={loc.province}>{loc.province}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>

                <FormItem name="district" className={styles.col}>
                  <FormLabel>Quận / Huyện</FormLabel>
                  <Select 
                    value={form.values.district || "_empty"} 
                    onValueChange={val => form.setValues(prev => ({ ...prev, district: val === "_empty" ? "" : val }))}
                    disabled={!selectedProvince}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Chọn quận/huyện" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {districts.map(dist => (
                        <SelectItem key={dist} value={dist}>{dist}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              </div>

              <FormItem name="ownerPhoneFull">
                <FormLabel>Số điện thoại liên hệ</FormLabel>
                <FormControl>
                  <Input 
                    placeholder="0912345678" 
                    value={form.values.ownerPhoneFull}
                    onChange={e => form.setValues(prev => ({ ...prev, ownerPhoneFull: e.target.value }))}
                  />
                </FormControl>
                <FormDescription>
                  Số điện thoại sẽ được ẩn một phần (ví dụ: 091***678) để bảo vệ quyền riêng tư.
                </FormDescription>
                <FormMessage />
              </FormItem>
            </div>

            <DialogFooter className={styles.footer}>
              <Button type="button" variant="secondary" onClick={() => setOpen(false)}>
                Hủy
              </Button>
              <Button type="submit" disabled={submitMutation.isPending}>
                {submitMutation.isPending && <Loader2 className="animate-spin mr-2" size={16} />}
                Gửi sách
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};