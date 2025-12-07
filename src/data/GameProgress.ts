export interface GameProgressData {
  beatenBosses: number[];
}

const defaultData: GameProgressData = {
  beatenBosses: [],
};

export class GameProgress {
  private static data: GameProgressData = defaultData;

  static markBossAsBeaten(id: number): void {
    if (!this.data.beatenBosses.includes(id)) {
      this.data.beatenBosses.push(id);
      console.log(`Boss ${id} marked as beaten!`);
    }
  }

  static isBossBeaten(id: number): boolean {
    return this.data.beatenBosses.includes(id);
  }

  static getBeatenBosses(): number[] {
    return [...this.data.beatenBosses];
  }
}
