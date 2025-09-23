"use client";

import React, { useState } from "react";
import type { ReactNode } from "react";
import { Save } from "lucide-react";

export type FlowHeaderProps = {
  initialName?: string;
  onCreate?: () => void;
  onDelete?: () => void;
  onSaveTemplate?: () => void;
  children?: ReactNode;
};

export function FlowHeader({
  initialName = "untitled",
  onCreate,
  onDelete,
  onSaveTemplate,
  children,
}: FlowHeaderProps) {
  const [name, setName] = useState(initialName);
  const [editing, setEditing] = useState(false);

  return (
    <header className="w-full bg-white/60 backdrop-blur-sm border-b border-gray-100 px-4 py-2 flex items-center justify-between gap-3">
      <div className="flex items-center gap-4">
        <div className="flex flex-col">
          {editing ? (
            <input
              aria-label="workflow-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              onBlur={() => setEditing(false)}
              onKeyDown={(e) => {
                if (e.key === "Enter") setEditing(false);
                if (e.key === "Escape") setEditing(false);
              }}
              className="px-2 py-1 border rounded-md text-base font-semibold w-48"
              data-testid="flow-name-input"
            />
          ) : (
            <button
              onClick={() => setEditing(true)}
              className="text-base font-semibold text-gray-900 hover:underline"
              data-testid="flow-name-button"
            >
              {name}
            </button>
          )}
          <span className="text-xs text-gray-500">Workflow settings</span>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onSaveTemplate}
          className="inline-flex items-center gap-2 rounded-md border border-violet-200 px-3 py-1.5 text-sm font-semibold text-violet-600 hover:bg-violet-50"
        >
          <Save className="size-4" /> 템플릿으로 저장
        </button>
        <button
          type="button"
          onClick={onCreate}
          className="inline-flex items-center gap-2 bg-blue-600 text-white px-3 py-1.5 rounded-md shadow-sm hover:bg-blue-700 focus:outline-none text-sm"
          data-testid="create-btn"
        >
          생성
        </button>

        <button
          type="button"
          onClick={onDelete}
          className="inline-flex items-center gap-2 border border-gray-200 text-gray-700 px-2.5 py-1.5 rounded-md hover:bg-gray-50 text-sm"
          data-testid="delete-btn"
        >
          삭제
        </button>
      </div>

      {children}
    </header>
  );
}

export default FlowHeader;
