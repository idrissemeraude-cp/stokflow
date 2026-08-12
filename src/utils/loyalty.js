// Moteur de Programme de Fidélité Client (Points & Statuts VIP)

export const LOYALTY_TIERS = {
  BRONZE: { code: 'BRONZE', label: 'Client Standard', minPoints: 0, discountPercent: 0, badgeColor: 'bg-slate-100 text-slate-700 border-slate-300' },
  SILVER: { code: 'SILVER', label: 'Membre Argent', minPoints: 50, discountPercent: 3, badgeColor: 'bg-blue-100 text-blue-700 border-blue-300' },
  GOLD: { code: 'GOLD', label: 'Client Privilège Or', minPoints: 150, discountPercent: 5, badgeColor: 'bg-amber-100 text-amber-800 border-amber-400 font-bold' },
  PLATINUM: { code: 'PLATINUM', label: 'VIP Platine Faso', minPoints: 300, discountPercent: 8, badgeColor: 'bg-purple-100 text-purple-800 border-purple-400 font-extrabold' }
};

// Règle d'attribution : 1 point par tranche de 1 000 FCFA dépensée
export const calculatePointsEarned = (amountSpent) => {
  if (!amountSpent || amountSpent <= 0) return 0;
  return Math.floor(amountSpent / 1000);
};

// Déterminer le palier VIP en fonction du solde de points
export const getClientTier = (points = 0) => {
  if (points >= LOYALTY_TIERS.PLATINUM.minPoints) return LOYALTY_TIERS.PLATINUM;
  if (points >= LOYALTY_TIERS.GOLD.minPoints) return LOYALTY_TIERS.GOLD;
  if (points >= LOYALTY_TIERS.SILVER.minPoints) return LOYALTY_TIERS.SILVER;
  return LOYALTY_TIERS.BRONZE;
};

// Calculer la valeur monétaire des points en bon d'achat (Ex: 10 points = 500 FCFA de remise)
export const convertPointsToFCFA = (points = 0) => {
  return points * 50; // 1 pt = 50 FCFA
};
