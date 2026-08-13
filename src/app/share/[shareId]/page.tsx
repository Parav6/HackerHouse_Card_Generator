import { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { connectToDatabase } from "@/lib/mongodb";
import { Builder } from "@/models/Builder";
import Navbar from "@/components/navigation/Navbar";
import { Shield, PlusCircle, ArrowUpRight, Share2 } from "lucide-react";

interface Props {
  params: Promise<{ shareId: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { shareId } = await params;
  await connectToDatabase();
  const builder = await Builder.findOne({ publicId: shareId });

  if (!builder) {
    return {
      title: "Hacker House Goa Passport",
    };
  }

  return {
    title: `${builder.name} | Hacker House Goa 2026 Passport`,
    description: `Meet ${builder.name} (${builder.builderTitle}) at Hacker House Goa 2026!`,
    openGraph: {
      title: `${builder.name}'s Hacker House Goa Passport`,
      description: `Goa Title: ${builder.builderTitle}. Stack: ${builder.stack}.`,
      images: [
        {
          url: builder.cardUrl,
          width: 600,
          height: 900,
          alt: `${builder.name} Builder Badge`,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: `${builder.name}'s Hacker House Goa Passport`,
      description: `Goa Title: ${builder.builderTitle}. Stack: ${builder.stack}.`,
      images: [builder.cardUrl],
    },
  };
}

export default async function SharePage({ params }: Props) {
  const { shareId } = await params;

  await connectToDatabase();
  const builder = await Builder.findOne({ publicId: shareId });

  if (!builder) {
    notFound();
  }

  return (
    <div className="flex flex-col min-h-screen bg-hh-green-dark text-white relative paper-texture overflow-hidden pb-12">
      <Navbar />

      <main className="flex-grow max-w-lg mx-auto w-full px-4 py-12 relative z-20 flex flex-col items-center">
        
        <div className="bg-white text-hh-ink brutalist-border border-3 p-6 shadow-[6px_6px_0px_var(--hh-pink)] flex flex-col gap-6 w-full items-center text-center">
          
          <div className="bg-hh-pink border-3 border-hh-ink p-4 rotate-[-1deg] shadow-[3px_3px_0px_var(--hh-ink)] text-white w-full">
            <h2 className="font-serif text-2xl md:text-3xl font-black uppercase tracking-tight">
              BUILDER PASSPORT
            </h2>
            <p className="font-mono text-[10px] mt-1 uppercase text-hh-yellow font-bold">
              Shared by {builder.name}
            </p>
          </div>

          {/* Large Card Render */}
          <div className="relative w-64 h-96 shadow-[4px_4px_0px_var(--hh-ink)] overflow-hidden bg-hh-green-dark">
            <Image
              src={builder.cardUrl}
              alt={builder.name}
              fill
              priority
              className="object-cover"
            />
          </div>

          <div className="w-full flex flex-col gap-3 mt-2">
            <Link
              href={`/builder/${builder.publicId}`}
              className="w-full py-4 text-sm brutalist-button flex items-center justify-center gap-1.5"
            >
              VIEW BUILDER PROFILE
              <ArrowUpRight size={16} />
            </Link>

            <Link
              href="/create"
              className="w-full py-3 text-sm brutalist-button-pink flex items-center justify-center gap-1.5"
            >
              <PlusCircle size={16} />
              CREATE MY OWN PASSPORT
            </Link>
          </div>

          <div className="border-t-2 border-dashed border-hh-ink/20 pt-4 w-full">
            <p className="text-xs text-hh-ink/75 leading-relaxed font-bold">
              ⚡ Attend Hacker House Goa 2026 and scan other developers' badges to grow your network and climb the Connector leaderboard!
            </p>
          </div>
        </div>

      </main>

    </div>
  );
}
