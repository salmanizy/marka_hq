import { Separator } from "@/components/ui/separator"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { ClientTable } from "./client-table"

// Definisikan tipe data balikan dari Meta API
interface MetaAdAccount {
  name: string;
  account_id: string;
  id: string;
}

export default async function Page() {
  let clients: { name: string; accountId: string; actId: string }[] = []

  try {
    const businessId = process.env.META_BUSINESS_ID;
    // Panggil token dari Environment Variable
    const accessToken = process.env.META_ACCESS_TOKEN; 

    if (!accessToken) {
      console.warn("META_ACCESS_TOKEN belum diatur di .env.local");
    } else {
      // Fetching data langsung di server
      const response = await fetch(
        `https://graph.facebook.com/v25.0/${businessId}/client_ad_accounts?fields=name,account_id&access_token=${accessToken}`,
        { 
          // ISR: Cache data selama 1 jam (3600 detik) untuk menghindari Rate Limit Meta
          next: { revalidate: 3600 } 
        }
      );

      if (!response.ok) {
        console.error("Gagal menarik data dari Meta API:", await response.text());
      } else {
        const data = await response.json();
        
        // Mapping data Meta ke format state UI Anda
        if (data.data) {
          clients = data.data.map((account: MetaAdAccount) => ({
            name: account.name,
            accountId: account.account_id,
            actId: account.id, // Meta mengembalikan format act_xxx di field "id"
          }));
        }
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