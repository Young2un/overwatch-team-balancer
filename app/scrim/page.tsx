"use client";

import { roleBalancedAssign } from "@/lib/match/assign";
import { summarizeBanPick } from "@/lib/match/banpick";
import { improveBalance } from "@/lib/match/improve";
import { getMapTypeDescription } from "@/lib/match/maps";
import { MatchResult, Player, RandomBanPick, Role } from "@/lib/match/types";
import { useEffect, useState } from "react";

// 샘플 플레이어 데이터
const SAMPLE_PLAYERS: Player[] = [
  {
    id: "1",
    name: "김영은",
    roles: ["SUPPORT", "DPS"],
    primary: "TANK",
    skills: { TANK: 3500, DPS: 3200 },
  },
  {
    id: "2",
    name: "DPSPro",
    roles: ["DPS", "TANK"],
    primary: "DPS",
    skills: { DPS: 3600, TANK: 3000 },
  },
  {
    id: "3",
    name: "장승원",
    roles: ["SUPPORT"],
    primary: "SUPPORT",
    skills: { SUPPORT: 3400 },
  },
  {
    id: "4",
    name: "오현진",
    roles: ["TANK", "DPS", "SUPPORT"],
    primary: "DPS",
    skills: { TANK: 3100, DPS: 3300, SUPPORT: 2900 },
  },
  {
    id: "5",
    name: "신윤수",
    roles: ["SUPPORT", "DPS"],
    primary: "SUPPORT",
    skills: { SUPPORT: 3500, DPS: 2800 },
  },
  {
    id: "6",
    name: "이호균",
    roles: ["TANK", "SUPPORT"],
    primary: "TANK",
    skills: { TANK: 3200, SUPPORT: 3000 },
  },
  {
    id: "7",
    name: "고은별",
    roles: ["DPS", "SUPPORT"],
    primary: "DPS",
    skills: { DPS: 3400, SUPPORT: 3100 },
  },
  {
    id: "8",
    name: "김제휘",
    roles: ["SUPPORT", "TANK"],
    primary: "SUPPORT",
    skills: { SUPPORT: 3300, TANK: 2900 },
  },
  {
    id: "9",
    name: "권재민",
    roles: ["SUPPORT", "TANK"],
    primary: "SUPPORT",
    skills: { SUPPORT: 3300, TANK: 2900 },
  },
  {
    id: "10",
    name: "김제휘",
    roles: ["SUPPORT", "TANK"],
    primary: "SUPPORT",
    skills: { SUPPORT: 3300, TANK: 2900 },
  },
];

const ROLES: Role[] = ["TANK", "DPS", "SUPPORT"];

