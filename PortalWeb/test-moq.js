// Quick test to verify MOQ implementation
const MOQ_AMOUNT = 5000;

function validateMOQ(cartTotal) {
  const isValid = cartTotal >= MOQ_AMOUNT;
  const shortfall = Math.max(0, MOQ_AMOUNT - cartTotal);

  return {
    isValid,
    currentAmount: cartTotal,
    requiredAmount: MOQ_AMOUNT,
    shortfall,
    message: isValid
      ? `✓ Minimum order requirement met (₹${MOQ_AMOUNT.toLocaleString()})`
      : `Add ₹${shortfall.toLocaleString()} more to reach minimum order of ₹${MOQ_AMOUNT.toLocaleString()}`,
  };
}

// Test cases
console.log("=== MOQ Implementation Test ===");

// Test 1: Below MOQ
console.log("\n1. Cart Total: ₹2,000 (Below MOQ)");
const result1 = validateMOQ(2000);
console.log("Result:", result1);
console.log("Expected: isValid=false, shortfall=3000");

// Test 2: Exactly at MOQ
console.log("\n2. Cart Total: ₹5,000 (Exactly at MOQ)");
const result2 = validateMOQ(5000);
console.log("Result:", result2);
console.log("Expected: isValid=true, shortfall=0");

// Test 3: Above MOQ
console.log("\n3. Cart Total: ₹7,500 (Above MOQ)");
const result3 = validateMOQ(7500);
console.log("Result:", result3);
console.log("Expected: isValid=true, shortfall=0");

// Test 4: Edge case - very small amount
console.log("\n4. Cart Total: ₹100 (Very small)");
const result4 = validateMOQ(100);
console.log("Result:", result4);
console.log("Expected: isValid=false, shortfall=4900");

console.log("\n=== Test Complete ===");
