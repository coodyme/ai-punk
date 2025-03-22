/**
 * Calculate damage based on weapon and combat parameters
 * @param {Object} params - Combat parameters
 * @param {Object} params.weapon - Weapon data
 * @param {number} params.attackerLevel - Attacker's level
 * @param {number} params.targetDefense - Target's defense value
 * @param {boolean} params.isCritical - Whether it's a critical hit
 * @returns {number} Calculated damage amount
 */
export const calculateDamage = (params) => {
  const { weapon, attackerLevel, targetDefense, isCritical } = params;
  
  // Base damage from weapon
  let damage = weapon.damage || 10;
  
  // Add level bonus (5% per level)
  damage += damage * (attackerLevel * 0.05);
  
  // Apply critical hit multiplier
  if (isCritical) {
    damage *= 1.5;
  }
  
  // Factor in weapon quality if available
  if (weapon.quality) {
    // Quality ranges: 1 (poor) to 5 (legendary)
    const qualityMultiplier = 0.8 + (weapon.quality * 0.1);
    damage *= qualityMultiplier;
  }
  
  // Apply target defense reduction (logarithmic scale to prevent negating damage completely)
  const defenseReduction = Math.min(0.75, targetDefense / (targetDefense + 50));
  damage *= (1 - defenseReduction);
  
  // Add weapon element/type bonuses if applicable
  if (weapon.element) {
    // This could be expanded with target resistances/weaknesses
    damage *= 1.1; // Simple 10% elemental damage bonus
  }

  // Ensure minimal damage of 1
  return Math.max(1, Math.floor(damage));
};