"use client"

import * as React from "react"

import { NavPaidMedia } from "@/components/nav-paid-media"
import { NavCreative } from "@/components/nav-creative"
import { NavCommercial } from "@/components/nav-commercial"
import { NavUser } from "@/components/nav-user"
import { TeamSwitcher } from "@/components/team-switcher"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from "@/components/ui/sidebar"
import { GalleryVerticalEndIcon, AudioLinesIcon, TerminalIcon, TerminalSquareIcon, BotIcon, BookOpenIcon, Settings2Icon, FrameIcon, PieChartIcon, MapIcon } from "lucide-react"

// This is sample data.
const data = {
  user: {
    name: "Salman Azhar",
    email: "salman-azhar@marka-digital.id",
    avatar: "https://github.com/shadcn.png",
  },
  teams: [
    {
      name: "Acme Inc",
      logo: (
        <GalleryVerticalEndIcon
        />
      ),
      plan: "Enterprise",
    },
    {
      name: "Acme Corp.",
      logo: (
        <AudioLinesIcon
        />
      ),
      plan: "Startup",
    },
    {
      name: "Evil Corp.",
      logo: (
        <TerminalIcon
        />
      ),
      plan: "Free",
    },
  ],

  navPaid: [
    {
      name: "Report",
      url: "/paid-media-report",
      icon: (
        <FrameIcon
        />
      ),
    },
    {
      name: "Briefs",
      url: "/paid-media-briefs",
      icon: (
        <PieChartIcon
        />
      ),
    },
    {
      name: "Landing Page Builder",
      url: "/landing-page-builder",
      icon: (
        <MapIcon
        />
      ),
    },
  ],

  navCre: [
    {
      name: "Report",
      url: "/creative-report",
      icon: (
        <FrameIcon
        />
      ),
    },
    {
      name: "Tools",
      url: "/creative-tools",
      icon: (
        <PieChartIcon
        />
      ),
    },
    {
      name: "Creators",
      url: "/creative-creators",
      icon: (
        <MapIcon
        />
      ),
    },
  ],

  navCom: [
    {
      name: "Report",
      url: "/commercial-report",
      icon: (
        <FrameIcon
        />
      ),
    },
    {
      name: "Dashboard",
      url: "/commercial-dashboard",
      icon: (
        <PieChartIcon
        />
      ),
    },
    {
      name: "Revenue",
      url: "/commercial-revenue",
      icon: (
        <MapIcon
        />
      ),
    },
  ],
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <TeamSwitcher teams={data.teams} />
      </SidebarHeader>

      <SidebarContent>
        <NavPaidMedia list={data.navPaid} />
        <NavCreative list={data.navCre} />
        <NavCommercial list={data.navCom} />
      </SidebarContent>
      
      <SidebarFooter>
        <NavUser user={data.user} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
