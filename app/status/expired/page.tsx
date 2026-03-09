import { TimerOff } from "lucide-react";
export default function Expired() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-black text-white p-6">
      <TimerOff className="h-16 w-16 text-red-500 mb-6" />
      <h1 className="text-4xl font-bold tracking-tight mb-2">Link Expired</h1>
      <p className="text-zinc-400 text-center max-w-md">
        This link has reached its maximum allowed click limit and has been
        automatically deactivated.
      </p>
    </div>
  );
}
