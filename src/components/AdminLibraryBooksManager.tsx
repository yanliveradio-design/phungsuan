import React, { useState, useEffect } from "react";
import { Button } from "./Button";
import { Input } from "./Input";
import { Badge } from "./Badge";
import { Checkbox } from "./Checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./Select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "./Dialog";
import { FileDropzone } from "./FileDropzone";
import { Skeleton } from "./Skeleton";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationNext,
  PaginationPrevious,
} from "./Pagination";
import {
  useAdminBooksList,
  useImportBooks,
  useBatchUpdateBooks,
  useAdminBookIds,
} from "../helpers/useAdminBooks";

import { BookStatus } from "../helpers/schema";
import { Search, Upload, Eye, EyeOff, Check, Trash2, Download } from "lucide-react";
import * as XLSX from "xlsx";
import { downloadBookImportTemplate } from "../helpers/downloadExcelTemplate";
import { AdminBookCoverCell } from "./AdminBookCoverCell";
import styles from "./AdminLibraryBooksManager.module.css";

export const AdminLibraryBooksManager = ({ className }: { className?: string }) => {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<BookStatus | "all">("all");
  const [isApprovedFilter, setIsApprovedFilter] = useState<string>("all");
  const [isHiddenFilter, setIsHiddenFilter] = useState<string>("false");
  const [selectedBooks, setSelectedBooks] = useState<number[]>([]);
  
  // Select All Across Pages State
  const [isSelectAllPages, setIsSelectAllPages] = useState(false);
  const [shouldFetchAllIds, setShouldFetchAllIds] = useState(false);
  
  // Import state
  const [importDialogOpen, setImportDialogOpen] = useState(false);
  const [importedData, setImportedData] = useState<any[]>([]);
  const [importErrors, setImportErrors] = useState<any[]>([]);

  const { data, isFetching } = useAdminBooksList({
    page,
    pageSize: 20,
    search: search || undefined,
    status: statusFilter === "all" ? undefined : statusFilter,
    isApproved: isApprovedFilter === "all" ? undefined : isApprovedFilter === "true",
    isHidden: isHiddenFilter === "all" ? undefined : isHiddenFilter === "true",
  });

  // Query to fetch all IDs for "Select All" functionality
  const allIdsQuery = useAdminBookIds({
    status: statusFilter === "all" ? undefined : statusFilter,
    isApproved: isApprovedFilter === "all" ? undefined : isApprovedFilter === "true",
    isHidden: isHiddenFilter === "all" ? undefined : isHiddenFilter === "true",
    search: search || undefined,
  }, shouldFetchAllIds);

  const batchUpdateMutation = useBatchUpdateBooks();
  const importMutation = useImportBooks();

  const books = data?.books || [];
  const totalPages = data?.totalPages || 1;
  const totalCount = data?.total || 0;

  // Handle data from allIdsQuery
  useEffect(() => {
    if (shouldFetchAllIds && allIdsQuery.data) {
      setSelectedBooks(allIdsQuery.data.bookIds);
      setIsSelectAllPages(true);
      setShouldFetchAllIds(false);
    }
  }, [shouldFetchAllIds, allIdsQuery.data]);

  // Reset selection when filters change
  useEffect(() => {
    setSelectedBooks([]);
    setIsSelectAllPages(false);
    setShouldFetchAllIds(false);
    setPage(1);
  }, [statusFilter, isApprovedFilter, isHiddenFilter, search]);

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedBooks(books.map((b) => b.id));
    } else {
      setSelectedBooks([]);
      setIsSelectAllPages(false);
    }
  };

  const handleSelectBook = (id: number, checked: boolean) => {
    if (checked) {
      setSelectedBooks((prev) => [...prev, id]);
    } else {
      setSelectedBooks((prev) => prev.filter((bid) => bid !== id));
      // If unchecking a single item, we are no longer selecting all pages
      setIsSelectAllPages(false);
    }
  };

  const handleSelectAllAcrossPages = () => {
    setShouldFetchAllIds(true);
  };

  const handleClearAll = () => {
    setSelectedBooks([]);
    setIsSelectAllPages(false);
    setShouldFetchAllIds(false);
  };

  const handleBatchAction = async (action: "approve" | "hide" | "unhide" | "delete") => {
    if (selectedBooks.length === 0) return;
    if (confirm(`Bạn có chắc chắn muốn thực hiện hành động này với ${selectedBooks.length} sách?`)) {
      await batchUpdateMutation.mutateAsync({
        bookIds: selectedBooks,
        action,
      });
      setSelectedBooks([]);
      setIsSelectAllPages(false);
    }
  };

  const handleFileUpload = (files: File[]) => {
    const file = files[0];
    const reader = new FileReader();
    reader.onload = (e) => {
      const data = new Uint8Array(e.target?.result as ArrayBuffer);
      const workbook = XLSX.read(data, { type: "array" });
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      const jsonData = XLSX.utils.sheet_to_json(worksheet);
      
      // Basic validation of structure
      const validData = jsonData.map((row: any) => ({
        title: row.title || row.Title || row["Tên sách"],
        author: row.author || row.Author || row["Tác giả"],
        category: row.category || row.Category || row["Thể loại"],
        province: row.province || row.Province || row["Tỉnh/Thành"],
        district: row.district || row.District || row["Quận/Huyện"],
        ownerName: row.ownerName || row["Tên chủ sở hữu"] || row["Chủ sở hữu"],
        ownerPhoneMasked: row.ownerPhoneMasked || row["SĐT Che"],
        ownerPhoneFull: row.ownerPhoneFull || row["SĐT Full"],
        coverUrl: row.coverUrl || row["URL Ảnh bìa"] || row["Cover URL"],
      })).filter((r: any) => r.title); // Filter out empty rows

      setImportedData(validData);
    };
    reader.readAsArrayBuffer(file);
  };

  const confirmImport = async () => {
    try {
      const result = await importMutation.mutateAsync({ books: importedData });
      if (result.errors.length > 0) {
        setImportErrors(result.errors);
      } else {
        setImportDialogOpen(false);
        setImportedData([]);
        setImportErrors([]);
      }
    } catch (e) {
      // Error handled by mutation
    }
  };

  const handleDownloadTemplate = () => {
    downloadBookImportTemplate();
  };

  const isAllPageSelected = books.length > 0 && books.every(b => selectedBooks.includes(b.id));

  return (
    <div className={`${styles.container} ${className || ""}`}>
      <div className={styles.actionsBar}>
        <div className={styles.filters}>
          <div className={styles.searchBox}>
            <Search size={16} className={styles.searchIcon} />
            <Input 
              placeholder="Tìm kiếm sách..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className={styles.searchInput}
            />
          </div>
          <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as any)}>
            <SelectTrigger className={styles.filterSelect}>
              <SelectValue placeholder="Trạng thái" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tất cả trạng thái</SelectItem>
              <SelectItem value="available">Có sẵn</SelectItem>
              <SelectItem value="borrowed">Đang mượn</SelectItem>
              <SelectItem value="unavailable">Không có sẵn</SelectItem>
            </SelectContent>
          </Select>
          <Select value={isApprovedFilter} onValueChange={setIsApprovedFilter}>
            <SelectTrigger className={styles.filterSelect}>
              <SelectValue placeholder="Duyệt" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tất cả</SelectItem>
              <SelectItem value="true">Đã duyệt</SelectItem>
              <SelectItem value="false">Chưa duyệt</SelectItem>
            </SelectContent>
          </Select>
          <Select value={isHiddenFilter} onValueChange={setIsHiddenFilter}>
            <SelectTrigger className={styles.filterSelect}>
              <SelectValue placeholder="Ẩn/Hiện" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tất cả</SelectItem>
              <SelectItem value="true">Đã ẩn</SelectItem>
              <SelectItem value="false">Hiển thị</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className={styles.mainActions}>
          <Button onClick={() => setImportDialogOpen(true)}>
            <Upload size={16} /> Import Excel
          </Button>
        </div>
      </div>

      {selectedBooks.length > 0 && (
        <div className={styles.batchActions}>
          <div className={styles.selectionInfo}>
            {!isSelectAllPages && isAllPageSelected && totalCount > books.length ? (
              <div className={styles.selectAllBanner}>
                <span>Đã chọn {selectedBooks.length} sách trên trang này.</span>
                <button 
                  className={styles.bannerLink} 
                  onClick={handleSelectAllAcrossPages}
                  disabled={allIdsQuery.isFetching}
                >
                  {allIdsQuery.isFetching 
                    ? "Đang tải..." 
                    : `Chọn tất cả ${totalCount} sách phù hợp với bộ lọc?`}
                </button>
              </div>
            ) : (
              <>
                <span className={styles.selectedCount}>
                  {isSelectAllPages 
                    ? `Đã chọn tất cả ${selectedBooks.length} sách`
                    : `${selectedBooks.length} đã chọn`}
                </span>
                {isSelectAllPages && (
                  <button className={styles.bannerLink} onClick={handleClearAll}>
                    Bỏ chọn tất cả
                  </button>
                )}
              </>
            )}
          </div>
          
          <div className={styles.actionButtons}>
            <Button size="sm" variant="outline" onClick={() => handleBatchAction("approve")}>
              <Check size={14} /> Duyệt
            </Button>
            <Button size="sm" variant="outline" onClick={() => handleBatchAction("hide")}>
              <EyeOff size={14} /> Ẩn
            </Button>
            <Button size="sm" variant="outline" onClick={() => handleBatchAction("unhide")}>
              <Eye size={14} /> Hiện
            </Button>
            <Button size="sm" variant="destructive" onClick={() => handleBatchAction("delete")}>
              <Trash2 size={14} /> Xóa
            </Button>
          </div>
        </div>
      )}

      <div className={styles.tableContainer}>
        {isFetching ? (
          <div className={styles.loadingState}>
            {[...Array(5)].map((_, i) => <Skeleton key={i} className={styles.rowSkeleton} />)}
          </div>
        ) : (
          <table className={styles.table}>
            <thead>
              <tr>
                <th className={styles.checkboxCol}>
                  <Checkbox 
                    checked={books.length > 0 && (isSelectAllPages || isAllPageSelected)}
                    onChange={(e) => handleSelectAll(e.target.checked)}
                  />
                </th>
                <th className={styles.coverCol}>Ảnh bìa</th>
                <th>Tên sách</th>
                <th>Tác giả</th>
                <th>Chủ sở hữu</th>
                <th>Khu vực</th>
                <th>Trạng thái</th>
                <th>Duyệt</th>
                <th>Ẩn</th>
              </tr>
            </thead>
            <tbody>
              {books.map((book) => (
                <tr key={book.id}>
                  <td className={styles.checkboxCol}>
                    <Checkbox 
                      checked={selectedBooks.includes(book.id)}
                      onChange={(e) => handleSelectBook(book.id, e.target.checked)}
                    />
                  </td>
                  <td className={styles.coverCell}>
                    <AdminBookCoverCell 
                      bookId={book.id} 
                      currentCoverUrl={book.coverUrl} 
                      bookTitle={book.title}
                    />
                  </td>
                  <td className={styles.titleCell} title={book.title}>{book.title}</td>
                  <td>{book.author || "—"}</td>
                  <td>{book.ownerName || "—"}</td>
                  <td>{book.district ? `${book.district}, ${book.province}` : book.province || "—"}</td>
                  <td>
                    <Badge variant={book.status === "available" ? "success" : book.status === "borrowed" ? "warning" : "default"}>
                      {book.status}
                    </Badge>
                  </td>
                  <td>
                    {book.isApproved ? (
                      <Badge variant="success">Đã duyệt</Badge>
                    ) : (
                      <Badge variant="warning">Chưa duyệt</Badge>
                    )}
                  </td>
                  <td>
                    {book.isHidden ? (
                      <Badge variant="destructive">Đã ẩn</Badge>
                    ) : (
                      <Badge variant="outline">Hiển thị</Badge>
                    )}
                  </td>
                </tr>
              ))}
              {books.length === 0 && (
                <tr>
                  <td colSpan={9} className={styles.emptyState}>Không tìm thấy sách nào</td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>

      {totalPages > 1 && (
        <Pagination>
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious 
                href="#" 
                onClick={(e) => { e.preventDefault(); if(page > 1) setPage(page - 1); }} 
              />
            </PaginationItem>
            <span className={styles.pageInfo}>Trang {page} / {totalPages}</span>
            <PaginationItem>
              <PaginationNext 
                href="#" 
                onClick={(e) => { e.preventDefault(); if(page < totalPages) setPage(page + 1); }} 
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      )}

      <Dialog open={importDialogOpen} onOpenChange={setImportDialogOpen}>
        <DialogContent className={styles.importDialog}>
          <DialogHeader>
            <DialogTitle>Import Sách từ Excel/CSV</DialogTitle>
          </DialogHeader>
          
          {!importedData.length ? (
            <div className={styles.uploadArea}>
              <FileDropzone 
                accept=".csv,.xlsx,.xls"
                onFilesSelected={handleFileUpload}
                title="Kéo thả file Excel/CSV vào đây"
                subtitle="Hỗ trợ định dạng .xlsx, .xls, .csv"
              />
              <div className={styles.templateButtonContainer}>
                <Button 
                  variant="outline" 
                  onClick={handleDownloadTemplate}
                  className={styles.templateButton}
                >
                  <Download size={16} /> Tải template mẫu
                </Button>
              </div>
            </div>
          ) : (
            <div className={styles.previewContainer}>
              <div className={styles.previewHeader}>
                <span>Đã đọc {importedData.length} dòng</span>
                <Button variant="ghost" size="sm" onClick={() => { setImportedData([]); setImportErrors([]); }}>
                  Chọn lại
                </Button>
              </div>
              
              {importErrors.length > 0 && (
                <div className={styles.errorList}>
                  <h4>Lỗi import ({importErrors.length})</h4>
                  <ul>
                    {importErrors.map((err, idx) => (
                      <li key={idx}>Dòng {err.row}: {err.message}</li>
                    ))}
                  </ul>
                </div>
              )}

              <div className={styles.previewTableWrapper}>
                <table className={styles.previewTable}>
                  <thead>
                    <tr>
                      <th>Tên sách</th>
                      <th>Tác giả</th>
                      <th>Chủ sở hữu</th>
                    </tr>
                  </thead>
                  <tbody>
                    {importedData.slice(0, 5).map((row, idx) => (
                      <tr key={idx}>
                        <td>{row.title}</td>
                        <td>{row.author}</td>
                        <td>{row.ownerName}</td>
                      </tr>
                    ))}
                    {importedData.length > 5 && (
                      <tr>
                        <td colSpan={3} style={{textAlign: 'center'}}>... và {importedData.length - 5} dòng khác</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setImportDialogOpen(false)}>Hủy</Button>
            <Button onClick={confirmImport} disabled={!importedData.length || importMutation.isPending}>
              {importMutation.isPending ? "Đang import..." : "Xác nhận Import"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};