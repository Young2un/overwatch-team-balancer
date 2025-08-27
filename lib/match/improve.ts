import { calculateScore, isBetterBalance } from "./score";
import { getSkillSafe } from "./skill";
import { MatchResult, Player, Role, Team } from "./types";

const MAX_SWAP_ATTEMPTS = 50; // 최대 스왑 시도 횟수

/**
 * 같은 역할끼리 스왑하여 팀 밸런스를 개선합니다.
 */
export function improveBalance(result: MatchResult): MatchResult {
  let currentScore = calculateScore(result.teamA, result.teamB);
  let improved = false;
  let attempts = 0;

  while (attempts < MAX_SWAP_ATTEMPTS) {
    attempts++;

    // 각 역할별로 스왑 시도
    for (const role of ["TANK", "DPS", "SUPPORT"] as Role[]) {
      const teamAPlayers = result.teamA.players.filter(
        (p) => p.assignedRole === role
      );
      const teamBPlayers = result.teamB.players.filter(
        (p) => p.assignedRole === role
      );

      // 같은 역할 플레이어들끼리 스왑 시도
      for (const playerA of teamAPlayers) {
        for (const playerB of teamBPlayers) {
          // 스왑 시도
          const newResult = trySwap(result, playerA, playerB);
          const newScore = calculateScore(newResult.teamA, newResult.teamB);

          if (isBetterBalance(newScore, currentScore)) {
            // 개선되면 스왑 적용
            result = newResult;
            currentScore = newScore;
            improved = true;
            console.log(
              `스왑 개선: ${playerA.name} ↔ ${
                playerB.name
              }, 점수: ${currentScore.toFixed(1)}`
            );
          }
        }
      }
    }

    // 더 이상 개선이 없으면 종료
    if (!improved) {
      break;
    }

    improved = false;
  }

  return result;
}

/**
 * 두 플레이어를 스왑한 새로운 결과를 생성합니다.
 */
function trySwap(
  result: MatchResult,
  playerA: Player,
  playerB: Player
): MatchResult {
  const newTeamA = {
    ...result.teamA,
    players: result.teamA.players.map((p) => {
      if (p.id === playerA.id) {
        return { ...playerB, assignedRole: playerA.assignedRole };
      }
      return p;
    }),
  };

  const newTeamB = {
    ...result.teamB,
    players: result.teamB.players.map((p) => {
      if (p.id === playerB.id) {
        return { ...playerA, assignedRole: playerB.assignedRole };
      }
      return p;
    }),
  };

  // 팀 총합 스킬 재계산
  newTeamA.totalSkill = calculateTeamTotalSkill(newTeamA);
  newTeamB.totalSkill = calculateTeamTotalSkill(newTeamB);

  return {
    teamA: newTeamA,
    teamB: newTeamB,
    spectators: result.spectators,
    warnings: result.warnings,
  };
}

/**
 * 팀의 총 스킬을 계산합니다.
 */
function calculateTeamTotalSkill(team: Team): number {
  return team.players.reduce((sum, player) => {
    if (player.assignedRole) {
      return sum + getSkillSafe(player, player.assignedRole);
    }
    return sum;
  }, 0);
}
