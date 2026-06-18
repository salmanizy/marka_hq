"use client"

import * as React from "react"
import { createClient } from "@/utils/supabase/client"

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

// Hapus data user dari sini, biarkan tim dan navigasi tetap statis
const data = {
  teams: [
    {
      name: "Marka Digital Indonesia",
      logo: <ArrowDownRightIcon />,
      plan: "Enterprise",
    },
    {
      name: "Marka Growth Partner",
      logo: <AudioLinesIcon />,
      plan: "Startup",
    },
  ],
  navPaid: [
    { name: "Report", url: "/paid-media-report", icon: <Proportions /> },
    { name: "Briefs", url: "/paid-media-briefs", icon: <ScrollText /> },
    { name: "Landing Page Builder", url: "/landing-page-builder", icon: <PanelsTopLeft /> },
  ],
  navCre: [
    { name: "Report", url: "/creative-report", icon: <Proportions /> },
    { name: "Tools", url: "/creative-tools", icon: <Drill /> },
    { name: "Creators", url: "/creative-creators", icon: <UserRound /> },
  ],
  navCom: [
    { name: "Report", url: "/commercial-report", icon: <Proportions /> },
    { name: "Dashboard", url: "/commercial-dashboard", icon: <CircleGauge /> },
    { name: "Revenue", url: "/commercial-revenue", icon: <ChartBar /> },
  ],
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const supabase = createClient()
  
  // State untuk menyimpan data user aktif
  const [activeUser, setActiveUser] = React.useState({
    name: "Loading...",
    email: "Memuat data...",
    avatar: "https://github.com/shadcn.png", // Avatar default
  })

  React.useEffect(() => {
    async function fetchUser() {
      const { data: { user } } = await supabase.auth.getUser()
      
      if (user) {
        setActiveUser({
          // Ambil nama dari depan email jika metadata nama tidak ada
          name: user.user_metadata?.full_name || user.email?.split("@")[0] || "User",
          email: user.email || "",
          avatar: user.user_metadata?.avatar_url || "https://github.com/shadcn.png",
        })
      }
    }
    
    fetchUser()
  }, [supabase])

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
        {/* Lempar state activeUser ke komponen NavUser */}
        <NavUser user={activeUser} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}