export interface Insight {
  id?: string;
  slug: string;
  title: string;
  category: string;
  read_time: string;
  excerpt: string;
  date: string;
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