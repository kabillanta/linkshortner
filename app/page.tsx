"use client";

import { useState } from "react";
import { createShortUrl } from "./actions";
import {
  Link2,
  ArrowRight,
  Copy,
  CheckCircle,
  AlertCircle,
  LayoutGrid,
  QrCode,
  ShieldAlert,
} from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
import Link from "next/link";
import SignOutButton from "@/components/SignOutButton";

export default function Home() {
  const [url, setUrl] = useState("");
  const [alias, setAlias] = useState("");
  const [maxClicks, setMaxClicks] = useState(""); // NEW: State for click limit
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
    if (maxClicks) formData.append("maxClicks", maxClicks); // NEW: Send limit to backend

    const result = await createShortUrl(formData);

    if (result.error) {
      setError(result.error);
    } else if (result.shortCode) {
      setShortCode(result.shortCode);
      setUrl("");
      setAlias("");
      setMaxClicks("");
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
    <main className="relative flex min-h-screen flex-col items-center justify-center bg-black text-white selection:bg-white/30 overflow-hidden font-sans">
      {/* Background Radial Glow */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-white/[0.02] rounded-full blur-[120px] pointer-events-none" />

      {/* Top Navbar */}
      <nav className="absolute top-0 w-full border-b border-white/5 bg-transparent z-40">
        <div className="mx-auto max-w-7xl flex items-center justify-between px-6 py-5">
          <div className="flex items-center gap-2">
            <div className="bg-white text-black p-1.5 rounded-full">
              <Link2 className="h-5 w-5" />
            </div>
            <span className="text-xl font-bold tracking-tight">Cognito</span>
          </div>
          <div className="flex items-center gap-3">
            <Link
              href="/dashboard"
              className="flex items-center gap-2 rounded-full border border-white/10 bg-black px-5 py-2 text-sm font-medium text-white hover:bg-white/10 transition-all duration-300"
            >
              <LayoutGrid className="h-4 w-4" />
              Dashboard
            </Link>
            <SignOutButton />
          </div>
        </div>
      </nav>

      <div className="z-10 w-full max-w-4xl px-6 flex flex-col items-center mt-12">
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-700 mb-8 flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-1.5 text-xs font-medium text-zinc-300">
          <span className="relative flex h-1.5 w-1.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-cyan-500"></span>
          </span>
          Neural-Engine Active{" "}
          <ArrowRight className="h-3 w-3 ml-1 opacity-50" />
        </div>

        <div className="text-center space-y-1 mb-10 animate-in fade-in slide-in-from-bottom-6 duration-700 delay-150 fill-mode-both">
          <h1 className="text-6xl md:text-[5.5rem] font-extrabold tracking-tighter leading-none">
            <span className="block text-white">Link shorter.</span>
            <span className="block text-[#666666]">Impact larger.</span>
          </h1>
          <p className="mx-auto max-w-xl text-lg text-[#888888] mt-6 font-medium">
            Strip away the noise. Create concise URLs, track global engagement,
            and dominate your analytics.
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="w-full max-w-2xl animate-in fade-in slide-in-from-bottom-8 duration-700 delay-300 fill-mode-both space-y-4"
        >
          <div className="relative flex items-center w-full rounded-full border border-white/10 bg-[#0A0A0A] p-1.5 transition-all focus-within:border-white/20 focus-within:bg-[#111111]">
            <Link2 className="absolute left-6 h-5 w-5 text-zinc-600" />
            <input
              type="url"
              required
              placeholder="https://your-long-url.com..."
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              className="w-full bg-transparent pl-14 pr-36 py-4 text-white placeholder-zinc-600 focus:outline-none"
            />
            <button
              type="submit"
              disabled={loading}
              className="absolute right-2 flex h-[80%] items-center justify-center rounded-full bg-white px-6 font-medium text-black hover:bg-zinc-200 disabled:opacity-50 transition-all active:scale-95"
            >
              {loading ? "Routing..." : "Shorten"}
              <ArrowRight className="ml-2 h-4 w-4" />
            </button>
          </div>

          {/* NEW: Secondary Inputs (Alias & Limit) */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-6 text-sm opacity-60 focus-within:opacity-100 transition-opacity">
            <div className="flex items-center gap-2">
              <span className="text-zinc-500 font-mono">/</span>
              <input
                type="text"
                placeholder="custom-alias"
                value={alias}
                onChange={(e) => setAlias(e.target.value)}
                className="w-40 border-b border-white/10 bg-transparent py-1 text-white placeholder-zinc-700 focus:border-cyan-500 focus:outline-none transition-colors font-mono text-center"
              />
            </div>

            <div className="hidden sm:block w-px h-4 bg-white/10"></div>

            <div className="flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-zinc-500" />
              <input
                type="number"
                min="1"
                placeholder="Max Clicks (optional)"
                value={maxClicks}
                onChange={(e) => setMaxClicks(e.target.value)}
                className="w-40 border-b border-white/10 bg-transparent py-1 text-white placeholder-zinc-700 focus:border-cyan-500 focus:outline-none transition-colors text-center"
              />
            </div>
          </div>

          {error && (
            <div className="flex items-center justify-center text-red-400 text-sm mt-4 animate-in fade-in">
              <AlertCircle className="w-4 h-4 mr-2" />
              {error}
            </div>
          )}
        </form>

        {/* Modal display code remains the same... */}
        {shortCode && (
          <div className="mt-12 w-full max-w-lg rounded-3xl border border-white/10 bg-white/[0.02] p-6 shadow-2xl backdrop-blur-xl animate-in fade-in slide-in-from-bottom-4 duration-500">
            <h3 className="mb-4 text-xs font-medium text-zinc-500 uppercase tracking-widest text-center">
              Payload Deployed
            </h3>

            <div className="flex flex-col sm:flex-row gap-6 items-center">
              <div className="rounded-2xl bg-white p-2 border-4 border-white/5 flex-shrink-0">
                <QRCodeSVG
                  value={fullShortUrl}
                  size={90}
                  bgColor={"#ffffff"}
                  fgColor={"#000000"}
                  level={"Q"}
                  includeMargin={false}
                />
              </div>

              <div className="flex-1 w-full space-y-4">
                <div className="flex items-center justify-between rounded-xl bg-black p-3 border border-white/10 shadow-inner">
                  <span className="text-white font-mono truncate mr-4 text-sm">
                    {fullShortUrl}
                  </span>
                  <button
                    onClick={copyToClipboard}
                    className="flex-shrink-0 rounded-lg bg-white/10 p-2 text-white hover:bg-white/20 transition-all active:scale-95"
                  >
                    {copied ? (
                      <CheckCircle className="h-4 w-4 text-green-400" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                  </button>
                </div>
                <p className="text-xs text-zinc-500 flex items-center">
                  <QrCode className="w-3 h-3 mr-1" /> Ready for distribution.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
