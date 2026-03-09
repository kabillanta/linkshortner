"use client";

import { useState } from "react";
import {
  MousePointerClick,
  Calendar,
  ExternalLink,
  X,
  Copy,
  CheckCircle,
  QrCode,
} from "lucide-react";
import { QRCodeSVG } from "qrcode.react";

export default function DashboardClient({ urls }: { urls: any[] }) {
  const [selectedLink, setSelectedLink] = useState<any | null>(null);
  const [copied, setCopied] = useState(false);

  const copyToClipboard = (shortCode: string) => {
    const fullUrl = `${window.location.origin}/${shortCode}`;
    navigator.clipboard.writeText(fullUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <>
      {/* The Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm whitespace-nowrap">
          <thead className="bg-zinc-950/50 text-zinc-400">
            <tr>
              <th className="px-6 py-4 font-medium">Short Link</th>
              <th className="px-6 py-4 font-medium">Original Destination</th>
              <th className="px-6 py-4 font-medium">Total Clicks</th>
              <th className="px-6 py-4 font-medium text-right">Details</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-800">
            {urls?.map((url: any) => (
              <tr
                key={url.short_code}
                className="hover:bg-zinc-800/30 transition-colors"
              >
                <td className="px-6 py-4">
                  <a
                    href={`/${url.short_code}`}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-2 font-mono text-blue-400 hover:text-blue-300 transition-colors"
                  >
                    /{url.short_code}
                    <ExternalLink className="h-3 w-3" />
                  </a>
                </td>
                <td className="px-6 py-4">
                  <div
                    className="max-w-[200px] sm:max-w-[300px] truncate text-zinc-300"
                    title={url.original_url}
                  >
                    {url.original_url}
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="inline-flex items-center gap-2 rounded-full bg-zinc-800 px-3 py-1 text-zinc-300">
                    <MousePointerClick className="h-3 w-3 text-zinc-500" />
                    <span className="font-medium">
                      {url.clicks?.length || 0}
                    </span>
                  </div>
                </td>
                <td className="px-6 py-4 text-right">
                  <button
                    onClick={() => setSelectedLink(url)}
                    className="rounded-lg bg-zinc-800 px-4 py-2 text-xs font-medium text-white hover:bg-zinc-700 transition-colors"
                  >
                    View Details
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* The Modal Overlay */}
      {selectedLink && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm animate-in fade-in duration-200">
          {/* Modal Content */}
          <div className="w-full max-w-lg rounded-2xl border border-zinc-800 bg-zinc-950 p-6 shadow-2xl relative animate-in zoom-in-95 duration-200 text-white">
            {/* Close Button */}
            <button
              onClick={() => setSelectedLink(null)}
              className="absolute right-4 top-4 rounded-full p-1 text-zinc-400 hover:bg-zinc-800 hover:text-white transition-colors"
            >
              <X className="h-5 w-5" />
            </button>

            <h3 className="mb-6 text-xl font-bold">Link Details</h3>

            <div className="space-y-6">
              {/* Short Link & Copy */}
              <div>
                <p className="mb-2 text-sm font-medium text-zinc-400">
                  Short Link
                </p>
                <div className="flex items-center justify-between rounded-lg border border-zinc-800 bg-black p-3">
                  <span className="font-mono text-blue-400 text-sm">
                    {typeof window !== "undefined"
                      ? window.location.origin
                      : ""}
                    /{selectedLink.short_code}
                  </span>
                  <button
                    onClick={() => copyToClipboard(selectedLink.short_code)}
                    className="ml-4 rounded-md bg-zinc-800 p-2 text-zinc-300 hover:bg-zinc-700 hover:text-white"
                  >
                    {copied ? (
                      <CheckCircle className="h-4 w-4 text-green-500" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </div>

              {/* Original URL (Full text, breaks nicely) */}
              <div>
                <p className="mb-2 text-sm font-medium text-zinc-400">
                  Original Destination
                </p>
                <div className="rounded-lg border border-zinc-800 bg-zinc-900 p-3 text-sm text-zinc-300 break-all max-h-32 overflow-y-auto">
                  {selectedLink.original_url}
                </div>
              </div>

              {/* Stats & QR Code Flexbox */}
              <div className="flex items-center justify-between gap-4 rounded-lg border border-zinc-800 bg-zinc-900/50 p-4">
                <div className="space-y-4">
                  <div>
                    <p className="text-xs text-zinc-500">Total Clicks</p>
                    <p className="text-2xl font-bold flex items-center gap-2">
                      <MousePointerClick className="h-5 w-5 text-blue-500" />
                      {selectedLink.clicks?.length || 0}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-zinc-500">Created On</p>
                    <p className="text-sm font-medium flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-zinc-400" />
                      {new Date(selectedLink.created_at).toLocaleDateString(
                        "en-US",
                        {
                          month: "long",
                          day: "numeric",
                          year: "numeric",
                        },
                      )}
                    </p>
                  </div>
                </div>

                {/* QR Code in Modal */}
                <div className="rounded-xl bg-white p-2 shadow-inner">
                  <QRCodeSVG
                    value={`${typeof window !== "undefined" ? window.location.origin : ""}/${selectedLink.short_code}`}
                    size={80}
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
