// import { performRandomBanPick } from "./banpick"; // 나중에 랜덤벤픽 추가 시 복구
import { selectRandomMap } from "./maps";
import { seededShuffle } from "./shuffle";
import { canPlayRole, getSkillSafe } from "./skill";
import {
  MatchResult,
  Player,
  RandomBanPick,
  Role,
  ROLE_CAPACITY,
  Team,
} from "./types";

/**
 * 팀의 특정 역할 총 스킬을 계산합니다.
 */
function getTeamRoleSkill(team: Team, role: Role): number {
  return team.players
    .filter((player) => player.assignedRole === role)
    .reduce((sum, player) => sum + getSkillSafe(player, role), 0);
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

/**
 * 역할별 그리디 배치로 팀을 생성합니다.
 */
export function roleBalancedAssign(
  players: Player[],
  seed: number,
  banPickSettings?: RandomBanPick
): MatchResult {
  // 플레이어를 시드 기반으로 셔플
  const shuffledPlayers = seededShuffle(players, seed);

  // 초기 팀 구조
  const teamA: Team = { players: [], totalSkill: 0 };
  const teamB: Team = { players: [], totalSkill: 0 };

  // 이미 배정된 플레이어 ID를 추적하는 Set
  const assignedPlayerIds = new Set<string>();

  // 각 역할별로 플레이어를 선호자와 나머지로 분류하고 스킬 내림차순 정렬
  const roleCandidates: Record<Role, Player[]> = {
    TANK: [],
    DPS: [],
    SUPPORT: [],
  };

  // 각 역할별 후보군 구성
  for (const role of Object.keys(roleCandidates) as Role[]) {
    const candidates = shuffledPlayers.filter((player) =>
      canPlayRole(player, role)
    );

    // 선호자와 나머지로 분류 (primary가 배열이므로 includes 사용)
    const preferred = candidates.filter(
      (player) => player.primary && player.primary.includes(role)
    );
    const others = candidates.filter(
      (player) => !player.primary || !player.primary.includes(role)
    );

    // 각 그룹을 스킬 내림차순으로 정렬
    preferred.sort((a, b) => getSkillSafe(b, role) - getSkillSafe(a, role));
    others.sort((a, b) => getSkillSafe(b, role) - getSkillSafe(a, role));

    // 선호자 우선, 그 다음 나머지 순서로 합치기
    roleCandidates[role] = [...preferred, ...others];
  }

  // 각 역할별로 필요한 인원만큼 상위 플레이어 추출
  const roleAssignments: Record<Role, Player[]> = {
    TANK: roleCandidates.TANK.slice(0, ROLE_CAPACITY.TANK * 2),
    DPS: roleCandidates.DPS.slice(0, ROLE_CAPACITY.DPS * 2),
    SUPPORT: roleCandidates.SUPPORT.slice(0, ROLE_CAPACITY.SUPPORT * 2),
  };

  // 역할별 그리디 배치
  for (const role of Object.keys(roleAssignments) as Role[]) {
    const candidates = roleAssignments[role];

    for (const player of candidates) {
      // 이미 배정된 플레이어는 건너뛰기
      if (assignedPlayerIds.has(player.id)) {
        continue;
      }

      // 해당 역할의 현재 팀 합산 스킬이 낮은 팀에 배치
      const teamASkill = getTeamRoleSkill(teamA, role);
      const teamBSkill = getTeamRoleSkill(teamB, role);

      const targetTeam = teamASkill <= teamBSkill ? teamA : teamB;

      // 정원이 남아있는지 확인
      const currentCount = targetTeam.players.filter(
        (p) => p.assignedRole === role
      ).length;
      if (currentCount < ROLE_CAPACITY[role]) {
        // 역할 할당
        const assignedPlayer = { ...player, assignedRole: role };
        targetTeam.players.push(assignedPlayer);
        // 배정된 플레이어 ID를 Set에 추가
        assignedPlayerIds.add(player.id);
      }
    }
  }

  // 남은 인원 배치 (팀 총합 스킬 균형을 보며)
  const remainingPlayers = shuffledPlayers.filter(
    (player) => !assignedPlayerIds.has(player.id)
  );

  for (const player of remainingPlayers) {
    // 플레이어가 가능한 역할 중 아직 정원이 남은 역할 찾기
    const availableRoles = player.roles.filter((role) => {
      const teamACount = teamA.players.filter(
        (p) => p.assignedRole === role
      ).length;
      const teamBCount = teamB.players.filter(
        (p) => p.assignedRole === role
      ).length;
      return (
        teamACount < ROLE_CAPACITY[role] || teamBCount < ROLE_CAPACITY[role]
      );
    });

    if (availableRoles.length > 0) {
      // 팀 총합 스킬이 낮은 팀에 배치
      const targetTeam = teamA.totalSkill <= teamB.totalSkill ? teamA : teamB;

      // 가능한 역할 중 가장 높은 스킬을 가진 역할 선택
      const bestRole = availableRoles.reduce((best, role) =>
        getSkillSafe(player, role) > getSkillSafe(player, best) ? role : best
      );

      const assignedPlayer = { ...player, assignedRole: bestRole };
      targetTeam.players.push(assignedPlayer);
      // 배정된 플레이어 ID를 Set에 추가
      assignedPlayerIds.add(player.id);
    }
  }

  // 팀 총합 스킬 계산
  teamA.totalSkill = calculateTeamTotalSkill(teamA);
  teamB.totalSkill = calculateTeamTotalSkill(teamB);

  // 관전자 목록
  const spectators = shuffledPlayers.filter(
    (player) => !assignedPlayerIds.has(player.id)
  );

  // 전장 선택
  const selectedMap = selectRandomMap(seed);

  // 랜덤벤픽 수행 (나중에 랜덤벤픽 추가 시 복구)
  // const bannedHeroes = banPickSettings
  //   ? performRandomBanPick(seed, banPickSettings)
  //   : [];
  const bannedHeroes: string[] = [];

  // 경고 메시지 생성
  const warnings: string[] = [];
  for (const role of Object.keys(ROLE_CAPACITY) as Role[]) {
    const totalAssigned =
      teamA.players.filter((p) => p.assignedRole === role).length +
      teamB.players.filter((p) => p.assignedRole === role).length;
    const required = ROLE_CAPACITY[role] * 2;

    if (totalAssigned < required) {
      warnings.push(
        `${role} 역할 지원 인원이 부족합니다. (필요: ${required}명, 현재: ${totalAssigned}명)`
      );
    }
  }

  return {
    teamA,
    teamB,
    spectators,
    warnings,
    selectedMap,
    bannedHeroes,
  };
}
