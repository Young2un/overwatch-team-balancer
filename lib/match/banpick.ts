import { seededShuffle } from "./shuffle";
import { RandomBanPick, Role } from "./types";

// 오버워치 2 영웅 데이터
export const HEROES: Record<Role, string[]> = {
  TANK: [
    "D.Va",
    "둠피스트",
    "라마트라",
    "라인하르트",
    "레킹볼",
    "로드호그",
    "마우가",
    "시그마",
    "오리사",
    "윈스턴",
    "자리야",
    "정커퀸",
    "해저드",
  ],
  DPS: [
    "겐지",
    "한조",
    "트레이서",
    "위도우메이커",
    "애쉬",
    "캐서디",
    "바스티온",
    "리퍼",
    "메이",
    "파라",
    "소전",
    "솔저: 76",
    "솜브라",
    "시메트라",
    "토르비욘",
    "정크랫",
    "에코",
    "벤처",
    "프레야",
    "벤데타",
  ],
  SUPPORT: [
    "아나",
    "바티스트",
    "브리기테",
    "루시우",
    "메르시",
    "모이라",
    "젠야타",
    "키리코",
    "라이프위버",
    "일리아리",
    "주노",
    "우양",
  ],
};

/**
 * 랜덤벤픽을 수행합니다.
 */
export function performRandomBanPick(
  seed: number,
  settings: RandomBanPick,
): string[] {
  if (!settings.enabled) {
    console.log("벤픽 비활성화됨");
    return [];
  }

  const allHeroes = [...HEROES.TANK, ...HEROES.DPS, ...HEROES.SUPPORT];

  // 설정에 따라 밴할 영웅 수 결정
  const totalBans = Math.min(
    settings.maxBansPerRole * 3, // 역할당 최대 밴 수 * 3개 역할
    settings.maxBansPerPosition * 4, // 포지션당 최대 밴 수 * 4개 포지션
    allHeroes.length,
  );

  console.log("벤픽 설정:", settings);
  console.log("총 밴 수:", totalBans);

  // 더 랜덤한 시드 생성 (현재 시간 + 원본 시드 + 랜덤 요소)
  const randomSeed = seed + Date.now() + Math.floor(Math.random() * 10000);

  // 시드 기반으로 영웅들을 셔플하고 상위 N개를 밴
  const shuffledHeroes = seededShuffle(allHeroes, randomSeed);
  const bannedHeroes = shuffledHeroes.slice(0, totalBans);

  console.log("밴된 영웅들:", bannedHeroes);
  return bannedHeroes;
}

/**
 * 역할별로 밴된 영웅을 분류합니다.
 */
export function categorizeBannedHeroes(
  bannedHeroes: string[],
): Record<Role, string[]> {
  const categorized: Record<Role, string[]> = {
    TANK: [],
    DPS: [],
    SUPPORT: [],
  };

  bannedHeroes.forEach((hero) => {
    if (HEROES.TANK.includes(hero)) {
      categorized.TANK.push(hero);
    } else if (HEROES.DPS.includes(hero)) {
      categorized.DPS.push(hero);
    } else if (HEROES.SUPPORT.includes(hero)) {
      categorized.SUPPORT.push(hero);
    }
  });

  return categorized;
}

/**
 * 밴된 영웅이 특정 역할에 미치는 영향을 계산합니다.
 */
export function calculateBanImpact(bannedHeroes: string[], role: Role): number {
  const roleHeroes = HEROES[role];
  const bannedInRole = bannedHeroes.filter((hero) => roleHeroes.includes(hero));

  // 밴된 영웅 비율에 따른 영향도 (0~1)
  return bannedInRole.length / roleHeroes.length;
}

/**
 * 밴픽 결과를 요약합니다.
 */
export function summarizeBanPick(bannedHeroes: string[]): {
  totalBans: number;
  byRole: Record<Role, number>;
  impact: Record<Role, number>;
} {
  const byRole = categorizeBannedHeroes(bannedHeroes);

  return {
    totalBans: bannedHeroes.length,
    byRole: {
      TANK: byRole.TANK.length,
      DPS: byRole.DPS.length,
      SUPPORT: byRole.SUPPORT.length,
    },
    impact: {
      TANK: calculateBanImpact(bannedHeroes, "TANK"),
      DPS: calculateBanImpact(bannedHeroes, "DPS"),
      SUPPORT: calculateBanImpact(bannedHeroes, "SUPPORT"),
    },
  };
}
