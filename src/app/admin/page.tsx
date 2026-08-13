"use client";

import { useState } from "react";
import Image from "next/image";
import { Shield, Lock, Eye, Trash2, ToggleLeft, ToggleRight, Loader2, CheckCircle } from "lucide-react";
import Navbar from "@/components/navigation/Navbar";

export default function AdminPage() {
  const [passcode, setPasscode] = useState("");
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [adminData, setAdminData] = useState<any | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!passcode) return;
    setErrorMsg(null);
    setLoading(true);

    try {
      const res = await fetch("/api/admin", {
        headers: {
          "x-admin-secret": passcode,
        },
      });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Invalid passcode.");
      }

      setAdminData(data);
      setIsAuthenticated(true);
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || "Failed to authenticate.");
    } finally {
      setLoading(false);
    }
  };

  const toggleFeature = async (featureName: string, currentValue: boolean) => {
    setActionLoading(featureName);
    try {
      const res = await fetch("/api/admin", {
        method: "POST",
        headers: {
          "x-admin-secret": passcode,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          action: "toggle-feature",
          feature: featureName,
          value: !currentValue,
        }),
      });

      if (res.ok) {
        // Refresh data
        const refreshRes = await fetch("/api/admin", {
          headers: { "x-admin-secret": passcode },
        });
        const data = await refreshRes.json();
        setAdminData(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setActionLoading(null);
    }
  };

  const deleteBuilder = async (builderId: string, builderName: string) => {
    if (!confirm(`Are you absolutely sure you want to delete ${builderName} and all their connections? This cannot be undone.`)) {
      return;
    }
    setActionLoading(builderId);
    try {
      const res = await fetch("/api/admin", {
        method: "POST",
        headers: {
          "x-admin-secret": passcode,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          action: "delete-builder",
          builderId,
        }),
      });

      if (res.ok) {
        // Refresh data
        const refreshRes = await fetch("/api/admin", {
          headers: { "x-admin-secret": passcode },
        });
        const data = await refreshRes.json();
        setAdminData(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setActionLoading(null);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-hh-green-dark text-white relative paper-texture overflow-hidden pb-12">
      <Navbar />

      <main className="flex-grow max-w-5xl mx-auto w-full px-4 py-12 relative z-20 flex flex-col justify-center items-center">
        
        {!isAuthenticated ? (
          /* Login Form */
          <form
            onSubmit={handleLogin}
            className="bg-white text-hh-ink brutalist-border border-3 p-6 md:p-8 max-w-md w-full shadow-[6px_6px_0px_var(--hh-pink)] flex flex-col gap-6"
          >
            <div className="bg-hh-pink border-3 border-hh-ink p-4 rotate-[-1deg] shadow-[3px_3px_0px_var(--hh-ink)] text-white text-center">
              <Shield size={36} className="mx-auto mb-2" />
              <h2 className="font-serif text-2xl font-black uppercase tracking-tight">
                ORGANIZER PORTAL
              </h2>
              <p className="font-mono text-[10px] mt-1 uppercase text-hh-yellow font-bold">
                Passcode Verification Required
              </p>
            </div>

            <div className="flex flex-col gap-2">
              <label className="font-mono text-sm font-extrabold uppercase">Enter Admin Passcode</label>
              <div className="relative">
                <input
                  type="password"
                  placeholder="••••••••"
                  value={passcode}
                  onChange={(e) => setPasscode(e.target.value)}
                  className="w-full p-3 pl-10 border-3 border-hh-ink font-bold focus:outline-none focus:bg-hh-yellow/5"
                />
                <Lock size={18} className="absolute left-3.5 top-4 text-hh-ink/50" />
              </div>
            </div>

            {errorMsg && (
              <div className="text-hh-pink font-bold text-sm bg-red-50 p-3 border-2 border-hh-pink text-center">
                {errorMsg}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 brutalist-button flex items-center justify-center gap-2 cursor-pointer"
            >
              {loading ? <Loader2 className="animate-spin" size={18} /> : "ACCESS DASHBOARD"}
            </button>
          </form>
        ) : (
          /* Admin Dashboard Layout */
          <div className="w-full flex flex-col gap-8">
            <div className="bg-hh-yellow text-hh-ink brutalist-border border-3 p-6 shadow-[5px_5px_0px_var(--hh-ink)] flex flex-col md:flex-row justify-between items-center gap-4">
              <div>
                <h1 className="font-serif text-3xl md:text-5xl font-black uppercase leading-none">
                  ADMIN MODERATION
                </h1>
                <p className="font-mono text-xs font-bold uppercase tracking-wider text-hh-pink mt-1">
                  Hacker House Goa 2026 Admin Controls
                </p>
              </div>
              <div className="font-mono text-xs font-bold uppercase bg-white border-2 border-hh-ink px-3 py-1.5 shadow-[2px_2px_0px_var(--hh-ink)]">
                🟢 Session Verified
              </div>
            </div>

            {/* Stats section */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="bg-white text-hh-ink brutalist-border border-3 p-6 shadow-[4px_4px_0px_var(--hh-ink)] text-center">
                <h4 className="font-mono text-xs font-bold uppercase text-hh-ink/60">Total Registered Builders</h4>
                <h2 className="font-serif text-4xl md:text-5xl font-black mt-2">{adminData?.stats?.totalBuilders}</h2>
              </div>
              <div className="bg-white text-hh-ink brutalist-border border-3 p-6 shadow-[4px_4px_0px_var(--hh-ink)] text-center">
                <h4 className="font-mono text-xs font-bold uppercase text-hh-ink/60">Total Connections Scanned</h4>
                <h2 className="font-serif text-4xl md:text-5xl font-black mt-2">{adminData?.stats?.totalConnections}</h2>
              </div>
            </div>

            {/* Feature Toggles */}
            <div className="bg-white text-hh-ink brutalist-border border-3 p-6 shadow-[5px_5px_0px_var(--hh-ink)] flex flex-col gap-4">
              <h3 className="font-serif text-2xl font-black uppercase border-b-3 border-hh-ink pb-2 mb-2">
                EVENT FEATURE TOGGLES
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Connection toggle */}
                <div className="flex justify-between items-center p-3 border-2 border-hh-ink bg-hh-yellow/5">
                  <div className="flex flex-col">
                    <span className="font-bold text-sm uppercase">Connections API</span>
                    <span className="text-[10px] text-hh-ink/60">Enable builder QR pairing</span>
                  </div>
                  <button
                    onClick={() => toggleFeature("connectionsEnabled", adminData?.event?.settings?.connectionsEnabled)}
                    disabled={actionLoading === "connectionsEnabled"}
                    className="cursor-pointer text-hh-green"
                  >
                    {adminData?.event?.settings?.connectionsEnabled ? (
                      <ToggleRight size={44} className="text-hh-green fill-hh-green/10" />
                    ) : (
                      <ToggleLeft size={44} className="text-gray-400" />
                    )}
                  </button>
                </div>

                {/* Leaderboard toggle */}
                <div className="flex justify-between items-center p-3 border-2 border-hh-ink bg-hh-yellow/5">
                  <div className="flex flex-col">
                    <span className="font-bold text-sm uppercase">Leaderboard Page</span>
                    <span className="text-[10px] text-hh-ink/60">Show connectors list</span>
                  </div>
                  <button
                    onClick={() => toggleFeature("leaderboardEnabled", adminData?.event?.settings?.leaderboardEnabled)}
                    disabled={actionLoading === "leaderboardEnabled"}
                    className="cursor-pointer"
                  >
                    {adminData?.event?.settings?.leaderboardEnabled ? (
                      <ToggleRight size={44} className="text-hh-green fill-hh-green/10" />
                    ) : (
                      <ToggleLeft size={44} className="text-gray-400" />
                    )}
                  </button>
                </div>

                {/* Network toggle */}
                <div className="flex justify-between items-center p-3 border-2 border-hh-ink bg-hh-yellow/5">
                  <div className="flex flex-col">
                    <span className="font-bold text-sm uppercase">Network Panel</span>
                    <span className="text-[10px] text-hh-ink/60">Allow My Network tabs</span>
                  </div>
                  <button
                    onClick={() => toggleFeature("networkEnabled", adminData?.event?.settings?.networkEnabled)}
                    disabled={actionLoading === "networkEnabled"}
                    className="cursor-pointer"
                  >
                    {adminData?.event?.settings?.networkEnabled ? (
                      <ToggleRight size={44} className="text-hh-green fill-hh-green/10" />
                    ) : (
                      <ToggleLeft size={44} className="text-gray-400" />
                    )}
                  </button>
                </div>
              </div>
            </div>

            {/* Builder profiles moderation list */}
            <div className="bg-white text-hh-ink brutalist-border border-3 p-6 shadow-[5px_5px_0px_var(--hh-ink)] flex flex-col gap-4">
              <h3 className="font-serif text-2xl font-black uppercase border-b-3 border-hh-ink pb-2 mb-2">
                BUILDERS DIRECTORY
              </h3>

              <div className="overflow-x-auto">
                <table className="w-full text-left font-bold text-sm border-collapse">
                  <thead>
                    <tr className="border-b-3 border-hh-ink text-xs uppercase font-black text-hh-ink/60 bg-hh-yellow/10">
                      <th className="p-3">Name / Title</th>
                      <th className="p-3">Role / Stack</th>
                      <th className="p-3 text-center">Connections</th>
                      <th className="p-3 text-center">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {adminData?.builders?.map((b: any) => (
                      <tr key={b.id} className="border-b border-hh-ink/10 hover:bg-hh-yellow/5">
                        <td className="p-3">
                          <div className="font-serif uppercase text-base font-black">{b.name}</div>
                          <div className="text-[10px] font-mono font-bold text-hh-pink">{b.builderTitle}</div>
                        </td>
                        <td className="p-3">
                          <div className="text-xs uppercase">{b.role}</div>
                          <div className="text-[10px] font-mono font-bold text-hh-green-light">{b.stack}</div>
                        </td>
                        <td className="p-3 text-center font-mono">{b.connectionCount}</td>
                        <td className="p-3 text-center flex justify-center gap-2">
                          <a
                            href={`/builder/${b.publicId}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-1.5 bg-hh-yellow border-2 border-hh-ink hover:translate-y-[-1px] shadow-[1px_1px_0px_var(--hh-ink)]"
                            title="View Profile"
                          >
                            <Eye size={14} />
                          </a>
                          <button
                            onClick={() => deleteBuilder(b.id, b.name)}
                            disabled={actionLoading === b.id}
                            className="p-1.5 bg-hh-pink text-white border-2 border-hh-ink hover:translate-y-[-1px] shadow-[1px_1px_0px_var(--hh-ink)] cursor-pointer disabled:opacity-50"
                            title="Delete Builder"
                          >
                            {actionLoading === b.id ? (
                              <Loader2 className="animate-spin" size={14} />
                            ) : (
                              <Trash2 size={14} />
                            )}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

      </main>

      
    </div>
  );
}
