export interface Insight {
  id?: string;
  slug: string;
  title: string;
  category: string;
  read_time: string;
  excerpt: string;
  date: string;
  author?: string;
  image?: string;
  body: string[];
  readers?: number;
  tags?: string[];
  featured?: boolean;
  published?: boolean;
  sort_order?: number;
  created_at?: string;
  updated_at?: string;
}

export type InsightPreview = Pick<
  Insight,
  "slug" | "title" | "category" | "read_time" | "excerpt" | "date" | "author" | "image" | "tags" | "featured"
>;