import {
  DetectedEntity,
  EntityType,
  EntityCategory,
  RiskAssessment,
  RiskLevel,
  SecurityDecision,
  PrivacyMode
} from '../src/types/privacy';

interface EntityRule {
  type: EntityType;
  category: EntityCategory;
  riskWeight: number;
  label: string;
  description: string;
  pattern: RegExp;
  extractValue?: (match: RegExpExecArray) => string;
}

const RULES: EntityRule[] = [
  // 1. Secrets, Passwords, API Keys, Tokens (CRITICAL - Immediate BLOCK)
  {
    type: 'API_KEY',
    category: 'CREDENTIAL',
    riskWeight: 95,
    label: 'API Key',
    description: 'Cryptographic API Key or access credential',
    pattern: /(?:(?:sk-[a-zA-Z0-9_\-]{10,}|sk_live_[a-zA-Z0-9]{16,}|sk_test_[a-zA-Z0-9]{16,}|AKIA[0-9A-Z]{16}|ghp_[a-zA-Z0-9]{36}|gho_[a-zA-Z0-9]{36}|AIza[0-9A-Za-z\-_]{35}|npm_[a-zA-Z0-9]{36}|glpat-[a-zA-Z0-9\-]{20,}|xox[bpa]-[a-zA-Z0-9\-]{20,})|(?:api[_-]?key|access[_-]?token|auth[_-]?token|secret[_-]?key|private[_-]?key|client[_-]?secret)\s*[:=]\s*['"]?([a-zA-Z0-9_\-\.]{10,})['"]?)/gi,
    extractValue: (m) => m[1] || m[0]
  },
  {
    type: 'JWT_TOKEN',
    category: 'CREDENTIAL',
    riskWeight: 95,
    label: 'JWT Token',
    description: 'JSON Web Token with encoded authorization payload',
    pattern: /\beyJ[a-zA-Z0-9_\-]{8,}\.eyJ[a-zA-Z0-9_\-]{8,}\.[a-zA-Z0-9_\-]{8,}\b/g
  },
  {
    type: 'BEARER_TOKEN',
    category: 'CREDENTIAL',
    riskWeight: 90,
    label: 'Bearer Token',
    description: 'HTTP Authorization Bearer token header or string',
    pattern: /(?:bearer\s+[a-zA-Z0-9_\-\.]{16,}|authorization\s*[:=]\s*['"]?bearer\s+[a-zA-Z0-9_\-\.]+['"]?)/gi,
    extractValue: (m) => m[0]
  },
  {
    type: 'PASSWORD',
    category: 'CREDENTIAL',
    riskWeight: 95,
    label: 'Password',
    description: 'Plaintext credential or password assignment',
    pattern: /(?:(?:password|passwd|pwd|pass|secret_code)\s*[:=]\s*['"]?([^\s"';,]{4,})['"]?)/gi,
    extractValue: (m) => m[1] || m[0]
  },
  {
    type: 'SECRET',
    category: 'CREDENTIAL',
    riskWeight: 95,
    label: 'Secret / Private Key',
    description: 'Secret token, private key, or cloud credential',
    pattern: /(?:-----BEGIN [A-Z0-9 ]+ KEY-----|(?:secret|private_key|webhook_secret|encryption_key)\s*[:=]\s*['"]?([^\s"';,]{6,})['"]?)/gi,
    extractValue: (m) => m[1] || m[0]
  },
  {
    type: 'URL_CREDENTIALS',
    category: 'CREDENTIAL',
    riskWeight: 90,
    label: 'URL with Credentials',
    description: 'URL containing embedded username, password, or token',
    pattern: /https?:\/\/[a-zA-Z0-9_\-]+:[a-zA-Z0-9_\-]+@[a-zA-Z0-9.-]+/gi
  },

  // 2. Financial Data (HIGH / CRITICAL)
  {
    type: 'CREDIT_CARD',
    category: 'FINANCIAL',
    riskWeight: 55,
    label: 'Card Number',
    description: 'Payment credit or debit card identifier',
    pattern: /\b(?:4[0-9]{12}(?:[0-9]{3})?|5[1-5][0-9]{14}|3[47][0-9]{13}|(?:[0-9]{4}[-\s]){3}[0-9]{4}|(?:[0-9]{4}[-\s]){2}[0-9]{4}[-\s]?[0-9]{1,4})\b/g
  },
  {
    type: 'CVV',
    category: 'FINANCIAL',
    riskWeight: 60,
    label: 'CVV / CVC',
    description: 'Card security verification code',
    pattern: /(?:(?:cvv|cvc|security\s*code|cid)\s*(?:is|[:=])?\s*)\b([0-9]{3,4})\b/gi,
    extractValue: (m) => m[1] || m[0]
  },
  {
    type: 'BANK_ACCOUNT',
    category: 'FINANCIAL',
    riskWeight: 50,
    label: 'Bank Account / IBAN',
    description: 'Financial institution account, IBAN, or routing number',
    pattern: /(?:\b[A-Z]{2}[0-9]{2}[A-Z0-9]{11,30}\b|(?:(?:account|acc|acct|a\/c|bank\s*account|routing|iban)\s*(?:no|number|#)?\s*(?:is|[:=-])?\s*)\b([A-Z0-9\-]{8,22})\b)/gi,
    extractValue: (m) => (m[1] || m[0]).trim()
  },
  {
    type: 'UPI_ID',
    category: 'FINANCIAL',
    riskWeight: 45,
    label: 'UPI ID / VPA',
    description: 'Unified Payments Interface payment handle',
    pattern: /\b[a-zA-Z0-9.\-_]{2,64}@(okhdfcbank|okaxis|oksbi|icici|paytm|upi|ybl|apl|axl|ibl|barodampay|federal|kotak|postbank|jupiteraxis|sliceaxis|axisbank|sbi|hdfcbank|pnb)\b/gi
  },

  // 3. Government Identifiers (HIGH)
  {
    type: 'PAN_CARD',
    category: 'GOVERNMENT_ID',
    riskWeight: 45,
    label: 'PAN Card',
    description: 'Indian Income Tax Permanent Account Number (10 alphanumeric)',
    pattern: /\b[A-Z]{5}[0-9]{4}[A-Z]{1}\b/g
  },
  {
    type: 'AADHAAR',
    category: 'GOVERNMENT_ID',
    riskWeight: 50,
    label: 'Aadhaar Number',
    description: '12-digit Indian National Identity Number',
    pattern: /(?:(?:aadhaar|uidai)\s*(?:no|number|#)?\s*(?:is|[:=-])?\s*\b(\d{4}\s?\d{4}\s?\d{4})\b|\b(\d{4}\s\d{4}\s\d{4})\b)/gi,
    extractValue: (m) => (m[1] || m[2] || m[0]).trim()
  },
  {
    type: 'SSN',
    category: 'GOVERNMENT_ID',
    riskWeight: 55,
    label: 'Social Security Number (SSN)',
    description: 'United States 9-digit Social Security Number',
    pattern: /(?:(?:ssn|social\s*security)\s*(?:no|number|#)?\s*(?:is|[:=-])?\s*\b(\d{3}[-\s]?\d{2}[-\s]?\d{4})\b|\b(\d{3}-\d{2}-\d{4})\b)/gi,
    extractValue: (m) => (m[1] || m[2] || m[0]).trim()
  },

  // 4. Contact and Personal PII (MEDIUM to HIGH)
  {
    type: 'EMAIL',
    category: 'PII',
    riskWeight: 25,
    label: 'Email Address',
    description: 'Electronic mail communication address',
    pattern: /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}\b/g
  },
  {
    type: 'PHONE',
    category: 'PII',
    riskWeight: 35,
    label: 'Phone Number',
    description: 'Telephone or mobile contact number',
    pattern: /(?:(?:phone|mobile|cell|contact|tel|call|whatsapp)\s*(?:no|number|#)?\s*(?:is|[:=])?\s*(\+?[0-9()\s\-.\/]{7,20})\b|\b(?:\+?[1-9]\d{0,2}[-.\s]?)?\(?\d{2,4}\)?[-.\s]?\d{3,4}[-.\s]?\d{3,5}\b|\b[6-9]\d{9}\b)/gi,
    extractValue: (m) => {
      if (m[1]) return m[1].trim();
      const matchDigits = m[0].match(/(?:\+?[0-9]{1,3}[-.\s]?)?\(?[0-9]{2,4}\)?[-.\s]?[0-9]{3,4}[-.\s]?[0-9]{3,5}|[6-9]\d{9}/);
      return matchDigits ? matchDigits[0].trim() : m[0].trim();
    }
  },

  // 5. Network & Internal Identifiers
  {
    type: 'IP_ADDRESS',
    category: 'NETWORK',
    riskWeight: 20,
    label: 'IP Address',
    description: 'IPv4 Network Host Identifier',
    pattern: /\b(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\b/g
  },

  // 6. Confidential Document Warnings
  {
    type: 'CONFIDENTIAL_KEYWORD',
    category: 'CONFIDENTIAL_DOC',
    riskWeight: 30,
    label: 'Confidential Document Flag',
    description: 'Proprietary, classified, or internal-only markings',
    pattern: /\b(STRICTLY\s+CONFIDENTIAL|CONFIDENTIAL|INTERNAL\s+USE\s+ONLY|DO\s+NOT\s+SHARE|RESTRICTED|TOP\s+SECRET|PROPRIETARY)\b/gi
  }
];

// Common non-name words and stopwords to prevent false positives in open entity matching
const NON_NAME_WORDS = new Set([
  'The', 'This', 'That', 'These', 'Those', 'Please', 'Thank', 'Thanks', 'Write', 'Draft',
  'Send', 'Check', 'Update', 'Review', 'Verify', 'Confirm', 'Cancel', 'Delete', 'Remove',
  'Good', 'Great', 'Best', 'Dear', 'Hello', 'Notice', 'Warning', 'Alert', 'Attention',
  'Subject', 'Regarding', 'Important', 'Urgent', 'Confidential', 'Restricted', 'Internal',
  'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday',
  'January', 'February', 'March', 'April', 'May', 'June', 'July', 'August',
  'September', 'October', 'November', 'December',
  'United', 'States', 'Kingdom', 'America', 'European', 'Union', 'Canada', 'Australia',
  'Germany', 'France', 'India', 'China', 'Japan', 'London', 'Paris', 'Berlin', 'Tokyo',
  'New', 'York', 'San', 'Francisco', 'Los', 'Angeles', 'Chicago', 'Boston', 'Seattle',
  'Google', 'Amazon', 'Microsoft', 'Apple', 'Meta', 'OpenAI', 'Anthropic', 'Twitter',
  'Customer', 'Client', 'Patient', 'Employee', 'Service', 'Support', 'Care', 'Team',
  'Security', 'Privacy', 'Gateway', 'System', 'Server', 'Database', 'Cloud', 'Platform',
  'Artificial', 'Intelligence', 'Machine', 'Learning', 'Large', 'Language', 'Model',
  'Standard', 'General', 'Global', 'Corporate', 'Enterprise', 'Official', 'Executive',
  'Department', 'Office', 'Company', 'Firm', 'Agency', 'Bureau', 'Center', 'Hospital',
  'School', 'University', 'College', 'Institute', 'Academy', 'Foundation', 'Bank',
  'Account', 'Number', 'Card', 'Credit', 'Debit', 'Invoice', 'Payment', 'Transaction',
  'Report', 'Summary', 'Document', 'Record', 'Details', 'Profile', 'Settings', 'Policy',
  'Agreement', 'Contract', 'Terms', 'Conditions', 'Overview', 'Status', 'Action', 'Item',
  'UPI', 'ID', 'PAN', 'Aadhaar', 'SSN', 'API', 'Key', 'Token', 'Secret', 'Password',
  'Passwd', 'Pass', 'Bearer', 'Auth', 'Email', 'Phone', 'Mobile', 'Cell', 'Chief',
  'Technology', 'Officer', 'Director', 'Manager', 'Engineer', 'Doctor', 'Prompt', 'LLM',
  'Refund', 'Eligibility', 'Compensation', 'Internal', 'Host', 'Address', 'IP',
  'Dr', 'Mr', 'Mrs', 'Ms', 'Miss', 'Prof', 'Sir', 'Madam'
]);

function isLikelyPersonName(candidate: string): boolean {
  const clean = candidate.replace(/'s$/i, '').trim();
  const parts = clean.split(/\s+/);
  if (parts.length < 2 || parts.length > 3) return false;
  
  for (const part of parts) {
    if (NON_NAME_WORDS.has(part)) return false;
    // Reject all-caps acronyms like UPI, PAN, SSN, API, ID, etc.
    if (/^[A-Z]{2,}$/.test(part)) return false;
    // Each part should start with an uppercase letter followed by lowercase letters/hyphens/apostrophes
    if (!/^[A-Z][a-zA-Z'\-]{1,20}$/.test(part)) return false;
  }
  return true;
}

// Helper to check overlap
function isOverlapping(newEntity: { index: number; length: number }, existing: DetectedEntity[]): boolean {
  const newEnd = newEntity.index + newEntity.length;
  for (const e of existing) {
    const eEnd = e.index + e.length;
    if (newEntity.index < eEnd && newEnd > e.index) {
      return true;
    }
  }
  return false;
}

/**
 * Agent 1: Detection Agent
 * Deterministic rules and dynamic contextual recognizers to identify sensitive entities.
 * Fully dynamic: zero hardcoded sample names or specific test values.
 */
export function detectSensitiveEntities(prompt: string): DetectedEntity[] {
  const detected: DetectedEntity[] = [];

  // Step 1: Execute primary rule-based detectors (Credentials, Financial, Gov IDs, Contact)
  for (const rule of RULES) {
    rule.pattern.lastIndex = 0;
    let match: RegExpExecArray | null;

    while ((match = rule.pattern.exec(prompt)) !== null) {
      let raw = rule.extractValue ? rule.extractValue(match) : match[0];
      // Strip any accidental trailing sentence punctuation like dots or commas
      raw = raw.replace(/[.,;:!?]+$/, '').trim();
      if (!raw) continue;

      const matchIndex = match.index + (match[0].indexOf(raw) >= 0 ? match[0].indexOf(raw) : 0);

      const candidate = {
        index: matchIndex,
        length: raw.length
      };

      if (!isOverlapping(candidate, detected)) {
        detected.push({
          id: `entity_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
          type: rule.type,
          category: rule.category,
          raw: raw.trim(),
          index: matchIndex,
          length: raw.trim().length,
          riskWeight: rule.riskWeight,
          label: rule.label,
          description: rule.description
        });
      }

      if (match.index === rule.pattern.lastIndex) {
        rule.pattern.lastIndex++;
      }
    }
  }

  // Step 2: Dynamic Person Name Detection (Contextual triggers + Structural NER)
  // Stage A: Names following titles, roles, relationship prepositions, or introductions
  const contextualNamePatterns = [
    // Titles and honorifics: Dr. Sarah Connor, Prof. Aris Thorne, Mr. Carlos Mendoza, Officer Mark Vance
    /(?:(?:Mr\.|Mrs\.|Ms\.|Miss|Dr\.|Prof\.|Sir|Doctor|Professor|Officer|Director|Agent|Representative|Engineer|Architect|Consultant)\s+)([A-Z][a-zA-Z'\-]+(?:\s+[A-Z][a-zA-Z'\-]+){0,2})\b/g,
    // Role markers: Customer Carlos Mendoza, Patient Emily Watson, User David O'Connor
    /(?:(?:Customer|Client|Patient|User|Employee|Caller|Contact|Account\s*holder|Sender|Recipient|Assignee|Attendee|Candidate|Student|Doctor|Nurse|Partner|Author|Member|Subject|Passenger)\s*(?:name)?[:\s]+)([A-Z][a-zA-Z'\-]+(?:\s+[A-Z][a-zA-Z'\-]+){0,2})\b/g,
    // Introductions: My name is Carlos Mendoza, Contact person: Alice Wang, Name: Marcus Vance
    /(?:(?:My name is|I am|I'm|Name:\s*|Contact person:\s*|Patient:\s*|Employee:\s*|Customer:\s*|Full Name:\s*|Attn:\s*|Attention:\s*)\s*)([A-Z][a-zA-Z'\-]+(?:\s+[A-Z][a-zA-Z'\-]+){0,2})\b/g,
    // Specific contextual verbs: named Carlos Mendoza, speak with Sarah Connor, review for David Miller
    /(?:(?:named|calls? himself|calls? herself|goes by|meet with|meeting with|assigned to|speak with|interview|consult with|email from|reported by|prepared by|signed by|review for)\s+)([A-Z][a-zA-Z'\-]+(?:\s+[A-Z][a-zA-Z'\-]+){0,2})\b/g,
    // Generic prepositions with optional honorific: to Dr. Alexander Wright, for John Doe
    /(?:(?:for|to|with)\s+(?:(?:Mr\.|Mrs\.|Ms\.|Miss|Dr\.|Prof\.|Sir)\s+)?)([A-Z][a-zA-Z'\-]+(?:\s+[A-Z][a-zA-Z'\-]+){1,2})\b/g,
    // Salutations & signoffs: Dear Carlos Mendoza, Regards, Sophia Chen
    /(?:(?:Dear|Hello|Hi|Greetings|Sincerely,?|Regards,?|Best regards,?|Warm regards,?|Cheers,?|Thanks,?|Signed,?)\s+)([A-Z][a-zA-Z'\-]+(?:\s+[A-Z][a-zA-Z'\-]+){0,2})\b/g
  ];

  for (const regex of contextualNamePatterns) {
    regex.lastIndex = 0;
    let match: RegExpExecArray | null;
    while ((match = regex.exec(prompt)) !== null) {
      let nameCandidate = match[1]?.trim();
      if (!nameCandidate) continue;
      // Strip trailing possessive e.g. "Kumar's" -> "Kumar"
      nameCandidate = nameCandidate.replace(/'s$/i, '').replace(/'$/i, '').trim();

      // Filter out candidates containing common non-name terms or all-caps acronyms
      const words = nameCandidate.split(/\s+/);
      const isClean = words.every((w) => !NON_NAME_WORDS.has(w) && !/^[A-Z]{2,}$/.test(w) && /^[A-Z][a-zA-Z'\-]{1,20}$/.test(w));
      if (!isClean) continue;

      const matchIndex = match.index + match[0].lastIndexOf(nameCandidate);
      const candidateLoc = { index: matchIndex, length: nameCandidate.length };

      if (!isOverlapping(candidateLoc, detected)) {
        detected.push({
          id: `entity_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
          type: 'PERSON_NAME',
          category: 'PII',
          raw: nameCandidate,
          index: matchIndex,
          length: nameCandidate.length,
          riskWeight: 20,
          label: 'Person Name',
          description: 'Identifiable individual or customer full name'
        });
      }

      if (regex.lastIndex === match.index) {
        regex.lastIndex++;
      }
    }
  }

  // Stage B: General 2-word proper noun phrases in text matching name criteria
  const properNounRegex = /\b([A-Z][a-zA-Z'\-]{1,20}\s+[A-Z][a-zA-Z'\-]{1,20})\b/g;
  let pnMatch: RegExpExecArray | null;
  while ((pnMatch = properNounRegex.exec(prompt)) !== null) {
    const candidate = pnMatch[1].replace(/'s$/i, '').trim();
    if (isLikelyPersonName(candidate)) {
      const candidateLoc = { index: pnMatch.index, length: candidate.length };
      if (!isOverlapping(candidateLoc, detected)) {
        detected.push({
          id: `entity_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
          type: 'PERSON_NAME',
          category: 'PII',
          raw: candidate,
          index: pnMatch.index,
          length: candidate.length,
          riskWeight: 20,
          label: 'Person Name',
          description: 'Identifiable individual or customer full name'
        });
      }
    }
  }

  // Sort strictly by appearance in original prompt
  return detected.sort((a, b) => a.index - b.index);
}

/**
 * Agent 2: Security Decision Agent
 * Evaluates privacy risk score (0-100), risk level (LOW/MEDIUM/HIGH/CRITICAL),
 * and decides ALLOW / MASK / BLOCK based on privacy mode.
 */
export function assessPrivacyRisk(
  entities: DetectedEntity[],
  mode: PrivacyMode = 'standard'
): RiskAssessment {
  const entityCounts: Record<string, number> = {};
  const confidentialFlags: string[] = [];
  let hasCredentials = false;
  let hasFinancial = false;
  let hasGovId = false;
  let hasPii = false;
  const reasons: string[] = [];

  for (const entity of entities) {
    entityCounts[entity.type] = (entityCounts[entity.type] || 0) + 1;

    if (entity.category === 'CREDENTIAL') {
      hasCredentials = true;
      reasons.push(`High-risk credential or secret identified: ${entity.label}`);
    }
    if (entity.category === 'FINANCIAL') {
      hasFinancial = true;
    }
    if (entity.category === 'GOVERNMENT_ID') {
      hasGovId = true;
    }
    if (entity.category === 'PII') {
      hasPii = true;
    }
    if (entity.category === 'CONFIDENTIAL_DOC') {
      confidentialFlags.push(entity.raw);
      reasons.push(`Confidential classification detected: "${entity.raw}"`);
    }
  }

  // Calculate base score
  let baseScore = 0;
  for (const entity of entities) {
    baseScore += entity.riskWeight;
  }

  // Compound combination rules
  let hasDangerousCombinations = false;
  if (entities.length >= 3) {
    baseScore += 15;
    reasons.push('Compound multi-entity exposure (3 or more sensitive entities present)');
  }

  if (hasPii && hasFinancial) {
    baseScore += 25;
    hasDangerousCombinations = true;
    reasons.push('Dangerous combination: Personal identity paired with financial credentials');
  }

  if (hasPii && hasGovId) {
    baseScore += 20;
    hasDangerousCombinations = true;
    reasons.push('Identity theft vector: Personal identity paired with Government National ID');
  }

  // Normalize score
  let score = Math.min(100, Math.max(0, baseScore));

  // Determine Level & Decision
  let level: RiskLevel = 'LOW';
  let decision: SecurityDecision = 'ALLOW';

  if (entities.length === 0) {
    score = 0;
    level = 'LOW';
    decision = 'ALLOW';
    reasons.push('No sensitive personal, financial, or credential data detected.');
  } else if (hasCredentials) {
    score = Math.max(92, score);
    level = 'CRITICAL';
    decision = 'BLOCK';
    reasons.push('Security Rule: Credentials and secrets must NEVER be transmitted to external LLMs.');
  } else if (score >= 70 || (hasFinancial && hasDangerousCombinations)) {
    level = 'HIGH';
    if (mode === 'strict') {
      decision = 'BLOCK';
      reasons.push('Strict Privacy Policy: HIGH risk requests are blocked from external transmission.');
    } else {
      decision = 'MASK';
      reasons.push('High privacy risk: All identifiable values must be masked with session tokens.');
    }
  } else if (score >= 20 || hasPii || hasGovId) {
    level = 'MEDIUM';
    decision = 'MASK';
    reasons.push('Medium privacy risk: PII must be replaced with session tokens.');
  } else {
    level = 'LOW';
    decision = 'ALLOW';
  }

  return {
    score,
    level,
    decision,
    reasons,
    entityCounts,
    hasCredentials,
    hasDangerousCombinations,
    confidentialFlags,
    activeMode: mode
  };
}

/**
 * Agent 3: Masking / Protection Agent
 * Replaces sensitive items with session-specific placeholders like [NAME_001], [EMAIL_001].
 */
export function maskPrompt(
  prompt: string,
  entities: DetectedEntity[]
): {
  protectedPrompt: string;
  mappings: Record<string, { raw: string; type: EntityType; category: EntityCategory }>;
  tokens: { placeholder: string; type: EntityType }[];
} {
  const typeCounters: Record<string, number> = {};
  const mappings: Record<string, { raw: string; type: EntityType; category: EntityCategory }> = {};
  const tokens: { placeholder: string; type: EntityType }[] = [];

  // Prefix mapping for cleaner placeholder tags
  const prefixMap: Record<EntityType, string> = {
    PERSON_NAME: 'NAME',
    EMAIL: 'EMAIL',
    PHONE: 'PHONE',
    PAN_CARD: 'GOV_PAN',
    AADHAAR: 'GOV_AADHAAR',
    SSN: 'GOV_SSN',
    BANK_ACCOUNT: 'BANK_ACC',
    CREDIT_CARD: 'CARD_NUM',
    CVV: 'CARD_CVV',
    UPI_ID: 'UPI_HANDLE',
    API_KEY: 'SECRET_APIKEY',
    JWT_TOKEN: 'SECRET_JWT',
    PASSWORD: 'SECRET_PASS',
    SECRET: 'SECRET_KEY',
    BEARER_TOKEN: 'AUTH_TOKEN',
    IP_ADDRESS: 'IP_ADDR',
    URL_CREDENTIALS: 'URL_AUTH',
    CONFIDENTIAL_KEYWORD: 'CONF_MARKER',
    INTERNAL_ID: 'INTERNAL_ID'
  };

  // 1. Sort forward to assign numbering in natural reading order
  const forwardEntities = [...entities].sort((a, b) => a.index - b.index);
  const planned: { entity: DetectedEntity; placeholder: string }[] = [];
  let lastEnd = -1;

  for (const entity of forwardEntities) {
    if (entity.index < lastEnd) continue; // Skip any overlapping entity
    lastEnd = entity.index + entity.length;

    const prefix = prefixMap[entity.type] || 'TOKEN';
    typeCounters[prefix] = (typeCounters[prefix] || 0) + 1;
    const placeholder = `[${prefix}_${String(typeCounters[prefix]).padStart(3, '0')}]`;

    mappings[placeholder] = {
      raw: entity.raw,
      type: entity.type,
      category: entity.category
    };

    tokens.push({
      placeholder,
      type: entity.type
    });

    planned.push({ entity, placeholder });
  }

  // 2. Perform string substitutions in reverse order of index to preserve character positions
  let protectedText = prompt;
  planned.sort((a, b) => b.entity.index - a.entity.index);

  for (const item of planned) {
    protectedText =
      protectedText.substring(0, item.entity.index) +
      item.placeholder +
      protectedText.substring(item.entity.index + item.entity.length);
  }

  return {
    protectedPrompt: protectedText,
    mappings,
    tokens
  };
}

/**
 * Pre-Send Security Gate
 * Performs independent fail-closed audit on protected prompt.
 */
export function verifyPreSendSecurityGate(
  protectedPrompt: string,
  rawValues: string[]
): {
  passed: boolean;
  sensitiveScanComplete: boolean;
  rawValuesRemoved: boolean;
  protectedPromptVerified: boolean;
  safeForExternalAI: boolean;
  residualLeaks: string[];
} {
  const residualLeaks: string[] = [];

  // 1. Check if any known raw sensitive values still exist in the protected text
  for (const raw of rawValues) {
    if (raw && raw.trim().length > 2 && protectedPrompt.includes(raw.trim())) {
      residualLeaks.push(`Raw sensitive value still present: "${raw.substring(0, 3)}***"`);
    }
  }

  // 2. Scan protected prompt for unmasked credentials (fail closed)
  const secondaryEntities = detectSensitiveEntities(protectedPrompt);
  const unmaskedCredentials = secondaryEntities.filter(
    (e) => e.category === 'CREDENTIAL' && !e.raw.startsWith('[')
  );

  if (unmaskedCredentials.length > 0) {
    residualLeaks.push('Unmasked credentials detected during pre-send safety verification');
  }

  const passed = residualLeaks.length === 0;

  return {
    passed,
    sensitiveScanComplete: true,
    rawValuesRemoved: passed,
    protectedPromptVerified: true,
    safeForExternalAI: passed,
    residualLeaks
  };
}

/**
 * Agent 4: Restoration Agent
 * Restores session tokens back to original values in the AI response.
 */
export function restoreAIResponse(
  aiResponse: string,
  mappings: Record<string, { raw: string; type: EntityType }>
): {
  restoredResponse: string;
  restoredCount: number;
  itemsRestored: { placeholder: string; type: EntityType }[];
} {
  let restored = aiResponse;
  let restoredCount = 0;
  const itemsRestored: { placeholder: string; type: EntityType }[] = [];

  for (const [placeholder, info] of Object.entries(mappings)) {
    if (restored.includes(placeholder)) {
      restored = restored.split(placeholder).join(info.raw);
      restoredCount++;
      itemsRestored.push({ placeholder, type: info.type });
    }
  }

  return {
    restoredResponse: restored,
    restoredCount,
    itemsRestored
  };
}
