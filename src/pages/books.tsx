import React, { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { PageCover } from "../components/PageCover";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "../components/Tabs";
import { BooksExploreTab } from "../components/BooksExploreTab";
import { MyBooksTab } from "../components/MyBooksTab";
import { MyBorrowRecordsTab } from "../components/MyBorrowRecordsTab";
import { useAuth } from "../helpers/useAuth";
import styles from "./books.module.css";

export default function BooksPage() {
  const { authState } = useAuth();
  const [searchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState("explore");

  const isAuthenticated = authState.type === "authenticated";

  useEffect(() => {
    const tabParam = searchParams.get("tab");
    if (
      tabParam &&
      ["explore", "mybooks", "borrowing"].includes(tabParam) &&
      (tabParam === "explore" || isAuthenticated)
    ) {
      setActiveTab(tabParam);
    }
  }, [searchParams, isAuthenticated]);

  return (
    <div className={styles.page}>
      <PageCover
        pageKey="books"
        title="Sách Chia Sẻ Trong Cộng Đồng"
        subtitle="Khám phá kho tàng tri thức được chia sẻ bởi cộng đồng."
        className={styles.pageCover}
      />

      <div className={styles.container}>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="explore">Khám phá</TabsTrigger>
            {isAuthenticated && (
              <>
                <TabsTrigger value="mybooks">Sách của tôi</TabsTrigger>
                <TabsTrigger value="borrowing">Đang mượn</TabsTrigger>
              </>
            )}
          </TabsList>

          <TabsContent value="explore">
            <BooksExploreTab />
          </TabsContent>

          {isAuthenticated && (
            <>
              <TabsContent value="mybooks">
                <MyBooksTab />
              </TabsContent>

              <TabsContent value="borrowing">
                <MyBorrowRecordsTab role="borrower" />
              </TabsContent>
            </>
          )}
        </Tabs>
      </div>
    </div>
  );
}