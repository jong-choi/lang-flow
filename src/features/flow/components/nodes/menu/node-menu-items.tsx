import {
  Copy,
  Edit,
  Plus,
  Trash2,
} from "lucide-react";
import type { MenuItem } from "@/features/flow/types/nodes";

export const createBasicMenuItems = (handleDelete: () => void): MenuItem[] => [
  {
    icon: Trash2,
    label: "삭제",
    onClick: handleDelete,
    variant: "destructive",
  },
];

export const createFullMenuItems = (
  handleEdit: () => void,
  handleDuplicate: () => void,
  handleAddConnection: () => void,
  handleDelete: () => void,
): MenuItem[] => [
  { icon: Edit, label: "편집", onClick: handleEdit },
  { icon: Copy, label: "복제", onClick: handleDuplicate },
  { icon: Plus, label: "연결 추가", onClick: handleAddConnection },
  {
    icon: Trash2,
    label: "삭제",
    onClick: handleDelete,
    variant: "destructive",
  },
];
