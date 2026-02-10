export const MOQ_AMOUNT = 5000 // ₹5,000 minimum order value

export interface MOQStatus {
  isValid: boolean
  currentAmount: number
  requiredAmount: number
  shortfall: number
  message: string
}

export function validateMOQ(cartTotal: number): MOQStatus {
  const isValid = cartTotal >= MOQ_AMOUNT
  const shortfall = Math.max(0, MOQ_AMOUNT - cartTotal)

  return {
    isValid,
    currentAmount: cartTotal,
    requiredAmount: MOQ_AMOUNT,
    shortfall,
    message: isValid
      ? `✓ Minimum order requirement met (₹${MOQ_AMOUNT.toLocaleString()})`
      : `Add ₹${shortfall.toLocaleString()} more to reach minimum order of ₹${MOQ_AMOUNT.toLocaleString()}`,
  }
}
