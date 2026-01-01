import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  useTitlesList,
  useCreateTitle,
  useUpdateTitle,
  useDeleteTitle,
} from "../helpers/useAdminTitles";
import { AdminTitleItem } from "../endpoints/admin/titles/list_GET.schema";
import { TitleColorArrayValues, TitleColor } from "../helpers/schema";
import { MemberTitleBadge } from "./MemberTitleBadge";
import { Button } from "./Button";
import { Input } from "./Input";
import { Textarea } from "./Textarea";
import { Switch } from "./Switch";
import { Badge } from "./Badge";
import { Skeleton } from "./Skeleton";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./Dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./DropdownMenu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./Select";
import {
  Plus,
  MoreHorizontal,
  Pencil,
  Trash2,
  Check,
  X,
  Users,
} from "lucide-react";

import styles from "./AdminTitlesTab.module.css";

// --- Schema for Create/Edit Form ---
const titleFormSchema = z.object({
  name: z.string().min(1, "Tên danh hiệu không được để trống"),
  description: z.string().optional(),
  color: z.enum(TitleColorArrayValues, {
    required_error: "Vui lòng chọn màu sắc",
  }),
  isDefault: z.boolean().default(false),
  isActive: z.boolean().default(true),
});

type TitleFormValues = z.infer<typeof titleFormSchema>;

