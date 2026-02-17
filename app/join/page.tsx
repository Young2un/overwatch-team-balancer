import Link from "next/link";
import JoinClient from "./JoinClient";

export default function JoinPage() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md mb-4 flex justify-between items-center text-sm">
        <Link href="/scrim" className="text-blue-600 hover:underline">
          &larr; 스크림 페이지로 돌아가기
        </Link>
      </div>
      <JoinClient />
    </div>
  );
}
