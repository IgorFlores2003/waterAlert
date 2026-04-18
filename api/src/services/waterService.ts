export class WaterService {
  /**
   * Calculates the recommended daily water intake in milliliters.
   * Formula: (Weight * 35) + Age Adjustment + Height Adjustment
   */
  static calculateGoal(weight: number, height: number, age: number): number {
    // Base: 35ml per kg
    let goal = weight * 35;

    // Age Adjustment
    // Younger bodies often have higher metabolic rates / water turnover
    if (age < 30) {
      goal += 200;
    } else if (age > 55) {
      // Older adults might have reduced kidney function or lower thirst drive, 
      // but hydration is still critical. Formula-wise, it often scales down slightly.
      goal -= 200;
    }

    // Height Adjustment (minor surface area factor)
    // Avg height is ~170cm. For every 10cm above/below, adjust by 50ml.
    const heightDiff = height - 170;
    goal += (heightDiff / 10) * 50;

    // Round to nearest 50ml for practicality
    return Math.round(goal / 50) * 50;
  }
}
