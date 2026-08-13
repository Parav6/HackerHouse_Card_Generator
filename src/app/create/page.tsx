import Navbar from "@/components/navigation/Navbar";
import BuilderCardGenerator from "@/components/generator/BuilderCardGenerator";
import Image from "next/image";

export default function CreatePage() {
  return (
    <div className="flex flex-col min-h-screen bg-hh-green-dark text-white relative paper-texture overflow-hidden">
      <Navbar />

      <div className="flex-1 flex flex-col justify-center items-center py-12">
        <BuilderCardGenerator />
      </div>

      
    </div>
  );
}
