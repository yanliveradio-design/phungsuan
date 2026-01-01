import React from "react";
import { format } from "date-fns";
import {
  useUpdateMemberTrusted,
  useUnlockMember,
} from "../helpers/useAdminMembers";
import { useMemberTitles } from "../helpers/useMemberTitles";
import { MemberListItem } from "../endpoints/admin/members/list_GET.schema";
import { MemberTitleBadge } from "./MemberTitleBadge";
import { Button } from "./Button";
import { Badge } from "./Badge";
import { Avatar, AvatarImage, AvatarFallback } from "./Avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./DropdownMenu";
import { Tooltip, TooltipContent, TooltipTrigger } from "./Tooltip";
import {
  MoreHorizontal,
  Shield,
  ShieldAlert,
  Lock,
  Unlock,
  History,
  Calendar,
  Award,
} from "lucide-react";

import styles from "./AdminMembersTableRow.module.css";

interface AdminMembersTableRowProps {
  user: MemberListItem;
  onViewHistory: () => void;
  onEditJoinedDate: () => void;
  onManageTitles: () => void;
  onLock: () => void;
}

export const AdminMembersTableRow = ({
  user,
  onViewHistory,
  onEditJoinedDate,
  onManageTitles,
  onLock,
}: AdminMembersTableRowProps) => {
  const updateTrustedMutation = useUpdateMemberTrusted();
  const unlockMutation = useUnlockMember();
  
  const { data: titlesData } = useMemberTitles(user.id);

  const handleToggleTrusted = () => {
    updateTrustedMutation.mutate({
      userId: user.id,
      isTrustedMember: !user.isTrustedMember,
    });
  };

  const handleUnlock = () => {
    if (confirm(`Bạn có chắc chắn muốn mở khóa tài khoản cho ${user.fullName}?`)) {
      unlockMutation.mutate({ userId: user.id });
    }
  };

  return (
    <tr>
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
        <div className={styles.locationInfo}>
          {user.district && <span>{user.district}</span>}
          <span className={styles.province}>{user.province || "—"}</span>
        </div>
      </td>
      <td>
        {format(new Date(user.joinedAt), "dd/MM/yyyy")}
      </td>
      <td>
        <div className={styles.titlesCell}>
          {titlesData && titlesData.titles.length > 0 ? (
            <div className={styles.titlesList}>
              {titlesData.titles.map((title) => (
                <MemberTitleBadge
                  key={title.id}
                  name={title.name}
                  color={title.color}
                  size="sm"
                />
              ))}
            </div>
          ) : (
            <span className={styles.noTitles}>—</span>
          )}
        </div>
      </td>
      <td>
        {user.isActive ? (
          <Badge variant="default" className={styles.badge}>Hoạt động</Badge>
        ) : (
          <Tooltip>
            <TooltipTrigger>
              <Badge variant="destructive" className={styles.badge}>
                <Lock size={12} className={styles.badgeIcon} /> Đã khóa
              </Badge>
            </TooltipTrigger>
            <TooltipContent>
              <p>Lý do: {user.lockReason || "Không có lý do"}</p>
            </TooltipContent>
          </Tooltip>
        )}
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
            
            <DropdownMenuItem onClick={onViewHistory}>
              <History size={16} className={styles.menuIcon} />
              Xem lịch sử
            </DropdownMenuItem>

            <DropdownMenuItem onClick={onEditJoinedDate}>
              <Calendar size={16} className={styles.menuIcon} />
              Sửa ngày tham gia
            </DropdownMenuItem>

            <DropdownMenuItem onClick={onManageTitles}>
              <Award size={16} className={styles.menuIcon} />
              Quản lý danh hiệu
            </DropdownMenuItem>

            <DropdownMenuItem onClick={handleToggleTrusted}>
              {user.isTrustedMember ? (
                <>
                  <ShieldAlert size={16} className={styles.menuIcon} />
                  Thu hồi tin cậy
                </>
              ) : (
                <>
                  <Shield size={16} className={styles.menuIcon} />
                  Cấp quyền tin cậy
                </>
              )}
            </DropdownMenuItem>

            <DropdownMenuSeparator />

            {user.isActive ? (
              <DropdownMenuItem 
                className={styles.destructiveItem}
                onClick={onLock}
              >
                <Lock size={16} className={styles.menuIcon} />
                Khóa tài khoản
              </DropdownMenuItem>
            ) : (
              <DropdownMenuItem onClick={handleUnlock}>
                <Unlock size={16} className={styles.menuIcon} />
                Mở khóa tài khoản
              </DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </td>
    </tr>
  );
};