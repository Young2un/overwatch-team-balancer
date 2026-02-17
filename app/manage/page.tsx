import { getPlayers } from "@/app/actions";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import ManageClient from "./ManageClient";

export const dynamic = "force-dynamic";

export default async function ManagePage() {
  const players = await getPlayers();

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <Link
              href="/scrim"
              className="inline-flex items-center text-sm text-blue-600 hover:text-blue-800 mb-2 font-medium"
            >
              <ArrowLeft size={16} className="mr-1" />
              매치 생성하러 가기
            </Link>
            <h1 className="text-3xl font-bold text-gray-900">선수 관리</h1>
            <p className="mt-1 text-sm text-gray-600">
              팀 밸런싱에 사용할 선수들을 등록하고 관리하세요.
            </p>
          </div>
        </div>
        
        <ManageClient initialPlayers={players} />
      </div>
    </div>
  );
}
