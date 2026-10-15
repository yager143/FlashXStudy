/**
 * Levenshtein distance algorithm for typo tolerance
 */
export function levenshteinDistance(a: string, b: string): number {
  const m = a.length;
  const n = b.length;
  const dp: number[][] = Array.from({ length: m + 1 }, () => Array(n + 1).fill(0));

  for (let i = 0; i <= m; i++) dp[i][0] = i;
  for (let j = 0; j <= n; j++) dp[0][j] = j;

  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      if (a[i - 1] === b[j - 1]) {
        dp[i][j] = dp[i - 1][j - 1];
      } else {
        dp[i][j] = 1 + Math.min(dp[i - 1][j], dp[i][j - 1], dp[i - 1][j - 1]);
      }
    }
  }

  return dp[m][n];
}

/**
 * Normalizes text by removing non-alphanumeric punctuation,
 * collapsing whitespace, and lowercasing.
 */
export function normalizeAnswer(text: string): string {
  return text
    .toLowerCase()
    .replace(/[.,\/#!$%\^&\*;:{}=\-_`~()'"?]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Extracts possible acceptable variants from a term.
 * E.g., "Endoplasmic Reticulum (ER)" -> ["endoplasmic reticulum (er)", "endoplasmic reticulum", "er"]
 * "Hypertext / HTML" -> ["hypertext / html", "hypertext", "html"]
 */
export function getAcceptableVariants(term: string): string[] {
  const variants = new Set<string>();
  const rawNormalized = normalizeAnswer(term);
  variants.add(rawNormalized);

  // Extract parentheses content e.g. "Term (Acronym)"
  const parenMatch = term.match(/^(.*?)\((.*?)\)(.*)$/);
  if (parenMatch) {
    const main = normalizeAnswer(`${parenMatch[1]} ${parenMatch[3]}`);
    const inside = normalizeAnswer(parenMatch[2]);
    if (main.length > 0) variants.add(main);
    if (inside.length > 0) variants.add(inside);
  }

  // Extract slash-separated options e.g. "Option A / Option B"
  if (term.includes('/')) {
    term.split('/').forEach(part => {
      const p = normalizeAnswer(part);
      if (p.length > 0) variants.add(p);
    });
  }

  return Array.from(variants);
}

export interface GradeResult {
  isCorrect: boolean;
  typoTolerated: boolean;
  matchedVariant?: string;
  bestDistance: number;
}

/**
 * Smart grading function:
 * 1. Checks exact match against normalized variants
 * 2. If no exact match, checks typo tolerance based on word length:
 *    - len >= 9: allows up to 2 typos (distance <= 2)
 *    - len >= 5: allows 1 typo (distance <= 1)
 */
export function gradeAnswer(userAnswer: string, expectedTerm: string): GradeResult {
  const normUser = normalizeAnswer(userAnswer);
  if (!normUser) {
    return { isCorrect: false, typoTolerated: false, bestDistance: 999 };
  }

  const variants = getAcceptableVariants(expectedTerm);

  // Check exact matches
  for (const variant of variants) {
    if (normUser === variant) {
      return { isCorrect: true, typoTolerated: false, matchedVariant: variant, bestDistance: 0 };
    }
  }

  // Check typo tolerance
  let minDistance = Infinity;
  let bestVariant = '';

  for (const variant of variants) {
    const dist = levenshteinDistance(normUser, variant);
    if (dist < minDistance) {
      minDistance = dist;
      bestVariant = variant;
    }
  }

  const variantLen = bestVariant.length;
  // Lenient typo threshold
  let allowedErrors = 0;
  if (variantLen >= 9) {
    allowedErrors = 2;
  } else if (variantLen >= 5) {
    allowedErrors = 1;
  }

  if (minDistance <= allowedErrors) {
    return {
      isCorrect: true,
      typoTolerated: true,
      matchedVariant: bestVariant,
      bestDistance: minDistance,
    };
  }

  return {
    isCorrect: false,
    typoTolerated: false,
    matchedVariant: bestVariant,
    bestDistance: minDistance,
  };
}
