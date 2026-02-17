import { getPlayers } from "@/app/actions";
import { Settings } from "lucide-react";
import Link from "next/link";
import ScrimClient from "./ScrimClient";

export const dynamic = "force-dynamic";

export default async function ScrimPage() {
  const players = await getPlayers();

  return (
    <div>
      <div className="absolute top-4 right-4 z-10">
        <Link 
          href="/manage" 
          className="flex items-center gap-2 bg-white px-4 py-2 rounded-full shadow-md hover:bg-gray-50 text-gray-700 font-medium transition"
        >
          <Settings size={18} />
          선수 관리
        </Link>
      </div>
      <ScrimClient initialPlayers={players} />
    </div>
  );
}
