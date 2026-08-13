import Navbar from "@/components/navigation/Navbar";
import QRScanner from "@/components/scanner/QRScanner";
import Image from "next/image";

export default function ScanPage() {
  return (
    <div className="flex flex-col min-h-screen bg-hh-green-dark text-white relative paper-texture overflow-hidden">
      <Navbar />

      <div className="flex-1 flex flex-col justify-center items-center py-12 px-4">
        <QRScanner />
      </div>

      
    </div>
  );
}
