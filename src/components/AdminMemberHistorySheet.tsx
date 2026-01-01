import React from "react";
import { format } from "date-fns";
import { useMemberHistory } from "../helpers/useAdminMembers";
import { MemberListItem } from "../endpoints/admin/members/list_GET.schema";
import { Badge } from "./Badge";
import { Avatar, AvatarImage, AvatarFallback } from "./Avatar";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "./Sheet";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "./Tabs";
import { Calendar } from "lucide-react";
import { MemberTitleBadge } from "./MemberTitleBadge";
import { useMemberTitles } from "../helpers/useMemberTitles";
import {
  HistorySkeleton,
  EmptyState,
  formatAuditAction,
  BorrowStatusBadge,
} from "./AdminMemberHistoryHelpers";

import styles from "./AdminMemberHistorySheet.module.css";

interface AdminMemberHistorySheetProps {
  member: MemberListItem;
  isOpen: boolean;
  onClose: () => void;
}

export const AdminMemberHistorySheet = ({ 
  member, 
  isOpen, 
  onClose 
}: AdminMemberHistorySheetProps) => {
  const { data, isLoading } = useMemberHistory(member.id);
  const { data: titleData, isFetching: isLoadingTitles } = useMemberTitles(member.id);

  return (
    <Sheet open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <SheetContent side="right" className={styles.sheetContent}>
        <SheetHeader className={styles.sheetHeader}>
          <div className={styles.sheetUserHeader}>
            <Avatar className={styles.sheetAvatar}>
              <AvatarImage src={member.avatarUrl || undefined} />
              <AvatarFallback>{member.fullName.charAt(0).toUpperCase()}</AvatarFallback>
            </Avatar>
            <div>
              <SheetTitle>{member.fullName}</SheetTitle>
              <SheetDescription>{member.email}</SheetDescription>
              <div className={styles.sheetMeta}>
                <span className={styles.metaItem}>
                  <Calendar size={12} /> Tham gia: {format(new Date(member.joinedAt), "dd/MM/yyyy")}
                </span>
              </div>
              <div className={styles.titlesRow}>
                {titleData?.titles.map((title) => (
                  <MemberTitleBadge
                    key={title.id}
                    name={title.name}
                    color={title.color}
                    size="sm"
                  />
                ))}
              </div>
            </div>
          </div>
        </SheetHeader>

        <div className={styles.sheetBody}>
          <Tabs defaultValue="audit" className={styles.tabs}>
            <TabsList className={styles.tabsList}>
              <TabsTrigger value="audit">Lịch sử hệ thống</TabsTrigger>
              <TabsTrigger value="activities">Hoạt động</TabsTrigger>
              <TabsTrigger value="borrows">Mượn sách</TabsTrigger>
            </TabsList>

            <TabsContent value="audit" className={styles.tabContent}>
              {isLoading ? (
                <HistorySkeleton />
              ) : data?.auditLogs.length === 0 ? (
                <EmptyState message="Chưa có lịch sử hệ thống" iconName="FileText" />
              ) : (
                <div className={styles.historyList}>
                  {data?.auditLogs.map((log) => (
                    <div key={log.id} className={styles.historyItem}>
                      <div className={styles.historyHeader}>
                        <span className={styles.historyAction}>{formatAuditAction(log.action)}</span>
                        <span className={styles.historyDate}>
                          {format(new Date(log.createdAt), "dd/MM/yyyy HH:mm")}
                        </span>
                      </div>
                      {log.note && <p className={styles.historyNote}>{log.note}</p>}
                      <div className={styles.historyActor}>
                        Thực hiện bởi: {log.actorName || "Hệ thống"}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="activities" className={styles.tabContent}>
              {isLoading ? (
                <HistorySkeleton />
              ) : data?.activities.length === 0 ? (
                <EmptyState message="Chưa tham gia hoạt động nào" iconName="Activity" />
              ) : (
                <div className={styles.simpleTableWrapper}>
                  <table className={styles.simpleTable}>
                    <thead>
                      <tr>
                        <th>Hoạt động</th>
                        <th>Check-in</th>
                        <th>Hình thức</th>
                      </tr>
                    </thead>
                    <tbody>
                      {data?.activities.map((act) => (
                        <tr key={act.id}>
                          <td>{act.title}</td>
                          <td>{format(new Date(act.checkinAt), "dd/MM/yyyy HH:mm")}</td>
                          <td>
                            <Badge variant="outline" className={styles.miniBadge}>
                              {act.checkinMethod === "qr" ? "QR Code" : "Thủ công"}
                            </Badge>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </TabsContent>

            <TabsContent value="borrows" className={styles.tabContent}>
              {isLoading ? (
                <HistorySkeleton />
              ) : data?.borrows.length === 0 ? (
                <EmptyState message="Chưa có lịch sử mượn sách" iconName="BookOpen" />
              ) : (
                <div className={styles.simpleTableWrapper}>
                  <table className={styles.simpleTable}>
                    <thead>
                      <tr>
                        <th>Sách</th>
                        <th>Ngày mượn</th>
                        <th>Trạng thái</th>
                      </tr>
                    </thead>
                    <tbody>
                      {data?.borrows.map((borrow) => (
                        <tr key={borrow.id}>
                          <td>{borrow.bookTitle}</td>
                          <td>{format(new Date(borrow.createdAt), "dd/MM/yyyy")}</td>
                          <td>
                            <BorrowStatusBadge status={borrow.status} />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </SheetContent>
    </Sheet>
  );
};