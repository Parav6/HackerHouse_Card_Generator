"use client";

import { useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { ArrowRight, QrCode, Shield, Users, Trophy } from "lucide-react";
import Navbar from "@/components/navigation/Navbar";
import { useSessionStore } from "@/store/session-store";

export default function Home() {
  const { builder, isAuthenticated, checkSession } = useSessionStore();

  useEffect(() => {
    checkSession();
  }, [checkSession]);

  return (
    <div className="flex flex-col min-h-screen bg-hh-green-dark text-white relative paper-texture overflow-hidden">
      <Navbar />

      {/* Decorative Assets - Beach Scene Framing */}
      {/* Sun - Pulsing in Top Right */}
      <motion.div
        className="absolute top-12 right-[-50px] md:right-10 w-48 h-48 md:w-64 md:h-64 z-0 pointer-events-none opacity-40 md:opacity-75"
        animate={{
          scale: [1, 1.05, 1],
          rotate: 360,
        }}
        transition={{
          scale: { duration: 6, repeat: Infinity, ease: "easeInOut" },
          rotate: { duration: 120, repeat: Infinity, ease: "linear" },
        }}
      >
        <Image
          src="/brand/sun.png"
          alt="Goa Sun"
          width={256}
          height={256}
          className="w-full h-full object-contain"
        />
      </motion.div>

      {/* Palm Trees - Swaying from Left & Right */}
      <motion.div
        className="absolute top-20 left-[-40px] md:left-[-10px] w-40 h-64 md:w-72 md:h-[450px] z-10 pointer-events-none origin-bottom-left"
        animate={{ rotate: [-2, 3, -2] }}
        transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
      >
        <Image
          src="/brand/palm.png"
          alt="Palm Trees"
          width={300}
          height={450}
          className="w-full h-full object-contain scale-x-[-1]"
        />
      </motion.div>

      <motion.div
        className="absolute top-32 right-[-30px] md:right-[-10px] w-36 h-60 md:w-64 md:h-[400px] z-10 pointer-events-none origin-bottom-right"
        animate={{ rotate: [2, -3, 2] }}
        transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
      >
        <Image
          src="/brand/palm.png"
          alt="Palm Trees"
          width={300}
          height={450}
          className="w-full h-full object-contain"
        />
      </motion.div>

      {/* Main Hero Container */}
      <main className="flex-1 flex flex-col justify-center items-center px-4 py-16 md:py-24 max-w-5xl mx-auto w-full text-center relative z-20">
        {/* Goa-poster Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="mb-8"
        >
          <span className="font-mono text-xs md:text-sm tracking-widest text-hh-yellow uppercase bg-hh-ink/40 px-3 py-1 brutalist-border border-2 rounded-full inline-block mb-4 shadow-[2px_2px_0px_var(--hh-ink)]">
            Hacker House Goa 2026 Submission
          </span>

          <h1 className="font-serif text-5xl md:text-8xl font-black uppercase tracking-tight text-hh-yellow leading-[0.95] md:leading-[0.9]">
            BUILD YOUR <br />
            <span className="text-white relative">
              GOA IDENTITY
              <motion.span
                className="absolute left-0 bottom-[-10px] md:bottom-[-20px] w-full h-3 md:h-6 bg-hh-pink -rotate-1 -z-10"
                initial={{ width: 0 }}
                animate={{ width: "100%" }}
                transition={{ delay: 0.5, duration: 0.6 }}
              />
            </span>
          </h1>

          <p className="mt-8 font-sans font-medium text-lg md:text-2xl text-white/90 max-w-2xl mx-auto leading-relaxed">
            Generate your branded builder badge, download your social card, and step into the event networking layer. Scan to connect with peers, unlock recommendations, and rank on the leaderboard.
          </p>
        </motion.div>

        {/* Dynamic Navigation Box */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2, duration: 0.6 }}
          className="flex flex-col sm:flex-row gap-4 justify-center items-center w-full max-w-lg mb-16"
        >
          {isAuthenticated && builder ? (
            <div className="w-full flex flex-col gap-4">
              {/* If builder passport already exists */}
              <div className="bg-white/10 brutalist-border border-3 p-4 shadow-[4px_4px_0px_0px_var(--hh-yellow)] text-center rounded-none">
                <p className="text-hh-yellow font-bold uppercase tracking-wider text-sm mb-1">Passport Active</p>
                <h4 className="font-serif text-xl font-bold uppercase text-white">{builder.builderTitle}</h4>
                <p className="text-xs text-white/80 font-mono mt-1">ID: {builder.publicId}</p>
              </div>
              <div className="flex flex-col sm:flex-row gap-3 w-full">
                <Link href="/network" className="flex-1 text-center py-4 text-lg brutalist-button flex items-center justify-center gap-2">
                  <Users size={20} />
                  My Network
                </Link>
                <Link href="/scan" className="flex-1 text-center py-4 text-lg brutalist-button-pink flex items-center justify-center gap-2">
                  <QrCode size={20} />
                  Scan Builder
                </Link>
              </div>
            </div>
          ) : (
            <>
              <Link
                href="/create"
                className="w-full sm:w-auto px-8 py-5 text-xl brutalist-button flex items-center justify-center gap-2 group cursor-pointer"
              >
                CREATE YOUR BUILDER ID
                <ArrowRight size={22} className="group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link
                href="/scan"
                className="w-full sm:w-auto px-8 py-5 text-xl brutalist-button-pink flex items-center justify-center gap-2 cursor-pointer"
              >
                <QrCode size={22} />
                SCAN A BUILDER
              </Link>
            </>
          )}
        </motion.div>

        {/* Feature Signboard Block */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full text-left mt-8">
          {/* Card 1 */}
          <motion.div
            whileHover={{ y: -5 }}
            className="brutalist-card p-6 flex flex-col justify-between"
          >
            <div>
              <div className="bg-hh-yellow brutalist-border border-2 p-3 w-fit mb-4 rotate-[-3deg] shadow-[2px_2px_0px_var(--hh-ink)]">
                <Shield size={24} className="text-hh-ink" />
              </div>
              <h3 className="font-serif text-2xl font-black uppercase text-hh-ink mb-2">1. Identity Badge</h3>
              <p className="text-hh-ink/80 text-sm leading-relaxed">
                Upload your picture and auto-generate a retro screen-print style event badge with a custom Goa-themed title and unique QR connection code.
              </p>
            </div>
            <div className="border-t border-hh-ink/20 pt-4 mt-6 flex justify-between items-center text-xs font-mono font-bold uppercase text-hh-ink">
              <span>NO LOGIN REQUIRED</span>
              <span className="text-hh-pink">✦</span>
            </div>
          </motion.div>

          {/* Card 2 */}
          <motion.div
            whileHover={{ y: -5 }}
            className="brutalist-card p-6 flex flex-col justify-between shadow-[6px_6px_0px_var(--hh-pink)]"
          >
            <div>
              <div className="bg-hh-pink brutalist-border border-2 p-3 w-fit mb-4 rotate-[3deg] shadow-[2px_2px_0px_var(--hh-ink)] text-white">
                <QrCode size={24} />
              </div>
              <h3 className="font-serif text-2xl font-black uppercase text-hh-ink mb-2">2. QR Networking</h3>
              <p className="text-hh-ink/80 text-sm leading-relaxed">
                Your card is your digital passport. Show it to someone at the house, let them scan it, and connect instantly. Stores all your connections on MongoDB.
              </p>
            </div>
            <div className="border-t border-hh-ink/20 pt-4 mt-6 flex justify-between items-center text-xs font-mono font-bold uppercase text-hh-ink">
              <span>CAMERA & UPLOAD CROP</span>
              <span className="text-hh-pink">✦</span>
            </div>
          </motion.div>

          {/* Card 3 */}
          <motion.div
            whileHover={{ y: -5 }}
            className="brutalist-card p-6 flex flex-col justify-between"
          >
            <div>
              <div className="bg-hh-yellow brutalist-border border-2 p-3 w-fit mb-4 rotate-[-1deg] shadow-[2px_2px_0px_var(--hh-ink)]">
                <Trophy size={24} className="text-hh-ink" />
              </div>
              <h3 className="font-serif text-2xl font-black uppercase text-hh-ink mb-2">3. Climb the Hype</h3>
              <p className="text-hh-ink/80 text-sm leading-relaxed">
                Discover complementary tech stacks and roles through smart local suggestions. Monitor your stats, and see who are the top connectors on the leaderboard.
              </p>
            </div>
            <div className="border-t border-hh-ink/20 pt-4 mt-6 flex justify-between items-center text-xs font-mono font-bold uppercase text-hh-ink">
              <span>REDIS CACHED RANKS</span>
              <span className="text-hh-pink">✦</span>
            </div>
          </motion.div>
        </div>
      </main>
    </div>
  );
}
