"use client";

import { useState } from "react";
import { Shield, Lock, Eye, EyeOff, CheckCircle, RefreshCw } from "lucide-react";
import { useSessionStore } from "@/store/session-store";

export default function ClaimPassportOverlay() {
  const { setSession } = useSessionStore();
  const [passcode, setPasscode] = useState("");
  const [confirmPasscode, setConfirmPasscode] = useState("");
  const [showPasscode, setShowPasscode] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleClaim = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    // Validate inputs
    if (passcode.length < 4 || passcode.length > 10) {
      setErrorMsg("Passcode must be between 4 and 10 characters long.");
      return;
    }
    if (passcode !== confirmPasscode) {
      setErrorMsg("Passcodes do not match.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/builders/claim", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ passcode }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to secure profile.");
      }

      setSuccess(true);
      setTimeout(() => {
        // Update Zustand global session state
        setSession(data.builder);
      }, 1500);
    } catch (err: unknown) {
      console.error(err);
      const errMsg = err instanceof Error ? err.message : "An unexpected error occurred.";
      setErrorMsg(errMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto px-4 relative z-20">
      <div className="bg-white text-hh-ink brutalist-border border-3 p-6 md:p-8 shadow-[6px_6px_0px_var(--hh-yellow)] flex flex-col gap-6">
        
        {success ? (
          /* Success Screen */
          <div className="text-center py-6 flex flex-col items-center gap-4 animate-pulse-slow">
            <div className="bg-hh-green text-white brutalist-border border-2 p-3 rounded-full shadow-[2px_2px_0px_var(--hh-ink)] rotate-[-4deg]">
              <CheckCircle size={36} />
            </div>
            <h3 className="font-serif text-2xl font-black uppercase">PASSPORT SECURED!</h3>
            <p className="text-sm font-sans font-bold text-hh-ink/75 leading-relaxed">
              Your passcode has been hashed and stored securely. Opening networking layer...
            </p>
          </div>
        ) : (
          /* Setup Form */
          <form onSubmit={handleClaim} className="flex flex-col gap-5">
            <div className="bg-hh-yellow border-3 border-hh-ink p-4 rotate-[-1deg] shadow-[3px_3px_0px_var(--hh-ink)] text-center">
              <Shield size={32} className="mx-auto mb-2" />
              <h2 className="font-serif text-2xl font-black uppercase tracking-tight">
                SECURE PASSPORT
              </h2>
              <p className="font-mono text-[9px] mt-1 uppercase text-hh-pink font-bold">
                Identity Passcode Verification Setup
              </p>
            </div>

            <div className="text-xs font-bold leading-relaxed text-hh-ink/70 bg-hh-yellow/5 border-2 border-dashed border-hh-ink/20 p-3 rounded-none">
              ⚡ To participate in the **Hacker House Goa Networking Layer**, you must secure your profile with a passcode. This prevents session hijacking and lets you recover your connections if your session expires.
            </div>

            {/* Passcode Input */}
            <div className="flex flex-col gap-1.5">
              <label className="font-mono text-xs font-extrabold uppercase flex justify-between">
                <span>1. Setup Passcode (4-10 digits/chars)</span>
              </label>
              <div className="relative">
                <input
                  type={showPasscode ? "text" : "password"}
                  placeholder="e.g. 123456"
                  value={passcode}
                  onChange={(e) => setPasscode(e.target.value)}
                  disabled={loading}
                  className="w-full p-3 pl-10 pr-10 border-3 border-hh-ink font-bold focus:outline-none focus:bg-hh-yellow/5"
                  required
                />
                <Lock size={16} className="absolute left-3.5 top-4 text-hh-ink/50" />
                <button
                  type="button"
                  onClick={() => setShowPasscode(!showPasscode)}
                  className="absolute right-3 top-3.5 text-hh-ink/50 hover:text-hh-ink cursor-pointer"
                >
                  {showPasscode ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {/* Confirm Input */}
            <div className="flex flex-col gap-1.5">
              <label className="font-mono text-xs font-extrabold uppercase">
                2. Confirm Passcode
              </label>
              <div className="relative">
                <input
                  type={showPasscode ? "text" : "password"}
                  placeholder="Re-enter your passcode"
                  value={confirmPasscode}
                  onChange={(e) => setConfirmPasscode(e.target.value)}
                  disabled={loading}
                  className="w-full p-3 pl-10 border-3 border-hh-ink font-bold focus:outline-none focus:bg-hh-yellow/5"
                  required
                />
                <Lock size={16} className="absolute left-3.5 top-4 text-hh-ink/50" />
              </div>
            </div>

            {errorMsg && (
              <div className="text-hh-pink font-bold text-xs bg-red-50 p-2 border-2 border-hh-pink text-center">
                {errorMsg}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 text-lg brutalist-button cursor-pointer flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <RefreshCw className="animate-spin" size={18} />
                  SECURING PROFILE...
                </>
              ) : (
                "SECURE & ENABLE NETWORKING"
              )}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
