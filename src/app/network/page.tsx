"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { motion } from "framer-motion";
import { Users, Code, Compass, Heart, ArrowUpRight, Search, QrCode } from "lucide-react";
import Navbar from "@/components/navigation/Navbar";
import ClaimPassportOverlay from "@/components/navigation/ClaimPassportOverlay";
import { useSessionStore } from "@/store/session-store";

export default function NetworkPage() {
  const router = useRouter();
  const { builder, isAuthenticated, checkSession, isLoading: sessionLoading } = useSessionStore();

  const [networkData, setNetworkData] = useState<any | null>(null);
  const [recommendations, setRecommendations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    checkSession();
  }, [checkSession]);

  useEffect(() => {
    if (isAuthenticated) {
      fetchNetworkAndRecommendations();
    } else if (!sessionLoading && !isAuthenticated) {
      router.push("/");
    }
  }, [isAuthenticated, sessionLoading]);

  const fetchNetworkAndRecommendations = async () => {
    try {
      setLoading(true);

      // Fetch network stats and connections
      const netRes = await fetch("/api/network");
      const netData = await netRes.json();

      // Fetch recommendations
      const recRes = await fetch("/api/recommendations");
      const recData = await recRes.json();

      if (netRes.ok) setNetworkData(netData);
      if (recRes.ok) setRecommendations(recData.recommendations || []);
    } catch (err) {
      console.error("Failed to load network dashboard data:", err);
    } finally {
      setLoading(false);
    }
  };

  const filteredPeople = networkData?.peopleMet?.filter((person: any) =>
    person.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    person.role.toLowerCase().includes(searchQuery.toLowerCase()) ||
    person.stack.toLowerCase().includes(searchQuery.toLowerCase()) ||
    person.builderTitle.toLowerCase().includes(searchQuery.toLowerCase())
  ) || [];

  if (sessionLoading || loading) {
    return (
      <div className="flex flex-col min-h-screen bg-hh-green-dark text-white relative paper-texture justify-center items-center">
        <Navbar />
        <div className="flex-grow flex flex-col justify-center items-center gap-2">
          <RefreshIcon className="animate-spin text-hh-yellow w-10 h-10" />
          <p className="font-mono text-xs uppercase tracking-wider text-hh-yellow mt-2">
            Loading Network Dashboard...
          </p>
        </div>
      </div>
    );
  }

  if (isAuthenticated && builder && !builder.claimed) {
    return (
      <div className="flex flex-col min-h-screen bg-hh-green-dark text-white relative paper-texture justify-center items-center">
        <Navbar />
        <div className="flex-grow flex flex-col justify-center items-center w-full py-12">
          <ClaimPassportOverlay />
        </div>
      </div>
    );
  }

  const stats = networkData?.stats || { totalMet: 0, uniqueRoles: 0, uniqueStacks: 0, diversityScore: 0 };

  return (
    <div className="flex flex-col min-h-screen bg-hh-green-dark text-white relative paper-texture overflow-hidden pb-12">
      <Navbar />

      <main className="flex-grow max-w-6xl mx-auto w-full px-4 py-8 relative z-20 flex flex-col gap-10">
        
        {/* Header Block */}
        <div className="bg-hh-yellow text-hh-ink brutalist-border border-3 p-6 shadow-[5px_5px_0px_var(--hh-ink)] flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="text-center md:text-left">
            <h1 className="font-serif text-3xl md:text-5xl font-black uppercase leading-none">
              MY BUILDER NETWORK
            </h1>
            <p className="font-mono text-xs font-bold uppercase tracking-wider text-hh-pink mt-1">
              Hacker Passport Identity Layer // {builder?.builderTitle}
            </p>
          </div>
          <button
            onClick={() => router.push("/scan")}
            className="w-full md:w-auto px-6 py-3 bg-hh-pink text-white font-extrabold uppercase brutalist-border border-2 shadow-[3px_3px_0px_var(--hh-ink)] hover:translate-y-[-1px] active:translate-y-0.5 cursor-pointer flex items-center justify-center gap-2"
          >
            <QrCode size={18} />
            SCAN TO CONNECT
          </button>
        </div>

        {/* Dynamic Signboard Stat Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {/* Stat 1: Total Met */}
          <div className="bg-white text-hh-ink brutalist-border border-3 p-4 shadow-[4px_4px_0px_var(--hh-ink)] flex flex-col justify-between items-center text-center">
            <div className="bg-hh-yellow border-2 border-hh-ink p-2 rounded-full mb-2">
              <Users size={20} />
            </div>
            <h2 className="font-serif text-3xl md:text-5xl font-black">{stats.totalMet}</h2>
            <p className="font-mono text-xs font-bold uppercase text-hh-ink/75 mt-1">Builders Met</p>
          </div>

          {/* Stat 2: Tech Stacks */}
          <div className="bg-white text-hh-ink brutalist-border border-3 p-4 shadow-[4px_4px_0px_var(--hh-ink)] flex flex-col justify-between items-center text-center">
            <div className="bg-hh-pink border-2 border-hh-ink p-2 rounded-full mb-2 text-white">
              <Code size={20} />
            </div>
            <h2 className="font-serif text-3xl md:text-5xl font-black">{stats.uniqueStacks}</h2>
            <p className="font-mono text-xs font-bold uppercase text-hh-ink/75 mt-1">Tech Stacks</p>
          </div>

          {/* Stat 3: Roles */}
          <div className="bg-white text-hh-ink brutalist-border border-3 p-4 shadow-[4px_4px_0px_var(--hh-ink)] flex flex-col justify-between items-center text-center">
            <div className="bg-hh-yellow border-2 border-hh-ink p-2 rounded-full mb-2">
              <Compass size={20} />
            </div>
            <h2 className="font-serif text-3xl md:text-5xl font-black">{stats.uniqueRoles}</h2>
            <p className="font-mono text-xs font-bold uppercase text-hh-ink/75 mt-1">Roles Met</p>
          </div>

          {/* Stat 4: Diversity */}
          <div className="bg-white text-hh-ink brutalist-border border-3 p-4 shadow-[4px_4px_0px_var(--hh-ink)] flex flex-col justify-between items-center text-center">
            <div className="bg-hh-pink border-2 border-hh-ink p-2 rounded-full mb-2 text-white animate-pulse">
              <Heart size={20} />
            </div>
            <h2 className="font-serif text-3xl md:text-5xl font-black">{stats.diversityScore}%</h2>
            <p className="font-mono text-xs font-bold uppercase text-hh-ink/75 mt-1">Network Diversity</p>
          </div>
        </div>

        {/* Dashboard Split Pane: Recommended (Left) & Network Directory (Right) */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          
          {/* LEFT: Recommendations Panel */}
          <div className="lg:col-span-1 flex flex-col gap-6">
            <div className="bg-hh-pink text-white brutalist-border border-3 p-4 shadow-[4px_4px_0px_var(--hh-ink)] rotate-[-1deg] text-center">
              <h3 className="font-serif text-xl font-black uppercase">PEOPLE YOU SHOULD MEET</h3>
              <p className="font-mono text-[10px] text-hh-yellow uppercase font-bold">Suggested Complementary Skills</p>
            </div>

            {recommendations.length > 0 ? (
              <div className="flex flex-col gap-4">
                {recommendations.map((rec) => (
                  <div
                    key={rec.publicId}
                    className="bg-white text-hh-ink brutalist-border border-3 p-4 shadow-[4px_4px_0px_var(--hh-ink)] flex flex-col justify-between relative overflow-hidden group"
                  >
                    <div>
                      <div className="flex justify-between items-start gap-2">
                        <span className="font-mono text-[9px] font-black uppercase bg-hh-pink text-white px-2 py-0.5 shadow-[1px_1px_0px_var(--hh-ink)]">
                          {rec.role}
                        </span>
                        {rec.city && (
                          <span className="text-[10px] text-hh-ink/65 font-bold uppercase">{rec.city}</span>
                        )}
                      </div>
                      <h4 className="font-serif text-lg font-black uppercase tracking-tight text-hh-ink mt-2 leading-tight">
                        {rec.name}
                      </h4>
                      <p className="font-mono text-xs font-bold text-hh-pink leading-none mt-1">
                        {rec.builderTitle}
                      </p>
                      <p className="font-mono text-[10px] font-extrabold uppercase text-hh-ink/80 mt-3">
                        Stack: {rec.stack}
                      </p>
                    </div>

                    <button
                      onClick={() => router.push(`/builder/${rec.publicId}`)}
                      className="w-full mt-4 py-2 bg-hh-yellow border-2 border-hh-ink font-bold text-xs uppercase shadow-[2px_2px_0px_var(--hh-ink)] active:translate-y-0.5 cursor-pointer flex items-center justify-center gap-1.5"
                    >
                      View Profile
                      <ArrowUpRight size={14} />
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-white/5 border-3 border-dashed border-white/20 p-6 text-center text-white/60 text-sm font-bold uppercase">
                Met everyone nearby!
              </div>
            )}
          </div>

          {/* RIGHT: Connected Builders Directory */}
          <div className="lg:col-span-2 flex flex-col gap-6">
            <div className="bg-white text-hh-ink brutalist-border border-3 p-4 shadow-[4px_4px_0px_var(--hh-ink)] flex flex-col md:flex-row justify-between items-center gap-3">
              <h3 className="font-serif text-2xl font-black uppercase">PEOPLE YOU MET ({stats.totalMet})</h3>
              
              {/* Search input */}
              <div className="relative w-full md:w-64">
                <input
                  type="text"
                  placeholder="Search met builders..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full p-2 pl-9 border-2 border-hh-ink bg-white font-bold text-sm focus:outline-none focus:bg-hh-yellow/5"
                />
                <Search size={16} className="absolute left-3 top-2.5 text-hh-ink/50" />
              </div>
            </div>

            {filteredPeople.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredPeople.map((person: any) => (
                  <div
                    key={person.publicId}
                    className="bg-white text-hh-ink brutalist-border border-3 p-4 shadow-[4px_4px_0px_var(--hh-ink)] flex gap-4 items-center group relative"
                  >
                    {/* Tiny badge graphic preview */}
                    <div
                      onClick={() => router.push(`/builder/${person.publicId}`)}
                      className="relative w-20 h-32 border-2 border-hh-ink shrink-0 cursor-pointer overflow-hidden bg-hh-green shadow-[2px_2px_0px_var(--hh-ink)] group-hover:scale-105 transition-transform"
                    >
                      <Image
                        src={person.cardUrl}
                        alt={person.name}
                        fill
                        className="object-cover"
                      />
                    </div>

                    <div className="flex-1 flex flex-col gap-0.5">
                      <span className="font-mono text-[9px] font-black uppercase bg-hh-yellow border border-hh-ink px-1.5 py-0.5 w-fit shadow-[1px_1px_0px_var(--hh-ink)]">
                        {person.role}
                      </span>
                      <h4
                        onClick={() => router.push(`/builder/${person.publicId}`)}
                        className="font-serif text-lg font-black uppercase text-hh-ink leading-tight mt-1 hover:text-hh-pink cursor-pointer"
                      >
                        {person.name}
                      </h4>
                      <p className="font-sans text-[10px] font-extrabold text-hh-green leading-none">
                        {person.builderTitle}
                      </p>
                      <p className="font-mono text-[9px] font-extrabold uppercase text-hh-ink/75 mt-2">
                        Stack: {person.stack}
                      </p>
                      {person.connectedAt && (
                        <p className="font-sans text-[10px] text-hh-ink/50 italic mt-1">
                          Met: {new Date(person.connectedAt).toLocaleDateString(undefined, {
                            month: "short",
                            day: "numeric",
                            hour: "2-digit",
                            minute: "2-digit"
                          })}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-white/5 border-3 border-dashed border-white/20 p-12 text-center text-white/50 font-bold uppercase rounded-none">
                {searchQuery ? "No search matches found." : "No builders met yet. Show your QR badge at the Hacker House and scan others to connect!"}
              </div>
            )}
          </div>

        </div>

      </main>

    </div>
  );
}

function RefreshIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 1121.21 7.89M9 11l3-3m0 0l3 3m-3-3v12" />
    </svg>
  );
}
