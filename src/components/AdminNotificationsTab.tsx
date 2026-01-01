import React, { useState } from "react";
import { format } from "date-fns";
import { vi } from "date-fns/locale";
import {
  useAdminSendNotification,
  useAdminNotificationHistory,
  useAdminPreviewRecipients,
} from "../helpers/useNotifications";
import { useMembersList } from "../helpers/useAdminMembers";
import { useDebounce } from "../helpers/useDebounce";
import { Button } from "./Button";
import { Input } from "./Input";
import { Textarea } from "./Textarea";
import { Switch } from "./Switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./Select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./Tabs";
import { Form, FormItem, FormLabel, FormControl, FormMessage, FormDescription, useForm } from "./Form";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "./Dialog";
import { Badge } from "./Badge";
import { Pagination, PaginationContent, PaginationItem, PaginationPrevious, PaginationNext } from "./Pagination";
import { Skeleton } from "./Skeleton";
import { Send, History, Users, MapPin, X, Search, CheckCircle, AlertCircle } from "lucide-react";
import { z } from "zod";
import styles from "./AdminNotificationsTab.module.css";

// --- Constants ---
const PROVINCES = [
  "Hà Nội", "Hồ Chí Minh", "Đà Nẵng", "Hải Phòng", "Cần Thơ",
  "An Giang", "Bà Rịa - Vũng Tàu", "Bắc Giang", "Bắc Kạn", "Bạc Liêu",
  "Bắc Ninh", "Bến Tre", "Bình Định", "Bình Dương", "Bình Phước",
  "Bình Thuận", "Cà Mau", "Cao Bằng", "Đắk Lắk", "Đắk Nông",
  "Điện Biên", "Đồng Nai", "Đồng Tháp", "Gia Lai", "Hà Giang",
  "Hà Nam", "Hà Tĩnh", "Hải Dương", "Hậu Giang", "Hòa Bình",
  "Hưng Yên", "Khánh Hòa", "Kiên Giang", "Kon Tum", "Lai Châu",
  "Lâm Đồng", "Lạng Sơn", "Lào Cai", "Long An", "Nam Định",
  "Nghệ An", "Ninh Bình", "Ninh Thuận", "Phú Thọ", "Phú Yên",
  "Quảng Bình", "Quảng Nam", "Quảng Ngãi", "Quảng Ninh", "Quảng Trị",
  "Sóc Trăng", "Sơn La", "Tây Ninh", "Thái Bình", "Thái Nguyên",
  "Thanh Hóa", "Thừa Thiên Huế", "Tiền Giang", "Trà Vinh", "Tuyên Quang",
  "Vĩnh Long", "Vĩnh Phúc", "Yên Bái"
];

// --- Schemas ---
const sendFormSchema = z.object({
  title: z.string().min(1, "Tiêu đề là bắt buộc"),
  message: z.string().min(1, "Nội dung là bắt buộc"),
  link: z.string().optional(),
  isImportant: z.boolean().default(false),
  targetType: z.enum(["all", "trusted", "province", "specific"]),
  targetFilter: z.any().optional(),
});

// --- Main Component ---
export const AdminNotificationsTab = () => {
  const [activeTab, setActiveTab] = useState("send");

  return (
    <div className={styles.container}>
      <Tabs value={activeTab} onValueChange={setActiveTab} className={styles.tabs}>
        <TabsList>
          <TabsTrigger value="send">
            <Send size={16} className={styles.tabIcon} /> Gửi thông báo
          </TabsTrigger>
          <TabsTrigger value="history">
            <History size={16} className={styles.tabIcon} /> Lịch sử gửi
          </TabsTrigger>
        </TabsList>

        <TabsContent value="send" className={styles.tabContent}>
          <SendNotificationForm onSuccess={() => setActiveTab("history")} />
        </TabsContent>

        <TabsContent value="history" className={styles.tabContent}>
          <NotificationHistoryTable />
        </TabsContent>
      </Tabs>
    </div>
  );
};

// --- Sub-components ---

