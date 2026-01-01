import React, { useState } from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "./Tabs";
import { AdminLibraryBooksManager } from "./AdminLibraryBooksManager";
import { AdminLibraryBorrowsManager } from "./AdminLibraryBorrowsManager";
import styles from "./AdminLibraryTab.module.css";

export const AdminLibraryTab = ({ className }: { className?: string }) => {
  const [currentTab, setCurrentTab] = useState<"books" | "borrows">("books");

  return (
    <div className={`${styles.container} ${className || ""}`}>
      <Tabs value={currentTab} onValueChange={(v) => setCurrentTab(v as any)}>
        <TabsList>
          <TabsTrigger value="books">Quản lý Sách</TabsTrigger>
          <TabsTrigger value="borrows">Quản lý Mượn trả</TabsTrigger>
        </TabsList>

        <TabsContent value="books">
          <AdminLibraryBooksManager />
        </TabsContent>

        <TabsContent value="borrows">
          <AdminLibraryBorrowsManager />
        </TabsContent>
      </Tabs>
    </div>
  );
};