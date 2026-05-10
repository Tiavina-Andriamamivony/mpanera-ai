"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  Briefcase,
  LayoutDashboard,
  Sparkles,
  UserCircle,
  WandSparkles,
} from "lucide-react"

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarRail,
  SidebarTrigger,
} from "@/components/ui/sidebar"
import { Header } from "@/components/ui/header-with-search"
import { TooltipProvider } from "@/components/ui/tooltip"

const NAV_ITEMS = [
  {
    href: "/app",
    label: "Tableau de bord",
    icon: LayoutDashboard,
    isActive: (pathname: string) => pathname === "/app",
  },
  {
    href: "/app/providers/demo-provider",
    label: "Prestataire",
    icon: Briefcase,
    isActive: (pathname: string) => pathname.startsWith("/app/providers"),
  },
  {
    href: "/app/clients/demo-client",
    label: "Client",
    icon: UserCircle,
    isActive: (pathname: string) => pathname.startsWith("/app/clients"),
  },
] as const

export function PlatformAppShell({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const pathname = usePathname()

  return (
    <TooltipProvider>
      <SidebarProvider className="min-h-svh bg-muted/30">
        <Sidebar collapsible="icon" variant="sidebar">
          <SidebarHeader className="gap-2 border-b border-sidebar-border">
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild size="lg" tooltip="Retour à l'accueil">
                  <Link href="/">
                    <Sparkles className="size-4 shrink-0 text-sidebar-primary" />
                    <span className="truncate font-semibold">Mpanera AI</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarHeader>
          <SidebarContent>
            <SidebarGroup>
              <SidebarGroupLabel>Menu</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {NAV_ITEMS.map((item) => {
                    const Icon = item.icon
                    return (
                      <SidebarMenuItem key={item.href}>
                        <SidebarMenuButton
                          asChild
                          isActive={item.isActive(pathname)}
                          tooltip={item.label}
                        >
                          <Link href={item.href}>
                            <Icon />
                            <span>{item.label}</span>
                          </Link>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    )
                  })}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </SidebarContent>
          <SidebarRail />
        </Sidebar>

        <SidebarInset className="overflow-x-hidden">
          <Header leadingSlot={<SidebarTrigger />} />
          <div className="flex flex-1 flex-col">
            <div className="mx-auto flex w-full max-w-6xl flex-1 flex-col px-6 py-10">
              {children}
            </div>
          </div>
        </SidebarInset>
      </SidebarProvider>
    </TooltipProvider>
  )
}
