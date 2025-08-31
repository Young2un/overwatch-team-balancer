import { getSkillSafe } from "./skill";
import { Team } from "./types";

/**
 * 팀 밸런스 품질을 측정하는 스코어 함수
 * 낮을수록 좋은 밸런스 (팀 총합 차이 + 선호 불일치 패널티)
 */
export function calculateScore(teamA: Team, teamB: Team): number {
  // 팀 총합 스킬 차이
  const skillDifference = Math.abs(teamA.totalSkill - teamB.totalSkill);

  // 선호 불일치 패널티 (선호 역할과 배정 역할이 다른 경우)
  const preferencePenalty =
    calculatePreferencePenalty(teamA) + calculatePreferencePenalty(teamB);

  return skillDifference + preferencePenalty;
}

/**
 * 팀의 선호 불일치 패널티를 계산합니다.
 */
function calculatePreferencePenalty(team: Team): number {
  return team.players.reduce((penalty, player) => {
    if (
      player.primary &&
      player.assignedRole &&
      !player.primary.includes(player.assignedRole)
    ) {
      // 선호 역할과 배정 역할이 다르면 패널티 (스킬 점수의 10%)
      return penalty + getSkillSafe(player, player.assignedRole) * 0.1;
    }
    return penalty;
  }, 0);
}

/**
 * 두 팀의 밸런스 품질을 비교합니다.
 */
export function isBetterBalance(
  newScore: number,
  currentScore: number
): boolean {
  return newScore < currentScore;
}
