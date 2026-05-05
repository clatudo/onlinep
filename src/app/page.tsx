import { Cpu } from "lucide-react";

export default function Home() {
  return (
    <main className="min-h-screen bg-[#FAFBFA] flex flex-col items-center justify-center p-4">
      <div className="flex flex-col items-center gap-4 animate-in fade-in zoom-in duration-1000">
        <div className="flex items-center gap-3 sm:gap-4 group">
          <Cpu className="text-[#DE2027] w-12 h-12 sm:w-16 sm:h-16 group-hover:rotate-90 transition-transform duration-700" />
          <div className="flex items-center text-3xl sm:text-5xl font-black tracking-tighter font-heading leading-none">
            <span className="text-[#131A26]">ONLINE</span>
            <span className="text-[#DE2027]">PRODUÇÕES</span>
          </div>
        </div>
        <div className="w-16 h-1 bg-[#DE2027] rounded-full mt-2"></div>
      </div>
    </main>
  );
}
