export const CombatUtils = {
  /**
   * Calculates damage based on attack stat and optional multiplier/variance.
   */
  rollAttackDamage: (baseAttack: number, multiplier: number = 1): number => {
    // Base damage + Attack * Multiplier
    // Adding some variance (e.g., +/- 20%)
    const variance = 0.8 + Math.random() * 0.4;
    const damage = Math.floor(baseAttack * multiplier * variance);
    return Math.max(1, damage); // Minimum 1 damage
  },

  /**
   * Applies damage to a target with HP and Shield.
   * Damage is absorbed by Shield first, then HP.
   */
  applyDamage: (
    currentHp: number,
    currentShield: number,
    damage: number,
  ): { hp: number; shield: number; damageDealt: number } => {
    let remainingDamage = damage;
    let newShield = currentShield;
    let newHp = currentHp;

    if (newShield > 0) {
      const shieldDamage = Math.min(newShield, remainingDamage);
      newShield -= shieldDamage;
      remainingDamage -= shieldDamage;
    }

    if (remainingDamage > 0) {
      newHp -= remainingDamage;
    }

    return {
      hp: Math.max(0, newHp),
      shield: Math.max(0, newShield),
      damageDealt: damage,
    };
  },
};
