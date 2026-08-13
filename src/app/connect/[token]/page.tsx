"use client";

import { useEffect, useState, use } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { Users, Shield, PlusCircle, AlertCircle, Loader2 } from "lucide-react";
import Navbar from "@/components/navigation/Navbar";
import { useSessionStore } from "@/store/session-store";

export default function ConnectPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = use(params);
  const router = useRouter();
  const { builder: currentUser, isAuthenticated, checkSession } = useSessionStore();

  const [targetBuilder, setTargetBuilder] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [connecting, setConnecting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [connectionSuccess, setConnectionSuccess] = useState<any | null>(null);

  useEffect(() => {
    checkSession();
    fetchTargetProfile();
  }, [token, checkSession]);

  const fetchTargetProfile = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/builders/token/${token}`);
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to load builder profile.");
      }
      setTargetBuilder(data.builder);
    } catch (err: any) {
      console.error(err);
      setErrorMessage(err.message || "Failed to load builder profile.");
    } finally {
      setLoading(false);
    }
  };

  const handleConnect = async () => {
    if (!isAuthenticated) return;
    setConnecting(true);
    setErrorMessage(null);

    try {
      const res = await fetch("/api/connections", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ connectionToken: token }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to connect.");
      }

      setConnectionSuccess(data.target);
    } catch (err: any) {
      console.error(err);
      setErrorMessage(err.message || "Connection failed.");
    } finally {
      setConnecting(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-hh-green-dark text-white relative paper-texture overflow-hidden">
      <Navbar />

      <div className="flex-grow flex flex-col justify-center items-center py-12 px-4 relative z-20">
        <AnimatePresence mode="wait">
          {loading ? (
            <motion.div
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center gap-4 text-center"
            >
              <Loader2 className="animate-spin text-hh-yellow" size={40} />
              <p className="font-mono text-sm uppercase text-hh-yellow tracking-wider">
                Resolving Builder Passport...
              </p>
            </motion.div>
          ) : errorMessage && !connectionSuccess ? (
            <motion.div
              key="error"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white text-hh-ink brutalist-border border-3 p-6 max-w-md w-full shadow-[6px_6px_0px_var(--hh-pink)] text-center flex flex-col items-center gap-4"
            >
              <AlertCircle size={44} className="text-hh-pink" />
              <h3 className="font-serif text-2xl font-black uppercase text-hh-ink">
                PROFILE ERROR
              </h3>
              <p className="font-sans font-bold text-hh-ink/75 leading-relaxed text-sm">
                {errorMessage}
              </p>
              <button
                onClick={() => router.push("/")}
                className="w-full py-3 brutalist-button cursor-pointer"
              >
                BACK TO LOBBY
              </button>
            </motion.div>
          ) : connectionSuccess ? (
            /* Celebration Overlay */
            <motion.div
              key="success"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white text-hh-ink brutalist-border border-3 p-8 max-w-md w-full shadow-[8px_8px_0px_var(--hh-yellow)] text-center flex flex-col items-center gap-6"
            >
              <div className="bg-hh-yellow brutalist-border border-2 p-4 rounded-full text-5xl rotate-[-5deg] animate-bounce shadow-[3px_3px_0px_var(--hh-ink)]">
                🤝
              </div>
              <div>
                <span className="font-mono text-xs font-black uppercase tracking-wider text-hh-pink bg-hh-pink/15 px-3 py-1 rounded-full inline-block mb-2">
                  New connection made
                </span>
                <h3 className="font-serif text-3xl font-black uppercase text-hh-ink leading-tight">
                  YOU MET A BUILDER!
                </h3>
                <h4 className="font-sans text-xl font-extrabold text-hh-green-dark mt-3">
                  {connectionSuccess.name}
                </h4>
                <p className="font-mono text-sm text-hh-pink font-bold mt-1">
                  {connectionSuccess.builderTitle}
                </p>
              </div>

              {/* Connected image card preview */}
              <div className="relative w-48 h-72 border-3 border-hh-ink shadow-[4px_4px_0px_var(--hh-ink)] overflow-hidden bg-hh-green">
                <Image
                  src={connectionSuccess.cardUrl}
                  alt={connectionSuccess.name}
                  fill
                  className="object-cover"
                />
              </div>

              <div className="flex flex-col gap-3 w-full mt-4">
                <button
                  onClick={() => router.push("/network")}
                  className="w-full py-4 brutalist-button flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Users size={18} />
                  VIEW MY NETWORK
                </button>
                <button
                  onClick={() => router.push("/scan")}
                  className="w-full py-3 brutalist-button-pink text-sm flex items-center justify-center gap-2 cursor-pointer"
                >
                  KEEP SCANNING
                </button>
              </div>
            </motion.div>
          ) : (
            /* Connection confirmation interface */
            <motion.div
              key="connect-profile"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white text-hh-ink brutalist-border border-3 p-6 md:p-8 max-w-lg w-full shadow-[6px_6px_0px_var(--hh-yellow)] flex flex-col gap-6"
            >
              <div className="bg-hh-yellow border-3 border-hh-ink p-4 rotate-[-1deg] shadow-[3px_3px_0px_var(--hh-ink)] text-center">
                <h2 className="font-serif text-3xl font-black uppercase tracking-tight">
                  BUILDER DETECTED
                </h2>
              </div>

              {/* Target Builder Card Preview */}
              <div className="flex flex-col md:flex-row gap-6 items-center border-3 border-hh-ink p-4 bg-hh-yellow/5">
                <div className="relative w-36 h-56 border-2 border-hh-ink shrink-0 bg-hh-green shadow-[3px_3px_0px_var(--hh-ink)]">
                  <Image
                    src={targetBuilder.cardUrl}
                    alt={targetBuilder.name}
                    fill
                    className="object-cover"
                  />
                </div>
                <div className="flex-1 flex flex-col text-center md:text-left gap-1">
                  <span className="font-mono text-xs uppercase bg-hh-pink text-white px-2 py-0.5 w-fit font-bold rounded-none mx-auto md:mx-0 shadow-[1px_1px_0px_var(--hh-ink)] rotate-[-1deg]">
                    {targetBuilder.role}
                  </span>
                  <h3 className="font-serif text-2xl font-black uppercase tracking-tight leading-tight text-hh-ink mt-1">
                    {targetBuilder.name}
                  </h3>
                  <p className="font-sans text-xs font-bold text-hh-green-dark">
                    {targetBuilder.builderTitle}
                  </p>
                  <p className="font-mono text-xs font-extrabold uppercase mt-2 text-hh-ink/75">
                    Stack: {targetBuilder.stack}
                  </p>
                  {targetBuilder.city && (
                    <p className="font-sans text-xs font-medium text-hh-ink/60">
                      From: {targetBuilder.city}
                    </p>
                  )}
                  <p className="font-sans text-xs font-extrabold text-hh-pink mt-2">
                    ⚡ {targetBuilder.connectionCount} connections
                  </p>
                </div>
              </div>

              {/* Action Rules Trigger */}
              {!isAuthenticated ? (
                /* Prompt to register first */
                <div className="bg-hh-pink/10 border-3 border-hh-pink p-5 text-center flex flex-col items-center gap-3">
                  <AlertCircle size={32} className="text-hh-pink animate-pulse" />
                  <h4 className="font-serif text-xl font-bold uppercase text-hh-ink">
                    PASSPORT REQUIRED
                  </h4>
                  <p className="font-sans text-sm font-bold text-hh-ink/80 leading-relaxed">
                    Create your own Hacker House Goa Builder ID passport first before connecting with {targetBuilder.name}!
                  </p>
                  <button
                    onClick={() => router.push("/create")}
                    className="mt-2 w-full py-4 text-base brutalist-button flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <PlusCircle size={18} />
                    CREATE MY BUILDER ID
                  </button>
                </div>
              ) : currentUser?.id === targetBuilder.id ? (
                /* Block self connect */
                <div className="bg-red-50 border-3 border-red-500 p-5 text-center flex flex-col items-center gap-2 text-red-700">
                  <AlertCircle size={32} />
                  <h4 className="font-serif text-xl font-bold uppercase">SELF DETECTION</h4>
                  <p className="font-sans text-sm font-bold leading-relaxed">
                    This is your own QR code passport! You cannot connect with yourself.
                  </p>
                  <button
                    onClick={() => router.push("/network")}
                    className="mt-2 w-full py-3 brutalist-button cursor-pointer"
                  >
                    GO TO NETWORK DASHBOARD
                  </button>
                </div>
              ) : (
                /* Authenticated connection prompt */
                <div className="flex flex-col gap-3">
                  <button
                    onClick={handleConnect}
                    disabled={connecting}
                    className="w-full py-5 text-xl brutalist-button flex items-center justify-center gap-2 cursor-pointer"
                  >
                    {connecting ? (
                      <>
                        <Loader2 className="animate-spin" size={22} />
                        CONNECTING...
                      </>
                    ) : (
                      `CONNECT WITH ${targetBuilder.name.toUpperCase()}`
                    )}
                  </button>
                  <button
                    onClick={() => router.push("/scan")}
                    disabled={connecting}
                    className="w-full py-3 brutalist-button-pink text-sm cursor-pointer"
                  >
                    CANCEL SCAN
                  </button>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      
    </div>
  );
}