export const AdminTitlesTab = () => {
  const { data, isFetching } = useTitlesList();
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [editingTitle, setEditingTitle] = useState<AdminTitleItem | null>(null);
  const [deletingTitle, setDeletingTitle] = useState<AdminTitleItem | null>(
    null
  );

  const deleteMutation = useDeleteTitle();

  const handleDelete = () => {
    if (deletingTitle) {
      deleteMutation.mutate(
        { id: deletingTitle.id },
        {
          onSuccess: () => setDeletingTitle(null),
        }
      );
    }
  };

  return (
    <div className={styles.container}>
      {/* Header Actions */}
      <div className={styles.header}>
        <div className={styles.headerText}>
          <h2 className={styles.title}>Quản lý danh hiệu</h2>
          <p className={styles.description}>
            Tạo và quản lý các danh hiệu, huy hiệu cho thành viên.
          </p>
        </div>
        <Button onClick={() => setIsCreateDialogOpen(true)}>
          <Plus size={16} />
          Thêm danh hiệu
        </Button>
      </div>

      {/* Table Section */}
      <div className={styles.tableWrapper}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Danh hiệu</th>
              <th>Mô tả</th>
              <th>Mặc định</th>
              <th>Trạng thái</th>
              <th>Thành viên</th>
              <th className={styles.actionCol}>Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {isFetching ? (
              Array.from({ length: 5 }).map((_, i) => (
                <tr key={i}>
                  <td>
                    <Skeleton className={styles.badgeSkeleton} />
                  </td>
                  <td>
                    <Skeleton className={styles.textSkeleton} />
                  </td>
                  <td>
                    <Skeleton className={styles.iconSkeleton} />
                  </td>
                  <td>
                    <Skeleton className={styles.statusSkeleton} />
                  </td>
                  <td>
                    <Skeleton className={styles.textSkeleton} />
                  </td>
                  <td>
                    <Skeleton className={styles.actionSkeleton} />
                  </td>
                </tr>
              ))
            ) : data?.titles.length === 0 ? (
              <tr>
                <td colSpan={6} className={styles.emptyCell}>
                  <div className={styles.emptyState}>
                    <p>Chưa có danh hiệu nào.</p>
                    <Button
                      variant="link"
                      onClick={() => setIsCreateDialogOpen(true)}
                    >
                      Tạo danh hiệu đầu tiên
                    </Button>
                  </div>
                </td>
              </tr>
            ) : (
              data?.titles.map((title) => (
                <tr key={title.id}>
                  <td>
                    <MemberTitleBadge name={title.name} color={title.color} />
                  </td>
                  <td className={styles.descCell}>
                    <span className={styles.truncate}>
                      {title.description || "—"}
                    </span>
                  </td>
                  <td>
                    {title.isDefault ? (
                      <Check size={18} className={styles.checkIcon} />
                    ) : (
                      <span className={styles.dash}>—</span>
                    )}
                  </td>
                  <td>
                    {title.isActive ? (
                      <Badge variant="success" className={styles.miniBadge}>
                        Hoạt động
                      </Badge>
                    ) : (
                      <Badge variant="secondary" className={styles.miniBadge}>
                        Vô hiệu
                      </Badge>
                    )}
                  </td>
                  <td>
                    <div className={styles.userCount}>
                      <Users size={14} />
                      {title.userCount}
                    </div>
                  </td>
                  <td className={styles.actionCol}>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon-sm">
                          <MoreHorizontal size={16} />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Thao tác</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={() => setEditingTitle(title)}>
                          <Pencil size={16} className={styles.menuIcon} />
                          Chỉnh sửa
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          className={styles.destructiveItem}
                          onClick={() => setDeletingTitle(title)}
                        >
                          <Trash2 size={16} className={styles.menuIcon} />
                          Xóa
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Create Dialog */}
      <TitleFormDialog
        open={isCreateDialogOpen}
        onOpenChange={setIsCreateDialogOpen}
        mode="create"
      />

      {/* Edit Dialog */}
      {editingTitle && (
        <TitleFormDialog
          open={!!editingTitle}
          onOpenChange={(open) => !open && setEditingTitle(null)}
          mode="edit"
          initialData={editingTitle}
        />
      )}

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={!!deletingTitle}
        onOpenChange={(open) => !open && setDeletingTitle(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Xóa danh hiệu</DialogTitle>
            <DialogDescription>
              Bạn có chắc chắn muốn xóa danh hiệu{" "}
              <strong>{deletingTitle?.name}</strong>? Hành động này không thể
              hoàn tác và sẽ gỡ bỏ danh hiệu khỏi tất cả thành viên đang sở hữu.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDeletingTitle(null)}
              disabled={deleteMutation.isPending}
            >
              Hủy bỏ
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={deleteMutation.isPending}
            >
              {deleteMutation.isPending ? "Đang xóa..." : "Xác nhận xóa"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

// --- Sub-component: Title Form Dialog ---

interface TitleFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mode: "create" | "edit";
  initialData?: AdminTitleItem;
}

const TitleFormDialog = ({
  open,
  onOpenChange,
  mode,
  initialData,
}: TitleFormDialogProps) => {
  const createMutation = useCreateTitle();
  const updateMutation = useUpdateTitle();

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<TitleFormValues>({
    resolver: zodResolver(titleFormSchema),
    defaultValues: {
      name: "",
      description: "",
      color: "blue",
      isDefault: false,
      isActive: true,
    },
  });

  // Reset form when dialog opens/closes or initialData changes
  React.useEffect(() => {
    if (open) {
      if (mode === "edit" && initialData) {
        reset({
          name: initialData.name,
          description: initialData.description || "",
          color: initialData.color,
          isDefault: initialData.isDefault,
          isActive: initialData.isActive,
        });
      } else {
        reset({
          name: "",
          description: "",
          color: "blue",
          isDefault: false,
          isActive: true,
        });
      }
    }
  }, [open, mode, initialData, reset]);

  const onSubmit = (values: TitleFormValues) => {
    if (mode === "create") {
      createMutation.mutate(values, {
        onSuccess: () => onOpenChange(false),
      });
    } else if (mode === "edit" && initialData) {
      updateMutation.mutate(
        { id: initialData.id, ...values },
        {
          onSuccess: () => onOpenChange(false),
        }
      );
    }
  };

  const isPending = createMutation.isPending || updateMutation.isPending;
  const selectedColor = watch("color");
  const isDefault = watch("isDefault");
  const isActive = watch("isActive");

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className={styles.dialogContent}>
        <DialogHeader>
          <DialogTitle>
            {mode === "create" ? "Thêm danh hiệu mới" : "Chỉnh sửa danh hiệu"}
          </DialogTitle>
          <DialogDescription>
            {mode === "create"
              ? "Tạo danh hiệu mới để gán cho các thành viên trong cộng đồng."
              : "Cập nhật thông tin danh hiệu."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className={styles.form}>
          <div className={styles.formGroup}>
            <label className={styles.label}>
              Tên danh hiệu <span className={styles.required}>*</span>
            </label>
            <Input
              placeholder="Ví dụ: Người đóng góp tích cực"
              {...register("name")}
            />
            {errors.name && (
              <span className={styles.error}>{errors.name.message}</span>
            )}
          </div>

          <div className={styles.formGroup}>
            <label className={styles.label}>Mô tả</label>
            <Textarea
              placeholder="Mô tả ngắn về danh hiệu này..."
              rows={3}
              {...register("description")}
            />
          </div>

          <div className={styles.formGroup}>
            <label className={styles.label}>
              Màu sắc <span className={styles.required}>*</span>
            </label>
            <Select
              value={selectedColor}
              onValueChange={(val) => setValue("color", val as TitleColor)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Chọn màu sắc" />
              </SelectTrigger>
              <SelectContent>
                {TitleColorArrayValues.map((color) => (
                  <SelectItem key={color} value={color}>
                    <div className={styles.colorOption}>
                      <span
                        className={`${styles.colorDot} ${styles[color]}`}
                      ></span>
                      <span className={styles.colorName}>
                        {getColorName(color)}
                      </span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.color && (
              <span className={styles.error}>{errors.color.message}</span>
            )}
          </div>

          <div className={styles.previewSection}>
            <span className={styles.previewLabel}>Xem trước:</span>
            <MemberTitleBadge
              name={watch("name") || "Tên danh hiệu"}
              color={selectedColor}
            />
          </div>

          <div className={styles.switchGroup}>
            <div className={styles.switchRow}>
              <Switch
                id="isDefault"
                checked={isDefault}
                onCheckedChange={(checked) => setValue("isDefault", checked)}
              />
              <div className={styles.switchLabelGroup}>
                <label htmlFor="isDefault" className={styles.switchLabel}>
                  Đặt làm mặc định
                </label>
                <span className={styles.switchDesc}>
                  Tự động gán cho thành viên mới đăng ký
                </span>
              </div>
            </div>

            <div className={styles.switchRow}>
              <Switch
                id="isActive"
                checked={isActive}
                onCheckedChange={(checked) => setValue("isActive", checked)}
              />
              <div className={styles.switchLabelGroup}>
                <label htmlFor="isActive" className={styles.switchLabel}>
                  Kích hoạt
                </label>
                <span className={styles.switchDesc}>
                  Cho phép sử dụng và hiển thị danh hiệu này
                </span>
              </div>
            </div>
          </div>

          <DialogFooter className={styles.dialogFooter}>
            <Button
              variant="outline"
              type="button"
              onClick={() => onOpenChange(false)}
              disabled={isPending}
            >
              Hủy bỏ
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending
                ? "Đang lưu..."
                : mode === "create"
                  ? "Tạo danh hiệu"
                  : "Lưu thay đổi"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

// Helper to translate color names
const getColorName = (color: string) => {
  const map: Record<string, string> = {
    blue: "Xanh dương (Blue)",
    brown: "Nâu đất (Brown)",
    green: "Xanh lá (Green)",
    orange: "Cam (Orange)",
    purple: "Tím (Purple)",
    rose: "Hồng đất (Rose)",
    teal: "Xanh cổ vịt (Teal)",
  };
  return map[color] || color;
};