"use client";

import { useState } from "react";
import { createShortUrl } from "./actions";
import {
  Link as LinkIcon,
  ArrowRight,
  Copy,
  CheckCircle,
  AlertCircle,
  QrCode,
} from "lucide-react";
import { QRCodeSVG } from "qrcode.react";

export default function Home() {
  const [url, setUrl] = useState("");
  const [alias, setAlias] = useState("");
  const [shortCode, setShortCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setShortCode("");

    const formData = new FormData();
    formData.append("url", url);
    formData.append("alias", alias);

    const result = await createShortUrl(formData);

    if (result.error) {
      setError(result.error);
    } else if (result.shortCode) {
      setShortCode(result.shortCode);
      setUrl(""); // Clear form on success
      setAlias("");
    }
    setLoading(false);
  };

  const fullShortUrl =
    typeof window !== "undefined"
      ? `${window.location.origin}/${shortCode}`
      : `/${shortCode}`;

  const copyToClipboard = () => {
    navigator.clipboard.writeText(fullShortUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-6 bg-zinc-950 text-white">
      <div className="w-full max-w-xl space-y-8">
        <div className="text-center space-y-2">
          <h1 className="text-4xl font-bold tracking-tight">
            Advanced Link Engine
          </h1>
          <p className="text-zinc-400">
            Custom aliases, QR codes, and edge routing.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="relative">
            <LinkIcon className="absolute left-3 top-3.5 h-5 w-5 text-zinc-500" />
            <input
              type="url"
              required
              placeholder="Paste your long URL here..."
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              className="w-full rounded-lg border border-zinc-800 bg-zinc-900 px-10 py-3 text-white placeholder-zinc-500 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 transition-all"
            />
          </div>

          <div className="flex gap-4 flex-col sm:flex-row">
            <div className="relative flex-1">
              <span className="absolute left-3 top-3 text-zinc-500 font-mono text-sm">
                /
              </span>
              <input
                type="text"
                placeholder="custom-alias (optional)"
                value={alias}
                onChange={(e) => setAlias(e.target.value)}
                className="w-full rounded-lg border border-zinc-800 bg-zinc-900 px-8 py-3 text-white placeholder-zinc-600 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 font-mono text-sm transition-all"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="flex items-center justify-center rounded-lg bg-blue-600 px-8 py-3 font-medium hover:bg-blue-700 disabled:opacity-50 transition-colors sm:w-auto w-full"
            >
              {loading ? "Processing..." : "Shorten"}
              <ArrowRight className="ml-2 h-4 w-4" />
            </button>
          </div>

          {error && (
            <div className="flex items-center text-red-400 text-sm mt-2 bg-red-400/10 p-3 rounded-lg border border-red-400/20">
              <AlertCircle className="w-4 h-4 mr-2" />
              {error}
            </div>
          )}
        </form>

        {shortCode && (
          <div className="mt-8 rounded-xl border border-zinc-800 bg-zinc-900/50 p-6 shadow-2xl backdrop-blur-sm animate-in fade-in slide-in-from-bottom-4 duration-500">
            <h3 className="mb-4 text-sm font-medium text-zinc-400 uppercase tracking-wider">
              Your Link is Ready
            </h3>

            <div className="flex flex-col sm:flex-row gap-6 items-center">
              {/* QR Code Display */}
              <div className="bg-white p-3 rounded-xl shadow-inner flex-shrink-0">
                <QRCodeSVG
                  value={fullShortUrl}
                  size={120}
                  bgColor={"#ffffff"}
                  fgColor={"#000000"}
                  level={"Q"}
                  includeMargin={false}
                />
              </div>

              <div className="flex-1 w-full space-y-4">
                <div className="flex items-center justify-between rounded-lg bg-black p-4 border border-zinc-800 shadow-inner">
                  <span className="text-blue-400 font-mono truncate mr-4">
                    {fullShortUrl}
                  </span>
                  <button
                    onClick={copyToClipboard}
                    className="flex-shrink-0 rounded-md bg-zinc-800 p-2 text-zinc-300 hover:bg-zinc-700 hover:text-white transition-colors"
                    title="Copy to clipboard"
                  >
                    {copied ? (
                      <CheckCircle className="h-5 w-5 text-green-500" />
                    ) : (
                      <Copy className="h-5 w-5" />
                    )}
                  </button>
                </div>
                <p className="text-xs text-zinc-500 flex items-center">
                  <QrCode className="w-3 h-3 mr-1" /> Scan the QR code or copy
                  the link to share.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
