import React from "react";
import { Link, useLocation } from "react-router-dom";
import {
  BookOpen,
  Calendar,
  Home,
  Menu,
  X,
  LogOut,
  Shield,
  User as UserIcon,
  Route,
} from "lucide-react";
import { Button } from "./Button";
import { Avatar, AvatarFallback, AvatarImage } from "./Avatar";
import { NotificationCenter } from "./NotificationCenter";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./DropdownMenu";
import { Skeleton } from "./Skeleton";
import { useAuth } from "../helpers/useAuth";
import { useBranding } from "../helpers/useBranding";
import { MobileBottomNav } from "./MobileBottomNav";
import styles from "./SharedLayout.module.css";

function getInitials(name: string) {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

export const SharedLayout = ({ children }: { children: React.ReactNode }) => {
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);
  const { authState, logout } = useAuth();
  const { branding, isLoading: isBrandingLoading } = useBranding();

  const appName = branding?.appName || "Phụng Sự An";
  const appDescription =
    branding?.appDescription ||
    "Kết nối tri thức, lan tỏa văn hóa đọc trong cộng đồng.";
  const contactEmail = branding?.contactEmail || "nhomphungsuan@gmail.com";
  const contactPhone = branding?.contactPhone || "+84 763280984";

  const renderLogo = () => {
    if (isBrandingLoading) {
      return (
        <>
          <span className={styles.logoIcon}>📚</span>
          <span className={styles.logoText}>Phụng Sự An</span>
        </>
      );
    }

    if (branding?.logoType === "image") {
      return (
        <>
          <img
            src={branding.logoValue}
            alt="Logo"
            className={styles.logoImage}
          />
          <span className={styles.logoText}>{appName}</span>
        </>
      );
    }

    return (
      <>
        <span className={styles.logoIcon}>{branding?.logoValue || "📚"}</span>
        <span className={styles.logoText}>{appName}</span>
      </>
    );
  };

  const navItems = [
    { label: "Trang chủ", path: "/", icon: <Home size={18} /> },
    {
      label: "Thư Viện Cộng Đồng",
      path: "/books",
      icon: <BookOpen size={18} />,
    },
    {
      label: "Hành trình của tôi",
      path: "/my-journey",
      icon: <Route size={18} />,
    },
    { label: "Hoạt động", path: "/activities", icon: <Calendar size={18} /> },
  ];

  return (
    <div className={styles.layout}>
      <header className={styles.header}>
        <div className={styles.container}>
          <div className={styles.headerContent}>
            <Link to="/" className={styles.logo}>
              {renderLogo()}
            </Link>

            {/* Desktop Nav */}
            <nav className={styles.desktopNav}>
              {navItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`${styles.navLink} ${
                    location.pathname === item.path ? styles.active : ""
                  }`}
                >
                  {item.icon}
                  {item.label}
                </Link>
              ))}

              <div className={styles.desktopAuth}>
                {authState.type === "loading" ? (
                  <Skeleton
                    style={{
                      width: "2.5rem",
                      height: "2.5rem",
                      borderRadius: "9999px",
                    }}
                  />
                ) : authState.type === "authenticated" ? (
                  <>
                    <NotificationCenter />
                    <DropdownMenu>
                      <DropdownMenuTrigger
                        className={styles.userDropdownTrigger}
                      >
                        <Avatar>
                          <AvatarImage
                            src={authState.user.avatarUrl ?? undefined}
                            alt={authState.user.fullName}
                          />
                          <AvatarFallback>
                            {getInitials(authState.user.fullName)}
                          </AvatarFallback>
                        </Avatar>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>
                          {authState.user.fullName}
                        </DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem asChild>
                          <Link to="/profile">
                            <UserIcon
                              size={16}
                              style={{ marginRight: "0.5rem" }}
                            />
                            Hồ sơ cá nhân
                          </Link>
                        </DropdownMenuItem>
                        {authState.user.role === "admin" && (
                          <DropdownMenuItem asChild>
                            <Link to="/admin">
                              <Shield
                                size={16}
                                style={{ marginRight: "0.5rem" }}
                              />
                              Bảng điều khiển Admin
                            </Link>
                          </DropdownMenuItem>
                        )}
                        <DropdownMenuItem onClick={() => logout()}>
                          <LogOut size={16} style={{ marginRight: "0.5rem" }} />
                          Đăng xuất
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </>
                ) : (
                  <Button asChild size="sm">
                    <Link to="/login">Đăng nhập</Link>
                  </Button>
                )}
              </div>
            </nav>

            {/* Mobile Menu Toggle */}
            <button
              className={styles.mobileToggle}
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {/* Mobile Nav */}
        {isMobileMenuOpen && (
          <nav className={styles.mobileNav}>
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`${styles.mobileNavLink} ${
                  location.pathname === item.path ? styles.active : ""
                }`}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                {item.icon}
                {item.label}
              </Link>
            ))}

            <div className={styles.mobileNavSeparator} />

            <div className={styles.mobileUserSection}>
              {authState.type === "loading" ? (
                <div className={styles.mobileUserProfile}>
                  <Skeleton
                    style={{
                      width: "2.5rem",
                      height: "2.5rem",
                      borderRadius: "9999px",
                    }}
                  />
                  <Skeleton style={{ width: "100px", height: "1rem" }} />
                </div>
              ) : authState.type === "authenticated" ? (
                <>
                  <div className={styles.mobileNotificationsWrapper}>
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        padding: "0 var(--spacing-3)",
                        marginBottom: "var(--spacing-2)",
                      }}
                    >
                      <span
                        style={{
                          fontSize: "0.9rem",
                          fontWeight: 500,
                          color: "var(--muted-foreground)",
                        }}
                      >
                        Thông báo
                      </span>
                      <NotificationCenter />
                    </div>
                  </div>

                  <Link
                    to="/profile"
                    className={styles.mobileUserProfile}
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <Avatar className={styles.mobileAvatar}>
                      <AvatarImage
                        src={authState.user.avatarUrl ?? undefined}
                        alt={authState.user.fullName}
                      />
                      <AvatarFallback>
                        {getInitials(authState.user.fullName)}
                      </AvatarFallback>
                    </Avatar>
                    <span className={styles.mobileUserName}>
                      {authState.user.fullName}
                    </span>
                  </Link>
                  {authState.user.role === "admin" && (
                    <Link
                      to="/admin"
                      className={styles.mobileNavLink}
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      <Shield size={18} />
                      Bảng điều khiển Admin
                    </Link>
                  )}
                  <button
                    className={styles.mobileNavLink}
                    onClick={() => {
                      logout();
                      setIsMobileMenuOpen(false);
                    }}
                  >
                    <LogOut size={18} />
                    Đăng xuất
                  </button>
                </>
              ) : (
                <Link
                  to="/login"
                  className={styles.mobileNavLink}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <UserIcon size={18} />
                  Đăng nhập
                </Link>
              )}
            </div>
          </nav>
        )}
      </header>

      <main className={styles.main}>{children}</main>

      <MobileBottomNav items={navItems} currentPath={location.pathname} />

      <footer className={styles.footer}>
        <div className={styles.container}>
          <div className={styles.footerContent}>
            <div className={styles.footerBrand}>
              <Link
                to="/"
                className={styles.logo}
                style={{ textDecoration: "none" }}
              >
                {renderLogo()}
              </Link>
              <p className={styles.footerDesc}>{appDescription}</p>
            </div>
            <div className={styles.footerLinks}>
              <h4>Khám phá</h4>
              <Link to="/books">Tủ sách cộng đồng</Link>
              <Link to="/activities">Hoạt động sắp tới</Link>
            </div>
            <div className={styles.footerLinks}>
              <h4>Liên hệ</h4>
              {contactEmail && (
                <a href={`mailto:${contactEmail}`}>{contactEmail}</a>
              )}
              {contactPhone && <span>{contactPhone}</span>}
            </div>
          </div>
          <div className={styles.copyright}>
            © {new Date().getFullYear()} {appName}. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
};
