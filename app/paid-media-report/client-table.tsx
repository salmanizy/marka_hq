"use client"

import { useState } from "react"
import Link from "next/link"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Search } from "lucide-react"

interface Client {
  name: string
  accountId: string
  actId: string
}

export function ClientTable({ clients }: { clients: Client[] }) {
  const [query, setQuery] = useState("")
  const [activeQuery, setActiveQuery] = useState("")

  const filtered = clients.filter((c) =>
    activeQuery === ""
      ? true
      : c.name.toLowerCase().includes(activeQuery.toLowerCase()) ||
        c.accountId.includes(activeQuery) ||
        c.actId.includes(activeQuery)
  )

  function handleSearch() {
    setActiveQuery(query)
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex gap-2">
        <Input
          placeholder="Search by name, account ID, or act ID…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSearch()}
          className="max-w-sm"
        />
        <Button variant="outline" onClick={handleSearch}>
          <Search className="h-4 w-4 mr-2" />
          Search
        </Button>
      </div>

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
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={3} className="px-4 py-10 text-center text-muted-foreground">
                  {clients.length === 0 ? "No clients data retrieved." : "No results found."}
                </td>
              </tr>
            ) : (
              filtered.map((client, index) => (
                <tr key={index} className="border-b last:border-0 hover:bg-muted/30">
                  <td className="px-4 py-3">
                    <Link
                      href={`/paid-media-report/${encodeURIComponent(client.actId)}`}
                      className="text-primary font-medium hover:underline"
                    >
                      {client.name}
                    </Link>
                  </td>
                  <td className="px-4 py-3">{client.accountId}</td>
                  <td className="px-4 py-3">{client.actId}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
