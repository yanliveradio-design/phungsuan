import React, { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { Search, Filter, MapPin } from "lucide-react";
import { Input } from "./Input";
import { BookCard } from "./BookCard";
import { Skeleton } from "./Skeleton";
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
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "./Pagination";
import { useMemberBooks } from "../helpers/useMemberLibrary";
import { useBookFilterOptions } from "../helpers/useBookFilters";
import { useDebounce } from "../helpers/useDebounce";
import styles from "./BooksExploreTab.module.css";

interface BooksExploreTabProps {
  className?: string;
}

export const BooksExploreTab = ({ className }: BooksExploreTabProps) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [provinceFilter, setProvinceFilter] = useState("all");
  const [districtFilter, setDistrictFilter] = useState("all");
  const [page, setPage] = useState(1);
  const pageSize = 12;

  const debouncedSearch = useDebounce(searchTerm, 300);

  const { data: filterOptions, isFetching: filterOptionsLoading } = useBookFilterOptions();

  const { data, isFetching } = useMemberBooks({
    search: debouncedSearch || undefined,
    category: categoryFilter !== "all" ? categoryFilter : undefined,
    province: provinceFilter !== "all" ? provinceFilter : undefined,
    district: districtFilter !== "all" ? districtFilter : undefined,
    page,
    pageSize,
  });

  // Get districts for selected province
  const availableDistricts = useMemo(() => {
    if (provinceFilter === "all" || !filterOptions) return [];
    const found = filterOptions.districtsByProvince.find(d => d.province === provinceFilter);
    return found?.districts || [];
  }, [filterOptions, provinceFilter]);

  // Reset district when province changes
  const handleProvinceChange = (value: string) => {
    setProvinceFilter(value);
    setDistrictFilter("all");
    setPage(1);
  };

  const handleFilterChange = () => {
    setPage(1);
  };

  // Generate pagination items
  const paginationItems = useMemo(() => {
    if (!data) return [];
    const { totalPages } = data;
    const items: (number | "ellipsis")[] = [];

    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) {
        items.push(i);
      }
    } else {
      if (page <= 3) {
        items.push(1, 2, 3, 4, "ellipsis", totalPages);
      } else if (page >= totalPages - 2) {
        items.push(1, "ellipsis", totalPages - 3, totalPages - 2, totalPages - 1, totalPages);
      } else {
        items.push(1, "ellipsis", page - 1, page, page + 1, "ellipsis", totalPages);
      }
    }

    return items;
  }, [data, page]);

  return (
    <div className={`${styles.container} ${className || ""}`}>
      {/* Filters */}
      <div className={styles.filters}>
        <div className={styles.searchBox}>
          <Search className={styles.searchIcon} size={18} />
          <Input
            placeholder="Tìm kiếm theo tên sách hoặc tác giả..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              handleFilterChange();
            }}
            className={styles.searchInput}
          />
        </div>

        <div className={styles.filterRow}>
          <div className={styles.filterBox}>
            <Select
              value={categoryFilter}
              onValueChange={(value) => {
                setCategoryFilter(value);
                handleFilterChange();
              }}
              disabled={filterOptionsLoading}
            >
              <SelectTrigger className={styles.selectTrigger}>
                <div className={styles.selectLabel}>
                  <Filter size={16} />
                  <span>
                    {categoryFilter === "all"
                      ? "Tất cả danh mục"
                      : categoryFilter}
                  </span>
                </div>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả danh mục</SelectItem>
                {filterOptions?.categories.map((cat) => (
                  <SelectItem key={cat} value={cat}>
                    {cat}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className={styles.filterBox}>
            <Select
              value={provinceFilter}
              onValueChange={handleProvinceChange}
              disabled={filterOptionsLoading}
            >
              <SelectTrigger className={styles.selectTrigger}>
                <div className={styles.selectLabel}>
                  <MapPin size={16} />
                  <span>
                    {provinceFilter === "all"
                      ? "Tất cả tỉnh/thành"
                      : provinceFilter}
                  </span>
                </div>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả tỉnh/thành</SelectItem>
                {filterOptions?.provinces.map((prov) => (
                  <SelectItem key={prov} value={prov}>
                    {prov}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className={styles.filterBox}>
            <Select
              value={districtFilter}
              onValueChange={(value) => {
                setDistrictFilter(value);
                handleFilterChange();
              }}
              disabled={provinceFilter === "all" || filterOptionsLoading}
            >
              <SelectTrigger className={styles.selectTrigger}>
                <div className={styles.selectLabel}>
                  <MapPin size={16} />
                  <span>
                    {districtFilter === "all"
                      ? "Tất cả quận/huyện"
                      : districtFilter}
                  </span>
                </div>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả quận/huyện</SelectItem>
                {availableDistricts.map((dist) => (
                  <SelectItem key={dist} value={dist}>
                    {dist}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Grid */}
      {isFetching && !data ? (
        <div className={styles.grid}>
          {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((i) => (
            <Skeleton key={i} className={styles.cardSkeleton} />
          ))}
        </div>
      ) : data && data.books.length > 0 ? (
        <>
          <div className={styles.grid}>
            {data.books.map((book) => (
              <Link
                key={book.id}
                to={`/books/${book.id}`}
                className={styles.bookLink}
              >
                <BookCard book={book} />
              </Link>
            ))}
          </div>

          {/* Pagination */}
          {data.totalPages > 1 && (
            <div className={styles.paginationWrapper}>
              <Pagination>
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious
                      onClick={() => setPage((p) => Math.max(1, p - 1))}
                      style={{
                        pointerEvents: page === 1 ? "none" : "auto",
                        opacity: page === 1 ? 0.5 : 1,
                        cursor: page === 1 ? "not-allowed" : "pointer",
                      }}
                    />
                  </PaginationItem>

                  {paginationItems.map((item, idx) =>
                    item === "ellipsis" ? (
                      <PaginationItem key={`ellipsis-${idx}`}>
                        <PaginationEllipsis />
                      </PaginationItem>
                    ) : (
                      <PaginationItem key={item}>
                        <PaginationLink
                          onClick={() => setPage(item)}
                          isActive={page === item}
                        >
                          {item}
                        </PaginationLink>
                      </PaginationItem>
                    )
                  )}

                  <PaginationItem>
                    <PaginationNext
                      onClick={() =>
                        setPage((p) => Math.min(data.totalPages, p + 1))
                      }
                      style={{
                        pointerEvents:
                          page === data.totalPages ? "none" : "auto",
                        opacity: page === data.totalPages ? 0.5 : 1,
                        cursor:
                          page === data.totalPages ? "not-allowed" : "pointer",
                      }}
                    />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            </div>
          )}
        </>
      ) : (
        <div className={styles.emptyState}>
          <div className={styles.emptyIcon}>📚</div>
          <h3>Không tìm thấy sách nào</h3>
          <p>Thử thay đổi từ khóa tìm kiếm hoặc bộ lọc.</p>
        </div>
      )}
    </div>
  );
};