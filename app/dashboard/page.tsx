import { supabase } from "@/lib/supabase";
import { MousePointerClick, Link2 } from "lucide-react";
import DashboardClient from "@/components/DashboardClient"; // Import your new component

export const revalidate = 0;

export default async function Dashboard() {
  const { data: urls, error } = await supabase
    .from("urls")
    .select(
      `
      short_code,
      original_url,
      created_at,
      clicks ( id )
    `,
    )
    .order("created_at", { ascending: false });

  if (error) {
    return (
      <div className="flex h-screen items-center justify-center bg-zinc-950 text-red-500">
        Failed to load dashboard data. Check your Supabase connection.
      </div>
    );
  }

  const totalLinks = urls?.length || 0;
  const totalClicks =
    urls?.reduce((sum, url) => sum + (url.clicks?.length || 0), 0) || 0;

  return (
    <main className="min-h-screen bg-zinc-950 p-6 sm:p-10 text-white">
      <div className="mx-auto max-w-6xl space-y-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Link Dashboard</h1>
          <p className="mt-2 text-zinc-400">
            Manage your generated links and track their performance.
          </p>
        </div>

        {/* Top Stats */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-6 shadow-sm">
            <div className="flex items-center gap-4">
              <div className="rounded-lg bg-blue-500/10 p-3 text-blue-500">
                <Link2 className="h-6 w-6" />
              </div>
              <div>
                <p className="text-sm font-medium text-zinc-400">Total Links</p>
                <p className="text-3xl font-bold text-white">{totalLinks}</p>
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-6 shadow-sm">
            <div className="flex items-center gap-4">
              <div className="rounded-lg bg-green-500/10 p-3 text-green-500">
                <MousePointerClick className="h-6 w-6" />
              </div>
              <div>
                <p className="text-sm font-medium text-zinc-400">
                  Total Clicks
                </p>
                <p className="text-3xl font-bold text-white">{totalClicks}</p>
              </div>
            </div>
          </div>
        </div>

        {/* The Client Component with the Table and Modal */}
        <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 shadow-sm flex flex-col">
          <div className="border-b border-zinc-800 bg-zinc-900 px-6 py-4">
            <h2 className="text-lg font-semibold text-white">
              All Generated Links
            </h2>
          </div>

          {urls && urls.length > 0 ? (
            <DashboardClient urls={urls} />
          ) : (
            <div className="flex flex-col items-center justify-center p-12 text-zinc-500">
              <Link2 className="mb-4 h-12 w-12 opacity-20" />
              <p className="text-lg font-medium">No links generated yet</p>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
