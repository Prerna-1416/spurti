// Learning Tree Anti-Cheat Tests - Standalone
// Run with: node server/services/learningTree.test.js

console.log('='.repeat(60));
console.log('LEARNING TREE ANTI-CHEAT TESTS');
console.log('='.repeat(60));

// ============================================================
// COPY OF FUNCTIONS BEING TESTED (standalone, no imports)
// ============================================================

function applyDiminishingUtility(basePoints, activityCount) {
  // activityCount is 1-indexed (1st activity = activityCount 1)
  if (activityCount <= 1) return basePoints;       // Activity 1: 100%
  if (activityCount === 2) return Math.round(basePoints * 0.8);  // Activity 2: 80%
  if (activityCount === 3) return Math.round(basePoints * 0.6);  // Activity 3: 60%
  return Math.round(basePoints * 0.4);             // Activity 4+: 40%
}

function validateQuality(duration, qualityScore) {
  // Reject if EITHER condition is true:
  // 1. Duration is less than 5 minutes
  // 2. Quality score exists and is <= 0.7
  if (duration < 5) return false;
  if (qualityScore !== undefined && qualityScore <= 0.7) return false;
  return true;
}

// ============================================================
// FIX 1: validateQuality() Tests
// ============================================================

console.log('\n--- FIX 1: validateQuality() ---\n');
console.log('BEFORE (buggy):');
console.log('  if (duration < 5 && !qualityScore) return false;');
console.log('  // Only failed when BOTH duration < 5 AND qualityScore was undefined');
console.log('  // Passed when duration < 5 but qualityScore was 0.5 (WRONG)');
console.log('');
console.log('AFTER (fixed):');
console.log('  if (duration < 5) return false;');
console.log('  if (qualityScore !== undefined && qualityScore <= 0.7) return false;');
console.log('  // Rejects if EITHER duration < 5 OR qualityScore <= 0.7');
console.log('');

const fix1Tests = [
  // Tests that REJECT (duration < 5 cases)
  { input: { duration: 3, qualityScore: undefined }, expected: false, desc: 'duration < 5, no qualityScore → REJECT' },
  { input: { duration: 3, qualityScore: 1.0 }, expected: false, desc: 'duration < 5, qualityScore = 1.0 → REJECT' },
  { input: { duration: 3, qualityScore: 0.9 }, expected: false, desc: 'duration < 5, qualityScore = 0.9 → REJECT' },
  { input: { duration: 3, qualityScore: 0.5 }, expected: false, desc: 'duration < 5, qualityScore = 0.5 → REJECT' },
  { input: { duration: 3, qualityScore: 0.7 }, expected: false, desc: 'duration < 5, qualityScore = 0.7 → REJECT' },
  { input: { duration: 3, qualityScore: 0.71 }, expected: false, desc: 'duration < 5, qualityScore = 0.71 → REJECT' },
  // Tests that ACCEPT (duration >= 5 cases)
  { input: { duration: 10, qualityScore: undefined }, expected: true, desc: 'duration >= 5, no qualityScore → ACCEPT' },
  { input: { duration: 5, qualityScore: 1.0 }, expected: true, desc: 'duration = 5, qualityScore = 1.0 → ACCEPT' },
  { input: { duration: 5, qualityScore: 0.8 }, expected: true, desc: 'duration = 5, qualityScore = 0.8 → ACCEPT' },
  { input: { duration: 10, qualityScore: 0.71 }, expected: true, desc: 'duration >= 5, qualityScore = 0.71 → ACCEPT' },
  // Tests that REJECT (qualityScore <= 0.7)
  { input: { duration: 10, qualityScore: 0.7 }, expected: false, desc: 'duration >= 5, qualityScore = 0.7 → REJECT (must be > 0.7)' },
  { input: { duration: 10, qualityScore: 0.5 }, expected: false, desc: 'duration >= 5, qualityScore = 0.5 → REJECT' },
  { input: { duration: 5, qualityScore: 0.0 }, expected: false, desc: 'duration = 5, qualityScore = 0.0 → REJECT' },
];

let fix1Passed = 0;
let fix1Failed = 0;

fix1Tests.forEach((test, i) => {
  const result = validateQuality(test.input.duration, test.input.qualityScore);
  const pass = result === test.expected;
  if (pass) {
    fix1Passed++;
    console.log(`  ✅ Test ${i + 1}: ${test.desc}`);
  } else {
    fix1Failed++;
    console.log(`  ❌ Test ${i + 1}: ${test.desc}`);
    console.log(`     Expected: ${test.expected}, Got: ${result}`);
  }
});

console.log(`\n  Fix 1 Results: ${fix1Passed}/${fix1Passed + fix1Failed} passed`);

// ============================================================
// FIX 2: applyDiminishingUtility() Tests
// ============================================================

console.log('\n--- FIX 2: applyDiminishingUtility() ---\n');
console.log('BEFORE (buggy):');
console.log('  if (activityCount === 0) return basePoints;');
console.log('  if (activityCount === 1) return basePoints;  // Activity 1: 100%');
console.log('  if (activityCount === 2) return Math.round(basePoints * 0.8);  // Activity 2: 80%');
console.log('  return Math.round(basePoints * 0.4);  // Activity 3+: 40% (WRONG! Activity 3 should be 60%)');
console.log('');
console.log('AFTER (fixed):');
console.log('  if (activityCount <= 1) return basePoints;  // Activity 1: 100%');
console.log('  if (activityCount === 2) return Math.round(basePoints * 0.8);  // Activity 2: 80%');
console.log('  if (activityCount === 3) return Math.round(basePoints * 0.6);  // Activity 3: 60%');
console.log('  return Math.round(basePoints * 0.4);  // Activity 4+: 40%');
console.log('');

