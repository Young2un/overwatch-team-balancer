import { seededShuffle } from "./shuffle";
import { Map, MapType } from "./types";

// 오버워치 전장 데이터
export const MAPS: Map[] = [
  // ASSAULT (공격)
  { name: "한라산", type: "ASSAULT", description: "한국의 전통적인 사원" },
  {
    name: "볼스카야 인더스트리",
    type: "ASSAULT",
    description: "러시아의 거대한 공장",
  },
  { name: "아누비스 신전", type: "ASSAULT", description: "이집트의 고대 신전" },
  { name: "하나무라", type: "ASSAULT", description: "일본의 전통 마을" },
  { name: "파리", type: "ASSAULT", description: "프랑스의 아름다운 도시" },
  { name: "킹스 로우", type: "ASSAULT", description: "영국의 도시" },

  // ESCORT (호위)
  { name: "도라도", type: "ESCORT", description: "멕시코의 아름다운 마을" },
  {
    name: "리우데자네이루",
    type: "ESCORT",
    description: "브라질의 활기찬 도시",
  },
  { name: "로테르담", type: "ESCORT", description: "네덜란드의 항구 도시" },
  { name: "하바나", type: "ESCORT", description: "쿠바의 역사적인 도시" },
  { name: "리알토", type: "ESCORT", description: "이탈리아의 운하 도시" },
  { name: "지브롤터", type: "ESCORT", description: "영국의 전략적 요충지" },

  // HYBRID (혼합)
  { name: "할리우드", type: "HYBRID", description: "미국의 영화 도시" },
  { name: "누마니", type: "HYBRID", description: "나이지리아의 미래 도시" },
  {
    name: "블리자드 월드",
    type: "HYBRID",
    description: "게임 개발사의 테마파크",
  },
  { name: "에이헨발데", type: "HYBRID", description: "독일의 중세 성" },
  { name: "킹스 로우", type: "HYBRID", description: "영국의 도시" },
  { name: "미드타운", type: "HYBRID", description: "미국의 도시" },

  // CONTROL (점령)
  { name: "부산", type: "CONTROL", description: "한국의 항구 도시" },
  { name: "일리오스", type: "CONTROL", description: "그리스의 아름다운 섬" },
  { name: "리장 타워", type: "CONTROL", description: "중국의 고대 탑" },
  { name: "네팔", type: "CONTROL", description: "히말라야의 수도원" },
  { name: "오아시스", type: "CONTROL", description: "아랍의 미래 도시" },

  // PUSH (밀어내기)
  { name: "콜로세오", type: "PUSH", description: "이탈리아의 고대 경기장" },
  { name: "뉴 퀸 스트리트", type: "PUSH", description: "영국의 현대적 거리" },
  { name: "에스페란사", type: "PUSH", description: "포르투갈의 아름다운 도시" },

  // FLASHPOINT (섬멸)
  {
    name: "수라바야",
    type: "FLASHPOINT",
    description: "인도네시아의 항구 도시",
  },
  { name: "뉴 주시", type: "FLASHPOINT", description: "미국의 미래 도시" },
];

/**
 * 시드 기반으로 랜덤 전장을 선택합니다.
 */
export function selectRandomMap(seed: number): Map {
  const shuffledMaps = seededShuffle(MAPS, seed);
  return shuffledMaps[0];
}

/**
 * 전장 타입별로 전장을 필터링합니다.
 */
export function getMapsByType(type: MapType): Map[] {
  return MAPS.filter((map) => map.type === type);
}

/**
 * 전장 타입별 설명을 반환합니다.
 */
export function getMapTypeDescription(type: MapType): string {
  const descriptions = {
    ASSAULT: "공격팀이 두 개의 포인트를 점령해야 하는 맵",
    ESCORT: "공격팀이 폭탄을 목적지까지 운반해야 하는 맵",
    HYBRID: "먼저 포인트를 점령한 후 폭탄을 운반하는 맵",
    CONTROL: "두 팀이 중앙 포인트를 점령하는 맵",
    PUSH: "로봇을 상대팀 기지까지 밀어내는 맵",
    FLASHPOINT: "여러 포인트를 순차적으로 점령하는 맵",
  };
  return descriptions[type];
}
