import React, { useRef } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { BookCard } from "./BookCard";
import { Button } from "./Button";
import { Skeleton } from "./Skeleton";
import { useBooksList } from "../helpers/useBooksList";
import styles from "./FeaturedBooksCarousel.module.css";

interface FeaturedBooksCarouselProps {
  className?: string;
}

export const FeaturedBooksCarousel = ({
  className,
}: FeaturedBooksCarouselProps) => {
  const { data, isFetching } = useBooksList({ status: "available" });
  const scrollRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: "left" | "right") => {
    if (!scrollRef.current) return;

    const scrollAmount = 320; // Width of card + gap
    const newScrollLeft =
      scrollRef.current.scrollLeft +
      (direction === "left" ? -scrollAmount : scrollAmount);

    scrollRef.current.scrollTo({
      left: newScrollLeft,
      behavior: "smooth",
    });
  };

  const featuredBooks = data?.books.slice(0, 6) || [];

  if (isFetching) {
    return (
      <div className={`${styles.carousel} ${className || ""}`}>
        <div className={styles.scrollContainer}>
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className={styles.bookSkeleton} />
          ))}
        </div>
      </div>
    );
  }

  if (featuredBooks.length === 0) {
    return null;
  }

  return (
    <div className={`${styles.carousel} ${className || ""}`}>
      <div className={styles.controls}>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => scroll("left")}
          className={styles.controlButton}
          aria-label="Scroll left"
        >
          <ChevronLeft size={20} />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => scroll("right")}
          className={styles.controlButton}
          aria-label="Scroll right"
        >
          <ChevronRight size={20} />
        </Button>
      </div>

      <div className={styles.scrollContainer} ref={scrollRef}>
        {featuredBooks.map((book, index) => (
          <div
            key={book.id}
            className={styles.bookWrapper}
            style={{
              animationDelay: `${index * 0.1}s`,
            }}
          >
            <BookCard book={book} />
          </div>
        ))}
      </div>

      <div className={styles.gradient}></div>
    </div>
  );
};