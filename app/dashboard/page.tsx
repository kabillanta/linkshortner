import { supabase } from "@/lib/supabase";
import { MousePointerClick, Link2, Activity } from "lucide-react";
import DashboardClient from "@/components/DashboardClient";
import Link from "next/link";
import SignOutButton from "@/components/SignOutButton";

export const revalidate = 0;

export default async function Dashboard() {
  // THE FIX: We added max_clicks, is_active, and last_accessed_at to the select query!
  const { data: urls, error } = await supabase
    .from("urls")
    .select(
      `
      short_code,
      original_url,
      created_at,
      max_clicks,
      is_active,
      last_accessed_at,
      clicks ( id )
    `,
    )
    .order("created_at", { ascending: false });

  if (error) {
    return (
      <div className="flex h-screen items-center justify-center bg-black text-red-500 font-mono">
        [SYSTEM_ERROR]: Database connection failed.
      </div>
    );
  }

  const totalLinks = urls?.length || 0;
  const totalClicks =
    urls?.reduce((sum, url) => sum + (url.clicks?.length || 0), 0) || 0;

  return (
    <main className="relative min-h-screen bg-black text-white selection:bg-white/30 overflow-hidden">
      {/* Animated Radial Background Glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-white/[0.03] rounded-full blur-[120px] pointer-events-none animate-pulse" />

      {/* Top Navbar */}
      <nav className="border-b border-white/5 bg-black/50 backdrop-blur-xl sticky top-0 z-40">
        <div className="mx-auto max-w-6xl flex items-center justify-between px-6 py-4">
          <div className="flex items-center gap-2">
            <div className="bg-white text-black p-1.5 rounded-full">
              <Link2 className="h-5 w-5" />
            </div>
            <span className="text-xl font-bold tracking-tight">Cognito</span>
          </div>
          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="rounded-full border border-white/10 bg-white/5 px-6 py-2 text-sm font-medium text-white hover:bg-white/10 transition-all duration-300"
            >
              Create New Link
            </Link>
            <SignOutButton />
          </div>
        </div>
      </nav>

      <div className="mx-auto max-w-6xl space-y-12 px-6 py-12">
        {/* Header Section */}
        <div className="flex flex-col items-center text-center space-y-4 animate-in fade-in slide-in-from-bottom-8 duration-700">
          <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-1.5 text-xs font-medium text-zinc-400">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
            </span>
            Analytics Engine Active
          </div>
          <h1 className="text-5xl font-extrabold tracking-tighter sm:text-6xl text-transparent bg-clip-text bg-gradient-to-b from-white to-white/50">
            Command Center.
          </h1>
          <p className="max-w-xl text-lg text-zinc-400">
            Monitor your global engagement and track link performance in
            real-time.
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 animate-in fade-in slide-in-from-bottom-10 duration-700 delay-150 fill-mode-both">
          <div className="group relative overflow-hidden rounded-3xl border border-white/10 bg-white/[0.02] p-8 transition-all hover:bg-white/[0.04]">
            <div className="absolute -right-10 -top-10 h-32 w-32 rounded-full bg-white/5 blur-3xl transition-all group-hover:bg-white/10" />
            <p className="text-sm font-medium text-zinc-400 uppercase tracking-widest mb-2">
              Total Links
            </p>
            <p className="text-5xl font-bold tracking-tight">{totalLinks}</p>
          </div>

          <div className="group relative overflow-hidden rounded-3xl border border-white/10 bg-white/[0.02] p-8 transition-all hover:bg-white/[0.04]">
            <div className="absolute -right-10 -top-10 h-32 w-32 rounded-full bg-white/5 blur-3xl transition-all group-hover:bg-white/10" />
            <p className="text-sm font-medium text-zinc-400 uppercase tracking-widest mb-2">
              Total Engagements
            </p>
            <p className="text-5xl font-bold tracking-tight">{totalClicks}</p>
          </div>
        </div>

        {/* The Client Component (Table) */}
        <div className="animate-in fade-in slide-in-from-bottom-12 duration-700 delay-300 fill-mode-both">
          <DashboardClient urls={urls} />
        </div>
      </div>
    </main>
  );
}
