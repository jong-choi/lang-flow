"use client";

import { TemplateDeleteButton } from "@/features/flow/components/section/header/ui/template-delete-button";
import { TemplateSaveButton } from "@/features/flow/components/section/header/ui/template-save-button";

export const HeaderActions = () => (
  <div className="flex items-center gap-3">
    <TemplateSaveButton />
    <TemplateDeleteButton />
  </div>
);
