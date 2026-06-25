// paid-media-report/meta/page.tsx
import { Separator } from "@/components/ui/separator"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { ClientTable } from "./client-table"
import { getCachedClientList } from "@/lib/meta-fetcher"

interface MetaAdAccount {
  name: string
  account_id: string
  id: string
}

interface MetaResponse {
  data: MetaAdAccount[]
}

interface ClientRow {
  name: string
  accountId: string
  actId: string
  source: "owned" | "client" | "shared"
}

export default async function Page() {
  let clients: ClientRow[] = []

  try {
    const accessToken = process.env.META_ACCESS_TOKEN

    if (!accessToken) {
      console.warn("META_ACCESS_TOKEN belum diatur di .env.local")
    } else {
      const data: MetaResponse = await getCachedClientList()

      clients = (data.data || []).map((account) => ({
        name: account.name,
        accountId: account.account_id,
        actId: account.id,
        source: "shared" as const,
      }))
    }
  } catch (error) {
    console.error("Terjadi kesalahan saat fetching data Meta:", error)
  }

  return (
    <>
      <header className="flex h-16 shrink-0 items-center gap-2 px-4">
        <div className="flex items-center gap-2">
          <SidebarTrigger className="-ml-1" />
          <Separator orientation="vertical" className="mr-2" />
          <h1 className="font-medium">Paid Media | Client List</h1>
        </div>
      </header>
      <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
        <ClientTable clients={clients} />
      </div>
    </>
  )
}