const SendNotificationForm = ({ onSuccess }: { onSuccess: () => void }) => {
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewData, setPreviewData] = useState<{ count: number; sample: any[] } | null>(null);
  
  const sendMutation = useAdminSendNotification();
  const previewMutation = useAdminPreviewRecipients();

  const form = useForm({
    defaultValues: {
      title: "",
      message: "",
      link: "",
      isImportant: false,
      targetType: "all" as const,
      targetFilter: undefined as any,
    },
    schema: sendFormSchema,
  });

  const targetType = form.values.targetType;

  const handlePreview = async () => {
    const isValid = await form.validateForm();
    if (!isValid) return;

    const values = form.values;
    
    // Validate specific requirements
    if (values.targetType === "province" && !values.targetFilter) {
      form.setFieldError("targetFilter", "Vui lòng chọn tỉnh/thành");
      return;
    }
    if (values.targetType === "specific" && (!values.targetFilter || values.targetFilter.length === 0)) {
      form.setFieldError("targetFilter", "Vui lòng chọn ít nhất một người dùng");
      return;
    }

    previewMutation.mutate(
      {
        targetType: values.targetType,
        targetFilter: values.targetFilter,
      },
      {
        onSuccess: (data) => {
          setPreviewData(data);
          setPreviewOpen(true);
        },
      }
    );
  };

  const handleSend = () => {
    const values = form.values;
    sendMutation.mutate(values, {
      onSuccess: () => {
        setPreviewOpen(false);
        form.setValues({
          title: "",
          message: "",
          link: "",
          isImportant: false,
          targetType: "all",
          targetFilter: undefined,
        });
        onSuccess();
      },
    });
  };

  return (
    <div className={styles.formContainer}>
      <div className={styles.formHeader}>
        <h3 className={styles.formTitle}>Soạn thông báo mới</h3>
        <p className={styles.formDesc}>Gửi thông báo đến người dùng qua ứng dụng và email (nếu được bật).</p>
      </div>

      <Form {...form}>
        <form className={styles.form}>
          <div className={styles.formGrid}>
            <div className={styles.mainFields}>
              <FormItem name="title">
                <FormLabel>Tiêu đề <span className={styles.required}>*</span></FormLabel>
                <FormControl>
                  <Input 
                    placeholder="Nhập tiêu đề thông báo" 
                    value={form.values.title}
                    onChange={(e) => form.setValues(prev => ({ ...prev, title: e.target.value }))}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>

              <FormItem name="message">
                <FormLabel>Nội dung <span className={styles.required}>*</span></FormLabel>
                <FormControl>
                  <Textarea 
                    placeholder="Nhập nội dung chi tiết..." 
                    rows={5}
                    value={form.values.message}
                    onChange={(e) => form.setValues(prev => ({ ...prev, message: e.target.value }))}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>

              <FormItem name="link">
                <FormLabel>Liên kết (Tùy chọn)</FormLabel>
                <FormControl>
                  <Input 
                    placeholder="Ví dụ: /activities/123" 
                    value={form.values.link || ""}
                    onChange={(e) => form.setValues(prev => ({ ...prev, link: e.target.value }))}
                  />
                </FormControl>
                <FormDescription>Đường dẫn người dùng sẽ được chuyển đến khi nhấn vào thông báo.</FormDescription>
                <FormMessage />
              </FormItem>
            </div>

            <div className={styles.sideFields}>
              <div className={styles.settingsCard}>
                <h4 className={styles.cardTitle}>Cấu hình gửi</h4>
                
                <FormItem name="isImportant">
                  <div className={styles.switchRow}>
                    <div className={styles.switchLabel}>
                      <span className={styles.labelTitle}>Đánh dấu quan trọng</span>
                      <span className={styles.labelDesc}>Thông báo sẽ có biểu tượng cảnh báo</span>
                    </div>
                    <FormControl>
                      <Switch 
                        checked={form.values.isImportant}
                        onCheckedChange={(c) => form.setValues(prev => ({ ...prev, isImportant: c }))}
                      />
                    </FormControl>
                  </div>
                </FormItem>

                <div className={styles.separator} />

                <FormItem name="targetType">
                  <FormLabel>Đối tượng nhận</FormLabel>
                  <Select 
                    value={form.values.targetType} 
                    onValueChange={(v: any) => {
                      form.setValues(prev => ({ 
                        ...prev, 
                        targetType: v,
                        targetFilter: v === "specific" ? [] : undefined 
                      }));
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Tất cả thành viên</SelectItem>
                      <SelectItem value="trusted">Thành viên tin cậy</SelectItem>
                      <SelectItem value="province">Theo Tỉnh/Thành phố</SelectItem>
                      <SelectItem value="specific">Người dùng cụ thể</SelectItem>
                    </SelectContent>
                  </Select>
                </FormItem>

                {targetType === "province" && (
                  <FormItem name="targetFilter" className={styles.subField}>
                    <FormLabel>Chọn Tỉnh/Thành</FormLabel>
                    <Select 
                      value={form.values.targetFilter || "__empty"} 
                      onValueChange={(v) => form.setValues(prev => ({ ...prev, targetFilter: v }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Chọn tỉnh thành" />
                      </SelectTrigger>
                      <SelectContent className={styles.provinceSelectContent}>
                        {PROVINCES.map(p => (
                          <SelectItem key={p} value={p}>{p}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}

                {targetType === "specific" && (
                  <FormItem name="targetFilter" className={styles.subField}>
                    <FormLabel>Chọn người dùng</FormLabel>
                    <UserSelector 
                      selectedIds={form.values.targetFilter || []}
                      onChange={(ids) => form.setValues(prev => ({ ...prev, targetFilter: ids }))}
                    />
                    <FormMessage />
                  </FormItem>
                )}
              </div>

              <div className={styles.actionButtons}>
                <Button 
                  type="button" 
                  variant="outline" 
                  className={styles.fullWidth}
                  onClick={handlePreview}
                  disabled={previewMutation.isPending || sendMutation.isPending}
                >
                  {previewMutation.isPending ? "Đang tải..." : "Xem trước & Gửi"}
                </Button>
              </div>
            </div>
          </div>
        </form>
      </Form>

      <Dialog open={previewOpen} onOpenChange={setPreviewOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Xác nhận gửi thông báo</DialogTitle>
            <DialogDescription>
              Vui lòng kiểm tra lại thông tin trước khi gửi. Hành động này không thể hoàn tác.
            </DialogDescription>
          </DialogHeader>
          
          {previewData && (
            <div className={styles.previewContent}>
              <div className={styles.previewStat}>
                <div className={styles.statItem}>
                  <span className={styles.statLabel}>Tổng người nhận:</span>
                  <span className={styles.statValue}>{previewData.count} người</span>
                </div>
                <div className={styles.statItem}>
                  <span className={styles.statLabel}>Đối tượng:</span>
                  <Badge variant="outline">{getTargetLabel(form.values.targetType, form.values.targetFilter)}</Badge>
                </div>
              </div>

              <div className={styles.sampleList}>
                <p className={styles.sampleTitle}>Danh sách mẫu ({Math.min(previewData.sample.length, 10)}/{previewData.count}):</p>
                <ul className={styles.userList}>
                  {previewData.sample.map(user => (
                    <li key={user.id}>{user.fullName} <span className={styles.email}>({user.email})</span></li>
                  ))}
                  {previewData.count > previewData.sample.length && (
                    <li className={styles.moreUsers}>...và {previewData.count - previewData.sample.length} người khác</li>
                  )}
                </ul>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setPreviewOpen(false)}>Hủy bỏ</Button>
            <Button onClick={handleSend} disabled={sendMutation.isPending}>
              {sendMutation.isPending ? "Đang gửi..." : "Xác nhận gửi"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

const UserSelector = ({ selectedIds, onChange }: { selectedIds: number[], onChange: (ids: number[]) => void }) => {
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, 300);
  const [isOpen, setIsOpen] = useState(false);

  const { data } = useMembersList({
    page: 1,
    limit: 5,
    search: debouncedSearch || undefined,
  });

  const handleSelect = (user: any) => {
    if (!selectedIds.includes(user.id)) {
      onChange([...selectedIds, user.id]);
    }
    setSearch("");
    setIsOpen(false);
  };

  const handleRemove = (id: number) => {
    onChange(selectedIds.filter(uid => uid !== id));
  };

  // We need to fetch details for selected users to display their names
  // In a real app, we might want a separate hook or cache for this.
  // For now, we'll just display the ID if we don't have the name, or rely on the fact 
  // that we just selected them so we might have them in cache.
  // A better approach is to store the full user object in state, but the form schema expects IDs.
  // Let's keep it simple: just show count and IDs for now, or implement a proper multi-select component.
  // To make it better, let's assume we can display "User #ID" if name is missing.

  return (
    <div className={styles.userSelector}>
      <div className={styles.selectedTags}>
        {selectedIds.map(id => (
          <Badge key={id} variant="secondary" className={styles.userTag}>
            User #{id}
            <button type="button" onClick={() => handleRemove(id)} className={styles.removeTagBtn}>
              <X size={12} />
            </button>
          </Badge>
        ))}
      </div>
      
      <div className={styles.searchWrapper}>
        <Input 
          placeholder="Tìm tên hoặc email..." 
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
        />
        {isOpen && search && data && (
          <div className={styles.searchResults}>
            {data.users.length === 0 ? (
              <div className={styles.noResults}>Không tìm thấy</div>
            ) : (
              data.users.map(user => (
                <div 
                  key={user.id} 
                  className={styles.searchItem}
                  onClick={() => handleSelect(user)}
                >
                  <div className={styles.searchItemName}>{user.fullName}</div>
                  <div className={styles.searchItemEmail}>{user.email}</div>
                </div>
              ))
            )}
          </div>
        )}
      </div>
      {isOpen && <div className={styles.overlay} onClick={() => setIsOpen(false)} />}
    </div>
  );
};

const NotificationHistoryTable = () => {
  const [page, setPage] = useState(1);
  const [selectedBatch, setSelectedBatch] = useState<any>(null);
  
  const { data, isFetching } = useAdminNotificationHistory({ page, limit: 10 });
  const totalPages = data ? Math.ceil(data.total / 10) : 1;

  return (
    <div className={styles.historyContainer}>
      <div className={styles.tableWrapper}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Tiêu đề</th>
              <th>Nội dung</th>
              <th>Đối tượng</th>
              <th>Người nhận</th>
              <th>Người gửi</th>
              <th>Thời gian</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {isFetching ? (
              Array.from({ length: 5 }).map((_, i) => (
                <tr key={i}>
                  <td colSpan={7}><Skeleton style={{ height: "40px" }} /></td>
                </tr>
              ))
            ) : data?.history.length === 0 ? (
              <tr>
                <td colSpan={7} className={styles.emptyCell}>Chưa có lịch sử gửi thông báo</td>
              </tr>
            ) : (
              data?.history.map((item) => (
                <tr key={item.id} className={styles.row} onClick={() => setSelectedBatch(item)}>
                  <td className={styles.titleCell}>{item.title}</td>
                  <td className={styles.messageCell}>{item.message}</td>
                  <td><Badge variant="outline">{getTargetLabel(item.targetType as any, null)}</Badge></td>
                  <td>{item.recipientCount}</td>
                  <td>{item.adminName}</td>
                  <td className={styles.dateCell}>
                    {format(new Date(item.createdAt), "dd/MM/yyyy HH:mm")}
                  </td>
                  <td>
                    <Button variant="ghost" size="icon-sm"><Search size={16} /></Button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <Pagination>
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious 
                href="#" 
                onClick={(e) => { e.preventDefault(); if(page > 1) setPage(page - 1); }} 
                aria-disabled={page <= 1}
              />
            </PaginationItem>
            <span className={styles.pageInfo}>Trang {page} / {totalPages}</span>
            <PaginationItem>
              <PaginationNext 
                href="#" 
                onClick={(e) => { e.preventDefault(); if(page < totalPages) setPage(page + 1); }}
                aria-disabled={page >= totalPages}
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      )}

      <Dialog open={!!selectedBatch} onOpenChange={() => setSelectedBatch(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Chi tiết thông báo</DialogTitle>
          </DialogHeader>
          {selectedBatch && (
            <div className={styles.detailContent}>
              <div className={styles.detailRow}>
                <span className={styles.detailLabel}>Tiêu đề:</span>
                <span className={styles.detailValue}>{selectedBatch.title}</span>
              </div>
              <div className={styles.detailRow}>
                <span className={styles.detailLabel}>Đối tượng:</span>
                <span className={styles.detailValue}>{getTargetLabel(selectedBatch.targetType, null)}</span>
              </div>
              <div className={styles.detailRow}>
                <span className={styles.detailLabel}>Người gửi:</span>
                <span className={styles.detailValue}>{selectedBatch.adminName}</span>
              </div>
              <div className={styles.detailRow}>
                <span className={styles.detailLabel}>Thời gian:</span>
                <span className={styles.detailValue}>{format(new Date(selectedBatch.createdAt), "dd/MM/yyyy HH:mm")}</span>
              </div>
              <div className={styles.detailColumn}>
                <span className={styles.detailLabel}>Nội dung:</span>
                <div className={styles.messageBox}>{selectedBatch.message}</div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

// --- Helpers ---
function getTargetLabel(type: string, filter: any) {
  switch (type) {
    case "all": return "Tất cả thành viên";
    case "trusted": return "Thành viên tin cậy";
    case "province": return `Tỉnh/Thành: ${filter || "..."}`;
    case "specific": return "Người dùng cụ thể";
    default: return type;
  }
}