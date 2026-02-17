"use client";

import { createPlayer, deletePlayer, updatePlayer } from "@/app/actions";
import { roleBalancedAssign } from "@/lib/match/assign";
import { improveBalance } from "@/lib/match/improve";
import { getMapTypeDescription } from "@/lib/match/maps";
import { MatchResult, Player, Role } from "@/lib/match/types";
import { useState } from "react";
// ----- 랜덤벤픽 사용 시 아래 2줄 + state 블록 + generateMatch 인자 + 설정/결과 컴포넌트 주석 해제, lib/match/assign.ts 벤픽 로직도 복구 -----
// import { BanPickSettingsSection, BanPickResultSection } from "./BanPickSection";
// import { RandomBanPick } from "@/lib/match/types";

const ROLES: Role[] = ["TANK", "DPS", "SUPPORT"];

interface ScrimClientProps {
  initialPlayers: Player[];
}

export default function ScrimClient({ initialPlayers }: ScrimClientProps) {
  const [players, setPlayers] = useState<Player[]>(initialPlayers);
  const [seed, setSeed] = useState<number>(42);
  const [result, setResult] = useState<MatchResult | null>(null);
  const [enableImprovement, setEnableImprovement] = useState<boolean>(true);
  // 랜덤벤픽 사용 시 아래 state 주석 해제
  // const [banPickSettings, setBanPickSettings] = useState<RandomBanPick>({
  //   enabled: true,
  //   maxBansPerRole: 2,
  //   maxBansPerPosition: 2,
  // });

  // 매치 생성 함수
  const generateMatch = () => {
    if (players.length > 0) {
      console.log("매치 생성 시작");
      const matchResult = roleBalancedAssign(players, seed); // 랜덤벤픽 사용 시: roleBalancedAssign(players, seed, banPickSettings)
      console.log("매치 결과:", matchResult);
      if (enableImprovement) {
        const improvedResult = improveBalance(matchResult);
        setResult(improvedResult);
      } else {
        setResult(matchResult);
      }
    }
  };

  const addPlayer = async () => {
    const newId = crypto.randomUUID();
    const newPlayer: Player = {
      id: newId,
      name: "",
      roles: [],
      skills: {},
      preferredHeroes: [],
    };
    // Optimistic update
    setPlayers([...players, newPlayer]);
    
    try {
      await createPlayer(newPlayer);
    } catch (error) {
      console.error("Failed to add player", error);
      // Revert if needed
    }
  };

  const removePlayer = async (id: string) => {
    // Optimistic update
    setPlayers(players.filter((p) => p.id !== id));
    
    try {
      await deletePlayer(id);
    } catch (error) {
      console.error("Failed to remove player", error);
    }
  };

  const updatePlayerData = async (id: string, updates: Partial<Player>) => {
    // Optimistic update
    const updatedPlayers = players.map((p) => (p.id === id ? { ...p, ...updates } : p));
    setPlayers(updatedPlayers);
    
    const playerToUpdate = updatedPlayers.find(p => p.id === id);
    if (playerToUpdate) {
       // Debounce this in a real app
       try {
         await updatePlayer(playerToUpdate);
       } catch (error) {
         console.error("Failed to update player", error);
       }
    }
  };

  const updatePlayerSkill = (id: string, role: Role, value: string) => {
    const numValue = value === "" ? undefined : parseInt(value);
    
    const player = players.find(p => p.id === id);
    if (!player) return;

    const newSkills = { ...player.skills };
    if (numValue !== undefined) {
      newSkills[role] = numValue;
    } else {
      delete newSkills[role];
    }
    
    updatePlayerData(id, { skills: newSkills });
  };

  const toggleRole = (id: string, role: Role) => {
    const player = players.find(p => p.id === id);
    if (!player) return;

    const newRoles = player.roles.includes(role)
      ? player.roles.filter((r) => r !== role)
      : [...player.roles, role];
    
    updatePlayerData(id, { roles: newRoles });
  };

  const generateRandomSeed = () => {
    const randomSeed = Math.floor(Math.random() * 1000000);
    setSeed(randomSeed);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            오버워치 팀 밸런스 생성기
          </h1>
          <p className="text-lg text-gray-600">
            공정하고 균형잡힌 팀을 만들어보세요. 건강하게 즐겜합시당!
          </p>
          <div className="mt-4 flex justify-center">
            <button
              onClick={() => {
                const url = `${window.location.origin}/join`;
                navigator.clipboard.writeText(url);
                alert("참가 신청 링크가 복사되었습니다!");
              }}
              className="flex items-center gap-2 bg-indigo-100 text-indigo-700 px-4 py-2 rounded-full hover:bg-indigo-200 transition text-sm font-medium"
            >
              🔗 참가 신청 링크 복사
            </button>
          </div>
        </div>

        {/* 설정 패널 */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-semibold text-gray-900">설정</h2>
            <div className="flex items-center space-x-4">
              <button
                onClick={generateMatch}
                className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium"
              >
                매치 생성
              </button>
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
                <button
                  onClick={generateRandomSeed}
                  className="bg-green-600 text-white px-3 py-1 rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 text-sm"
                  title="랜덤 시드 생성"
                >
                  랜덤 돌리기
                </button>
              </div>
            </div>
          </div>

          {/* 랜덤벤픽 사용 시 아래 한 줄 주석 해제 */}
          {/* <BanPickSettingsSection value={banPickSettings} onChange={setBanPickSettings} /> */}

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

            {players.map((player) => (
              <div
                key={player.id}
                className="border border-gray-200 rounded-lg p-4"
              >
                <div className="flex items-center justify-between mb-4">
                  <input
                    type="text"
                    value={player.name}
                    onChange={(e) =>
                      updatePlayerData(player.id, { name: e.target.value })
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
                          type="checkbox"
                          checked={player.primary?.includes(role) || false}
                          onChange={() => {
                            const currentPrimary = player.primary || [];
                            const newPrimary = currentPrimary.includes(role)
                              ? currentPrimary.filter((r) => r !== role)
                              : [...currentPrimary, role];
                            updatePlayerData(player.id, {
                              primary:
                                newPrimary.length > 0 ? newPrimary : undefined,
                            });
                          }}
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

            {/* 랜덤벤픽 사용 시 아래 한 줄 주석 해제 */}
            {/* {result.bannedHeroes && result.bannedHeroes.length > 0 && <BanPickResultSection bannedHeroes={result.bannedHeroes} />} */}

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
                      result.teamA.totalSkill - result.teamB.totalSkill,
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
