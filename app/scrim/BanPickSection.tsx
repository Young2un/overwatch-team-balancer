"use client";

import { summarizeBanPick } from "@/lib/match/banpick";
import { RandomBanPick } from "@/lib/match/types";

/** 랜덤벤픽 설정 UI. 나중에 랜덤벤픽 사용 시 페이지에서 이 컴포넌트만 주석 해제하면 됨 */
export function BanPickSettingsSection({
  value,
  onChange,
}: {
  value: RandomBanPick;
  onChange: (v: RandomBanPick) => void;
}) {
  return (
    <div className="mb-6 p-4 bg-gray-50 rounded-lg">
      <h3 className="text-lg font-medium text-gray-900 mb-4">
        랜덤벤픽 설정
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <label className="flex items-center">
          <input
            type="checkbox"
            checked={value.enabled}
            onChange={(e) =>
              onChange({
                ...value,
                enabled: e.target.checked,
              })
            }
            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
          />
          <span className="ml-2 text-sm text-gray-700">랜덤벤픽 사용</span>
        </label>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            역할당 최대 밴 수:
          </label>
          <input
            type="number"
            min="0"
            max="5"
            value={value.maxBansPerRole}
            onChange={(e) =>
              onChange({
                ...value,
                maxBansPerRole: parseInt(e.target.value) || 0,
              })
            }
            className="w-20 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            포지션당 최대 밴 수:
          </label>
          <input
            type="number"
            min="0"
            max="4"
            value={value.maxBansPerPosition}
            onChange={(e) =>
              onChange({
                ...value,
                maxBansPerPosition: parseInt(e.target.value) || 0,
              })
            }
            className="w-20 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          />
        </div>
      </div>
    </div>
  );
}

/** 랜덤벤픽 결과 표시. 나중에 랜덤벤픽 사용 시 페이지에서 이 컴포넌트만 주석 해제하면 됨 */
export function BanPickResultSection({
  bannedHeroes,
}: {
  bannedHeroes: string[];
}) {
  const summary = summarizeBanPick(bannedHeroes);
  return (
    <div className="bg-red-50 border border-red-200 rounded-lg p-4">
      <h3 className="text-lg font-medium text-red-800 mb-2">
        🚫 밴된 영웅들 ({bannedHeroes.length}개)
      </h3>
      {bannedHeroes.length > 0 ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
          {bannedHeroes.map((hero, index) => (
            <div
              key={index}
              className="bg-white rounded px-3 py-2 border border-red-100"
            >
              <span className="text-sm font-medium text-red-900">{hero}</span>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-red-700 text-sm">밴된 영웅이 없습니다.</div>
      )}
      <div className="mt-3 pt-3 border-t border-red-200">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div>
            <span className="font-medium text-red-800">총 밴 수:</span>
            <span className="ml-2 text-red-700">{summary.totalBans}</span>
          </div>
          <div>
            <span className="font-medium text-red-800">탱커:</span>
            <span className="ml-2 text-red-700">{summary.byRole.TANK}</span>
          </div>
          <div>
            <span className="font-medium text-red-800">딜러:</span>
            <span className="ml-2 text-red-700">{summary.byRole.DPS}</span>
          </div>
          <div>
            <span className="font-medium text-red-800">힐러:</span>
            <span className="ml-2 text-red-700">{summary.byRole.SUPPORT}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
