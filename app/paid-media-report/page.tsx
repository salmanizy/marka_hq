import { Separator } from "@/components/ui/separator"
import { SidebarTrigger } from "@/components/ui/sidebar"

const clients: { name: string; accountId: string; actId: string }[] = []

export default function Page() {
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
        <div className="rounded-xl border bg-card">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-muted/50">
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">
                  Client Account Name
                </th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">
                  Account ID
                </th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">
                  Act ID
                </th>
              </tr>
            </thead>
            <tbody>
              {clients.length === 0 ? (
                <tr>
                  <td
                    colSpan={3}
                    className="px-4 py-10 text-center text-muted-foreground"
                  >
                    No clients added yet.
                  </td>
                </tr>
              ) : (
                clients.map((client, index) => (
                  <tr key={index} className="border-b last:border-0 hover:bg-muted/30">
                    <td className="px-4 py-3">{client.name}</td>
                    <td className="px-4 py-3">{client.accountId}</td>
                    <td className="px-4 py-3">{client.actId}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </>
  )
}
