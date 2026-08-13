"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { BrowserQRCodeReader } from "@zxing/library";
import { Camera, Upload, AlertCircle, RefreshCw, StopCircle } from "lucide-react";

export default function QRScanner() {
  const router = useRouter();
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [hasCameraPermission, setHasCameraPermission] = useState<boolean | null>(null);
  const [devices, setDevices] = useState<MediaDeviceInfo[]>([]);
  const [selectedDeviceId, setSelectedDeviceId] = useState<string>("");
  const [isScanning, setIsScanning] = useState(false);
  const [scanError, setScanError] = useState<string | null>(null);
  const codeReaderRef = useRef<BrowserQRCodeReader | null>(null);

  // Initialize ZXing code reader
  useEffect(() => {
    codeReaderRef.current = new BrowserQRCodeReader();
    return () => {
      stopCamera();
    };
  }, []);

  // Request camera list and check permission on start
  async function startCamera() {
    setScanError(null);
    try {
      const codeReader = codeReaderRef.current;
      if (!codeReader) return;

      const videoInputDevices = await codeReader.listVideoInputDevices();
      setDevices(videoInputDevices);
      setHasCameraPermission(true);

      if (videoInputDevices.length > 0) {
        // Select back camera if available, otherwise default to first device
        const backCamera = videoInputDevices.find((device) =>
          device.label.toLowerCase().includes("back") ||
          device.label.toLowerCase().includes("environment")
        );
        const deviceId = backCamera ? backCamera.deviceId : videoInputDevices[0].deviceId;
        setSelectedDeviceId(deviceId);

        setIsScanning(true);
        decodeStream(deviceId);
      } else {
        setScanError("No camera devices found.");
      }
    } catch (error: any) {
      console.error("Camera permission error:", error);
      setHasCameraPermission(false);
      setScanError("Camera access denied. Please grant permission or upload a QR image.");
    }
  }

  function decodeStream(deviceId: string) {
    const codeReader = codeReaderRef.current;
    const video = videoRef.current;
    if (!codeReader || !video) return;

    codeReader.decodeFromVideoDevice(deviceId, video, (result, err) => {
      if (result) {
        // Stop scanning and redirect
        stopCamera();
        handleScanSuccess(result.getText());
      }
      if (err && !(err.name === "NotFoundException")) {
        // Console error occasionally happens during search cycles, ignore standard not found
        console.warn("Scan error cycle:", err);
      }
    });
  }

  function stopCamera() {
    const codeReader = codeReaderRef.current;
    if (codeReader) {
      codeReader.reset();
    }
    setIsScanning(false);
  }

  function changeCamera(deviceId: string) {
    setSelectedDeviceId(deviceId);
    if (isScanning) {
      stopCamera();
      setIsScanning(true);
      decodeStream(deviceId);
    }
  }

  function handleScanSuccess(text: string) {
    try {
      const url = new URL(text);
      const pathname = url.pathname; // Should be /connect/[token]
      if (pathname.startsWith("/connect/")) {
        router.push(pathname);
      } else {
        alert(`Invalid QR code target: ${text}. Must be a Hacker House connection link.`);
      }
    } catch {
      // If it's a raw token instead of a URL
      if (text.length > 10 && !text.includes(" ")) {
        router.push(`/connect/${text}`);
      } else {
        alert(`Invalid QR code content: ${text}`);
      }
    }
  }

  // Fallback QR Image Upload processing
  async function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file || !codeReaderRef.current) return;

    setScanError(null);
    try {
      const reader = new FileReader();
      reader.onload = async (event) => {
        const dataUrl = event.target?.result as string;

        // Draw image onto a temp image element for ZXing
        const img = new Image();
        img.src = dataUrl;
        img.onload = async () => {
          try {
            const codeReader = codeReaderRef.current;
            if (!codeReader) return;
            const result = await codeReader.decodeFromImageElement(img);
            handleScanSuccess(result.getText());
          } catch (err) {
            console.error("QR Image decode error:", err);
            setScanError("Could not find any QR code in this image. Make sure it's bright and clear.");
          }
        };
      };
      reader.readAsDataURL(file);
    } catch (err) {
      console.error(err);
      setScanError("Failed to process QR image.");
    }
  }

  return (
    <div className="bg-white text-hh-ink brutalist-border border-3 p-6 shadow-[6px_6px_0px_var(--hh-yellow)] max-w-lg w-full">
      <div className="bg-hh-yellow border-3 border-hh-ink p-4 rotate-[-1.5deg] shadow-[3px_3px_0px_var(--hh-ink)] mb-6 text-center">
        <h2 className="font-serif text-3xl font-black uppercase tracking-tight">
          SCAN A BUILDER
        </h2>
      </div>

      {/* Main scanner container */}
      <div className="relative aspect-square border-3 border-hh-ink bg-black mb-6 overflow-hidden flex items-center justify-center">
        {isScanning ? (
          <video
            ref={videoRef}
            className="w-full h-full object-cover"
            playsInline
            muted
          />
        ) : (
          <div className="flex flex-col items-center gap-4 text-center p-6">
            <Camera size={48} className="text-white/60 animate-bounce" />
            <button
              onClick={startCamera}
              className="px-6 py-3 font-extrabold uppercase bg-hh-yellow text-hh-ink brutalist-border border-2 shadow-[3px_3px_0px_var(--hh-ink)] active:translate-y-0.5 cursor-pointer"
            >
              Open Camera Stream
            </button>
          </div>
        )}

        {/* Scanner Target Guide Overlay */}
        {isScanning && (
          <div className="absolute inset-0 border-[40px] border-black/40 pointer-events-none flex items-center justify-center">
            <div className="w-48 h-48 border-4 border-dashed border-hh-yellow relative animate-pulse-slow">
              {/* Laser line effect */}
              <div className="absolute left-0 w-full h-1 bg-hh-pink top-[50%] shadow-[0px_0px_8px_var(--hh-pink)]" />
            </div>
          </div>
        )}
      </div>

      {/* Camera Devices Dropdown */}
      {devices.length > 1 && isScanning && (
        <div className="flex flex-col gap-1.5 mb-4">
          <label className="font-mono text-xs font-extrabold uppercase">Switch Camera Source</label>
          <select
            value={selectedDeviceId}
            onChange={(e) => changeCamera(e.target.value)}
            className="p-3 border-3 border-hh-ink font-bold bg-white focus:outline-none"
          >
            {devices.map((device, idx) => (
              <option key={device.deviceId} value={device.deviceId}>
                {device.label || `Camera ${idx + 1}`}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Control Buttons */}
      {isScanning && (
        <button
          onClick={stopCamera}
          className="w-full mb-6 py-3 bg-hh-pink text-white font-extrabold uppercase border-3 border-hh-ink shadow-[3px_3px_0px_var(--hh-ink)] active:translate-y-0.5 flex items-center justify-center gap-2 cursor-pointer"
        >
          <StopCircle size={20} />
          Stop Camera
        </button>
      )}

      {/* Fallback Image Upload */}
      <div className="border-t-3 border-dashed border-hh-ink/20 pt-6">
        <p className="font-mono text-xs font-extrabold uppercase mb-3 text-center text-hh-ink/75">
          Camera not working? Try file upload
        </p>

        <div className="relative border-3 border-dashed border-hh-ink p-6 text-center bg-hh-yellow/5 hover:bg-hh-yellow/10 transition-colors flex flex-col items-center justify-center gap-2">
          <input
            type="file"
            accept="image/*"
            onChange={handleImageUpload}
            className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
          />
          <Upload size={24} className="text-hh-ink" />
          <span className="font-extrabold text-sm uppercase">Upload Card screenshot</span>
        </div>
      </div>

      {/* Error alert box */}
      {scanError && (
        <div className="mt-6 bg-red-100 border-3 border-red-500 p-4 text-red-700 flex gap-2 items-start">
          <AlertCircle size={20} className="shrink-0 mt-0.5" />
          <div className="text-sm font-bold leading-normal">
            {scanError}
          </div>
        </div>
      )}
    </div>
  );
}
