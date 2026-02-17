"use client";

import { createPlayer } from "@/app/actions";
import { HeroSelector } from "@/components/HeroSelector";
import { Player, Role } from "@/lib/match/types";
import { TIERS } from "@/lib/tiers";
import { useRouter } from "next/navigation";
import { useState } from "react";

const ROLES: Role[] = ["TANK", "DPS", "SUPPORT"];

export default function JoinClient() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [newPlayer, setNewPlayer] = useState<Partial<Player>>({
    name: "",
    roles: [],
    primary: [],
    skills: {},
    preferredHeroes: [],
  });

  const handleCreate = async () => {
    if (!newPlayer.name || !newPlayer.roles?.length) return;
    
    setIsSubmitting(true);
    
    // Create new player object
    const playerToCreate = { 
      ...newPlayer, 
      // Generate a temporary ID (will be replaced by DB or just used as is depending on implementation, 
      // but createPlayer action ignores ID usually or we can generate one here)
      id: crypto.randomUUID(),
    } as Player;

    try {
      await createPlayer(playerToCreate);
      alert("등록되었습니다!");
      // Reset form or redirect
      setNewPlayer({ name: "", roles: [], primary: [], skills: {}, preferredHeroes: [] });
      router.push('/scrim'); // Redirect to scrim page so they can see themselves
    } catch (error) {
      console.error("Failed to create player", error);
      alert("등록에 실패했습니다. 다시 시도해주세요.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const toggleRole = (role: Role) => {
    const currentRoles = newPlayer.roles || [];
    const newRoles = currentRoles.includes(role)
      ? currentRoles.filter(r => r !== role)
      : [...currentRoles, role];
    
    setNewPlayer({ ...newPlayer, roles: newRoles });
  };

  const togglePrimary = (role: Role) => {
    const currentPrimary = newPlayer.primary || [];
    const newPrimary = currentPrimary.includes(role)
      ? currentPrimary.filter(r => r !== role)
      : [...currentPrimary, role];

    setNewPlayer({ ...newPlayer, primary: newPrimary });
  };

  const updateSkill = (role: Role, value: string) => {
    const numValue = parseInt(value) || 0;
    const newSkills = { ...newPlayer.skills, [role]: numValue };
    setNewPlayer({ ...newPlayer, skills: newSkills });
  };

  const togglePreferredHero = (hero: string) => {
    const currentHeroes = newPlayer.preferredHeroes || [];
    const newHeroes = currentHeroes.includes(hero)
      ? currentHeroes.filter(h => h !== hero)
      : [...currentHeroes, hero];
    
    setNewPlayer({ ...newPlayer, preferredHeroes: newHeroes });
  };
  
  // Helper to find closest tier value
  const getClosestTierValue = (sr?: number) => {
    if (!sr) return TIERS[12].value; // Default to Gold 3
    return TIERS.reduce((prev, curr) => 
      Math.abs(curr.value - sr) < Math.abs(prev.value - sr) ? curr : prev
    ).value;
  };

  return (
    <div className="max-w-md mx-auto py-10 px-4">
      <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
        <h1 className="text-2xl font-bold text-gray-900 mb-6 text-center">스크림 참가 신청</h1>
        
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">닉네임</label>
            <input
              type="text"
              value={newPlayer.name}
              onChange={(e) => setNewPlayer({ ...newPlayer, name: e.target.value })}
              className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 py-2 px-3 border"
              placeholder="배틀태그 또는 닉네임"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">가능 포지션 (복수 선택 가능)</label>
            <div className="flex gap-4">
              {ROLES.map(role => (
                <label key={role} className="flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={newPlayer.roles?.includes(role)}
                    onChange={() => toggleRole(role)}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 h-4 w-4"
                  />
                  <span className="ml-2 text-gray-700">{role}</span>
                </label>
              ))}
            </div>
          </div>

          {newPlayer.roles?.length ? (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">주 포지션 (실제 주로 하는 역할)</label>
              <div className="flex gap-4">
                {newPlayer.roles.map(role => (
                  <label key={role} className="flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={newPlayer.primary?.includes(role)}
                      onChange={() => togglePrimary(role)}
                      className="rounded border-gray-300 text-green-600 focus:ring-green-500 h-4 w-4"
                    />
                    <span className="ml-2 text-gray-700">{role}</span>
                  </label>
                ))}
              </div>
            </div>
          ) : null}

          {newPlayer.roles?.length ? (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">티어 정보</label>
              <div className="space-y-3">
                {newPlayer.roles.map(role => (
                  <div key={role} className="flex items-center gap-3">
                    <span className="text-sm font-medium text-gray-500 w-16">{role}</span>
                    <select
                      value={getClosestTierValue(newPlayer.skills?.[role])}
                      onChange={(e) => updateSkill(role, e.target.value)}
                      className="flex-1 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm py-2 border"
                    >
                      {TIERS.map((tier) => (
                        <option key={tier.name} value={tier.value}>
                          {tier.name}
                        </option>
                      ))}
                    </select>
                  </div>
                ))}
              </div>
            </div>
          ) : null}

          <div>
             <HeroSelector
               selectedHeroes={newPlayer.preferredHeroes || []}
               onToggle={togglePreferredHero}
             />
          </div>

          <button
            onClick={handleCreate}
            disabled={!newPlayer.name || !newPlayer.roles?.length || isSubmitting}
            className="w-full py-3 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition shadow-md"
          >
            {isSubmitting ? "등록 중..." : "참가 등록하기"}
          </button>
        </div>
      </div>
    </div>
  );
}
