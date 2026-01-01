export interface BookData {
  id: number;
  title: string;
  author: string | null;
  category: string | null;
  coverUrl: string | null;
  ownerName: string | null;
  province: string | null;
  district: string | null;
  status: "available" | "borrowed" | "unavailable";
  createdAt: Date;
}