/**
 * Linear Congruential Generator (LCG) 구현
 * 시드 기반의 결정적 난수 생성
 */
class LCG {
  private state: number;

  constructor(seed: number) {
    this.state = seed;
  }

  next(): number {
    // LCG 파라미터: a = 1664525, c = 1013904223, m = 2^32
    this.state = (1664525 * this.state + 1013904223) >>> 0;
    return this.state / 0x100000000; // 0~1 범위로 정규화
  }

  nextInt(max: number): number {
    return Math.floor(this.next() * max);
  }
}

/**
 * 시드 기반 Fisher-Yates 셔플 알고리즘
 * @param array 셔플할 배열
 * @param seed 시드 값
 * @returns 셔플된 배열 (원본 배열을 변경하지 않음)
 */
export function seededShuffle<T>(array: T[], seed: number): T[] {
  const shuffled = [...array];
  const lcg = new LCG(seed);

  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = lcg.nextInt(i + 1);
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }

  return shuffled;
}