export default function ScrimPage() {
  const [players, setPlayers] = useState<Player[]>(SAMPLE_PLAYERS);
  const [seed, setSeed] = useState<number>(42);
  const [result, setResult] = useState<MatchResult | null>(null);
  const [enableImprovement, setEnableImprovement] = useState<boolean>(true);
  const [banPickSettings, setBanPickSettings] = useState<RandomBanPick>({
    enabled: true,
    maxBansPerRole: 2,
    maxBansPerPosition: 2,
  });

  // 플레이어 변경 시 자동 재계산
  useEffect(() => {
    if (players.length > 0) {
      const matchResult = roleBalancedAssign(players, seed, banPickSettings);
      if (enableImprovement) {
        const improvedResult = improveBalance(matchResult);
        setResult(improvedResult);
      } else {
        setResult(matchResult);
      }
    }
  }, [players, seed, enableImprovement, banPickSettings]);

  const addPlayer = () => {
    const newPlayer: Player = {
      id: Date.now().toString(),
      name: "",
      roles: [],
      skills: {},
    };
    setPlayers([...players, newPlayer]);
  };

  const removePlayer = (id: string) => {
    setPlayers(players.filter((p) => p.id !== id));
  };

  const updatePlayer = (id: string, updates: Partial<Player>) => {
    setPlayers(players.map((p) => (p.id === id ? { ...p, ...updates } : p)));
  };

  const updatePlayerSkill = (id: string, role: Role, value: string) => {
    const numValue = value === "" ? undefined : parseInt(value);
    setPlayers(
      players.map((p) => {
        if (p.id === id) {
          const newSkills = { ...p.skills };
          if (numValue !== undefined) {
            newSkills[role] = numValue;
          } else {
            delete newSkills[role];
          }
          return { ...p, skills: newSkills };
        }
        return p;
      })
    );
  };

  const toggleRole = (id: string, role: Role) => {
    setPlayers(
      players.map((p) => {
        if (p.id === id) {
          const newRoles = p.roles.includes(role)
            ? p.roles.filter((r) => r !== role)
            : [...p.roles, role];
          return { ...p, roles: newRoles };
        }
        return p;
      })
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            오버워치 팀 밸런스 생성기
          </h1>
          <p className="text-lg text-gray-600">
            공정하고 균형잡힌 팀을 만들어보세요
          </p>
        </div>

        {/* 설정 패널 */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-semibold text-gray-900">설정</h2>
            <div className="flex items-center space-x-4">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={enableImprovement}
                  onChange={(e) => setEnableImprovement(e.target.checked)}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="ml-2 text-sm text-gray-700">
                  개선 알고리즘 사용
                </span>
              </label>
              <div className="flex items-center space-x-2">
                <label
                  htmlFor="seed"
                  className="text-sm font-medium text-gray-700"
                >
                  시드:
                </label>
                <input
                  id="seed"
                  type="number"
                  value={seed}
                  onChange={(e) => setSeed(parseInt(e.target.value) || 0)}
                  className="w-20 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>

          {/* 랜덤벤픽 설정 */}
          <div className="mb-6 p-4 bg-gray-50 rounded-lg">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              랜덤벤픽 설정
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={banPickSettings.enabled}
                  onChange={(e) =>
                    setBanPickSettings({
                      ...banPickSettings,
                      enabled: e.target.checked,
                    })
                  }
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="ml-2 text-sm text-gray-700">
                  랜덤벤픽 사용
                </span>
              </label>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  역할당 최대 밴 수:
                </label>
                <input
                  type="number"
                  min="0"
                  max="5"
                  value={banPickSettings.maxBansPerRole}
                  onChange={(e) =>
                    setBanPickSettings({
                      ...banPickSettings,
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
                  value={banPickSettings.maxBansPerPosition}
                  onChange={(e) =>
                    setBanPickSettings({
                      ...banPickSettings,
                      maxBansPerPosition: parseInt(e.target.value) || 0,
                    })
                  }
                  className="w-20 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>

          {/* 플레이어 목록 */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium text-gray-900">
                플레이어 목록
              </h3>
              <button
                onClick={addPlayer}
                className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                플레이어 추가
              </button>
            </div>

            {players.map((player, index) => (
              <div
                key={player.id}
                className="border border-gray-200 rounded-lg p-4"
              >
                <div className="flex items-center justify-between mb-4">
                  <input
                    type="text"
                    value={player.name}
                    onChange={(e) =>
                      updatePlayer(player.id, { name: e.target.value })
                    }
                    placeholder="플레이어 이름"
                    className="flex-1 mr-4 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  />
                  <button
                    onClick={() => removePlayer(player.id)}
                    className="text-red-600 hover:text-red-800 focus:outline-none"
                  >
                    삭제
                  </button>
                </div>

                {/* 역할 선택 */}
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    가능한 역할:
                  </label>
                  <div className="flex space-x-4">
                    {ROLES.map((role) => (
                      <label key={role} className="flex items-center">
                        <input
                          type="checkbox"
                          checked={player.roles.includes(role)}
                          onChange={() => toggleRole(player.id, role)}
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                        <span className="ml-2 text-sm text-gray-700">
                          {role}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* 선호 역할 */}
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    선호 역할:
                  </label>
                  <div className="flex space-x-4">
                    {ROLES.map((role) => (
                      <label key={role} className="flex items-center">
                        <input
                          type="radio"
                          name={`primary-${player.id}`}
                          checked={player.primary === role}
                          onChange={() =>
                            updatePlayer(player.id, { primary: role })
                          }
                          className="border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                        <span className="ml-2 text-sm text-gray-700">
                          {role}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* 스킬 입력 */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    역할별 스킬 (SR):
                  </label>
                  <div className="grid grid-cols-3 gap-4">
                    {ROLES.map((role) => (
                      <div key={role}>
                        <label className="block text-xs text-gray-600 mb-1">
                          {role}
                        </label>
                        <input
                          type="number"
                          value={player.skills[role] || ""}
                          onChange={(e) =>
                            updatePlayerSkill(player.id, role, e.target.value)
                          }
                          placeholder="0"
                          className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 결과 표시 */}
        {result && (
          <div className="space-y-6">
            {/* 전장 정보 */}
            {result.selectedMap && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <h3 className="text-lg font-medium text-green-800 mb-2">
                  🗺️ 선택된 전장
                </h3>
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-xl font-bold text-green-900">
                      {result.selectedMap.name}
                    </div>
                    <div className="text-sm text-green-700">
                      {result.selectedMap.description}
                    </div>
                    <div className="text-xs text-green-600 mt-1">
                      {getMapTypeDescription(result.selectedMap.type)}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-medium text-green-800">
                      {result.selectedMap.type}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* 랜덤벤픽 결과 */}
            {result.bannedHeroes && result.bannedHeroes.length > 0 && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <h3 className="text-lg font-medium text-red-800 mb-2">
                  🚫 밴된 영웅들
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
                  {result.bannedHeroes.map((hero, index) => (
                    <div
                      key={index}
                      className="bg-white rounded px-3 py-2 border border-red-100"
                    >
                      <span className="text-sm font-medium text-red-900">
                        {hero}
                      </span>
                    </div>
                  ))}
                </div>
                {(() => {
                  const summary = summarizeBanPick(result.bannedHeroes);
                  return (
                    <div className="mt-3 pt-3 border-t border-red-200">
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div>
                          <span className="font-medium text-red-800">
                            총 밴 수:
                          </span>
                          <span className="ml-2 text-red-700">
                            {summary.totalBans}
                          </span>
                        </div>
                        <div>
                          <span className="font-medium text-red-800">
                            탱커:
                          </span>
                          <span className="ml-2 text-red-700">
                            {summary.byRole.TANK}
                          </span>
                        </div>
                        <div>
                          <span className="font-medium text-red-800">
                            딜러:
                          </span>
                          <span className="ml-2 text-red-700">
                            {summary.byRole.DPS}
                          </span>
                        </div>
                        <div>
                          <span className="font-medium text-red-800">
                            힐러:
                          </span>
                          <span className="ml-2 text-red-700">
                            {summary.byRole.SUPPORT}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })()}
              </div>
            )}

            {/* 경고 메시지 */}
            {result.warnings.length > 0 && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <h3 className="text-lg font-medium text-yellow-800 mb-2">
                  ⚠️ 경고
                </h3>
                <ul className="list-disc list-inside space-y-1">
                  {result.warnings.map((warning, index) => (
                    <li key={index} className="text-yellow-700">
                      {warning}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* 팀 결과 */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* A팀 */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                <h3 className="text-2xl font-bold text-blue-900 mb-4">A팀</h3>
                <div className="space-y-3">
                  {result.teamA.players.map((player, index) => (
                    <div
                      key={index}
                      className="bg-white rounded-lg p-3 border border-blue-100"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-medium text-gray-900">
                          {player.name}
                        </span>
                        <span className="text-sm text-gray-600">
                          {player.assignedRole} (
                          {player.skills[player.assignedRole!]} SR)
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="mt-4 pt-4 border-t border-blue-200">
                  <div className="text-lg font-semibold text-blue-900">
                    총합: {result.teamA.totalSkill} SR
                  </div>
                </div>
              </div>

              {/* B팀 */}
              <div className="bg-red-50 border border-red-200 rounded-lg p-6">
                <h3 className="text-2xl font-bold text-red-900 mb-4">B팀</h3>
                <div className="space-y-3">
                  {result.teamB.players.map((player, index) => (
                    <div
                      key={index}
                      className="bg-white rounded-lg p-3 border border-red-100"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-medium text-gray-900">
                          {player.name}
                        </span>
                        <span className="text-sm text-gray-600">
                          {player.assignedRole} (
                          {player.skills[player.assignedRole!]} SR)
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="mt-4 pt-4 border-t border-red-200">
                  <div className="text-lg font-semibold text-red-900">
                    총합: {result.teamB.totalSkill} SR
                  </div>
                </div>
              </div>
            </div>

            {/* 관전자 */}
            {result.spectators.length > 0 && (
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-4">
                  관전자
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                  {result.spectators.map((player, index) => (
                    <div
                      key={index}
                      className="bg-white rounded-lg p-3 border border-gray-200"
                    >
                      <div className="text-sm font-medium text-gray-900">
                        {player.name}
                      </div>
                      <div className="text-xs text-gray-600">
                        {player.roles.join(", ")}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 밸런스 정보 */}
            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                밸런스 정보
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                <div>
                  <div className="text-2xl font-bold text-blue-600">
                    {result.teamA.totalSkill}
                  </div>
                  <div className="text-sm text-gray-600">A팀 총합</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-red-600">
                    {result.teamB.totalSkill}
                  </div>
                  <div className="text-sm text-gray-600">B팀 총합</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-gray-900">
                    {Math.abs(
                      result.teamA.totalSkill - result.teamB.totalSkill
                    )}
                  </div>
                  <div className="text-sm text-gray-600">차이</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-gray-900">
                    {result.teamA.players.length + result.teamB.players.length}
                  </div>
                  <div className="text-sm text-gray-600">참가자</div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
