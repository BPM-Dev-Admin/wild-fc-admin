import * as React from "react"
import { Link, useRouterState } from "@tanstack/react-router"
import type { LinkProps } from "@tanstack/react-router"

import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from "@/components/ui/sidebar"
import { ChevronRightIcon } from "lucide-react"

export type NavItem = {
  title: string
  url: LinkProps["to"]
  icon?: React.ReactNode
  items?: {
    title: string
    url: LinkProps["to"]
  }[]
}

function isPathActive(pathname: string, url: NavItem["url"]) {
  if (typeof url !== "string") {
    return false
  }
  return pathname === url || pathname.startsWith(`${url}/`)
}

export function NavMain({ items }: { items: NavItem[] }) {
  const pathname = useRouterState({ select: (s) => s.location.pathname })

  return (
    <SidebarGroup>
      <SidebarGroupLabel>Workspace</SidebarGroupLabel>
      <SidebarMenu>
        {items.map((item) =>
          item.items?.length ? (
            <NavCollapsibleItem
              key={item.title}
              item={item}
              pathname={pathname}
            />
          ) : (
            <SidebarMenuItem key={item.title}>
              <SidebarMenuButton
                tooltip={item.title}
                isActive={isPathActive(pathname, item.url)}
                render={<Link to={item.url} />}
              >
                {item.icon}
                <span>{item.title}</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          )
        )}
      </SidebarMenu>
    </SidebarGroup>
  )
}

function NavCollapsibleItem({
  item,
  pathname,
}: {
  item: NavItem
  pathname: string
}) {
  const isActive = isPathActive(pathname, item.url)
  const [open, setOpen] = React.useState(isActive)
  const [wasActive, setWasActive] = React.useState(isActive)

  // Expand the group whenever navigation lands on one of its pages, while
  // still letting the user open/close it manually in between.
  if (wasActive !== isActive) {
    setWasActive(isActive)
    if (isActive) {
      setOpen(true)
    }
  }

  return (
    <Collapsible
      open={open}
      onOpenChange={setOpen}
      className="group/collapsible"
      render={<SidebarMenuItem />}
    >
      <CollapsibleTrigger
        render={<SidebarMenuButton tooltip={item.title} isActive={isActive} />}
      >
        {item.icon}
        <span>{item.title}</span>
        <ChevronRightIcon className="ml-auto transition-transform duration-200 group-data-open/collapsible:rotate-90" />
      </CollapsibleTrigger>
      <CollapsibleContent>
        <SidebarMenuSub>
          {item.items?.map((subItem) => (
            <SidebarMenuSubItem key={subItem.title}>
              <SidebarMenuSubButton
                isActive={isPathActive(pathname, subItem.url)}
                render={<Link to={subItem.url} />}
              >
                <span>{subItem.title}</span>
              </SidebarMenuSubButton>
            </SidebarMenuSubItem>
          ))}
        </SidebarMenuSub>
      </CollapsibleContent>
    </Collapsible>
  )
}
