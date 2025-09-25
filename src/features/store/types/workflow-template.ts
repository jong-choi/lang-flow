export interface WorkflowTemplate {
  id: string;
  title: string;
  description: string;
  category: string;
  price: number;
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
