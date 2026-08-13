"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Trophy, RefreshCw, Star, Users, Flame } from "lucide-react";
import Navbar from "@/components/navigation/Navbar";

export default function LeaderboardPage() {
  const router = useRouter();
  const [leaderboard, setLeaderboard] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [cached, setCached] = useState(false);

  useEffect(() => {
    fetchLeaderboard();
  }, []);

  const fetchLeaderboard = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/leaderboard");
      const data = await res.json();
      if (res.ok) {
        setLeaderboard(data.leaderboard || []);
        setCached(!!data.cached);
      }
    } catch (err) {
      console.error("Failed to fetch leaderboard:", err);
    } finally {
      setLoading(false);
    }
  };

  // Extract Top 3 for the Podium layout
  const top1 = leaderboard.find((b) => b.rank === 1);
  const top2 = leaderboard.find((b) => b.rank === 2);
  const top3 = leaderboard.find((b) => b.rank === 3);

  // Remaining list (ranks 4 to 20)
  const listRanks = leaderboard.filter((b) => b.rank > 3);

  return (
    <div className="flex flex-col min-h-screen bg-hh-green-dark text-white relative paper-texture overflow-hidden pb-12">
      <Navbar />

      <main className="flex-grow max-w-5xl mx-auto w-full px-4 py-8 relative z-20 flex flex-col gap-8">
        
        {/* Header Title Board */}
        <div className="bg-hh-yellow text-hh-ink brutalist-border border-3 p-6 shadow-[5px_5px_0px_var(--hh-ink)] text-center relative">
          <h1 className="font-serif text-4xl md:text-6xl font-black uppercase leading-none tracking-tight">
            THE CONNECTORS
          </h1>
          <p className="font-mono text-xs font-bold uppercase tracking-wider text-hh-pink mt-2">
            Hacker House Goa 2026 Connection Leaderboard
          </p>

          <button
            onClick={fetchLeaderboard}
            disabled={loading}
            className="absolute top-4 right-4 p-2 bg-white brutalist-border border-2 shadow-[2px_2px_0px_var(--hh-ink)] active:translate-y-0.5 cursor-pointer disabled:opacity-50"
            title="Refresh Leaderboard"
          >
            <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
          </button>
        </div>

        {/* Redis Cache Status Notice */}
        {cached && (
          <div className="text-center font-mono text-[10px] uppercase text-hh-yellow tracking-widest bg-hh-ink/30 py-1.5 px-3 border-2 border-dashed border-hh-yellow/30 w-fit mx-auto shadow-[2px_2px_0px_var(--hh-ink)]">
            ⚡ Redis Cached (Updates every 10s)
          </div>
        )}

        {loading && leaderboard.length === 0 ? (
          <div className="flex-1 flex flex-col justify-center items-center py-16 gap-3">
            <RefreshCw className="animate-spin text-hh-yellow" size={32} />
            <p className="font-mono text-xs text-hh-yellow uppercase">Retrieving scoreboard...</p>
          </div>
        ) : leaderboard.length === 0 ? (
          <div className="bg-white/5 border-3 border-dashed border-white/20 p-16 text-center text-white/50 font-bold uppercase">
            No connections registered yet. Start scanning to climb the rankings!
          </div>
        ) : (
          <>
            {/* Top 3 Podium Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-end mt-4">
              
              {/* 2nd Place Card (Left on Desktop) */}
              <div className="order-2 md:order-1">
                {top2 ? (
                  <PodiumCard builder={top2} rank={2} colorClass="bg-white" badgeColor="bg-slate-300" router={router} />
                ) : (
                  <PodiumEmpty rank={2} />
                )}
              </div>

              {/* 1st Place Card (Center, Large) */}
              <div className="order-1 md:order-2 md:scale-105 md:z-10">
                {top1 ? (
                  <PodiumCard builder={top1} rank={1} colorClass="bg-hh-yellow" badgeColor="bg-amber-400" router={router} />
                ) : (
                  <PodiumEmpty rank={1} />
                )}
              </div>

              {/* 3rd Place Card (Right on Desktop) */}
              <div className="order-3 md:order-3">
                {top3 ? (
                  <PodiumCard builder={top3} rank={3} colorClass="bg-hh-pink text-white" badgeColor="bg-amber-700" router={router} />
                ) : (
                  <PodiumEmpty rank={3} />
                )}
              </div>
            </div>

            {/* Ranks 4 to 20 List */}
            {listRanks.length > 0 && (
              <div className="bg-white text-hh-ink brutalist-border border-3 p-4 shadow-[5px_5px_0px_var(--hh-ink)] mt-6 flex flex-col gap-3">
                {listRanks.map((row) => (
                  <div
                    key={row.publicId}
                    onClick={() => router.push(`/builder/${row.publicId}`)}
                    className="flex justify-between items-center p-3 border-2 border-hh-ink bg-hh-yellow/5 hover:bg-hh-yellow/10 transition-colors cursor-pointer group"
                  >
                    <div className="flex items-center gap-4">
                      {/* Rank Number */}
                      <span className="font-serif text-2xl font-black w-8 text-center text-hh-ink/40 group-hover:text-hh-pink transition-colors">
                        {String(row.rank).padStart(2, "0")}
                      </span>

                      {/* Builder Image Circle */}
                      <div className="relative w-12 h-18 border-2 border-hh-ink shadow-[2px_2px_0px_var(--hh-ink)] bg-hh-green overflow-hidden">
                        <Image src={row.cardUrl} alt={row.name} fill className="object-cover" />
                      </div>

                      {/* Builder details */}
                      <div className="flex flex-col gap-0.5">
                        <h4 className="font-serif text-base font-black uppercase leading-tight group-hover:text-hh-pink transition-colors">
                          {row.name}
                        </h4>
                        <p className="font-sans text-[10px] font-extrabold text-hh-green-dark">
                          {row.builderTitle}
                        </p>
                        <p className="font-mono text-[9px] font-bold text-hh-ink/60">
                          {row.role} · {row.stack}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 font-mono font-bold text-sm bg-hh-ink text-white px-3 py-1.5 border-2 border-hh-ink shadow-[2px_2px_0px_var(--hh-yellow)]">
                      <Users size={14} className="text-hh-yellow" />
                      {row.connectionCount} Met
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </main>

    </div>
  );
}

interface PodiumCardProps {
  builder: any;
  rank: number;
  colorClass: string;
  badgeColor: string;
  router: any;
}

function PodiumCard({ builder, rank, colorClass, badgeColor, router }: PodiumCardProps) {
  const isRank1 = rank === 1;
  return (
    <div
      onClick={() => router.push(`/builder/${builder.publicId}`)}
      className={`${colorClass} text-hh-ink brutalist-border border-3 p-5 shadow-[6px_6px_0px_var(--hh-ink)] flex flex-col items-center text-center cursor-pointer relative group hover:scale-[1.01] transition-transform`}
    >
      {/* Crown or fire badge */}
      <div className={`absolute top-[-20px] ${badgeColor} text-hh-ink brutalist-border border-2 px-3 py-1 font-mono font-black text-sm rotate-[-4deg] flex items-center gap-1.5 shadow-[2px_2px_0px_var(--hh-ink)]`}>
        {isRank1 ? <Flame size={14} className="animate-pulse" /> : <Star size={14} />}
        RANK {rank}
      </div>

      {/* Card Image */}
      <div className={`relative ${isRank1 ? "w-40 h-60" : "w-32 h-48"} border-3 border-hh-ink shadow-[4px_4px_0px_var(--hh-ink)] bg-hh-green overflow-hidden mt-4`}>
        <Image src={builder.cardUrl} alt={builder.name} fill className="object-cover" />
      </div>

      <h3 className="font-serif text-xl md:text-2xl font-black uppercase mt-4 leading-tight group-hover:text-hh-pink transition-colors">
        {builder.name}
      </h3>
      <p className="font-mono text-xs font-bold text-hh-ink/75 leading-none mt-1">
        {builder.builderTitle}
      </p>

      <div className="mt-4 px-4 py-2 bg-hh-ink text-white font-mono font-black text-sm border-2 border-hh-ink shadow-[2px_2px_0px_var(--hh-yellow)] flex items-center gap-2">
        <Users size={16} className="text-hh-yellow" />
        {builder.connectionCount} Builders Met
      </div>
    </div>
  );
}

function PodiumEmpty({ rank }: { rank: number }) {
  return (
    <div className="bg-white/5 border-3 border-dashed border-white/20 p-12 text-center text-white/40 uppercase font-bold text-sm">
      Rank {rank} Empty
    </div>
  );
}
