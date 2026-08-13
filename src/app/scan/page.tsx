"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/navigation/Navbar";
import QRScanner from "@/components/scanner/QRScanner";
import ClaimPassportOverlay from "@/components/navigation/ClaimPassportOverlay";
import { useSessionStore } from "@/store/session-store";
import Image from "next/image";

export default function ScanPage() {
  const router = useRouter();
  const { builder, isAuthenticated, checkSession, isLoading } = useSessionStore();

  useEffect(() => {
    checkSession();
  }, [checkSession]);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push("/");
    }
  }, [isAuthenticated, isLoading, router]);

  return (
    <div className="flex flex-col min-h-screen bg-hh-green-dark text-white relative paper-texture overflow-hidden">
      <Navbar />

      <div className="flex-grow flex flex-col justify-center items-center py-12 px-4 relative z-20">
        {isLoading ? (
          <div className="text-center font-mono text-xs uppercase tracking-wider text-hh-yellow flex items-center gap-2">
            <svg className="animate-spin h-5 w-5 text-hh-yellow" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            Checking session...
          </div>
        ) : isAuthenticated && builder && !builder.claimed ? (
          <ClaimPassportOverlay />
        ) : (
          <QRScanner />
        )}
      </div>

    </div>
  );
}
