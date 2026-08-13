"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import QRCode from "qrcode";
import { Upload, HelpCircle, RefreshCw, Download, Check } from "lucide-react";
import { createBuilderSchema } from "@/schemas/builder";
import { useSessionStore } from "@/store/session-store";

const TwitterIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z" />
  </svg>
);

// Form validation schema based on API definitions
type FormValues = z.infer<typeof createBuilderSchema>;

const ROLES = [
  "Frontend",
  "Backend",
  "Fullstack",
  "AI/ML",
  "Mobile",
  "Blockchain",
  "Design",
  "Product Manager",
  "Founder",
];

const STACKS = [
  "React",
  "Next.js",
  "Node.js",
  "Python",
  "Go",
  "Rust",
  "Solidity",
  "Flutter",
  "Figma",
  "Vue",
  "Svelte",
];

const clientBuilderSchema = createBuilderSchema.extend({
  cardImage: z.string().optional(),
});

export default function BuilderCardGenerator() {
  const router = useRouter();
  const { setSession, isAuthenticated, builder } = useSessionStore();
  const [photoSrc, setPhotoSrc] = useState<string | null>(null);
  const [isConvertingHeic, setIsConvertingHeic] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedCard, setGeneratedCard] = useState<any | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const [connectionToken, setConnectionToken] = useState("");
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [pendingData, setPendingData] = useState<any | null>(null);
  const [imgDimensions, setImgDimensions] = useState({ width: 0, height: 0 });

  useEffect(() => {
    // Generate a random 32-character hex token on the client side only (prevents hydration mismatch)
    const array = new Uint8Array(16);
    if (typeof window !== "undefined" && window.crypto) {
      window.crypto.getRandomValues(array);
      const token = Array.from(array, (dec) => dec.toString(16).padStart(2, "0")).join("");
      setConnectionToken(token);
    }
  }, []);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
    setValue,
  } = useForm<any>({
    resolver: zodResolver(clientBuilderSchema),
    defaultValues: {
      name: "",
      role: "Fullstack",
      stack: "React",
      xHandle: "",
      github: "",
      city: "",
      cardImage: "",
      zoom: 1,
      offsetX: 0,
      offsetY: 0,
    },
  });

  const formValues = watch();

  // Load sample / default image for preview if no photo is uploaded yet
  useEffect(() => {
    // We can draw a placeholder silhouette
    drawPlaceholder();
  }, []);

  // Whenever form fields or photo source changes, redraw the canvas live
  useEffect(() => {
    triggerCanvasRedraw();
  }, [
    formValues.name,
    formValues.role,
    formValues.stack,
    formValues.xHandle,
    formValues.zoom,
    formValues.offsetX,
    formValues.offsetY,
    photoSrc,
    connectionToken,
  ]);

  const drawPlaceholder = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Reset and draw background
    ctx.fillStyle = "#003D24";
    ctx.fillRect(0, 0, 600, 900);

    // Thick outer border
    ctx.strokeStyle = "#111111";
    ctx.lineWidth = 16;
    ctx.strokeRect(0, 0, 600, 900);

    // Top Header Block
    ctx.fillStyle = "#FFD400";
    ctx.fillRect(8, 8, 584, 85);
    ctx.strokeStyle = "#111111";
    ctx.lineWidth = 4;
    ctx.strokeRect(8, 8, 584, 85);

    ctx.fillStyle = "#111111";
    ctx.font = "900 24px monospace";
    ctx.textAlign = "center";
    ctx.fillText("BUILDER ID // HH GOA 2026", 300, 58);
  };

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const fileType = file.type;
    const fileName = file.name.toLowerCase();

    // Check for HEIC / HEIF files
    if (fileType === "image/heic" || fileType === "image/heif" || fileName.endsWith(".heic") || fileName.endsWith(".heif")) {
      setIsConvertingHeic(true);
      try {
        const heic2any = (await import("heic2any")).default;
        const convertedBlob = await heic2any({
          blob: file,
          toType: "image/jpeg",
          quality: 0.8,
        });
        const reader = new FileReader();
        reader.onloadend = () => {
          const resultSrc = reader.result as string;
          setPhotoSrc(resultSrc);
          const tempImg = new Image();
          tempImg.onload = () => {
            setImgDimensions({ width: tempImg.width, height: tempImg.height });
          };
          tempImg.src = resultSrc;
          setIsConvertingHeic(false);
        };
        reader.readAsDataURL(convertedBlob as Blob);
      } catch (err) {
        console.error("HEIC conversion error:", err);
        alert("HEIC conversion failed. Please upload a standard JPG or PNG.");
        setIsConvertingHeic(false);
      }
    } else {
      // Normal images
      const reader = new FileReader();
      reader.onloadend = () => {
        const resultSrc = reader.result as string;
        setPhotoSrc(resultSrc);
        const tempImg = new Image();
        tempImg.onload = () => {
          setImgDimensions({ width: tempImg.width, height: tempImg.height });
        };
        tempImg.src = resultSrc;
      };
      reader.readAsDataURL(file);
    }
  };

  const triggerCanvasRedraw = async () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // 1. Draw Base Badge Structure
    try {
      const bgImg = new Image();
      bgImg.src = "/brand/background.png";
      await new Promise((resolve, reject) => {
        bgImg.onload = () => resolve(true);
        bgImg.onerror = () => reject(new Error("Background image not found."));
      });
      ctx.drawImage(bgImg, 0, 0, 600, 900);
    } catch {
      // Fallback: Palm-tree green diagonal stripes
      ctx.fillStyle = "#003D24"; // Tropical dark green
      ctx.fillRect(0, 0, 600, 900);

      ctx.strokeStyle = "#002B19";
      ctx.lineWidth = 14;
      for (let i = -600; i < 900; i += 40) {
        ctx.beginPath();
        ctx.moveTo(i, 0);
        ctx.lineTo(i + 900, 900);
        ctx.stroke();
      }
    }

    // 2. Goa-Vibe Sunset Sun Disc (drawn behind the photo frame)
    ctx.fillStyle = "#FF5E00"; // Sunset orange
    ctx.beginPath();
    ctx.arc(300, 295, 190, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = "#FFD400"; // Goa sun yellow
    ctx.beginPath();
    ctx.arc(300, 295, 170, 0, Math.PI * 2);
    ctx.fill();

    ctx.strokeStyle = "#111111";
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.arc(300, 295, 190, 0, Math.PI * 2);
    ctx.stroke();

    // Top Header Block
    ctx.fillStyle = "#FFD400";
    ctx.fillRect(8, 8, 584, 85);
    ctx.strokeStyle = "#111111";
    ctx.lineWidth = 4;
    ctx.strokeRect(8, 8, 584, 85);

    ctx.fillStyle = "#111111";
    ctx.font = "900 24px monospace";
    ctx.textAlign = "center";
    ctx.fillText("BUILDER PASSPORT // GOA 2026", 300, 58);

    // 3. Draw User Profile Photo Frame
    // Draw Photo Shadows and Frames
    ctx.fillStyle = "#111111";
    ctx.fillRect(146, 151, 320, 320); // Retro offset shadow

    ctx.fillStyle = "#FF0A78"; // Pink border block
    ctx.fillRect(130, 135, 320, 320);
    ctx.strokeStyle = "#111111";
    ctx.lineWidth = 4;
    ctx.strokeRect(130, 135, 320, 320);

    if (photoSrc) {
      const img = new Image();
      img.src = photoSrc;
      await new Promise((resolve) => (img.onload = resolve));

      // Save context for clipping path
      ctx.save();
      
      // Create clipping path for the photo frame (140, 145, 300, 300)
      ctx.beginPath();
      ctx.rect(140, 145, 300, 300);
      ctx.clip();

      // Translate to center of the crop frame
      ctx.translate(290, 295);

      // Apply zoom scale
      const zoom = formValues.zoom || 1;
      ctx.scale(zoom, zoom);

      // Apply pan offsets
      const offsetX = formValues.offsetX || 0;
      const offsetY = formValues.offsetY || 0;
      ctx.translate(offsetX, -offsetY);

      // Draw image using object-fit cover scale factor with a default top-focus shift for portrait photos
      const scale = Math.max(300 / img.width, 300 / img.height);
      const dw = img.width * scale;
      const dh = img.height * scale;

      let initialY = 0;
      if (dh > 300) {
        initialY = (dh - 300) * 0.35; // Shift down slightly by default to focus on the top half (face)
      }
      ctx.drawImage(img, -dw / 2, -dh / 2 + initialY, dw, dh);

      ctx.restore();

      // Draw the outline border on top of the clipped image
      ctx.strokeStyle = "#111111";
      ctx.lineWidth = 4;
      ctx.strokeRect(140, 145, 300, 300);
    } else {
      // Draw plain avatar placeholder text
      ctx.fillStyle = "#FFFFFF";
      ctx.fillRect(140, 145, 300, 300);
      ctx.strokeStyle = "#111111";
      ctx.lineWidth = 4;
      ctx.strokeRect(140, 145, 300, 300);

      ctx.fillStyle = "#111111";
      ctx.font = "bold 16px sans-serif";
      ctx.fillText("[ UPLOAD PHOTO ]", 300, 305);
    }

    // 4. Draw Hacker Terminal Console Window for Details
    const consoleX = 60;
    const consoleY = 490;
    const consoleW = 480;
    const consoleH = 195;

    // Draw shadow
    ctx.fillStyle = "#111111";
    ctx.fillRect(consoleX + 8, consoleY + 8, consoleW, consoleH);

    // Draw window background
    ctx.fillStyle = "#FFFDF0"; // Retro warm white
    ctx.fillRect(consoleX, consoleY, consoleW, consoleH);
    ctx.strokeStyle = "#111111";
    ctx.lineWidth = 4;
    ctx.strokeRect(consoleX, consoleY, consoleW, consoleH);

    // Draw window title bar (Cyberpunk neon pink header)
    ctx.fillStyle = "#FF0A78";
    ctx.fillRect(consoleX + 2, consoleY + 2, consoleW - 4, 34);
    ctx.strokeStyle = "#111111";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(consoleX, consoleY + 36);
    ctx.lineTo(consoleX + consoleW, consoleY + 36);
    ctx.stroke();

    // Title bar window controls (Red, Yellow, Green terminal dots)
    ctx.fillStyle = "#FF4B4B";
    ctx.beginPath(); ctx.arc(consoleX + 20, consoleY + 18, 6, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
    ctx.fillStyle = "#FFD400";
    ctx.beginPath(); ctx.arc(consoleX + 36, consoleY + 18, 6, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
    ctx.fillStyle = "#00E676";
    ctx.beginPath(); ctx.arc(consoleX + 52, consoleY + 18, 6, 0, Math.PI * 2); ctx.fill(); ctx.stroke();

    // Title Bar Text
    ctx.fillStyle = "#FFFFFF";
    ctx.font = "900 11px monospace";
    ctx.textAlign = "right";
    ctx.fillText("HACKER_PROFILE.SH // ACCESS_GRANTED", consoleX + consoleW - 15, consoleY + 22);

    // Reset align
    ctx.textAlign = "left";

    // Name inside console
    const displayName = (formValues.name || "YOUR NAME").toUpperCase();
    ctx.fillStyle = "#111111";
    ctx.font = "900 28px var(--font-playfair), Georgia, serif";
    ctx.fillText(displayName, consoleX + 20, consoleY + 75);

    // Custom Goa details Title (dynamic preview)
    const displayTitle = `GOA ${formValues.stack.toUpperCase()} ${
      formValues.role === "Founder" ? "GLADIATOR" : "ALCHEMIST"
    }`;
    ctx.fillStyle = "#00472B"; // Deep palm green
    ctx.font = "900 13px monospace";
    ctx.fillText(displayTitle, consoleX + 20, consoleY + 105);

    // Role & Stack labels
    ctx.fillStyle = "#111111";
    ctx.font = "bold 13px monospace";
    ctx.fillText(`ROLE: ${formValues.role.toUpperCase()}`, consoleX + 20, consoleY + 145);
    ctx.fillText(`STACK: ${formValues.stack.toUpperCase()}`, consoleX + 20, consoleY + 170);

    // Home Town / City
    const displayCity = (formValues.city || "PANAJI, GOA").toUpperCase();
    ctx.textAlign = "right";
    ctx.fillStyle = "#FF0A78";
    ctx.font = "900 11px monospace";
    ctx.fillText(`BASE: ${displayCity}`, consoleX + consoleW - 20, consoleY + 170);

    // 5. Draw Retro Beach Surf Waves (between console and QR block)
    ctx.strokeStyle = "#FF0A78"; // Neon pink surf line
    ctx.lineWidth = 4;
    ctx.beginPath();
    for (let x = 10; x < 590; x += 1) {
      const y = 700 + Math.sin(x * 0.045) * 6;
      if (x === 10) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.stroke();

    ctx.strokeStyle = "#FFD400"; // Goa yellow surf line
    ctx.lineWidth = 4;
    ctx.beginPath();
    for (let x = 10; x < 590; x += 1) {
      const y = 708 + Math.sin((x + 60) * 0.045) * 6;
      if (x === 10) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.stroke();

    // 6. Draw QR Code Frame (Symmetric bottom design)
    ctx.fillStyle = "#111111";
    ctx.fillRect(246, 726, 120, 120); // Shadow

    ctx.fillStyle = "#FFFFFF";
    ctx.fillRect(240, 720, 120, 120);
    ctx.strokeStyle = "#111111";
    ctx.lineWidth = 3;
    ctx.strokeRect(240, 720, 120, 120);



    // Generate actual connection token QR
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || window.location.origin;
    const tokenToUse = connectionToken || "temp-token-preview";
    const qrDataUrl = await QRCode.toDataURL(`${appUrl}/connect/${tokenToUse}`, {
      margin: 1,
      width: 110,
    });

    const qrImg = new Image();
    qrImg.src = qrDataUrl;
    await new Promise((resolve) => (qrImg.onload = resolve));
    ctx.drawImage(qrImg, 245, 725, 110, 110);
  };

  const executeGeneration = async (data: FormValues) => {
    setIsGenerating(true);
    try {
      const canvas = canvasRef.current;
      if (!canvas) throw new Error("Canvas is not ready.");

      // Export canvas to base64 PNG data url
      const finalDataUrl = canvas.toDataURL("image/png");
      setValue("cardImage", finalDataUrl);

      // Post profile information to api route
      const response = await fetch("/api/builders", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...data,
          connectionToken,
          cardImage: finalDataUrl,
        }),
      });

      const responseData = await response.json();

      if (!response.ok) {
        throw new Error(responseData.error || "Failed to register builder profile.");
      }

      setGeneratedCard(responseData.builder);
      setSession(responseData.builder);
    } catch (error: unknown) {
      console.error(error);
      const errMsg = error instanceof Error ? error.message : "An unexpected error occurred during creation.";
      alert(errMsg);
    } finally {
      setIsGenerating(false);
    }
  };

  const onFormSubmit = async (data: FormValues) => {
    if (!photoSrc) {
      alert("Please upload your profile photo first!");
      return;
    }

    if (isAuthenticated && builder) {
      setPendingData(data);
      setShowConfirmModal(true);
      return;
    }

    await executeGeneration(data);
  };

  const handleDownload = () => {
    if (!canvasRef.current) return;
    const link = document.createElement("a");
    link.download = `hh-goa-passport-${generatedCard?.publicId || "badge"}.png`;
    link.href = canvasRef.current.toDataURL("image/png");
    link.click();
  };

  const shareToTwitter = () => {
    if (!generatedCard) return;
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || window.location.origin;
    const shareUrl = `${appUrl}/share/${generatedCard.publicId}`;
    const text = `I just got my Hacker House Goa Builder ID! ✦\n\nSee my passport and connect with me at the event:\n${shareUrl}\n\n#FrameInGoa @HackerHouseGoa`;
    const twitterIntent = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`;
    window.open(twitterIntent, "_blank");
  };

  return (
    <div className={generatedCard 
      ? "grid grid-cols-1 lg:grid-cols-2 gap-8 items-start max-w-6xl mx-auto w-full px-4 py-8 relative z-20"
      : "max-w-xl mx-auto w-full px-4 py-8 relative z-20"
    }>
      {/* LEFT Pane: Inputs */}
      {!generatedCard ? (
        <form
          onSubmit={handleSubmit(onFormSubmit)}
          className="bg-white text-hh-ink brutalist-border border-3 p-4 sm:p-6 shadow-[6px_6px_0px_var(--hh-yellow)] flex flex-col gap-6"
        >
          <div className="bg-hh-yellow border-3 border-hh-ink p-3 sm:p-4 rotate-[-1deg] shadow-[3px_3px_0px_var(--hh-ink)] mb-2">
            <h2 className="font-serif text-2xl sm:text-3xl font-black uppercase tracking-tight text-center">
              CREATE YOUR PASSPORT
            </h2>
          </div>

          {/* Photo Upload Area */}
          <div className="flex flex-col gap-2">
            <label className="font-mono text-sm font-extrabold uppercase text-hh-ink">
              1. Profile Photo (JPG, PNG, HEIC)
            </label>
            <div className="relative border-3 border-dashed border-hh-ink p-4 sm:p-8 text-center bg-hh-yellow/5 hover:bg-hh-yellow/10 transition-colors flex flex-col items-center justify-center gap-3">
              <input
                type="file"
                accept="image/*,.heic,.heif"
                onChange={handlePhotoUpload}
                className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
              />
              <Upload size={36} className="text-hh-ink" />
              {isConvertingHeic ? (
                <div className="flex items-center gap-2 font-bold text-hh-pink">
                  <RefreshCw className="animate-spin" size={16} />
                  Converting HEIC file...
                </div>
              ) : photoSrc ? (
                <div className="flex flex-col items-center gap-4 py-2 w-full">
                  {/* Local Crop Positioner Preview */}
                  <div className="relative w-[180px] h-[180px] brutalist-border border-3 shadow-[4px_4px_0px_var(--hh-ink)] bg-hh-green overflow-hidden">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={photoSrc}
                      alt="Crop Preview"
                      style={{
                        transform: `scale(${formValues.zoom || 1}) translate(${(formValues.offsetX || 0) * 0.6}px, ${-(formValues.offsetY || 0) * 0.6}px)`,
                        width: "100%",
                        height: "100%",
                        objectFit: "cover",
                        objectPosition: imgDimensions.height > imgDimensions.width ? "center 15%" : "center center",
                      }}
                      className="transition-transform duration-75"
                    />
                  </div>
                  <div className="text-green-600 font-extrabold flex items-center gap-1.5 text-xs bg-white border-2 border-hh-ink px-2.5 py-1 shadow-[2.5px_2.5px_0px_var(--hh-ink)] rotate-[-1deg]">
                    <Check size={16} /> PHOTO SELECTED
                  </div>
                  <span className="text-[10px] text-hh-ink/60 font-bold">
                    Click anywhere inside to choose a different photo
                  </span>
                </div>
              ) : (
                <div>
                  <span className="font-extrabold">DROP YOUR PHOTO</span> or <span className="underline font-extrabold">CHOOSE A FILE</span>
                </div>
              )}
            </div>
          </div>

          {/* Interactive Photo Cropper Sliders */}
          {photoSrc && (
            <div className="bg-white text-hh-ink brutalist-border border-3 p-3 sm:p-4 shadow-[4px_4px_0px_var(--hh-ink)] flex flex-col gap-4 mt-2">
              <div className="bg-hh-yellow border-2 border-hh-ink px-3 py-1.5 text-center font-serif text-sm font-black uppercase rotate-[-0.5deg]">
                ↔️ ↕️ ADJUST PHOTO CROP & ZOOM
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Zoom Slider */}
                <div className="flex flex-col gap-1">
                  <label className="font-mono text-[10px] font-extrabold uppercase flex justify-between">
                    <span>🔍 Zoom ({formValues.zoom?.toFixed(1) || "1.0"}x)</span>
                  </label>
                  <input
                    type="range"
                    min="1"
                    max="3"
                    step="0.05"
                    {...register("zoom", { valueAsNumber: true })}
                    className="w-full h-2 bg-hh-yellow/20 border-2 border-hh-ink rounded-none appearance-none cursor-pointer accent-hh-pink"
                  />
                </div>
                {/* Offset X Slider */}
                <div className="flex flex-col gap-1">
                  <label className="font-mono text-[10px] font-extrabold uppercase">
                    ↔️ Pan Left/Right
                  </label>
                  <input
                    type="range"
                    min="-150"
                    max="150"
                    step="1"
                    {...register("offsetX", { valueAsNumber: true })}
                    className="w-full h-2 bg-hh-yellow/20 border-2 border-hh-ink rounded-none appearance-none cursor-pointer accent-hh-pink"
                  />
                </div>
                {/* Offset Y Slider */}
                <div className="flex flex-col gap-1">
                  <label className="font-mono text-[10px] font-extrabold uppercase">
                    ↕️ Pan Up/Down
                  </label>
                  <input
                    type="range"
                    min="-150"
                    max="150"
                    step="1"
                    {...register("offsetY", { valueAsNumber: true })}
                    className="w-full h-2 bg-hh-yellow/20 border-2 border-hh-ink rounded-none appearance-none cursor-pointer accent-hh-pink"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Fields */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Name */}
            <div className="flex flex-col gap-1.5 col-span-1 md:col-span-2">
              <label className="font-mono text-sm font-extrabold uppercase">Full Name</label>
              <input
                type="text"
                placeholder="e.g. Alex Sharma"
                className="p-3 border-3 border-hh-ink font-bold focus:outline-none focus:bg-hh-yellow/10"
                {...register("name")}
              />
              {errors.name && <span className="text-hh-pink font-bold text-xs">{(errors.name as any).message}</span>}
            </div>

            {/* Role */}
            <div className="flex flex-col gap-1.5">
              <label className="font-mono text-sm font-extrabold uppercase">Primary Role</label>
              <select
                className="p-3 border-3 border-hh-ink font-bold focus:outline-none bg-white"
                {...register("role")}
              >
                {ROLES.map((r) => (
                  <option key={r} value={r}>
                    {r}
                  </option>
                ))}
              </select>
            </div>

            {/* Stack */}
            <div className="flex flex-col gap-1.5">
              <label className="font-mono text-sm font-extrabold uppercase">Primary Stack</label>
              <select
                className="p-3 border-3 border-hh-ink font-bold focus:outline-none bg-white"
                {...register("stack")}
              >
                {STACKS.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>

            {/* X Handle */}
            <div className="flex flex-col gap-1.5">
              <label className="font-mono text-sm font-extrabold uppercase">X (Twitter) handle</label>
              <input
                type="text"
                placeholder="e.g. alex_codes"
                className="p-3 border-3 border-hh-ink font-bold focus:outline-none"
                {...register("xHandle")}
              />
            </div>

            {/* Github Handle */}
            <div className="flex flex-col gap-1.5">
              <label className="font-mono text-sm font-extrabold uppercase">GitHub username</label>
              <input
                type="text"
                placeholder="e.g. alexs"
                className="p-3 border-3 border-hh-ink font-bold focus:outline-none"
                {...register("github")}
              />
            </div>

            {/* City */}
            <div className="flex flex-col gap-1.5 col-span-1 md:col-span-2">
              <label className="font-mono text-sm font-extrabold uppercase">Home City</label>
              <input
                type="text"
                placeholder="e.g. Panaji, Goa"
                className="p-3 border-3 border-hh-ink font-bold focus:outline-none"
                {...register("city")}
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isGenerating}
            className="w-full py-4 sm:py-5 text-lg sm:text-xl brutalist-button cursor-pointer flex items-center justify-center gap-2"
          >
            {isGenerating ? (
              <>
                <RefreshCw className="animate-spin" size={22} />
                GENERATING BADGE...
              </>
            ) : (
              "GENERATE MY BUILDER ID"
            )}
          </button>
        </form>
      ) : (
        /* Result Pane (after registration success) */
        <div className="bg-white text-hh-ink brutalist-border border-3 p-4 sm:p-6 shadow-[6px_6px_0px_var(--hh-pink)] flex flex-col gap-6">
          <div className="bg-hh-pink border-3 border-hh-ink p-3 sm:p-4 rotate-[1deg] shadow-[3px_3px_0px_var(--hh-ink)] text-white text-center">
            <h2 className="font-serif text-2xl sm:text-3xl font-black uppercase tracking-tight">
              PASSPORT READY!
            </h2>
            <p className="font-mono text-xs mt-1 uppercase text-hh-yellow">
              Your networking passport is active
            </p>
          </div>

          <div className="flex flex-col gap-4">
            <button
              onClick={handleDownload}
              className="w-full py-4 text-lg brutalist-button flex items-center justify-center gap-2 cursor-pointer"
            >
              <Download size={20} />
              DOWNLOAD PASSPORT IMAGE
            </button>

            <button
              onClick={shareToTwitter}
              className="w-full py-4 text-lg brutalist-button-pink flex items-center justify-center gap-2 cursor-pointer"
            >
              <TwitterIcon className="w-5 h-5" />
              SHARE TO X / TWITTER
            </button>

            <button
              onClick={() => router.push("/network")}
              className="w-full py-4 text-lg bg-hh-green text-white font-extrabold uppercase border-3 border-hh-ink shadow-[4px_4px_0px_0px_var(--hh-ink)] hover:translate-y-[-1px] hover:shadow-[5px_5px_0px_var(--hh-ink)] active:translate-y-[1px] active:shadow-[2px_2px_0px_var(--hh-ink)] flex items-center justify-center gap-2 cursor-pointer"
            >
              START NETWORKING
            </button>
          </div>

          <div className="border-t-2 border-dashed border-hh-ink/30 pt-4 text-center">
            <p className="text-xs text-hh-ink/70 leading-relaxed font-bold">
              ✦ Share this passport on X using the <span className="text-hh-pink">#FrameInGoa</span> tag. Let other builders scan the QR code to connect with your profile instantly!
            </p>
          </div>
        </div>
      )}

      {/* RIGHT Pane: Canvas Live Preview (Only visible after registration success) */}
      <div className={`flex flex-col items-center justify-center gap-4 ${!generatedCard ? "hidden animate-out fade-out" : "animate-in fade-in duration-200"}`}>
        <span className="font-mono text-xs tracking-widest text-hh-yellow uppercase bg-hh-ink/40 px-3 py-1 brutalist-border border-2 rounded-full inline-block shadow-[2px_2px_0px_var(--hh-ink)]">
          LIVE PREVIEW (REAL-TIME DRAW)
        </span>
        <div className="shadow-[8px_8px_0px_var(--hh-ink)] overflow-hidden">
          {/* Main composition canvas */}
          <canvas
            ref={canvasRef}
            width={600}
            height={900}
            className="w-full max-w-[340px] md:max-w-[400px] h-auto object-contain block bg-[#003D24]"
          />
        </div>
      </div>

      {/* Themed Overwrite Warning Modal */}
      {showConfirmModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white text-hh-ink brutalist-border border-3 p-6 max-w-md w-full shadow-[8px_8px_0px_var(--hh-yellow)] flex flex-col gap-5 relative animate-in fade-in zoom-in-95 duration-150">
            <div className="bg-hh-pink border-3 border-hh-ink p-4 rotate-[-1deg] shadow-[3px_3px_0px_var(--hh-ink)] text-white text-center">
              <h3 className="font-serif text-2xl font-black uppercase tracking-tight flex items-center justify-center gap-2">
                ⚠️ WARNING
              </h3>
            </div>

            <div className="text-sm font-bold leading-relaxed text-hh-ink/80 bg-hh-yellow/5 border-2 border-dashed border-hh-ink/30 p-4 text-center">
              You already have an active profile (**{builder?.builderTitle}**). 
              <br /><br />
              Generating a new ID card will **permanently delete** your old profile and **reset all connections** you have established on the leaderboard.
            </div>

            <div className="flex flex-col sm:flex-row gap-3 mt-2">
              <button
                onClick={() => {
                  setShowConfirmModal(false);
                  if (pendingData) {
                    executeGeneration(pendingData);
                  }
                }}
                className="flex-1 py-3 text-sm font-extrabold uppercase bg-hh-pink text-white brutalist-border border-2 shadow-[2px_2px_0px_var(--hh-ink)] hover:translate-y-[-1px] hover:shadow-[3px_3px_0px_var(--hh-ink)] active:translate-y-[1px] active:shadow-[1px_1px_0px_var(--hh-ink)] cursor-pointer"
              >
                PROCEED & DELETE OLD
              </button>
              <button
                onClick={() => {
                  setShowConfirmModal(false);
                  setPendingData(null);
                }}
                className="flex-1 py-3 text-sm font-extrabold uppercase bg-white text-hh-ink brutalist-border border-2 shadow-[2px_2px_0px_var(--hh-ink)] hover:translate-y-[-1px] hover:shadow-[3px_3px_0px_var(--hh-ink)] active:translate-y-[1px] active:shadow-[1px_1px_0px_var(--hh-ink)] cursor-pointer"
              >
                KEEP MY OLD CARD
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
