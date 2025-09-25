import type { WorkflowTemplate } from "@/features/store/types";

export const mockTemplates: WorkflowTemplate[] = [
  {
    id: "1",
    title: "소셜 미디어 자동 포스팅",
    description:
      "Instagram, Twitter, Facebook에 동시에 포스팅하는 워크플로우입니다. 이미지 최적화와 해시태그 자동 생성 기능이 포함되어 있습니다.",
    category: "마케팅",
    price: 3,
    rating: 4.8,
    reviewCount: 124,
    author: {
      id: "author1",
      name: "김마케터",
      avatar:
        "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=40&h=40&fit=crop&crop=face",
    },
    tags: ["소셜미디어", "자동화", "마케팅", "포스팅"],
    createdAt: "2024-01-15",
    updatedAt: "2024-02-01",
    isPopular: true,
    isFeatured: true,
  },
  {
    id: "2",
    title: "이메일 뉴스레터 자동화",
    description:
      "구독자 세그먼트별로 맞춤형 뉴스레터를 자동으로 발송하는 워크플로우입니다.",
    category: "마케팅",
    price: 5,
    rating: 4.6,
    reviewCount: 89,
    author: {
      id: "author2",
      name: "이메일킹",
      avatar:
        "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=40&h=40&fit=crop&crop=face",
    },
    tags: ["이메일", "뉴스레터", "마케팅", "자동화"],
    createdAt: "2024-01-20",
    updatedAt: "2024-01-25",
    isPopular: true,
  },
  {
    id: "3",
    title: "데이터 백업 자동화",
    description:
      "중요한 데이터를 정기적으로 백업하고 클라우드에 저장하는 워크플로우입니다.",
    category: "시스템",
    price: 2,
    rating: 4.9,
    reviewCount: 156,
    author: {
      id: "author3",
      name: "데이터관리자",
      avatar:
        "https://images.unsplash.com/photo-1560250097-0b93528c311a?w=40&h=40&fit=crop&crop=face",
    },
    tags: ["백업", "클라우드", "시스템", "자동화"],
    createdAt: "2024-01-10",
    updatedAt: "2024-01-30",
  },
  {
    id: "4",
    title: "고객 지원 티켓 분류",
    description:
      "AI를 활용하여 고객 지원 티켓을 자동으로 분류하고 담당자에게 배정하는 워크플로우입니다.",
    category: "고객서비스",
    price: 7,
    rating: 4.7,
    reviewCount: 73,
    author: {
      id: "author4",
      name: "CS매니저",
      avatar:
        "https://images.unsplash.com/photo-1494790108755-2616b612b372?w=40&h=40&fit=crop&crop=face",
    },
    tags: ["고객서비스", "AI", "티켓", "분류"],
    createdAt: "2024-02-01",
    updatedAt: "2024-02-05",
    isFeatured: true,
  },
  {
    id: "5",
    title: "재고 관리 알림",
    description:
      "재고가 부족해지면 자동으로 알림을 보내고 발주를 제안하는 워크플로우입니다.",
    category: "비즈니스",
    price: 4,
    rating: 4.5,
    reviewCount: 92,
    author: {
      id: "author5",
      name: "재고왕",
      avatar:
        "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=40&h=40&fit=crop&crop=face",
    },
    tags: ["재고", "알림", "비즈니스", "관리"],
    createdAt: "2024-01-25",
    updatedAt: "2024-02-03",
  },
  {
    id: "6",
    title: "컨텐츠 번역 자동화",
    description:
      "다국어 컨텐츠를 자동으로 번역하고 각 플랫폼에 배포하는 워크플로우입니다.",
    category: "컨텐츠",
    price: 6,
    rating: 4.4,
    reviewCount: 67,
    author: {
      id: "author6",
      name: "글로벌라이터",
      avatar:
        "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=40&h=40&fit=crop&crop=face",
    },
    tags: ["번역", "컨텐츠", "다국어", "자동화"],
    createdAt: "2024-01-18",
    updatedAt: "2024-01-28",
  },
  {
    id: "7",
    title: "영업 리드 스코어링",
    description:
      "잠재 고객의 행동 데이터를 분석하여 영업 우선순위를 자동으로 매기는 워크플로우입니다.",
    category: "영업",
    price: 8,
    rating: 4.8,
    reviewCount: 145,
    author: {
      id: "author7",
      name: "세일즈킹",
      avatar:
        "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=40&h=40&fit=crop&crop=face",
    },
    tags: ["영업", "리드", "스코어링", "CRM"],
    createdAt: "2024-02-05",
    updatedAt: "2024-02-08",
    isPopular: true,
    isFeatured: true,
  },
  {
    id: "8",
    title: "회의 요약 자동화",
    description:
      "온라인 회의 녹음을 자동으로 텍스트로 변환하고 요약본을 생성하는 워크플로우입니다.",
    category: "업무효율",
    price: 5,
    rating: 4.6,
    reviewCount: 88,
    author: {
      id: "author8",
      name: "회의마스터",
      avatar:
        "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=40&h=40&fit=crop&crop=face",
    },
    tags: ["회의", "요약", "AI", "업무효율"],
    createdAt: "2024-01-30",
    updatedAt: "2024-02-06",
  },
];

export const categories = [
  "전체",
  "마케팅",
  "시스템",
  "고객서비스",
  "비즈니스",
  "컨텐츠",
  "영업",
  "업무효율",
];

export const popularTags = [
  "자동화",
  "AI",
  "마케팅",
  "이메일",
  "소셜미디어",
  "백업",
  "고객서비스",
  "재고",
  "번역",
  "영업",
  "CRM",
  "회의",
  "업무효율",
];
