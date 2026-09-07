"use client"

import * as React from "react"

import { NavMain } from "@/components/nav-main"
import type { NavItem } from "@/components/nav-main"
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@/components/ui/sidebar"
import {
  FileTextIcon,
  LayoutDashboardIcon,
  ShieldIcon,
} from "lucide-react"

const navMain: NavItem[] = [
  {
    title: "Dashboard",
    url: "/dashboard",
    icon: (
      <LayoutDashboardIcon
      />
    ),
  },
  {
    title: "Forms",
    url: "/forms/contact",
    icon: (
      <FileTextIcon
      />
    ),
    items: [
      {
        title: "Contact",
        url: "/forms/contact",
      },
    ],
  },
]

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" tooltip="Wild FC Admin">
              <div className="flex aspect-square size-8 items-center justify-center rounded-md bg-purple-900 text-white">
                <ShieldIcon className="size-4" />
              </div>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-semibold">Calgary Wild FC</span>
                <span className="truncate text-xs">Admin</span>
              </div>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={navMain} />
      </SidebarContent>
      <SidebarRail />
    </Sidebar>
  )
}
