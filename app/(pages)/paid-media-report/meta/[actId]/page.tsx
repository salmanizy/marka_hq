import Link from "next/link"
import { ChevronLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { InsightsClient } from "./insights-client"

export default async function Page({
  params,
}: {
  params: Promise<{ actId: string }>
}) {
  const { actId } = await params

  return (
    <>
      <header className="flex h-16 shrink-0 items-center gap-2 px-4">
        <div className="flex items-center gap-2">
          <SidebarTrigger className="-ml-1" />
          <Separator orientation="vertical" className="mr-2" />
          
          {/* Tombol Back Minimalis */}
          <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground" asChild>
            <Link href="/paid-media-report/meta">
              <ChevronLeft className="h-4 w-4" />
              <span className="sr-only">Kembali</span>
            </Link>
          </Button>

          <h1 className="font-medium ml-1">Paid Media | Meta Ads Clients</h1>
        </div>
      </header>
      <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
        <InsightsClient actId={actId} />
      </div>
    </>
  )
}