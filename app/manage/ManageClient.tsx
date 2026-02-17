"use client";

import { createPlayer, deletePlayer, updatePlayer } from "@/app/actions";
import { HeroSelector } from "@/components/HeroSelector";
import { Player, Role } from "@/lib/match/types";
import { getTierBySR, TIERS } from "@/lib/tiers";
import { Edit2, Plus, Save, Trash2, X } from "lucide-react";
import { useState } from "react";

const ROLES: Role[] = ["TANK", "DPS", "SUPPORT"];

interface ManageClientProps {
  initialPlayers: Player[];
}

export default function ManageClient({ initialPlayers }: ManageClientProps) {
  const [players, setPlayers] = useState<Player[]>(initialPlayers);
  const [editingPlayer, setEditingPlayer] = useState<Player | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  const [newPlayer, setNewPlayer] = useState<Partial<Player>>({
    name: "",
    roles: [],
    primary: [],
    skills: {},
    preferredHeroes: [],
  });

  const handleCreate = async () => {
    if (!newPlayer.name || !newPlayer.roles?.length) return;

    // Optimistic update
    const tempId = crypto.randomUUID();
    const playerToCreate = { ...newPlayer, id: tempId } as Player;
    setPlayers([...players, playerToCreate]);
    setIsAdding(false);
    setNewPlayer({
      name: "",
      roles: [],
      primary: [],
      skills: {},
      preferredHeroes: [],
    });

    try {
      await createPlayer(playerToCreate);
    } catch (error) {
      console.error("Failed to create player", error);
      // Revert on error or refetch
    }
  };

  const handleUpdate = async () => {
    if (!editingPlayer) return;

    setPlayers(
      players.map((p) => (p.id === editingPlayer.id ? editingPlayer : p)),
    );
    const playerToUpdate = editingPlayer;
    setEditingPlayer(null);

    try {
      await updatePlayer(playerToUpdate);
    } catch (error) {
      console.error("Failed to update player", error);
      // Revert on error
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("정말 삭제하시겠습니까?")) return;

    setPlayers(players.filter((p) => p.id !== id));
    try {
      await deletePlayer(id);
    } catch (error) {
      console.error("Failed to delete player", error);
    }
  };

  const toggleRole = (role: Role, isEdit: boolean) => {
    if (isEdit) {
      if (!editingPlayer) return;
      const currentRoles = editingPlayer.roles || [];
      const newRoles = currentRoles.includes(role)
        ? currentRoles.filter((r) => r !== role)
        : [...currentRoles, role];
      setEditingPlayer({
        ...editingPlayer,
        roles: newRoles,
        skills: editingPlayer.skills,
      });
    } else {
      if (!newPlayer) return;
      const currentRoles = newPlayer.roles || [];
      const newRoles = currentRoles.includes(role)
        ? currentRoles.filter((r) => r !== role)
        : [...currentRoles, role];
      setNewPlayer({ ...newPlayer, roles: newRoles, skills: newPlayer.skills });
    }
  };

  const togglePrimary = (role: Role, isEdit: boolean) => {
    if (isEdit) {
      if (!editingPlayer) return;
      const currentPrimary = editingPlayer.primary || [];
      const newPrimary = currentPrimary.includes(role)
        ? currentPrimary.filter((r) => r !== role)
        : [...currentPrimary, role];
      setEditingPlayer({ ...editingPlayer, primary: newPrimary });
    } else {
      if (!newPlayer) return;
      const currentPrimary = newPlayer.primary || [];
      const newPrimary = currentPrimary.includes(role)
        ? currentPrimary.filter((r) => r !== role)
        : [...currentPrimary, role];
      setNewPlayer({ ...newPlayer, primary: newPrimary });
    }
  };

  const updateSkill = (role: Role, value: string, isEdit: boolean) => {
    if (isEdit) {
      if (!editingPlayer) return;
      const numValue = parseInt(value) || 0;
      const newSkills = { ...editingPlayer.skills, [role]: numValue };
      setEditingPlayer({ ...editingPlayer, skills: newSkills });
    } else {
      if (!newPlayer) return;
      const numValue = parseInt(value) || 0;
      const newSkills = { ...newPlayer.skills, [role]: numValue };
      setNewPlayer({ ...newPlayer, skills: newSkills });
    }
  };

  const togglePreferredHero = (hero: string, isEdit: boolean) => {
    if (isEdit) {
      if (!editingPlayer) return;
      const currentHeroes = editingPlayer.preferredHeroes || [];
      const newHeroes = currentHeroes.includes(hero)
        ? currentHeroes.filter((h) => h !== hero)
        : [...currentHeroes, hero];
      setEditingPlayer({ ...editingPlayer, preferredHeroes: newHeroes });
    } else {
      if (!newPlayer) return;
      const currentHeroes = newPlayer.preferredHeroes || [];
      const newHeroes = currentHeroes.includes(hero)
        ? currentHeroes.filter((h) => h !== hero)
        : [...currentHeroes, hero];
      setNewPlayer({ ...newPlayer, preferredHeroes: newHeroes });
    }
  };

  // Helper to find closest tier value for default selection
  const getClosestTierValue = (sr?: number) => {
    if (!sr) return TIERS[12].value; // Default to Gold 3 (approx) if no SR
    return TIERS.reduce((prev, curr) =>
      Math.abs(curr.value - sr) < Math.abs(prev.value - sr) ? curr : prev,
    ).value;
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold text-gray-900">
          플레이어 관리 ({players.length}명)
        </h2>
        <button
          onClick={() => setIsAdding(true)}
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition"
        >
          <Plus size={18} />
          선수 추가
        </button>
      </div>

      {isAdding && (
        <div className="bg-white border border-blue-200 rounded-lg p-6 shadow-sm">
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            새 선수 추가
          </h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                이름
              </label>
              <input
                type="text"
                value={newPlayer.name}
                onChange={(e) =>
                  setNewPlayer({ ...newPlayer, name: e.target.value })
                }
                className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                placeholder="이름 입력"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                가능 포지션
              </label>
              <div className="flex gap-4">
                {ROLES.map((role) => (
                  <label key={role} className="flex items-center">
                    <input
                      type="checkbox"
                      checked={newPlayer.roles?.includes(role)}
                      onChange={() => toggleRole(role, false)}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="ml-2 text-sm text-gray-700">{role}</span>
                  </label>
                ))}
              </div>
            </div>

            {newPlayer.roles?.length ? (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  주 포지션
                </label>
                <div className="flex gap-4">
                  {newPlayer.roles.map((role) => (
                    <label key={role} className="flex items-center">
                      <input
                        type="checkbox"
                        checked={newPlayer.primary?.includes(role)}
                        onChange={() => togglePrimary(role, false)}
                        className="rounded border-gray-300 text-green-600 focus:ring-green-500"
                      />
                      <span className="ml-2 text-sm text-gray-700">{role}</span>
                    </label>
                  ))}
                </div>
              </div>
            ) : null}

            {newPlayer.roles?.length ? (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  티어 선택 (SR 자동 입력)
                </label>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {newPlayer.roles.map((role) => (
                    <div key={role}>
                      <span className="text-xs text-gray-500 block mb-1">
                        {role}
                      </span>
                      <select
                        value={getClosestTierValue(newPlayer.skills?.[role])}
                        onChange={(e) =>
                          updateSkill(role, e.target.value, false)
                        }
                        className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm"
                      >
                        {TIERS.map((tier) => (
                          <option key={tier.name} value={tier.value}>
                            {tier.name} ({tier.value})
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
                onToggle={(hero) => togglePreferredHero(hero, false)}
              />
            </div>

            <div className="flex justify-end gap-2 mt-4">
              <button
                onClick={() => setIsAdding(false)}
                className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-md"
              >
                취소
              </button>
              <button
                onClick={handleCreate}
                disabled={!newPlayer.name || !newPlayer.roles?.length}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
              >
                저장
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {players.map((player) => (
          <div
            key={player.id}
            className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm hover:shadow-md transition"
          >
            {editingPlayer?.id === player.id ? (
              // Edit Mode
              <div className="space-y-3">
                <input
                  type="text"
                  value={editingPlayer.name}
                  onChange={(e) =>
                    setEditingPlayer({ ...editingPlayer, name: e.target.value })
                  }
                  className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 font-bold"
                />

                <div className="space-y-2">
                  <div className="text-xs font-semibold text-gray-500">
                    포지션
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {ROLES.map((role) => (
                      <label key={role} className="flex items-center text-xs">
                        <input
                          type="checkbox"
                          checked={editingPlayer.roles.includes(role)}
                          onChange={() => toggleRole(role, true)}
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 h-3 w-3"
                        />
                        <span className="ml-1">{role}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="text-xs font-semibold text-gray-500">
                    티어
                  </div>
                  <div className="grid grid-cols-1 gap-2">
                    {editingPlayer.roles.map((role) => (
                      <div key={role} className="flex items-center gap-2">
                        <span className="text-xs text-gray-500 w-12">
                          {role}
                        </span>
                        <select
                          value={getClosestTierValue(
                            editingPlayer.skills[role],
                          )}
                          onChange={(e) =>
                            updateSkill(role, e.target.value, true)
                          }
                          className="flex-1 rounded-md border-gray-300 text-xs py-1 px-2"
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

                <div>
                  <HeroSelector
                    selectedHeroes={editingPlayer.preferredHeroes || []}
                    onToggle={(hero) => togglePreferredHero(hero, true)}
                  />
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <button
                    onClick={() => setEditingPlayer(null)}
                    className="p-1 text-gray-500 hover:bg-gray-100 rounded"
                  >
                    <X size={18} />
                  </button>
                  <button
                    onClick={handleUpdate}
                    className="p-1 text-green-600 hover:bg-green-50 rounded"
                  >
                    <Save size={18} />
                  </button>
                </div>
              </div>
            ) : (
              <>
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-bold text-lg text-gray-900">
                    {player.name}
                  </h3>
                  <div className="flex gap-1">
                    <button
                      onClick={() => setEditingPlayer(player)}
                      className="p-1 text-gray-400 hover:text-blue-600 rounded"
                    >
                      <Edit2 size={16} />
                    </button>
                    <button
                      onClick={() => handleDelete(player.id)}
                      className="p-1 text-gray-400 hover:text-red-600 rounded"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>

                <div className="space-y-2">
                  {/* Roles and Skills */}
                  <div className="flex flex-wrap gap-1">
                    {player.roles.map((role) => (
                      <span
                        key={role}
                        className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                          player.primary?.includes(role)
                            ? "bg-blue-100 text-blue-800 border border-blue-200"
                            : "bg-gray-100 text-gray-600 border border-gray-200"
                        }`}
                      >
                        {role} {getTierBySR(player.skills[role] || 0)}
                      </span>
                    ))}
                  </div>

                  {/* Preferred Heroes */}
                  {player.preferredHeroes &&
                    player.preferredHeroes.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-2 pt-2 border-t border-gray-100">
                        {player.preferredHeroes.map((hero) => (
                          <span
                            key={hero}
                            className="text-[10px] bg-indigo-50 text-indigo-700 px-1.5 py-0.5 rounded border border-indigo-100"
                          >
                            {hero}
                          </span>
                        ))}
                      </div>
                    )}
                </div>
              </>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
