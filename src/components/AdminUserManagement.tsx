import React, { useState } from "react";
import { useAuth } from "../helpers/useAuth";
import { useUsersList, useUpdateUserRole } from "../helpers/useAdminUsers";
import { useDebounce } from "../helpers/useDebounce";
import { UserRole, AdminRole } from "../helpers/schema";
import { Input } from "./Input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./Select";
import { Avatar, AvatarImage, AvatarFallback } from "./Avatar";
import { Badge } from "./Badge";
import { Button } from "./Button";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "./DropdownMenu";
import { Skeleton } from "./Skeleton";
import { MoreHorizontal, Search, Shield, ShieldAlert, ShieldCheck } from "lucide-react";
import styles from "./AdminUserManagement.module.css";

export const AdminUserManagement = () => {
  const { authState } = useAuth();
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, 500);
  const [roleFilter, setRoleFilter] = useState<UserRole | "all">("all");

  const { data: usersData, isFetching } = useUsersList({
    search: debouncedSearch,
    role: roleFilter === "all" ? undefined : roleFilter,
  });

  const updateRoleMutation = useUpdateUserRole();

  const currentUser = authState.type === "authenticated" ? authState.user : null;

  if (!currentUser || currentUser.adminRole !== "super_admin") {
    return null;
  }

  const handleUpdateRole = (
    userId: number,
    role: UserRole,
    adminRole: AdminRole | null
  ) => {
    updateRoleMutation.mutate({ userId, role, adminRole });
  };

  const renderAdminRoleBadge = (adminRole: AdminRole | null) => {
    if (!adminRole) return null;
    
    switch (adminRole) {
      case "super_admin":
        return <Badge variant="destructive">Super Admin</Badge>;
      case "event_admin":
        return <Badge variant="secondary">Event Admin</Badge>;
      case "content_admin":
        return <Badge variant="secondary">Content Admin</Badge>;
      default:
        return <Badge variant="outline">{adminRole}</Badge>;
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h2 className={styles.title}>Quản lý Admin</h2>
        <p className={styles.description}>
          Phân quyền quản trị viên cho hệ thống. Chỉ Super Admin mới thấy mục này.
        </p>
      </div>

      <div className={styles.filters}>
        <div className={styles.searchWrapper}>
          <Search className={styles.searchIcon} size={18} />
          <Input
            placeholder="Tìm kiếm theo tên hoặc email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className={styles.searchInput}
          />
        </div>
        <div className={styles.roleSelect}>
          <Select
            value={roleFilter}
            onValueChange={(val) => setRoleFilter(val as UserRole | "all")}
          >
            <SelectTrigger>
              <SelectValue placeholder="Lọc theo role" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tất cả users</SelectItem>
              <SelectItem value="admin">Admin</SelectItem>
              <SelectItem value="member">Member</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className={styles.tableWrapper}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>User</th>
              <th>Role</th>
              <th>Admin Role</th>
              <th className={styles.actionCol}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {isFetching ? (
              Array.from({ length: 5 }).map((_, i) => (
                <tr key={i}>
                  <td>
                    <div className={styles.userCell}>
                      <Skeleton style={{ width: "2.5rem", height: "2.5rem", borderRadius: "9999px" }} />
                      <div className={styles.userInfo}>
                        <Skeleton style={{ width: "120px", height: "1rem" }} />
                        <Skeleton style={{ width: "160px", height: "0.875rem" }} />
                      </div>
                    </div>
                  </td>
                  <td><Skeleton style={{ width: "60px", height: "1.5rem", borderRadius: "9999px" }} /></td>
                  <td><Skeleton style={{ width: "80px", height: "1.5rem", borderRadius: "9999px" }} /></td>
                  <td><Skeleton style={{ width: "2rem", height: "2rem" }} /></td>
                </tr>
              ))
            ) : usersData?.users.length === 0 ? (
              <tr>
                <td colSpan={4} className={styles.emptyCell}>
                  Không tìm thấy user nào phù hợp
                </td>
              </tr>
            ) : (
              usersData?.users.map((user) => (
                <tr key={user.id}>
                  <td>
                    <div className={styles.userCell}>
                      <Avatar>
                        <AvatarImage src={user.avatarUrl || undefined} alt={user.fullName} />
                        <AvatarFallback>{user.fullName.charAt(0).toUpperCase()}</AvatarFallback>
                      </Avatar>
                      <div className={styles.userInfo}>
                        <span className={styles.userName}>{user.fullName}</span>
                        <span className={styles.userEmail}>{user.email}</span>
                      </div>
                    </div>
                  </td>
                  <td>
                    <Badge variant={user.role === "admin" ? "default" : "outline"}>
                      {user.role}
                    </Badge>
                  </td>
                  <td>{renderAdminRoleBadge(user.adminRole)}</td>
                  <td className={styles.actionCol}>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon-sm" disabled={user.id === currentUser.id}>
                          <MoreHorizontal size={16} />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Phân quyền</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        
                        <DropdownMenuItem
                          disabled={user.adminRole === "super_admin"}
                          onClick={() => handleUpdateRole(user.id, "admin", "super_admin")}
                        >
                          <ShieldCheck size={16} className={styles.menuIcon} />
                          Đặt làm Super Admin
                        </DropdownMenuItem>
                        
                        <DropdownMenuItem
                          disabled={user.adminRole === "event_admin"}
                          onClick={() => handleUpdateRole(user.id, "admin", "event_admin")}
                        >
                          <Shield size={16} className={styles.menuIcon} />
                          Đặt làm Event Admin
                        </DropdownMenuItem>
                        
                        <DropdownMenuItem
                          disabled={user.adminRole === "content_admin"}
                          onClick={() => handleUpdateRole(user.id, "admin", "content_admin")}
                        >
                          <Shield size={16} className={styles.menuIcon} />
                          Đặt làm Content Admin
                        </DropdownMenuItem>

                        <DropdownMenuSeparator />
                        
                        <DropdownMenuItem
                          className={styles.destructiveItem}
                          disabled={user.role === "member"}
                          onClick={() => handleUpdateRole(user.id, "member", null)}
                        >
                          <ShieldAlert size={16} className={styles.menuIcon} />
                          Hủy quyền Admin
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
    </div>
  );
};