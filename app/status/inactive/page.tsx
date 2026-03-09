import { ShieldAlert } from "lucide-react";
export default function Inactive() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-black text-white p-6">
      <ShieldAlert className="h-16 w-16 text-yellow-500 mb-6 animate-pulse" />
      <h1 className="text-4xl font-bold tracking-tight mb-2">Link Inactive</h1>
      <p className="text-zinc-400 text-center max-w-md">
        This link has been disabled by the creator and is no longer routing
        traffic.
      </p>
    </div>
  );
}
