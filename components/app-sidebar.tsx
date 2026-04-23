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
import { AudioLinesIcon, Proportions, ArrowDownRightIcon, ScrollText, PanelsTopLeft, Drill, UserRound, CircleGauge, ChartBar } from "lucide-react"

// This is sample data.
const data = {
  user: {
    name: "Salman Azhar",
    email: "salman-azhar@marka-digital.id",
    avatar: "https://github.com/shadcn.png",
  },
  teams: [
    {
      name: "Marka Digital Indonesia",
      logo: (
        <ArrowDownRightIcon
        />
      ),
      plan: "Enterprise",
    },
    {
      name: "Marka Growth Partner",
      logo: (
        <AudioLinesIcon
        />
      ),
      plan: "Startup",
    },
  ],

  navPaid: [
    {
      name: "Report",
      url: "/paid-media-report",
      icon: (
        <Proportions
        />
      ),
    },
    {
      name: "Briefs",
      url: "/paid-media-briefs",
      icon: (
        <ScrollText
        />
      ),
    },
    {
      name: "Landing Page Builder",
      url: "/landing-page-builder",
      icon: (
        <PanelsTopLeft
        />
      ),
    },
  ],

  navCre: [
    {
      name: "Report",
      url: "/creative-report",
      icon: (
        <Proportions
        />
      ),
    },
    {
      name: "Tools",
      url: "/creative-tools",
      icon: (
        <Drill
        />
      ),
    },
    {
      name: "Creators",
      url: "/creative-creators",
      icon: (
        <UserRound
        />
      ),
    },
  ],

  navCom: [
    {
      name: "Report",
      url: "/commercial-report",
      icon: (
        <Proportions
        />
      ),
    },
    {
      name: "Dashboard",
      url: "/commercial-dashboard",
      icon: (
        <CircleGauge
        />
      ),
    },
    {
      name: "Revenue",
      url: "/commercial-revenue",
      icon: (
        <ChartBar
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
