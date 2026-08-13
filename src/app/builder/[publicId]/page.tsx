import { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { connectToDatabase } from "@/lib/mongodb";
import { Builder } from "@/models/Builder";
import Navbar from "@/components/navigation/Navbar";
import { MapPin, Users, Heart, Award } from "lucide-react";

const TwitterIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z" />
  </svg>
);

const GithubIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22" />
  </svg>
);

interface Props {
  params: Promise<{ publicId: string }>;
}

// 1. Dynamic Meta Generation for Twitter Card Previews
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { publicId } = await params;
  await connectToDatabase();
  const builder = await Builder.findOne({ publicId });

  if (!builder) {
    return {
      title: "Builder Profile Not Found | HH Goa 2026",
    };
  }

  return {
    title: `${builder.name} | Hacker House Goa 2026 Builder Passport`,
    description: `Check out ${builder.name}'s builder passport: "${builder.builderTitle}". Active at Hacker House Goa 2026!`,
    openGraph: {
      title: `${builder.name}'s Hacker House Goa Passport`,
      description: `Goa Title: ${builder.builderTitle}. Primary Stack: ${builder.stack}.`,
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
      title: `${builder.name} | Hacker House Goa 2026`,
      description: `Goa Title: ${builder.builderTitle}. Primary Stack: ${builder.stack}.`,
      images: [builder.cardUrl],
    },
  };
}

export default async function BuilderProfilePage({ params }: Props) {
  const { publicId } = await params;

  await connectToDatabase();
  const builder = await Builder.findOne({ publicId });

  if (!builder) {
    notFound();
  }

  return (
    <div className="flex flex-col min-h-screen bg-hh-green-dark text-white relative paper-texture overflow-hidden pb-12">
      <Navbar />

      <main className="flex-grow max-w-4xl mx-auto w-full px-4 py-12 relative z-20 flex flex-col items-center">
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full items-center bg-white text-hh-ink brutalist-border border-3 p-6 md:p-8 shadow-[8px_8px_0px_var(--hh-yellow)]">
          
          {/* Card PNG display */}
          <div className="flex flex-col items-center justify-center">
            <div className="relative w-full max-w-[280px] aspect-[2/3] shadow-[4px_4px_0px_var(--hh-ink)] overflow-hidden bg-hh-green-dark">
              <Image
                src={builder.cardUrl}
                alt={builder.name}
                fill
                priority
                className="object-cover"
              />
            </div>
            
            <p className="font-mono text-[10px] text-hh-ink/60 uppercase font-black text-center mt-3 tracking-widest">
              Hacker Passport Badge preview
            </p>
          </div>

          {/* Builder Details */}
          <div className="flex flex-col gap-5 justify-between h-full py-2">
            <div>
              {/* Role Tag */}
              <span className="font-mono text-xs font-black uppercase bg-hh-pink text-white px-3 py-1 shadow-[2px_2px_0px_var(--hh-ink)] border-2 border-hh-ink inline-block rotate-[-1deg] w-fit">
                {builder.role}
              </span>

              {/* Name */}
              <h1 className="font-serif text-3xl md:text-4xl font-black uppercase tracking-tight text-hh-ink mt-3 leading-none">
                {builder.name}
              </h1>

              {/* Title */}
              <h2 className="font-sans text-base font-extrabold text-hh-green mt-1">
                {builder.builderTitle}
              </h2>

              <hr className="border-t-2 border-dashed border-hh-ink/15 my-4" />

              {/* Specs info */}
              <div className="flex flex-col gap-2 font-mono text-xs text-hh-ink/80 font-bold uppercase">
                <p className="flex items-center gap-2">
                  <Award size={14} className="text-hh-pink" />
                  Primary Stack: <span className="text-hh-ink font-black">{builder.stack}</span>
                </p>
                {builder.city && (
                  <p className="flex items-center gap-2">
                    <MapPin size={14} className="text-hh-pink" />
                    City: <span className="text-hh-ink font-black">{builder.city}</span>
                  </p>
                )}
                <p className="flex items-center gap-2">
                  <Users size={14} className="text-hh-pink" />
                  Network Connections: <span className="text-hh-ink font-black">{builder.connectionCount} builders met</span>
                </p>
              </div>
            </div>

            {/* Social handles */}
            <div className="flex gap-3 my-4">
              {builder.xHandle && (
                <a
                  href={`https://twitter.com/${builder.xHandle}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-3 bg-hh-yellow text-hh-ink border-2 border-hh-ink shadow-[2px_2px_0px_var(--hh-ink)] hover:translate-y-[-1px] active:translate-y-0.5"
                >
                  <TwitterIcon className="w-[18px] h-[18px]" />
                </a>
              )}
              {builder.github && (
                <a
                  href={`https://github.com/${builder.github}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-3 bg-white text-hh-ink border-2 border-hh-ink shadow-[2px_2px_0px_var(--hh-ink)] hover:translate-y-[-1px] active:translate-y-0.5"
                >
                  <GithubIcon className="w-[18px] h-[18px]" />
                </a>
              )}
            </div>

            {/* Lobby / Generator CTA */}
            <div className="flex flex-col gap-3">
              <Link
                href="/create"
                className="w-full py-4 text-center text-sm brutalist-button flex items-center justify-center gap-1.5"
              >
                CREATE YOUR OWN PASSPORT
              </Link>
            </div>
          </div>

        </div>

      </main>

    </div>
  );
}
