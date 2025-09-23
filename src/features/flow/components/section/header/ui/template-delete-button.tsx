"use client";

import { toast } from "sonner";

export const TemplateDeleteButton = () => (
  <button
    type="button"
    onClick={() => toast.error("삭제기능 미구현")}
    className="inline-flex items-center gap-2 rounded-md border border-gray-200 px-2.5 py-1.5 text-sm text-gray-700 hover:bg-gray-50"
    data-testid="delete-btn"
  >
    삭제
  </button>
);
