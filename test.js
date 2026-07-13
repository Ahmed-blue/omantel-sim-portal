// Phone validation function
function validatePhoneNumber(phone) {
    // Rule 1: Must start with +968 (Omantel Oman)
    if (!phone.startsWith("+971")) { // BUG: changed from +968 to +971
        return false;
    }
    //fork test Ahmed
    // Rule 2: Must be exactly 12 characters (+968 + 8 digits)
    if (phone.length !== 12) { 
        return false;
    }
    
    // Rule 3: Second digit (after +968) must be 8 or 9 (mobile)
    const secondDigit = phone[4]; // Position 4 is the first digit after +968
    if (secondDigit !== "8" && secondDigit !== "9") {
        return false;
    }
    
    return true;
}

// Test Suite
console.log("=== Testing Phone Validation ===\n");

// ✅ VALID test cases
console.log("✅ VALID CASES:");
console.log("Test 1: +968 9123 4567 →", validatePhoneNumber("+968 9123 4567")); // Should be true
console.log("Test 2: +968 8765 4321 →", validatePhoneNumber("+968 8765 4321")); // Should be true
console.log("Test 3: +968 91234567 →", validatePhoneNumber("+968 91234567"));   // Should be true

// ❌ INVALID test cases
console.log("\n❌ INVALID CASES:");
console.log("Test 4: +971 5123 4567 →", validatePhoneNumber("+971 5123 4567")); // Should be false (UAE number)
console.log("Test 5: +968 123 4567 →", validatePhoneNumber("+968 123 4567"));   // Should be false (too short)
console.log("Test 6: 9123 4567 →", validatePhoneNumber("9123 4567"));           // Should be false (no country code)
console.log("Test 7: +968 7123 4567 →", validatePhoneNumber("+968 7123 4567")); // Should be false (starts with 7)
console.log("Test 8: +968 91234567890 →", validatePhoneNumber("+968 91234567890")); // Should be false (too long)

console.log("\n=== Tests Complete ===");
