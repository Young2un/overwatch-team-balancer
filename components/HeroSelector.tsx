"use client";

import { HEROES } from "@/lib/heroes";
import { Role } from "@/lib/match/types";
import { ChevronDown, ChevronUp } from "lucide-react";
import { useState } from "react";

const ROLES: Role[] = ["TANK", "DPS", "SUPPORT"];

interface HeroSelectorProps {
  selectedHeroes: string[];
  onToggle: (hero: string) => void;
}

export function HeroSelector({ selectedHeroes, onToggle }: HeroSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="border border-gray-200 rounded-md p-3">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-between w-full text-sm font-medium text-gray-700"
      >
        <span>선호 영웅 선택 ({selectedHeroes.length})</span>
        {isOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
      </button>

      {isOpen && (
        <div className="mt-3 space-y-4">
          {ROLES.map((role) => (
            <div key={role}>
              <div className="text-xs font-bold text-gray-500 mb-2">{role}</div>
              <div className="flex flex-wrap gap-2">
                {HEROES[role].map((hero) => (
                  <button
                    key={hero}
                    type="button"
                    onClick={() => onToggle(hero)}
                    className={`text-xs px-2 py-1 rounded-full border ${
                      selectedHeroes.includes(hero)
                        ? "bg-indigo-100 text-indigo-800 border-indigo-200"
                        : "bg-white text-gray-600 border-gray-200 hover:bg-gray-50"
                    }`}
                  >
                    {hero}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {!isOpen && selectedHeroes.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-1">
          {selectedHeroes.map((hero) => (
            <span
              key={hero}
              className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full"
            >
              {hero}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
