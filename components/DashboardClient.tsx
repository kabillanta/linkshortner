"use client";

import { useState, useEffect } from "react";
import {
  ExternalLink,
  X,
  Copy,
  CheckCircle,
  Edit2,
  Power,
  PowerOff,
  Save,
  ShieldAlert,
  Activity,
} from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
import { toggleLinkStatus, updateDestination } from "@/app/actions";
import { useRouter } from "next/navigation";

export default function DashboardClient({ urls }: { urls: any[] }) {
  const router = useRouter();

  const [isMounted, setIsMounted] = useState(false);
  const [selectedLink, setSelectedLink] = useState<any | null>(null);
  const [copied, setCopied] = useState(false);
  const [editingUrl, setEditingUrl] = useState<string | null>(null);
  const [newDest, setNewDest] = useState("");
  const [processing, setProcessing] = useState<string | null>(null);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const copyToClipboard = (shortCode: string) => {
    const fullUrl = `${window.location.origin}/${shortCode}`;
    navigator.clipboard.writeText(fullUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleToggle = async (shortCode: string, currentStatus: boolean) => {
    setProcessing(shortCode);
    await toggleLinkStatus(shortCode, currentStatus);
    setProcessing(null);
    router.refresh();
  };

  const handleSaveEdit = async (shortCode: string) => {
    setProcessing(shortCode);
    const result = await updateDestination(shortCode, newDest);

    if (result.error) {
      alert(`Update failed: ${result.error}. Make sure you include https://`);
      setProcessing(null);
      return;
    }

    setEditingUrl(null);
    setProcessing(null);
    router.refresh();
  };

  // Clean time formatting function
  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  };

  if (!isMounted) {
    return (
      <div className="h-64 animate-pulse rounded-3xl border border-white/10 bg-white/[0.02]"></div>
    );
  }

  if (!urls || urls.length === 0) {
    return (
      <div className="rounded-3xl border border-white/10 bg-white/[0.02] p-12 text-center backdrop-blur-sm">
        <Activity className="mx-auto mb-4 h-8 w-8 text-zinc-600 opacity-50" />
        <p className="text-xl font-medium text-zinc-400">The void is empty.</p>
        <p className="mt-2 text-sm text-zinc-500">
          Generate a link to start tracking data.
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="rounded-3xl border border-white/10 bg-white/[0.02] backdrop-blur-sm overflow-hidden shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="border-b border-white/5 bg-black/40 text-zinc-500">
              <tr>
                <th className="px-8 py-5 font-medium uppercase tracking-wider text-xs">
                  Short Link
                </th>
                <th className="px-8 py-5 font-medium uppercase tracking-wider text-xs">
                  Target Payload
                </th>
                <th className="px-8 py-5 font-medium uppercase tracking-wider text-xs">
                  Timeline
                </th>
                <th className="px-8 py-5 font-medium uppercase tracking-wider text-xs">
                  Impact Limit
                </th>
                <th className="px-8 py-5 font-medium uppercase tracking-wider text-xs text-right">
                  Command
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {urls.map((url: any) => {
                const currentClicks = url.clicks?.length || 0;
                const limitReached =
                  url.max_clicks && currentClicks >= url.max_clicks;

                return (
                  <tr
                    key={url.short_code}
                    className={`group transition-all duration-300 ${!url.is_active ? "bg-red-500/[0.02] opacity-60" : "hover:bg-white/[0.04]"}`}
                  >
                    {/* Column 1: Short Link */}
                    <td className="px-8 py-5">
                      <a
                        href={`/${url.short_code}`}
                        target="_blank"
                        rel="noreferrer"
                        className={`inline-flex items-center gap-2 font-mono transition-all ${!url.is_active ? "text-red-400 line-through" : "text-white group-hover:text-cyan-400"}`}
                      >
                        /{url.short_code}
                        {url.is_active && (
                          <ExternalLink className="h-3 w-3 opacity-0 transition-opacity group-hover:opacity-100" />
                        )}
                      </a>
                    </td>

                    {/* Column 2: Editable Destination */}
                    <td className="px-8 py-5">
                      {editingUrl === url.short_code ? (
                        <div className="flex items-center gap-2">
                          <input
                            type="url"
                            value={newDest}
                            onChange={(e) => setNewDest(e.target.value)}
                            className="bg-black border border-white/20 rounded-lg px-3 py-1.5 text-white w-64 focus:border-cyan-500 focus:outline-none focus:ring-1 focus:ring-cyan-500 transition-all"
                            autoFocus
                          />
                          <button
                            onClick={() => handleSaveEdit(url.short_code)}
                            disabled={processing === url.short_code}
                            className="p-1.5 text-green-400 hover:bg-green-400/10 rounded-md transition-colors disabled:opacity-50"
                          >
                            <Save className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => setEditingUrl(null)}
                            className="p-1.5 text-red-400 hover:bg-red-400/10 rounded-md transition-colors"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-center gap-3">
                          <div
                            className="max-w-[150px] sm:max-w-[250px] truncate text-zinc-400 transition-colors"
                            title={url.original_url}
                          >
                            {url.original_url}
                          </div>
                          <button
                            onClick={() => {
                              setEditingUrl(url.short_code);
                              setNewDest(url.original_url);
                            }}
                            className="opacity-0 group-hover:opacity-100 transition-opacity text-zinc-500 hover:text-white rounded-md p-1"
                          >
                            <Edit2 className="w-3 h-3" />
                          </button>
                        </div>
                      )}
                    </td>

                    {/* Column 3: Timestamps (NOW SHOWING EXACT TIME) */}
                    <td className="px-8 py-5 text-xs">
                      <div className="flex flex-col gap-1">
                        <span className="text-zinc-400">
                          <span className="text-zinc-600">Init:</span>{" "}
                          {formatTime(url.created_at)}
                        </span>
                        <span className="text-zinc-400">
                          <span className="text-zinc-600">Ping:</span>{" "}
                          {url.last_accessed_at
                            ? formatTime(url.last_accessed_at)
                            : "Pending"}
                        </span>
                      </div>
                    </td>

                    {/* Column 4: Max Clicks limit */}
                    <td className="px-8 py-5">
                      <div
                        className={`flex items-center gap-2 ${limitReached ? "text-red-400 font-bold" : ""}`}
                      >
                        <span
                          className={
                            limitReached
                              ? "text-red-400"
                              : "text-white font-medium"
                          }
                        >
                          {currentClicks}
                        </span>
                        <span
                          className={
                            limitReached ? "text-red-500/50" : "text-zinc-600"
                          }
                        >
                          /
                        </span>
                        <span
                          className={
                            limitReached
                              ? "text-red-400"
                              : "text-zinc-400 font-mono"
                          }
                        >
                          {url.max_clicks ? url.max_clicks : "∞"}
                        </span>
                      </div>
                    </td>

                    {/* Column 5: Controls */}
                    <td className="px-8 py-5 text-right">
                      <div className="flex items-center justify-end gap-3">
                        <button
                          onClick={() =>
                            handleToggle(url.short_code, url.is_active)
                          }
                          disabled={processing === url.short_code}
                          className={`rounded-full p-2 transition-all active:scale-95 disabled:opacity-50 ${
                            url.is_active
                              ? "text-cyan-400 bg-cyan-400/10 hover:bg-cyan-400/20 border border-cyan-400/20"
                              : "text-red-400 bg-red-400/10 hover:bg-red-400/20 border border-red-400/20"
                          }`}
                          title={url.is_active ? "Disable Link" : "Enable Link"}
                        >
                          {url.is_active ? (
                            <Power className="w-4 h-4" />
                          ) : (
                            <PowerOff className="w-4 h-4" />
                          )}
                        </button>

                        <button
                          onClick={() => setSelectedLink(url)}
                          className="rounded-full border border-white/10 bg-transparent px-4 py-1.5 text-xs font-medium text-white transition-all hover:bg-white/10 hover:scale-105 active:scale-95"
                        >
                          Intel
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* The Glassmorphism Modal Overlay */}
      {selectedLink && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-md animate-in fade-in duration-300"
            onClick={() => setSelectedLink(null)}
          />

          <div className="relative w-full max-w-md rounded-3xl border border-white/10 bg-[#0a0a0a] p-8 shadow-2xl animate-in zoom-in-95 slide-in-from-bottom-4 duration-300 text-white">
            <button
              onClick={() => setSelectedLink(null)}
              className="absolute right-6 top-6 rounded-full bg-white/5 p-2 text-zinc-400 hover:bg-white/10 hover:text-white transition-colors"
            >
              <X className="h-4 w-4" />
            </button>

            <div className="flex items-center gap-3 mb-8">
              <h3 className="text-2xl font-bold tracking-tight">
                Data Profile
              </h3>
              {!selectedLink.is_active && (
                <span className="flex items-center gap-1 rounded-full bg-red-500/10 px-2 py-1 text-[10px] font-bold uppercase tracking-widest text-red-500 border border-red-500/20">
                  <ShieldAlert className="w-3 h-3" /> Offline
                </span>
              )}
            </div>

            <div className="space-y-6">
              <div>
                <p className="mb-2 text-xs font-medium text-zinc-500 uppercase tracking-widest">
                  Routing Alias
                </p>
                <div className="flex items-center justify-between rounded-xl border border-white/10 bg-black p-4 shadow-inner">
                  <span className="font-mono text-cyan-400">
                    {window.location.origin}/{selectedLink.short_code}
                  </span>
                  <button
                    onClick={() => copyToClipboard(selectedLink.short_code)}
                    className="ml-4 rounded-lg bg-white/10 p-2 text-white hover:bg-white/20 transition-all active:scale-95"
                  >
                    {copied ? (
                      <CheckCircle className="h-4 w-4 text-green-400" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </div>

              <div>
                <p className="mb-2 text-xs font-medium text-zinc-500 uppercase tracking-widest">
                  Target Payload
                </p>
                <div className="rounded-xl border border-white/10 bg-white/[0.02] p-4 text-sm text-zinc-400 break-all max-h-32 overflow-y-auto">
                  {selectedLink.original_url}
                </div>
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-white/10">
                <div className="space-y-4">
                  <div>
                    <p className="text-xs font-medium text-zinc-500 uppercase tracking-widest mb-1">
                      Total Impact
                    </p>
                    <p className="text-3xl font-bold">
                      {selectedLink.clicks?.length || 0}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs font-medium text-zinc-500 uppercase tracking-widest mb-1">
                      Last Ping
                    </p>
                    <p className="text-sm font-medium text-zinc-300">
                      {selectedLink.last_accessed_at
                        ? formatTime(selectedLink.last_accessed_at)
                        : "Never accessed"}
                    </p>
                  </div>
                </div>
                <div className="rounded-2xl bg-white p-2 border-4 border-white/5 opacity-90 hover:opacity-100 transition-opacity">
                  <QRCodeSVG
                    value={`${window.location.origin}/${selectedLink.short_code}`}
                    size={80}
                    fgColor="#000000"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
