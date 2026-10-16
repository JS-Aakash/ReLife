import { ProductCategory, RepairRecord, HealthScoreBreakdown, WarrantyStatus } from './types';

// Average embodied carbon (kg CO2e) & physical e-waste mass (kg) avoided when a product is repaired/kept in service
export const CATEGORY_ENVIRONMENTAL_BENCHMARKS: Record<
  ProductCategory,
  { avgWeightKg: number; avgEmbodiedCarbonKg: number; typicalLifespanYears: number }
> = {
  smartphone: { avgWeightKg: 0.2, avgEmbodiedCarbonKg: 72, typicalLifespanYears: 3 },
  laptop: { avgWeightKg: 2.1, avgEmbodiedCarbonKg: 240, typicalLifespanYears: 5 },
  tablet: { avgWeightKg: 0.5, avgEmbodiedCarbonKg: 110, typicalLifespanYears: 4 },
  audio: { avgWeightKg: 0.35, avgEmbodiedCarbonKg: 45, typicalLifespanYears: 4 },
  appliance: { avgWeightKg: 18.0, avgEmbodiedCarbonKg: 350, typicalLifespanYears: 8 },
  bicycle: { avgWeightKg: 12.5, avgEmbodiedCarbonKg: 180, typicalLifespanYears: 10 },
  camera: { avgWeightKg: 0.8, avgEmbodiedCarbonKg: 140, typicalLifespanYears: 6 },
  gaming: { avgWeightKg: 3.5, avgEmbodiedCarbonKg: 200, typicalLifespanYears: 6 },
  other: { avgWeightKg: 2.0, avgEmbodiedCarbonKg: 100, typicalLifespanYears: 5 },
};

/**
 * Calculates warranty status and days remaining
 */
export function getWarrantyInfo(expiryDateStr: string): {
  status: WarrantyStatus;
  daysRemaining: number;
  label: string;
  badgeClass: string;
} {
  if (!expiryDateStr) {
    return {
      status: 'unknown',
      daysRemaining: 0,
      label: 'No Warranty Data',
      badgeClass: 'bg-zinc-100 text-zinc-700 border-zinc-200',
    };
  }

  const expiry = new Date(expiryDateStr);
  const now = new Date();
  const diffTime = expiry.getTime() - now.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays < 0) {
    return {
      status: 'expired',
      daysRemaining: diffDays,
      label: `Expired (${Math.abs(diffDays)}d ago)`,
      badgeClass: 'bg-amber-50 text-amber-800 border-amber-200',
    };
  } else if (diffDays <= 30) {
    return {
      status: 'expiring_soon',
      daysRemaining: diffDays,
      label: `Expiring Soon (${diffDays}d left)`,
      badgeClass: 'bg-orange-50 text-orange-800 border-orange-200 font-medium animate-pulse',
    };
  } else {
    return {
      status: 'active',
      daysRemaining: diffDays,
      label: `Active (${diffDays}d left)`,
      badgeClass: 'bg-emerald-50 text-emerald-800 border-emerald-200',
    };
  }
}

/**
 * Calculates an explainable Product Health Score (0 - 100)
 */