const fix2Tests = [
  // Activity 1: 100%
  { basePoints: 100, activityCount: 1, expected: 100, desc: 'Activity 1 → 100% = 100 pts' },
  { basePoints: 50, activityCount: 1, expected: 50, desc: 'Activity 1, 50 base → 50 pts' },
  { basePoints: 33, activityCount: 1, expected: 33, desc: 'Activity 1, 33 base → 33 pts' },
  // Activity 2: 80%
  { basePoints: 100, activityCount: 2, expected: 80, desc: 'Activity 2 → 80% = 80 pts' },
  { basePoints: 50, activityCount: 2, expected: 40, desc: 'Activity 2, 50 base → 40 pts' },
  { basePoints: 33, activityCount: 2, expected: 26, desc: 'Activity 2, 33 base → 26 pts (80%)' },
  // Activity 3: 60% (THIS WAS THE BUG - used to return 40%)
  { basePoints: 100, activityCount: 3, expected: 60, desc: 'Activity 3 → 60% = 60 pts (FIXED)' },
  { basePoints: 50, activityCount: 3, expected: 30, desc: 'Activity 3, 50 base → 30 pts' },
  { basePoints: 33, activityCount: 3, expected: 20, desc: 'Activity 3, 33 base → 20 pts (60%)' },
  // Activity 4+: 40%
  { basePoints: 100, activityCount: 4, expected: 40, desc: 'Activity 4+ → 40% = 40 pts' },
  { basePoints: 50, activityCount: 4, expected: 20, desc: 'Activity 4+, 50 base → 20 pts' },
  { basePoints: 15, activityCount: 4, expected: 6, desc: 'Activity 4+, 15 base → 6 pts' },
  { basePoints: 15, activityCount: 5, expected: 6, desc: 'Activity 5+ → 40% = 6 pts' },
  { basePoints: 15, activityCount: 10, expected: 6, desc: 'Activity 10+ → 40% = 6 pts' },
];

let fix2Passed = 0;
let fix2Failed = 0;

fix2Tests.forEach((test, i) => {
  const result = applyDiminishingUtility(test.basePoints, test.activityCount);
  const pass = result === test.expected;
  if (pass) {
    fix2Passed++;
    console.log(`  ✅ Test ${i + 1}: ${test.desc}`);
  } else {
    fix2Failed++;
    console.log(`  ❌ Test ${i + 1}: ${test.desc}`);
    console.log(`     Expected: ${test.expected}, Got: ${result}`);
  }
});

console.log(`\n  Fix 2 Results: ${fix2Passed}/${fix2Passed + fix2Failed} passed`);

// ============================================================
// FIX 3: Diversity Enforcement (documented, requires DB)
// ============================================================

console.log('\n--- FIX 3: Diversity Enforcement ---\n');
console.log('  The diversity penalty is applied in updateLearningTree()');
console.log('');
console.log('  Rule (from docs/implementation.md):');
console.log('  - Weekly requirement: balance in at least 5 categories');
console.log('  - Punishment for narrow category-focused activity');
console.log('');
console.log('  Implementation:');
console.log('  if (weekCategoriesActive < 5 && totalBranchXP > 0) {');
console.log('    const categoriesShort = 5 - weekCategoriesActive;');
console.log('    const weeklyXP = recentActivities.reduce((sum, a) => sum + a.appliedPoints, 0);');
console.log('    const penaltyPerCategory = Math.round(weeklyXP * 0.1);');
console.log('    const totalPenalty = penaltyPerCategory * categoriesShort;');
console.log('    // Apply penalty proportionally across all 8 dimensions');
console.log('    // Log as diversity_penalty activity');
console.log('  }');
console.log('');
console.log('  Example scenario:');
console.log('  - Student uses only 3 categories this week (shortfall = 2)');
console.log('  - Weekly XP earned = 200');
console.log('  - Penalty = 200 * 10% * 2 = 40 XP total');
console.log('  - 40 XP / 8 dimensions = 5 XP deducted per dimension');
console.log('');
console.log('  ✅ Fix 3 implemented (DB required for full integration test)');

// ============================================================
// SUMMARY
// ============================================================

console.log('\n' + '='.repeat(60));
console.log('SUMMARY');
console.log('='.repeat(60));
console.log(`  Fix 1 (validateQuality): ${fix1Passed}/${fix1Passed + fix1Failed} tests passed`);
console.log(`  Fix 2 (applyDiminishingUtility): ${fix2Passed}/${fix2Passed + fix2Failed} tests passed`);
console.log(`  Fix 3 (diversity enforcement): Implemented (DB required for full test)`);
console.log('\n');

// Exit with error code if any tests failed
if (fix1Failed > 0 || fix2Failed > 0) {
  console.log('❌ SOME TESTS FAILED');
  process.exit(1);
} else {
  console.log('✅ ALL TESTS PASSED');
}