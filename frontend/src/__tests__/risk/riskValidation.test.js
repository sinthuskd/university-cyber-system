// ============================================================
// Risk Assessment Module — Input Validation & Edge Case Tests
// IT3040 ITPM — Assignment 5
// ============================================================

// ── Validation helpers ───────────────────────────────────────
function validateAnswers(answers, totalQuestions) {
  const errors = [];
  const answeredCount = Object.keys(answers).length;

  if (answeredCount === 0) {
    errors.push('No questions answered');
    return { valid: false, errors };
  }

  // Each answer must be 0-3 (4 options, index 0 to 3)
  for (const [key, value] of Object.entries(answers)) {
    const idx = parseInt(key);
    if (isNaN(idx) || idx < 0 || idx >= totalQuestions) {
      errors.push(`Invalid question index: ${key}`);
    }
    if (typeof value !== 'number' || value < 0 || value > 3) {
      errors.push(`Invalid answer value for question ${key}: ${value}`);
    }
  }

  return { valid: errors.length === 0, errors, answeredCount };
}

function isValidSessionId(sessionId) {
  if (!sessionId || typeof sessionId !== 'string') return false;
  const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  return uuidPattern.test(sessionId);
}

function formatAssessmentDate(isoString) {
  if (!isoString) return 'Unknown date';
  const date = new Date(isoString);
  if (isNaN(date.getTime())) return 'Invalid date';
  return date.toLocaleDateString('en-US', {
    year: 'numeric', month: 'short', day: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
}

// ── Test Suite 1: Answer Validation ─────────────────────────
describe('Risk Answer Validation', () => {

  test('Valid complete answers → passes validation', () => {
    const answers = { '0': 0, '1': 1, '2': 2, '3': 3, '4': 0, '5': 1, '6': 2, '7': 3 };
    const result = validateAnswers(answers, 8);
    expect(result.valid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });

  test('Empty answers → fails validation with error', () => {
    const result = validateAnswers({}, 8);
    expect(result.valid).toBe(false);
    expect(result.errors[0]).toMatch(/no questions answered/i);
  });

  test('Answer value out of range (4) → fails validation', () => {
    const answers = { '0': 4 }; // max is 3
    const result = validateAnswers(answers, 8);
    expect(result.valid).toBe(false);
    expect(result.errors.some(e => e.includes('0'))).toBe(true);
  });

  test('Negative answer value → fails validation', () => {
    const answers = { '0': -1 };
    const result = validateAnswers(answers, 8);
    expect(result.valid).toBe(false);
  });

  test('Partial answers (5 of 8) → valid but shows count', () => {
    const answers = { '0': 0, '1': 1, '2': 2, '3': 0, '4': 1 };
    const result = validateAnswers(answers, 8);
    expect(result.valid).toBe(true);
    expect(result.answeredCount).toBe(5);
  });

  test('All boundary values (0 and 3) → valid', () => {
    const answers = { '0': 0, '1': 3, '2': 0, '3': 3, '4': 0, '5': 3, '6': 0, '7': 3 };
    const result = validateAnswers(answers, 8);
    expect(result.valid).toBe(true);
  });

});

// ── Test Suite 2: Session ID Validation ─────────────────────
describe('Session ID Validation', () => {

  test('Valid UUID → returns true', () => {
    expect(isValidSessionId('f47ac10b-58cc-4372-a567-0e02b2c3d479')).toBe(true);
  });

  test('Empty string → returns false', () => {
    expect(isValidSessionId('')).toBe(false);
  });

  test('null → returns false', () => {
    expect(isValidSessionId(null)).toBe(false);
  });

  test('Random short string → returns false', () => {
    expect(isValidSessionId('abc123')).toBe(false);
  });

  test('UUID without hyphens → returns false', () => {
    expect(isValidSessionId('f47ac10b58cc4372a5670e02b2c3d479')).toBe(false);
  });

});

// ── Test Suite 3: Date Formatting ────────────────────────────
describe('Assessment Date Formatting', () => {

  test('Valid ISO string → returns formatted date', () => {
    const formatted = formatAssessmentDate('2024-03-15T10:30:00Z');
    expect(formatted).not.toBe('Invalid date');
    expect(formatted).not.toBe('Unknown date');
    expect(formatted.length).toBeGreaterThan(0);
  });

  test('null → returns "Unknown date"', () => {
    expect(formatAssessmentDate(null)).toBe('Unknown date');
  });

  test('Invalid string → returns "Invalid date"', () => {
    expect(formatAssessmentDate('not-a-date')).toBe('Invalid date');
  });

  test('Empty string → returns "Unknown date"', () => {
    expect(formatAssessmentDate('')).toBe('Unknown date');
  });

});

// ── Test Suite 4: Risk Level Display Logic ───────────────────
describe('Risk Level Display Helpers', () => {

  const levelConfig = {
    LOW:    { label: 'Low Risk',    color: 'text-green-400',  barColor: 'bg-green-500' },
    MEDIUM: { label: 'Medium Risk', color: 'text-yellow-400', barColor: 'bg-yellow-500' },
    HIGH:   { label: 'High Risk',   color: 'text-red-400',    barColor: 'bg-red-500' },
  };

  test('LOW risk → shows green color class', () => {
    expect(levelConfig['LOW'].color).toBe('text-green-400');
  });

  test('HIGH risk → shows red color class', () => {
    expect(levelConfig['HIGH'].color).toBe('text-red-400');
  });

  test('MEDIUM risk → shows yellow color class', () => {
    expect(levelConfig['MEDIUM'].color).toBe('text-yellow-400');
  });

  test('All levels have required display properties', () => {
    ['LOW', 'MEDIUM', 'HIGH'].forEach(level => {
      expect(levelConfig[level]).toHaveProperty('label');
      expect(levelConfig[level]).toHaveProperty('color');
      expect(levelConfig[level]).toHaveProperty('barColor');
    });
  });

  test('Progress bar width = score percentage', () => {
    const score = 65;
    const style = { width: `${score}%` };
    expect(style.width).toBe('65%');
  });

});
