import React, { useEffect, useState } from "react";
import {
  useBrandingQuery,
  useUpdateBranding,
  PageCovers,
} from "../helpers/useBranding";
import { LogoType } from "../helpers/schema";
import { Button } from "./Button";
import { Input } from "./Input";
import { AdminBrandingImageInput } from "./AdminBrandingImageInput";
import { Textarea } from "./Textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./Select";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "./Tabs";
import { Skeleton } from "./Skeleton";
import {
  Save,
  Image as ImageIcon,
  Type,
  Layout,
  Smile,
  Globe,
  Mail,
  Phone,
  RotateCcw,
} from "lucide-react";
import { toast } from "sonner";
import styles from "./AdminBrandingManager.module.css";

const PAGE_COVER_KEYS: { key: keyof PageCovers; label: string }[] = [
  { key: "home", label: "Trang chủ" },
  { key: "books", label: "Sách" },
  { key: "activities", label: "Hoạt động" },
  { key: "profile", label: "Hồ sơ" },
  { key: "myJourney", label: "Hành trình" },
  { key: "admin", label: "Admin" },
];

export const AdminBrandingManager = ({ className }: { className?: string }) => {
  const { data, isLoading, isError } = useBrandingQuery();
  const { mutate: updateBranding, isPending: isSaving } = useUpdateBranding();

  // Local state for form
  const [logoType, setLogoType] = useState<LogoType>("emoji");
  const [logoValue, setLogoValue] = useState<string>("");
  const [appName, setAppName] = useState<string>("");
  const [appDescription, setAppDescription] = useState<string>("");
  const [contactEmail, setContactEmail] = useState<string>("");
  const [contactPhone, setContactPhone] = useState<string>("");
  const [pageCovers, setPageCovers] = useState<PageCovers>({});

  // Initialize state from query data
  useEffect(() => {
    if (data?.branding) {
      const b = data.branding;
      setLogoType(b.logoType);
      setLogoValue(b.logoValue);
      setAppName(b.appName);
      setAppDescription(b.appDescription || "");
      setContactEmail(b.contactEmail || "");
      setContactPhone(b.contactPhone || "");
      setPageCovers(b.pageCovers || {});
    }
  }, [data]);

  const handleSave = () => {
    if (!appName.trim()) {
      toast.error("Tên ứng dụng không được để trống");
      return;
    }
    if (!logoValue.trim()) {
      toast.error("Logo không được để trống");
      return;
    }

    updateBranding({
      logoType,
      logoValue,
      appName,
      appDescription,
      contactEmail,
      contactPhone,
      pageCovers,
    });
  };

  const handleReset = () => {
    if (data?.branding) {
      const b = data.branding;
      setLogoType(b.logoType);
      setLogoValue(b.logoValue);
      setAppName(b.appName);
      setAppDescription(b.appDescription || "");
      setContactEmail(b.contactEmail || "");
      setContactPhone(b.contactPhone || "");
      setPageCovers(b.pageCovers || {});
      toast.info("Đã khôi phục dữ liệu ban đầu");
    }
  };

  const handleCoverChange = (key: string, value: string) => {
    setPageCovers((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  if (isLoading) {
    return (
      <div className={className}>
        <div className="flex justify-between mb-6">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-10 w-32" />
        </div>
        <div className="grid gap-6">
          <Skeleton className="h-64 w-full" />
          <Skeleton className="h-64 w-full" />
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="p-4 border border-error text-error rounded-md">
        Đã có lỗi xảy ra khi tải thông tin thương hiệu. Vui lòng thử lại sau.
      </div>
    );
  }

  return (
    <div className={`${styles.container} ${className || ""}`}>
      <div className={styles.header}>
        <div>
          <h2 className={styles.title}>Quản lý Thương hiệu</h2>
          <p className={styles.subtitle}>
            Thiết lập logo, thông tin ứng dụng và hình ảnh bìa cho các trang.
          </p>
        </div>
        <div className={styles.actions}>
          <Button variant="outline" onClick={handleReset} disabled={isSaving}>
            <RotateCcw size={16} /> Khôi phục
          </Button>
          <Button onClick={handleSave} disabled={isSaving}>
            <Save size={16} /> {isSaving ? "Đang lưu..." : "Lưu thay đổi"}
          </Button>
        </div>
      </div>

      <div className={styles.grid}>
        {/* Left Column: Logo & App Info */}
        <div className={styles.column}>
          {/* Logo Settings */}
          <section className={styles.card}>
            <div className={styles.cardHeader}>
              <div className={styles.iconWrapper}>
                {logoType === "emoji" ? (
                  <Smile size={20} />
                ) : (
                  <ImageIcon size={20} />
                )}
              </div>
              <h3 className={styles.cardTitle}>Logo & Biểu tượng</h3>
            </div>

            <div className={styles.cardContent}>
              <div className={styles.formGroup}>
                <label className={styles.label}>Loại Logo</label>
                <Select
                  value={logoType}
                  onValueChange={(val) => setLogoType(val as LogoType)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="emoji">Emoji</SelectItem>
                    <SelectItem value="image">Hình ảnh (URL)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className={styles.formGroup}>
                <label className={styles.label}>
                  {logoType === "emoji" ? "Chọn Emoji" : "Hình ảnh Logo"}
                </label>
                <div className="flex gap-4 items-start">
                  <div className="flex-1">
                    {logoType === "emoji" ? (
                      <Input
                        value={logoValue}
                        onChange={(e) => setLogoValue(e.target.value)}
                        placeholder="📚"
                      />
                    ) : (
                      <AdminBrandingImageInput
                        value={logoValue}
                        onChange={setLogoValue}
                        maxSize={500 * 1024} // 500KB
                        placeholder="https://example.com/logo.png"
                      />
                    )}
                  </div>
                  <div className={styles.logoPreview}>
                    {logoType === "emoji" ? (
                      <span className={styles.logoEmoji}>
                        {logoValue || "📚"}
                      </span>
                    ) : (
                      <img
                        src={logoValue || "/placeholder-logo.png"}
                        alt="Logo Preview"
                        className={styles.logoImage}
                        onError={(e) => {
                          (e.target as HTMLImageElement).src =
                            "https://placehold.co/100x100?text=Logo";
                        }}
                      />
                    )}
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* App Info Settings */}
          <section className={styles.card}>
            <div className={styles.cardHeader}>
              <div className={styles.iconWrapper}>
                <Type size={20} />
              </div>
              <h3 className={styles.cardTitle}>Thông tin ứng dụng</h3>
            </div>

            <div className={styles.cardContent}>
              <div className={styles.formGroup}>
                <label className={styles.label}>
                  <Globe size={14} className="inline mr-1" /> Tên ứng dụng
                </label>
                <Input
                  value={appName}
                  onChange={(e) => setAppName(e.target.value)}
                  placeholder="Ví dụ: Floot"
                />
              </div>

              <div className={styles.formGroup}>
                <label className={styles.label}>Mô tả ngắn</label>
                <Textarea
                  value={appDescription}
                  onChange={(e) => setAppDescription(e.target.value)}
                  placeholder="Mô tả ngắn về cộng đồng của bạn..."
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className={styles.formGroup}>
                  <label className={styles.label}>
                    <Mail size={14} className="inline mr-1" /> Email liên hệ
                  </label>
                  <Input
                    type="email"
                    value={contactEmail}
                    onChange={(e) => setContactEmail(e.target.value)}
                    placeholder="contact@example.com"
                  />
                </div>
                <div className={styles.formGroup}>
                  <label className={styles.label}>
                    <Phone size={14} className="inline mr-1" /> Số điện thoại
                  </label>
                  <Input
                    type="tel"
                    value={contactPhone}
                    onChange={(e) => setContactPhone(e.target.value)}
                    placeholder="+84..."
                  />
                </div>
              </div>
            </div>
          </section>
        </div>

        {/* Right Column: Page Covers */}
        <div className={styles.column}>
          <section className={`${styles.card} h-full`}>
            <div className={styles.cardHeader}>
              <div className={styles.iconWrapper}>
                <Layout size={20} />
              </div>
              <h3 className={styles.cardTitle}>Ảnh bìa các trang</h3>
            </div>

            <div className={styles.cardContent}>
              <Tabs defaultValue="home" className="w-full">
                <TabsList className="mb-4 w-full flex-wrap h-auto">
                  {PAGE_COVER_KEYS.map((page) => (
                    <TabsTrigger key={String(page.key)} value={String(page.key)}>
                      {page.label}
                    </TabsTrigger>
                  ))}
                </TabsList>

                {PAGE_COVER_KEYS.map((page) => (
                  <TabsContent key={String(page.key)} value={String(page.key)}>
                    <div className={styles.formGroup}>
                      <label className={styles.label}>
                        Ảnh bìa cho {page.label}
                      </label>
                      <AdminBrandingImageInput
                        value={pageCovers[page.key] || ""}
                        onChange={(val) =>
                          handleCoverChange(page.key as string, val)
                        }
                        maxSize={1024 * 1024} // 1MB
                        placeholder="https://images.unsplash.com/..."
                      />
                    </div>

                    <div className="mt-4">
                      <label className={styles.label}>Xem trước</label>
                      <div className={styles.coverPreview}>
                        {pageCovers[page.key] ? (
                          <img
                            src={pageCovers[page.key]}
                            alt={`Cover for ${page.label}`}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src =
                                "https://placehold.co/600x200?text=No+Image";
                            }}
                          />
                        ) : (
                          <div className="flex items-center justify-center w-full h-full bg-muted text-muted-foreground">
                            Chưa có ảnh bìa
                          </div>
                        )}
                      </div>
                    </div>
                  </TabsContent>
                ))}
              </Tabs>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};