import React, { useState } from "react";
import {
  useMembersList,
} from "../helpers/useAdminMembers";
import { useDebounce } from "../helpers/useDebounce";
import { MemberListItem } from "../endpoints/admin/members/list_GET.schema";

import { Button } from "./Button";
import { Input } from "./Input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./Select";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationNext,
  PaginationPrevious,
} from "./Pagination";
import { Skeleton } from "./Skeleton";
import {
  Search,
  MapPin,
} from "lucide-react";

import { AdminMembersTableRow } from "./AdminMembersTableRow";
import { AdminMemberHistorySheet } from "./AdminMemberHistorySheet";
import { AdminMemberLockDialog } from "./AdminMemberLockDialog";
import { AdminMemberEditJoinedDateDialog } from "./AdminMemberEditJoinedDateDialog";
import { AdminMemberTitlesDialog } from "./AdminMemberTitlesDialog";

import styles from "./AdminMembersTab.module.css";

export const AdminMembersTab = () => {
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, 500);
  const [page, setPage] = useState(1);
  
  // Filters
  const [activeFilter, setActiveFilter] = useState<string>("all");
  const [provinceFilter, setProvinceFilter] = useState("");
  const debouncedProvince = useDebounce(provinceFilter, 500);

  // Action States
  const [historyMember, setHistoryMember] = useState<MemberListItem | null>(null);
  const [lockMember, setLockMember] = useState<MemberListItem | null>(null);
  const [editJoinedMember, setEditJoinedMember] = useState<MemberListItem | null>(null);
  const [titlesMember, setTitlesMember] = useState<MemberListItem | null>(null);

  // Data Fetching
  const { data, isFetching } = useMembersList({
    page,
    limit: 10,
    search: debouncedSearch || undefined,
    isActive: activeFilter === "all" ? undefined : activeFilter === "true",
    province: debouncedProvince || undefined,
  });

  const totalPages = data ? Math.ceil(data.total / 10) : 1;

  return (
    <div className={styles.container}>
      {/* Filters Section */}
      <div className={styles.filters}>
        <div className={styles.searchWrapper}>
          <Search className={styles.searchIcon} size={16} />
          <Input
            placeholder="Tìm kiếm theo tên, email..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className={styles.searchInput}
          />
        </div>

        <div className={styles.filterGroup}>
          <Select
            value={activeFilter}
            onValueChange={(val) => {
              setActiveFilter(val);
              setPage(1);
            }}
          >
            <SelectTrigger className={styles.selectTrigger}>
              <SelectValue placeholder="Trạng thái" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tất cả trạng thái</SelectItem>
              <SelectItem value="true">Đang hoạt động</SelectItem>
              <SelectItem value="false">Đã khóa</SelectItem>
            </SelectContent>
          </Select>

          <div className={styles.provinceWrapper}>
            <MapPin className={styles.inputIcon} size={16} />
            <Input
              placeholder="Lọc theo Tỉnh/Thành..."
              value={provinceFilter}
              onChange={(e) => {
                setProvinceFilter(e.target.value);
                setPage(1);
              }}
              className={styles.provinceInput}
            />
          </div>
        </div>
      </div>

      {/* Table Section */}
      <div className={styles.tableWrapper}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Thành viên</th>
              <th>Khu vực</th>
              <th>Ngày tham gia</th>
              <th>Danh hiệu</th>
              <th>Trạng thái</th>
              <th className={styles.actionCol}>Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {isFetching ? (
              Array.from({ length: 5 }).map((_, i) => (
                <tr key={i}>
                  <td>
                    <div className={styles.userCell}>
                      <Skeleton className={styles.avatarSkeleton} />
                      <div className={styles.userInfo}>
                        <Skeleton className={styles.textSkeleton} style={{ width: "120px" }} />
                        <Skeleton className={styles.textSkeleton} style={{ width: "160px" }} />
                      </div>
                    </div>
                  </td>
                  <td><Skeleton className={styles.textSkeleton} style={{ width: "100px" }} /></td>
                  <td><Skeleton className={styles.textSkeleton} style={{ width: "100px" }} /></td>
                  <td><Skeleton className={styles.badgeSkeleton} /></td>
                  <td><Skeleton className={styles.badgeSkeleton} /></td>
                  <td><Skeleton className={styles.actionSkeleton} /></td>
                </tr>
              ))
            ) : data?.users.length === 0 ? (
              <tr>
                <td colSpan={6} className={styles.emptyCell}>
                  Không tìm thấy thành viên nào phù hợp
                </td>
              </tr>
            ) : (
              data?.users.map((user) => (
                <AdminMembersTableRow
                  key={user.id}
                  user={user}
                  onViewHistory={() => setHistoryMember(user)}
                  onEditJoinedDate={() => setEditJoinedMember(user)}
                  onManageTitles={() => setTitlesMember(user)}
                  onLock={() => setLockMember(user)}
                />
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <Pagination>
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious 
                href="#" 
                onClick={(e) => { e.preventDefault(); if(page > 1) setPage(page - 1); }} 
                aria-disabled={page <= 1}
                className={page <= 1 ? styles.disabledLink : ""}
              />
            </PaginationItem>
            <span className={styles.pageInfo}>
              Trang {page} / {totalPages} (Tổng {data?.total || 0})
            </span>
            <PaginationItem>
              <PaginationNext 
                href="#" 
                onClick={(e) => { e.preventDefault(); if(page < totalPages) setPage(page + 1); }}
                aria-disabled={page >= totalPages}
                className={page >= totalPages ? styles.disabledLink : ""}
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      )}

      {/* Dialogs and Sheets */}
      {historyMember && (
        <AdminMemberHistorySheet 
          member={historyMember} 
          isOpen={!!historyMember} 
          onClose={() => setHistoryMember(null)} 
        />
      )}

      {lockMember && (
        <AdminMemberLockDialog
          member={lockMember}
          isOpen={!!lockMember}
          onClose={() => setLockMember(null)}
        />
      )}

      {editJoinedMember && (
        <AdminMemberEditJoinedDateDialog
          member={editJoinedMember}
          open={!!editJoinedMember}
          onOpenChange={(open) => !open && setEditJoinedMember(null)}
          onSuccess={() => setEditJoinedMember(null)}
        />
      )}

      {titlesMember && (
        <AdminMemberTitlesDialog
          member={titlesMember}
          isOpen={!!titlesMember}
          onClose={() => setTitlesMember(null)}
        />
      )}
    </div>
  );
};