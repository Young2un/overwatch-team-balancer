export type Role = "TANK" | "DPS" | "SUPPORT";

// 전장 타입
export type MapType =
  | "ASSAULT"
  | "ESCORT"
  | "HYBRID"
  | "CONTROL"
  | "PUSH"
  | "FLASHPOINT";

// 전장 정보
export interface Map {
  name: string;
  type: MapType;
  description: string;
}

// 랜덤벤픽 설정
export interface RandomBanPick {
  enabled: boolean;
  maxBansPerRole: number; // 역할당 최대 밴 수
  maxBansPerPosition: number; // 포지션당 최대 밴 수 (3-4개 포지션)
}

export interface Player {
  id: string;
  name: string;
  roles: Role[]; // 가능한 역할(1+)
  primary?: Role; // 선호 역할(옵션)
  skills: Partial<Record<Role, number>>; // 역할별 스킬 (입력된 역할만 존재)
  assignedRole?: Role; // 배정된 역할 (매치 결과에서만 사용)
}

export interface Team {
  players: Player[];
  totalSkill: number;
}

export interface MatchResult {
  teamA: Team;
  teamB: Team;
  spectators: Player[];
  warnings: string[];
  selectedMap?: Map; // 선택된 전장
  bannedHeroes?: string[]; // 밴된 영웅들
}

// 역할별 정원 상수
export const ROLE_CAPACITY: Record<Role, number> = {
  TANK: 1,
  DPS: 2,
  SUPPORT: 2,
};

// 팀당 총 인원
export const TEAM_SIZE = Object.values(ROLE_CAPACITY).reduce(
  (sum, capacity) => sum + capacity,
  0
);
