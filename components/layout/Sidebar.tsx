"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  FolderOpen,
  Library,
  Bot,
  Settings,
  Music2,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useSettingsStore } from "@/stores/settings.store";
import { Button } from "@/components/ui/button";

interface NavItem {
  href: string;
  label: string;
  icon: React.ReactNode;
}

const navItems: NavItem[] = [
  { href: "/", label: "Dashboard", icon: <LayoutDashboard className="h-5 w-5" /> },
  { href: "/artists", label: "Artistes", icon: <Users className="h-5 w-5" /> },
  { href: "/projects", label: "Projets", icon: <FolderOpen className="h-5 w-5" /> },
  { href: "/library", label: "Bibliothèque", icon: <Library className="h-5 w-5" /> },
  { href: "/agents", label: "Agents IA", icon: <Bot className="h-5 w-5" /> },
  { href: "/settings", label: "Paramètres", icon: <Settings className="h-5 w-5" /> },
];

export function Sidebar(): React.ReactElement {
  const pathname = usePathname();
  const { sidebarCollapsed, toggleSidebar } = useSettingsStore();

  return (
    <aside
      className={cn(
        "flex h-full flex-col border-r border-zinc-800 bg-zinc-950 transition-all duration-300",
        sidebarCollapsed ? "w-16" : "w-64"
      )}
    >
      {/* Logo */}
      <div className="flex h-16 items-center border-b border-zinc-800 px-4">
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-purple-600 text-white">
            <Music2 className="h-5 w-5" />
          </div>
          {!sidebarCollapsed && (
            <span className="text-sm font-bold text-white">Studio IA</span>
          )}
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 space-y-1 p-2">
        {navItems.map((item) => {
          const isActive =
            item.href === "/"
              ? pathname === "/"
              : pathname.startsWith(item.href);

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                isActive
                  ? "bg-purple-600/20 text-purple-400"
                  : "text-zinc-400 hover:bg-zinc-800 hover:text-white"
              )}
              title={sidebarCollapsed ? item.label : undefined}
            >
              <span className={cn("shrink-0", isActive && "text-purple-400")}>{item.icon}</span>
              {!sidebarCollapsed && <span>{item.label}</span>}
            </Link>
          );
        })}
      </nav>

      {/* Toggle button */}
      <div className="border-t border-zinc-800 p-2">
        <Button
          variant="ghost"
          size="icon"
          onClick={toggleSidebar}
          className="w-full text-zinc-500 hover:text-white"
          title={sidebarCollapsed ? "Développer" : "Réduire"}
        >
          {sidebarCollapsed ? (
            <ChevronRight className="h-4 w-4" />
          ) : (
            <ChevronLeft className="h-4 w-4" />
          )}
        </Button>
      </div>
    </aside>
  );
}
