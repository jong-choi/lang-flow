"use client";

import React from "react";
import { MoreVertical } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { SHARED_STYLES } from "@/features/flow/constants/node-config";
import type { MenuItem, NodeConfig } from "@/features/flow/types/node-ui";

export const NodeContainer: React.FC<{
  config: NodeConfig;
  children: React.ReactNode;
  menuItems: MenuItem[];
  isMenuOpen: boolean;
  setIsMenuOpen: (open: boolean) => void;
}> = ({ config, children, menuItems, isMenuOpen, setIsMenuOpen }) => (
  <div
    className={`${SHARED_STYLES.nodeContainer} ${config.gradient} ${config.border} ${config.hoverBorder}`}
  >
    {children}
    <DropdownMenu open={isMenuOpen} onOpenChange={setIsMenuOpen}>
      <DropdownMenuTrigger asChild>
        <button className={`${SHARED_STYLES.nodeButton} ${config.hoverBg}`}>
          <MoreVertical className={`h-4 w-4 ${config.iconColor}`} />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="min-w-[160px]">
        {menuItems.map((item, index) => (
          <React.Fragment key={`${item.label}-${index}`}>
            {item.variant === "destructive" && index > 0 && (
              <DropdownMenuSeparator />
            )}
            <DropdownMenuItem onClick={item.onClick} variant={item.variant}>
              <item.icon className="mr-2 h-4 w-4" />
              {item.label}
            </DropdownMenuItem>
          </React.Fragment>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  </div>
);
