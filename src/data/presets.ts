export interface DemoPreset {
  id: string;
  title: string;
  badge: string;
  badgeColor: 'emerald' | 'amber' | 'rose' | 'cyan' | 'purple';
  description: string;
  expectedDecision: 'ALLOW' | 'MASK' | 'BLOCK';
  expectedRisk: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  prompt: string;
  notes: string;
}

export const DEMO_PRESETS: DemoPreset[] = [
  {
    id: 'demo-rahul-kumar',
    title: 'Customer PII (Rahul Kumar)',
    badge: 'Spec Canonical',
    badgeColor: 'amber',
    description: 'Name, Email, and Phone number in customer service context',
    expectedDecision: 'MASK',
    expectedRisk: 'HIGH',
    prompt: "Customer Rahul Kumar's email is rahul@example.com. His phone number is 9876543210. Write a professional apology.",
    notes: 'Detects 3 sensitive entities (NAME, EMAIL, PHONE). External AI receives only [NAME_001], [EMAIL_001], and [PHONE_001]. Response is safely restored.'
  },
  {
    id: 'demo-api-key-block',
    title: 'Exposed API Key Secret',
    badge: 'Critical Block',
    badgeColor: 'rose',
    description: 'API key secret token in developer debug prompt',
    expectedDecision: 'BLOCK',
    expectedRisk: 'CRITICAL',
    prompt: 'My API key is sk-demo-123456789. Explain this authentication error.',
    notes: 'Immediate CRITICAL risk detection. Transmission to external AI is hard-blocked. Demonstrates fail-closed zero-leakage enforcement.'
  },
  {
    id: 'demo-financial-gov-id',
    title: 'Financial & National ID',
    badge: 'Identity Theft Risk',
    badgeColor: 'amber',
    description: 'PAN card, Aadhaar, Bank account, and UPI handle',
    expectedDecision: 'MASK',
    expectedRisk: 'HIGH',
    prompt: 'Verify customer Priya Sharma for refund. PAN is ABCDE1234F, Aadhaar number is 9876 5432 1098, Bank account is 918273645281, and UPI ID is priya@okaxis. Confirm refund eligibility.',
    notes: 'Detects financial identifiers and Indian national identity numbers. Tokens generated: [GOV_PAN_001], [GOV_AADHAAR_001], [BANK_ACC_001], [UPI_HANDLE_001].'
  },
  {
    id: 'demo-password-credentials',
    title: 'Hardcoded Password & Bearer',
    badge: 'Credential Leak',
    badgeColor: 'rose',
    description: 'Database password and Authorization Bearer header',
    expectedDecision: 'BLOCK',
    expectedRisk: 'CRITICAL',
    prompt: 'password = SuperSecretDatabasePass2026! and authorization = bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9. Please optimize my database query.',
    notes: 'Detects plaintext password assignment and JWT/Bearer token credentials. Fails pre-send verification and blocks external transmission.'
  },
  {
    id: 'demo-confidential-doc',
    title: 'Restricted Internal Document',
    badge: 'Doc Classification',
    badgeColor: 'purple',
    description: 'Proprietary enterprise data with confidentiality marking',
    expectedDecision: 'MASK',
    expectedRisk: 'HIGH',
    prompt: 'STRICTLY CONFIDENTIAL AND PROPRIETARY: Executive compensation summary for Chief Technology Officer Mark Vance at internal IP address 192.168.1.105. Draft the board report.',
    notes: 'Detects confidential keyword marking, executive name, and internal IP address. In Strict Mode, this will be hard-blocked.'
  },
  {
    id: 'demo-clean-prompt',
    title: 'Clean Engineering Query',
    badge: 'Zero PII',
    badgeColor: 'emerald',
    description: 'Non-sensitive general architecture query',
    expectedDecision: 'ALLOW',
    expectedRisk: 'LOW',
    prompt: 'What are the top architectural trade-offs between event-driven microservices and a modular monolith in Node.js?',
    notes: 'No sensitive data or credentials detected. Risk Score: 0/100. Decision: ALLOW (passes directly without placeholder modification).'
  }
];
