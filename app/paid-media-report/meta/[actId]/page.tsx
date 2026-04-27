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
          <h1 className="font-medium">Paid Media | Meta Ads Clients</h1>
        </div>
      </header>
      <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
        <InsightsClient actId={actId} />
      </div>
    </>
  )
}
