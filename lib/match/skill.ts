import { Player, Role } from "./types";

/**
 * 플레이어의 특정 역할 스킬을 가져옵니다.
 * @param player 플레이어 객체
 * @param role 확인할 역할
 * @returns 스킬 점수 (미입력이면 undefined)
 */
export function getSkill(player: Player, role: Role): number | undefined {
  return player.skills[role];
}

/**
 * 플레이어가 특정 역할을 할 수 있는지 확인합니다.
 * @param player 플레이어 객체
 * @param role 확인할 역할
 * @returns 가능 여부
 */
export function canPlayRole(player: Player, role: Role): boolean {
  return player.roles.includes(role) && player.skills[role] !== undefined;
}

/**
 * 플레이어의 특정 역할 스킬을 안전하게 가져옵니다.
 * @param player 플레이어 객체
 * @param role 확인할 역할
 * @returns 스킬 점수 (불가능하면 0)
 */
export function getSkillSafe(player: Player, role: Role): number {
  return getSkill(player, role) ?? 0;
}
