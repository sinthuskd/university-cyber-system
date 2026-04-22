// ============================================================
// Risk Assessment Module — Unit Tests
// IT3040 ITPM — Assignment 5
// Component: Risk Assessment (Score Calculation & Logic)
// ============================================================

// ── Helpers copied from RiskController scoring logic ────────
function calculateRiskScore(answers, totalQuestions) {
  let riskPoints = 0;
  for (let i = 0; i < totalQuestions; i++) {
    const given = answers[String(i)];
    if (given !== undefined && given !== null) {
      riskPoints += given;
    }
  }
  const maxRisk = totalQuestions * 3;
  return Math.round((riskPoints * 100) / maxRisk);
}

function getRiskLevel(score) {
  if (score < 30) return 'LOW';
  if (score < 60) return 'MEDIUM';
  return 'HIGH';
}

function getRecommendations(riskLevel) {
  const recommendations = {
    LOW: [
      'Great job! Continue maintaining strong cybersecurity practices.',
      'Consider sharing your good practices with colleagues.',
      'Stay updated with latest security threats and trends.',
    ],
    MEDIUM: [
      'Enable two-factor authentication on all important accounts.',
      'Use a password manager to generate and store unique passwords.',
      'Be more cautious with suspicious emails and links.',
      'Keep all software and OS updated regularly.',
    ],
    HIGH: [
      'Immediately change all your passwords to strong, unique ones.',
      'Enable 2FA on every account that supports it.',
      'Install reputable antivirus software and update it immediately.',
      'Never use public Wi-Fi without a VPN.',
      'Attend cybersecurity awareness training as soon as possible.',
    ],
  };
  return recommendations[riskLevel] || [];
}

// ── Test Suite 1: Score Calculation ─────────────────────────
describe('Risk Score Calculation', () => {

  test('All best answers (index 0) → score should be 0 (LOW risk)', () => {
    const answers = { '0': 0, '1': 0, '2': 0, '3': 0, '4': 0, '5': 0, '6': 0, '7': 0 };
    const score = calculateRiskScore(answers, 8);
    expect(score).toBe(0);
  });

  test('All worst answers (index 3) → score should be 100 (HIGH risk)', () => {
    const answers = { '0': 3, '1': 3, '2': 3, '3': 3, '4': 3, '5': 3, '6': 3, '7': 3 };
    const score = calculateRiskScore(answers, 8);
    expect(score).toBe(100);
  });

  test('Mixed answers → score should be between 0 and 100', () => {
    const answers = { '0': 1, '1': 2, '2': 0, '3': 1, '4': 2, '5': 1, '6': 0, '7': 2 };
    const score = calculateRiskScore(answers, 8);
    expect(score).toBeGreaterThanOrEqual(0);
    expect(score).toBeLessThanOrEqual(100);
  });

  test('Empty answers → score should be 0', () => {
    const score = calculateRiskScore({}, 8);
    expect(score).toBe(0);
  });

  test('Partial answers (only 4 out of 8) → calculates correctly', () => {
    const answers = { '0': 3, '1': 3, '2': 3, '3': 3 };
    const score = calculateRiskScore(answers, 8);
    // 12 points out of 24 max = 50%
    expect(score).toBe(50);
  });

});

// ── Test Suite 2: Risk Level Classification ──────────────────
describe('Risk Level Classification', () => {

  test('Score 0 → LOW risk', () => {
    expect(getRiskLevel(0)).toBe('LOW');
  });

  test('Score 29 → LOW risk (boundary)', () => {
    expect(getRiskLevel(29)).toBe('LOW');
  });

  test('Score 30 → MEDIUM risk (boundary)', () => {
    expect(getRiskLevel(30)).toBe('MEDIUM');
  });

  test('Score 59 → MEDIUM risk (boundary)', () => {
    expect(getRiskLevel(59)).toBe('MEDIUM');
  });

  test('Score 60 → HIGH risk (boundary)', () => {
    expect(getRiskLevel(60)).toBe('HIGH');
  });

  test('Score 100 → HIGH risk', () => {
    expect(getRiskLevel(100)).toBe('HIGH');
  });

  test('Score 45 → MEDIUM risk', () => {
    expect(getRiskLevel(45)).toBe('MEDIUM');
  });

});

