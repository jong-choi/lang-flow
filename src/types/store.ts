export interface WorkflowTemplate {
  id: string;
  title: string;
  description: string;
  category: string;
  price: number; // 크레딧 단위 (0-10)
  rating: number;
  reviewCount: number;
  author: {
    id: string;
    name: string;
    avatar?: string;
  };
  tags: string[];
  createdAt: string;
  updatedAt: string;
  isPurchased?: boolean;
  isPopular?: boolean;
  isFeatured?: boolean;
}

export interface StoreFilters {
  category?: string;
  priceRange?: {
    min: number;
    max: number;
  };
  rating?: number;
  tags?: string[];
  sortBy?: "popular" | "newest" | "price-low" | "price-high" | "rating";
}

export interface PurchaseInfo {
  templateId: string;
  price: number;
  purchasedAt: string;
}

export interface CartItem {
  template: WorkflowTemplate;
  addedAt: string;
}

export interface CartState {
  items: CartItem[];
  totalPrice: number;
  totalItems: number;
}