export function calculateHealthScore(
  purchaseDateStr: string,
  category: ProductCategory,
  purchasePrice: number,
  repairs: RepairRecord[]
): HealthScoreBreakdown {
  const benchmarks = CATEGORY_ENVIRONMENTAL_BENCHMARKS[category] || CATEGORY_ENVIRONMENTAL_BENCHMARKS.other;
  const purchaseDate = new Date(purchaseDateStr);
  const now = new Date();
  
  // Calculate age in years
  const ageYears = Math.max(0, (now.getTime() - purchaseDate.getTime()) / (1000 * 60 * 60 * 24 * 365.25));
  const expectedLifespan = benchmarks.typicalLifespanYears;

  // 1. Age Factor (Max 25 pts)
  // New devices start at 25, naturally depreciating condition relative to design lifespan
  const ageUsageRatio = ageYears / expectedLifespan;
  let ageScore = Math.round(Math.max(5, 25 - (ageUsageRatio * 15)));
  const ageExplanation = `Product is ${ageYears.toFixed(1)} yrs old (${Math.round(ageUsageRatio * 100)}% of typical ${expectedLifespan} yr service lifecycle).`;

  // 2. Repair Integrity & Evidence (Max 25 pts)
  // Repaired properly with verified/document-backed records scores high
  let repairIntegrityScore = 20; // default baseline
  if (repairs.length > 0) {
    const verifiedCount = repairs.filter(r => r.verificationBadge === 'technician-verified').length;
    const documentBackedCount = repairs.filter(r => r.verificationBadge === 'document-backed').length;
    
    if (verifiedCount > 0) {
      repairIntegrityScore = 25; // Certified technician care
    } else if (documentBackedCount > 0) {
      repairIntegrityScore = 22; // Backed by receipts
    } else {
      repairIntegrityScore = 18; // Self reported
    }
  }
  const repairExplanation = repairs.length === 0 
    ? 'No major hardware repairs required to date.' 
    : `${repairs.length} service event(s) logged. Provenance supported by verified documentation.`;

  // 3. Maintenance & Component Care (Max 25 pts)
  // Measures proactive care vs recurrent faults
  let maintenanceScore = 24;
  const recentRepairs = repairs.filter(r => {
    const rDate = new Date(r.date);
    return (now.getTime() - rDate.getTime()) / (1000 * 60 * 60 * 24 * 30) <= 6; // last 6 months
  });
  
  if (recentRepairs.length >= 2) {
    maintenanceScore = 15; // recurrent recent breakdowns
  } else if (recentRepairs.length === 1) {
    maintenanceScore = 21;
  }
  const maintenanceExplanation = recentRepairs.length >= 2
    ? 'Multiple faults recorded within the past 6 months.'
    : 'Stable operating condition with no high-frequency recurring failures.';

  // 4. Financial Viability / Cost-to-Value Ratio (Max 25 pts)
  // If total repair cost exceeds 60% of original purchase price, health drops
  const totalRepairCost = repairs.reduce((acc, r) => acc + (r.cost || 0), 0);
  const costRatio = purchasePrice > 0 ? (totalRepairCost / purchasePrice) : 0;
  
  let costScore = 25;
  if (costRatio > 0.6) {
    costScore = 12;
  } else if (costRatio > 0.35) {
    costScore = 18;
  } else if (costRatio > 0.15) {
    costScore = 22;
  }
  const costExplanation = totalRepairCost > 0 
    ? `Total repairs cost $${totalRepairCost.toFixed(0)} (${Math.round(costRatio * 100)}% of purchase price $${purchasePrice}).`
    : 'Zero repair expenses incurred to date.';

  const overallScore = Math.min(100, Math.max(10, ageScore + repairIntegrityScore + maintenanceScore + costScore));

  let tier: 'Exceptional' | 'Good' | 'Moderate' | 'Degraded' = 'Good';
  if (overallScore >= 85) tier = 'Exceptional';
  else if (overallScore >= 70) tier = 'Good';
  else if (overallScore >= 50) tier = 'Moderate';
  else tier = 'Degraded';

  const advice: string[] = [];
  if (ageYears > expectedLifespan * 0.7) {
    advice.push('Approaching mature lifecycle: schedule proactive inspection of wearing parts (battery, thermal paste, seals).');
  }
  if (repairs.some(r => r.symptoms.toLowerCase().includes('battery'))) {
    advice.push('Battery has undergone servicing. Maintain 20%-80% charging habits to maximize cell longevity.');
  }
  if (category === 'bicycle') {
    advice.push('Ensure chain elongation is checked every 800-1000 km to prevent premature drivetrain cassette wear.');
  }

  return {
    overallScore,
    tier,
    factors: [
      {
        name: 'Service Age & Design Lifespan',
        score: ageScore,
        maxScore: 25,
        weight: '25%',
        explanation: ageExplanation,
        status: ageScore >= 20 ? 'positive' : ageScore >= 14 ? 'neutral' : 'warning',
      },
      {
        name: 'Repair Provenance & Evidence',
        score: repairIntegrityScore,
        maxScore: 25,
        weight: '25%',
        explanation: repairExplanation,
        status: repairIntegrityScore >= 20 ? 'positive' : 'neutral',
      },
      {
        name: 'Fault Recurrence & Stability',
        score: maintenanceScore,
        maxScore: 25,
        weight: '25%',
        explanation: maintenanceExplanation,
        status: maintenanceScore >= 20 ? 'positive' : 'warning',
      },
      {
        name: 'Cost-to-Value Sustainability',
        score: costScore,
        maxScore: 25,
        weight: '25%',
        explanation: costExplanation,
        status: costScore >= 20 ? 'positive' : costScore >= 15 ? 'neutral' : 'warning',
      },
    ],
    maintenanceAdvice: advice.length > 0 ? advice : ['Device operates within optimal maintainability parameters.'],
  };
}

/**
 * Calculate transparent e-waste avoidance and CO2e savings
 */
export function calculateEnvironmentalImpact(
  category: ProductCategory,
  repairs: RepairRecord[]
): {
  eWasteAvoidedKg: number;
  carbonAvoidedKg: number;
  extendedMonths: number;
} {
  const benchmark = CATEGORY_ENVIRONMENTAL_BENCHMARKS[category] || CATEGORY_ENVIRONMENTAL_BENCHMARKS.other;
  
  if (repairs.length === 0) {
    return {
      eWasteAvoidedKg: 0,
      carbonAvoidedKg: 0,
      extendedMonths: 0,
    };
  }

  // Each repair extends useful life. A successfully maintained device diverts 1 full replacement unit from landfill
  // when extended beyond original baseline.
  const totalMonthsExtended = repairs.reduce((acc, r) => acc + (r.usefulLifeExtensionMonths || 12), 0);
  const extensionRatio = Math.min(1.8, totalMonthsExtended / (benchmark.typicalLifespanYears * 12));

  const eWasteAvoidedKg = Number((benchmark.avgWeightKg * extensionRatio).toFixed(2));
  const carbonAvoidedKg = Number((benchmark.avgEmbodiedCarbonKg * extensionRatio).toFixed(1));

  return {
    eWasteAvoidedKg,
    carbonAvoidedKg,
    extendedMonths: totalMonthsExtended,
  };
}
