import { UserStatData } from "./components/StatDisplay";

/**
 * Character stats interface
 */
export interface CharacterStats {
    attack: UserStatData;
    defense: UserStatData;
    hitPoints: UserStatData;
}

/**
 * Character data interface
 */
export interface Character {
    stats: CharacterStats;
    name?: string;
}

/**
 * Roll 3d6 for a stat (3-18 range)
 */
export function rollStat(): number {
    return Math.floor(Math.random() * 6) + 1 +
        Math.floor(Math.random() * 6) + 1 +
        Math.floor(Math.random() * 6) + 1;
}

/**
 * Roll 4d6 drop lowest for a stat (3-18 range, better distribution)
 */
export function rollStatAdvanced(name: string): UserStatData {
    const rolls = [
        Math.floor(Math.random() * 6) + 1,
        Math.floor(Math.random() * 6) + 1,
        Math.floor(Math.random() * 6) + 1,
        Math.floor(Math.random() * 6) + 1,
    ];
    rolls.sort((a, b) => a - b);
    // Drop the lowest, sum the rest
    return {
        label: name,
        value: rolls[1] + rolls[2] + rolls[3]
    }
}

/**
 * Generate random character stats
 */
export function generateRandomStats(): CharacterStats {
    return {
        attack: rollStatAdvanced("Atak"),
        defense: rollStatAdvanced("Obrona"),
        hitPoints: rollStatAdvanced("Punkty zdrowia"),
    };
}

/**
 * Get stat modifier from stat value (D&D style)
 */
export function getStatModifier(statValue: number): number {
    return Math.floor((statValue - 10) / 2);
}

/**
 * Get color for stat value (visual feedback)
 */
export function getStatColor(statValue: number): number {
    if (statValue >= 16) return 0x4ade80; // Green - Excellent
    if (statValue >= 14) return 0x60a5fa; // Blue - Good
    if (statValue >= 12) return 0xfbbf24; // Yellow - Average
    if (statValue >= 9) return 0xfb923c;  // Orange - Below Average
    return 0xef4444; // Red - Poor
}