// ── Test Suite 3: Recommendations ───────────────────────────
describe('Risk Recommendations', () => {

  test('LOW risk → returns non-empty recommendations', () => {
    const recs = getRecommendations('LOW');
    expect(recs.length).toBeGreaterThan(0);
  });

  test('MEDIUM risk → returns non-empty recommendations', () => {
    const recs = getRecommendations('MEDIUM');
    expect(recs.length).toBeGreaterThan(0);
  });

  test('HIGH risk → returns non-empty recommendations', () => {
    const recs = getRecommendations('HIGH');
    expect(recs.length).toBeGreaterThan(0);
  });

  test('HIGH risk → more recommendations than LOW risk', () => {
    const high = getRecommendations('HIGH');
    const low  = getRecommendations('LOW');
    expect(high.length).toBeGreaterThan(low.length);
  });

  test('HIGH risk → includes password change recommendation', () => {
    const recs = getRecommendations('HIGH');
    const hasPasswordRec = recs.some(r =>
      r.toLowerCase().includes('password')
    );
    expect(hasPasswordRec).toBe(true);
  });

  test('Unknown risk level → returns empty array', () => {
    const recs = getRecommendations('UNKNOWN');
    expect(recs).toEqual([]);
  });

});

// ── Test Suite 4: Full User Journey ─────────────────────────
describe('Full Risk Assessment User Journey', () => {

  test('Journey 1: Security-conscious user → LOW risk with encouraging message', () => {
    // User who uses password manager, 2FA, never uses public WiFi
    const answers = { '0': 0, '1': 0, '2': 0, '3': 1, '4': 0, '5': 0, '6': 0, '7': 0 };
    const score = calculateRiskScore(answers, 8);
    const level = getRiskLevel(score);
    const recs  = getRecommendations(level);

    expect(score).toBeLessThan(30);
    expect(level).toBe('LOW');
    expect(recs.length).toBeGreaterThan(0);
  });

  test('Journey 2: Average user → MEDIUM risk with actionable steps', () => {
    // User with some good, some bad habits
    const answers = { '0': 1, '1': 2, '2': 1, '3': 1, '4': 1, '5': 2, '6': 1, '7': 1 };
    const score = calculateRiskScore(answers, 8);
    const level = getRiskLevel(score);
    const recs  = getRecommendations(level);

    expect(score).toBeGreaterThanOrEqual(30);
    expect(score).toBeLessThan(60);
    expect(level).toBe('MEDIUM');
    expect(recs).toContain('Enable two-factor authentication on all important accounts.');
  });

  test('Journey 3: At-risk user → HIGH risk with urgent warnings', () => {
    // User with very poor security habits
    const answers = { '0': 2, '1': 3, '2': 2, '3': 3, '4': 3, '5': 3, '6': 2, '7': 3 };
    const score = calculateRiskScore(answers, 8);
    const level = getRiskLevel(score);
    const recs  = getRecommendations(level);

    expect(score).toBeGreaterThanOrEqual(60);
    expect(level).toBe('HIGH');
    expect(recs.some(r => r.toLowerCase().includes('password'))).toBe(true);
    expect(recs.some(r => r.toLowerCase().includes('2fa') || r.toLowerCase().includes('two-factor'))).toBe(true);
  });

  test('Journey 4: Score + level are consistent', () => {
    const testCases = [
      { answers: { '0': 0, '1': 0, '2': 0, '3': 0, '4': 0, '5': 0, '6': 0, '7': 0 }, expected: 'LOW' },
      { answers: { '0': 1, '1': 2, '2': 1, '3': 1, '4': 2, '5': 1, '6': 2, '7': 1 }, expected: 'MEDIUM' },
      { answers: { '0': 3, '1': 3, '2': 3, '3': 3, '4': 3, '5': 3, '6': 3, '7': 3 }, expected: 'HIGH' },
    ];

    testCases.forEach(({ answers, expected }) => {
      const score = calculateRiskScore(answers, 8);
      const level = getRiskLevel(score);
      expect(level).toBe(expected);
    });
  });

});
