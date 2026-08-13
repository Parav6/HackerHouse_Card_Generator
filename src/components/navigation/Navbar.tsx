"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X, QrCode, Trophy, Users, Shield, PlusCircle, LogOut, Key, Eye, EyeOff, RefreshCw } from "lucide-react";
import { useSessionStore } from "@/store/session-store";

export default function Navbar() {
  const { builder, isAuthenticated, checkSession, logout, setSession } = useSessionStore();
  const [isOpen, setIsOpen] = useState(false);
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const pathname = usePathname();

  // Login Modal Form State
  const [nameInput, setNameInput] = useState("");
  const [passcodeInput, setPasscodeInput] = useState("");
  const [showPasscode, setShowPasscode] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);
  const [loginLoading, setLoginLoading] = useState(false);

  useEffect(() => {
    checkSession();
  }, [pathname, checkSession]);

  const navLinks = [
    { name: "Create ID", href: "/create", icon: PlusCircle },
    { name: "Leaderboard", href: "/leaderboard", icon: Trophy },
  ];

  if (isAuthenticated && builder) {
    navLinks.push(
      { name: "My Network", href: "/network", icon: Users },
      { name: "Scanner", href: "/scan", icon: QrCode },
      { name: "My ID", href: `/builder/${builder.publicId}`, icon: Shield }
    );
  } else {
    // If not logged in, we still allow them to go to scanner
    navLinks.push({ name: "Scanner", href: "/scan", icon: QrCode });
  }

  const isActive = (href: string) => pathname === href;

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError(null);
    setLoginLoading(true);

    try {
      const res = await fetch("/api/builders/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: nameInput.trim(),
          passcode: passcodeInput,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to reclaim passport.");
      }

      setSession(data.builder);
      setIsLoginOpen(false);
      setNameInput("");
      setPasscodeInput("");
      // Force refresh current route to update pages that require claim verification
      window.location.reload();
    } catch (err: unknown) {
      console.error(err);
      const errMsg = err instanceof Error ? err.message : "An unexpected error occurred.";
      setLoginError(errMsg);
    } finally {
      setLoginLoading(false);
    }
  };

  return (
    <nav className="relative z-50 bg-hh-green brutalist-border border-t-0 border-x-0 border-b-3 px-4 py-3 md:px-8">
      <div className="mx-auto flex max-w-7xl items-center justify-between">
        {/* Brand Logo */}
        <Link href="/" className="group flex items-center gap-2">
          <span className="font-serif text-2xl font-black tracking-tight text-hh-yellow group-hover:text-hh-pink transition-colors">
            HH GOA <span className="font-sans text-xs bg-hh-pink text-white px-2 py-0.5 brutalist-border border-2 font-bold rotate-[-3deg] inline-block shadow-[1px_1px_0px_var(--hh-ink)]">2026</span>
          </span>
        </Link>

        {/* Desktop Menu */}
        <div className="hidden md:flex items-center gap-6">
          {navLinks.map((link) => {
            const Icon = link.icon;
            const active = isActive(link.href);
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`flex items-center gap-1.5 px-3 py-1.5 font-bold uppercase tracking-wider text-sm brutalist-border border-2 transition-all shadow-[2px_2px_0px_var(--hh-ink)] hover:translate-y-[-1px] hover:shadow-[3px_3px_0px_var(--hh-ink)] active:translate-y-[1px] active:shadow-[1px_1px_0px_var(--hh-ink)] ${
                  active
                    ? "bg-hh-yellow text-hh-ink"
                    : "bg-white text-hh-ink hover:bg-hh-yellow/10"
                }`}
              >
                <Icon size={16} />
                {link.name}
              </Link>
            );
          })}

          {!isAuthenticated && (
            <button
              onClick={() => setIsLoginOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 font-bold uppercase tracking-wider text-sm bg-hh-yellow text-hh-ink brutalist-border border-2 shadow-[2px_2px_0px_var(--hh-ink)] hover:translate-y-[-1px] hover:shadow-[3px_3px_0px_var(--hh-ink)] active:translate-y-[1px] active:shadow-[1px_1px_0px_var(--hh-ink)] cursor-pointer"
            >
              <Key size={16} />
              Reclaim ID
            </button>
          )}

          {isAuthenticated && (
            <button
              onClick={() => logout()}
              className="flex items-center gap-1.5 px-3 py-1.5 font-bold uppercase tracking-wider text-sm bg-hh-pink text-white brutalist-border border-2 shadow-[2px_2px_0px_var(--hh-ink)] hover:translate-y-[-1px] hover:shadow-[3px_3px_0px_var(--hh-ink)] active:translate-y-[1px] active:shadow-[1px_1px_0px_var(--hh-ink)] cursor-pointer"
            >
              <LogOut size={16} />
              Logout
            </button>
          )}
        </div>

        {/* Mobile menu button */}
        <div className="md:hidden flex items-center gap-2">
          {!isAuthenticated && (
            <button
              onClick={() => setIsLoginOpen(true)}
              className="p-1.5 bg-hh-yellow text-hh-ink brutalist-border border-2 shadow-[2px_2px_0px_var(--hh-ink)]"
              title="Reclaim ID"
            >
              <Key size={16} />
            </button>
          )}
          {isAuthenticated && (
            <button
              onClick={() => logout()}
              className="p-1.5 bg-hh-pink text-white brutalist-border border-2 shadow-[2px_2px_0px_var(--hh-ink)]"
              title="Logout"
            >
              <LogOut size={16} />
            </button>
          )}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="p-1.5 bg-hh-yellow text-hh-ink brutalist-border border-2 shadow-[2px_2px_0px_var(--hh-ink)]"
          >
            {isOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {isOpen && (
        <div className="absolute top-[100%] left-0 w-full bg-hh-green brutalist-border border-x-0 border-t-0 border-b-3 p-4 md:hidden flex flex-col gap-3 shadow-lg">
          {navLinks.map((link) => {
            const Icon = link.icon;
            const active = isActive(link.href);
            return (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setIsOpen(false)}
                className={`flex items-center gap-3 p-3 font-extrabold uppercase brutalist-border border-2 shadow-[3px_3px_0px_var(--hh-ink)] ${
                  active ? "bg-hh-yellow text-hh-ink" : "bg-white text-hh-ink"
                }`}
              >
                <Icon size={20} />
                {link.name}
              </Link>
            );
          })}
          {!isAuthenticated && (
            <button
              onClick={() => {
                setIsOpen(false);
                setIsLoginOpen(true);
              }}
              className="flex items-center gap-3 p-3 font-extrabold uppercase bg-hh-yellow text-hh-ink brutalist-border border-2 shadow-[3px_3px_0px_var(--hh-ink)] cursor-pointer text-left w-full"
            >
              <Key size={20} />
              Reclaim ID
            </button>
          )}
        </div>
      )}

      {/* Reclaim Passport Login Modal */}
      {isLoginOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white text-hh-ink brutalist-border border-3 p-6 max-w-sm w-full shadow-[8px_8px_0px_var(--hh-yellow)] flex flex-col gap-5 relative">
            <button
              onClick={() => setIsLoginOpen(false)}
              className="absolute top-3 right-3 p-1.5 border-2 border-hh-ink bg-white shadow-[1px_1px_0px_var(--hh-ink)] active:translate-y-0.5 cursor-pointer text-hh-ink"
            >
              <X size={16} />
            </button>

            <div className="bg-hh-yellow border-2 border-hh-ink p-3 text-center rotate-[-1deg] mt-2">
              <h3 className="font-serif text-xl font-black uppercase tracking-tight">RECLAIM PASSPORT</h3>
            </div>

            <form onSubmit={handleLoginSubmit} className="flex flex-col gap-4">
              <div className="flex flex-col gap-1">
                <label className="font-mono text-[10px] font-extrabold uppercase">Builder Name (e.g. Alex Sharma)</label>
                <input
                  type="text"
                  placeholder="Enter your name"
                  value={nameInput}
                  onChange={(e) => setNameInput(e.target.value)}
                  disabled={loginLoading}
                  className="p-2 border-2 border-hh-ink font-bold text-sm focus:outline-none focus:bg-hh-yellow/5"
                  required
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="font-mono text-[10px] font-extrabold uppercase">Passcode PIN</label>
                <div className="relative">
                  <input
                    type={showPasscode ? "text" : "password"}
                    placeholder="Enter Passcode"
                    value={passcodeInput}
                    onChange={(e) => setPasscodeInput(e.target.value)}
                    disabled={loginLoading}
                    className="w-full p-2 pr-8 border-2 border-hh-ink font-bold text-sm focus:outline-none focus:bg-hh-yellow/5"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPasscode(!showPasscode)}
                    className="absolute right-2 top-2.5 text-hh-ink/50 hover:text-hh-ink cursor-pointer"
                  >
                    {showPasscode ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              {loginError && (
                <div className="text-hh-pink font-bold text-xs text-center border-2 border-hh-pink bg-red-50 p-2">
                  {loginError}
                </div>
              )}

              <button
                type="submit"
                disabled={loginLoading}
                className="w-full py-3 brutalist-button text-sm flex items-center justify-center gap-1.5 cursor-pointer font-bold uppercase tracking-wider"
              >
                {loginLoading ? (
                  <>
                    <RefreshCw className="animate-spin" size={14} />
                    RECLAIMING...
                  </>
                ) : (
                  "RESTORE SESSION"
                )}
              </button>
            </form>
          </div>
        </div>
      )}
    </nav>
  );
}
