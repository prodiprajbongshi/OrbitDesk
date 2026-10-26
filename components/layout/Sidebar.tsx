 

"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  FolderOpen,
  CheckSquare,
  Kanban,
  CalendarDays,
  Users,
  ChartNoAxesCombined,
  Bell,
  Settings,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  PanelLeftClose,
} from "lucide-react";

import { useApp } from "@/lib/context";
import Avatar from "@/components/ui/Avatar";

const NAV_ITEMS = [
  { href: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
  { href: "/projects", icon: FolderOpen, label: "Projects" },
  { href: "/tasks", icon: CheckSquare, label: "My Tasks" },
  { href: "/board", icon: Kanban, label: "Board View" },
  { href: "/calendar", icon: CalendarDays, label: "Calendar" },
  { href: "/team", icon: Users, label: "Team" },
  { href: "/reports", icon: ChartNoAxesCombined, label: "Reports" },
  { href: "/notifications", icon: Bell, label: "Notifications" },
  { href: "/settings", icon: Settings, label: "Settings" },
];

export default function Sidebar() {
  const { state, dispatch } = useApp();
  const pathname = usePathname();

  const collapsed = state.sidebarCollapsed;
  const unreadCount = state.notifications.filter(
    (notification) => !notification.read,
  ).length;

  return (
    <aside
      className={`
        group/sidebar relative z-40 flex h-dvh shrink-0 flex-col
        overflow-hidden border-r border-white/[0.07]
        transition-[width] duration-300 ease-in-out
        
   
        ${collapsed ? "w-[86px]" : "w-[260px]"}
      `}
      style={{
        background:
          "linear-gradient(180deg, #0B1120 0%, #0A1020 55%, #0B1220 100%)",
        padding: '0px 10px' ,
      }}
    >

  

        {/* Brand */}
        <div
          className={`
          relative flex h-[82px] shrink-0 items-center gap-3
          border-b border-white/[0.07] px-4
          ${collapsed ? "justify-center px-2" : ""}
        `}
        >
          <div className="relative flex h-10 w-10 shrink-0 items-center justify-center rounded-[14px] bg-gradient-to-br from-blue-500 via-indigo-500 to-violet-600 shadow-lg shadow-blue-600/20 ring-1 ring-white/15">
            <Sparkles size={19} className="text-white" strokeWidth={1.8} />
            <span className="absolute -right-0.5 -top-0.5 h-2.5 w-2.5 rounded-full border-2 border-[#0B1120] bg-emerald-400" />
          </div>

          {!collapsed && (
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <span className="truncate text-[17px] font-bold tracking-tight text-white">
                  Orbit Desk
                </span>
                <span className="rounded-md border border-indigo-400/20 bg-indigo-400/10 px-1.5 py-0.5 text-[9px] font-bold tracking-[0.12em] text-indigo-300">
                  PRO
                </span>
              </div>
              <p className="mt-0.5 truncate text-[11px] font-medium tracking-wide text-slate-500">
                Workspace Studio
              </p>
            </div>
          )}
        </div>

        {/* Navigation */}
        <nav
          aria-label="Main navigation"
          className={`relative flex-1 space-y-1 overflow-x-hidden overflow-y-auto    ${collapsed ? "px-3" : "pl-4 pr-3"}`}
        >
          

          {NAV_ITEMS.map(({ href, icon: Icon, label }) => {
            const active =
              pathname === href ||
              (href !== "/dashboard" && pathname.startsWith(`${href}/`));

            const isNotifications = href === "/notifications";

            return (
              <Link
                key={href}
                href={href}
                aria-current={active ? "page" : undefined}
                title={collapsed ? label : undefined}
                className={`
                group/nav relative flex min-h-[44px] items-center gap-3
                overflow-hidden rounded-xl px-3
                transition-all duration-200
                ${
                  active
                    ? "border border-blue-400/[0.13] bg-gradient-to-r from-blue-500/[0.16] to-indigo-500/[0.07] text-white shadow-sm shadow-black/10"
                    : "border border-transparent text-slate-400 hover:border-white/[0.04] hover:bg-white/[0.045] hover:text-slate-100"
                }
                ${collapsed ? "justify-center px-0" : ""}
              `}
              >
                {/* Active indicator */}
                {active && (
                  <span className="absolute bottom-2 left-0 top-2 w-[3px] rounded-r-full bg-blue-400 shadow-[0_0_10px_rgba(96,165,250,0.6)]" />
                )}

                <span
                  className={`
                  relative flex h-8 w-8 shrink-0 items-center justify-center
                  rounded-lg transition-all duration-200
                  ${
                    active
                      ? "bg-blue-400/[0.12] text-blue-300"
                      : "text-slate-400 group-hover/nav:bg-white/[0.04] group-hover/nav:text-slate-200"
                  }
                `}
                >
                  <Icon size={18} strokeWidth={active ? 2.1 : 1.7} />

                  {isNotifications && unreadCount > 0 && (
                    <span
                      className={`
                      absolute flex items-center justify-center
                      rounded-full bg-rose-500 font-bold text-white
                      ring-2 ring-[#0B1120]
                      ${
                        collapsed
                          ? "-right-1 -top-1 h-2.5 w-2.5"
                          : "-right-1 -top-1 min-h-[16px] min-w-[16px] px-1 text-[9px]"
                      }
                    `}
                    >
                      {!collapsed && (unreadCount > 9 ? "9+" : unreadCount)}
                    </span>
                  )}
                </span>

                {!collapsed && (
                  <>
                    <span
                      className={`
                      min-w-0 flex-1 truncate text-[13px]
                      ${active ? "font-semibold" : "font-medium"}
                    `}
                    >
                      {label}
                    </span>

                    {active && (
                      <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-blue-400" />
                    )}
                  </>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Bottom section */}
        <div className="relative shrink-0 border-t border-white/[0.07] p-3">
          {!collapsed && (
            <div className="mb-3 rounded-xl border border-white/[0.07] bg-white/[0.025] p-2.5 transition-colors hover:bg-white/[0.045]">
              <div className="flex items-center gap-3">
                <Avatar
                  name={state.currentUser.name}
                  initials={state.currentUser.avatar}
                  size="sm"
                  online={true}
                />

                <div className="min-w-0 flex-1">
                  <p className="truncate text-[12px] font-semibold text-slate-100">
                    {state.currentUser.name}
                  </p>
                  <p className="mt-0.5 truncate text-[10px] text-slate-500">
                    {state.currentUser.email}
                  </p>
                </div>

                <span
                  className="h-2 w-2 shrink-0 rounded-full bg-emerald-400 ring-4 ring-emerald-400/10"
                  title="Online"
                />
              </div>
            </div>
          )}

          <button
            type="button"
            onClick={() => dispatch({ type: "TOGGLE_SIDEBAR" })}
            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            aria-expanded={!collapsed}
            title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            className={`
            flex min-h-[40px] w-full items-center gap-3 rounded-xl
            border border-transparent px-3
            text-slate-500 transition-all duration-200
            hover:border-white/[0.06] hover:bg-white/[0.045]
            hover:text-slate-200 cursor-pointer
            ${collapsed ? "justify-center px-0" : ""}
          `}
          >
            {collapsed ? (
              <ChevronRight size={17} />
            ) : (
              <>
                <PanelLeftClose size={17} strokeWidth={1.7} />
                <span className="flex-1 text-left text-[12px] font-medium">
                  Collapse sidebar
                </span>
                <ChevronLeft
                  size={15}
                  className="text-slate-600 transition-transform duration-200 group-hover/sidebar:-translate-x-0.5"
                />
              </>
            )}
          </button>
        </div>
 
    </aside>
  );



  
}
