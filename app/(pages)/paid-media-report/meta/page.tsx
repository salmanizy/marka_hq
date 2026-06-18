import { Separator } from "@/components/ui/separator"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { ClientTable } from "./client-table"

// Definisikan tipe data balikan dari Meta API
interface MetaAdAccount {
  name: string;
  account_id: string;
  id: string; // Meta mengembalikan format act_xxx di field "id"
}

interface MetaAdAccountsEdge {
  data?: MetaAdAccount[];
}

interface MetaBusinessResponse {
  id: string;
  owned_ad_accounts?: MetaAdAccountsEdge;
  client_ad_accounts?: MetaAdAccountsEdge;
}

type ClientSource = "owned" | "client"

interface ClientRow {
  name: string;
  accountId: string;
  actId: string;
  source: ClientSource;
}

// Mapping satu edge (owned_ad_accounts / client_ad_accounts) ke format UI
function mapAccounts(accounts: MetaAdAccount[] | undefined, source: ClientSource): ClientRow[] {
  if (!accounts) return []
  return accounts.map((account) => ({
    name: account.name,
    accountId: account.account_id,
    actId: account.id,
    source,
  }))
}

export default async function Page() {
  let clients: ClientRow[] = []

  try {
    const businessId = process.env.META_BUSINESS_ID;
    // Panggil token dari Environment Variable
    const accessToken = process.env.META_ACCESS_TOKEN; 

    if (!accessToken) {
      console.warn("META_ACCESS_TOKEN belum diatur di .env.local");
    } else {
      // Fetching data langsung di server
      // owned_ad_accounts -> akun yang dimiliki langsung oleh Business Manager ini
      // client_ad_accounts -> akun klien yang sharing akses ke Business Manager ini
      const response = await fetch(
        `https://graph.facebook.com/v25.0/${businessId}?fields=owned_ad_accounts{name,account_id},client_ad_accounts{name,account_id}&access_token=${accessToken}`,
        { 
          // ISR: Cache data selama 1 jam (3600 detik) untuk menghindari Rate Limit Meta
          next: { revalidate: 3600 } 
        }
      );

      if (!response.ok) {
        console.error("Gagal menarik data dari Meta API:", await response.text());
      } else {
        const data: MetaBusinessResponse = await response.json();

        // Gabungkan kedua edge, lalu hilangkan duplikat actId (kalau ada akun yang muncul di keduanya)
        const combined = [
          ...mapAccounts(data.owned_ad_accounts?.data, "owned"),
          ...mapAccounts(data.client_ad_accounts?.data, "client"),
        ]

        const seen = new Set<string>()
        clients = combined.filter((account) => {
          if (seen.has(account.actId)) return false
          seen.add(account.actId)
          return true
        })
      }
    }
  } catch (error) {
    console.error("Terjadi kesalahan saat fetching data Meta:", error);
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
  );
}