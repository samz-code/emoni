export type TabType = "projects" | "products" | "design";

export interface ProjectItem {
  id: string;
  name: string;
  sector: string;
  description: string;
  liveUrl: string | null;
  image?: string;
}

export interface ProductItem {
  id: string;
  name: string;
  category: string;
  description: string;
  format: string;
  status: "available" | "update";
  icon: string;
  price: number;
}

export interface DesignItem {
  id: string;
  title: string;
  category: string;
  image: string;
}