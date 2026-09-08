export type EntityCategory = 
  | 'PII' 
  | 'FINANCIAL' 
  | 'GOVERNMENT_ID' 
  | 'CREDENTIAL' 
  | 'CONFIDENTIAL_DOC'
  | 'NETWORK';

export type EntityType = 
  | 'PERSON_NAME'
  | 'EMAIL'
  | 'PHONE'
  | 'PAN_CARD'
  | 'AADHAAR'
  | 'SSN'
  | 'BANK_ACCOUNT'
  | 'CREDIT_CARD'
  | 'CVV'
  | 'UPI_ID'
  | 'API_KEY'
  | 'JWT_TOKEN'
  | 'PASSWORD'
  | 'SECRET'
  | 'BEARER_TOKEN'
  | 'IP_ADDRESS'
  | 'URL_CREDENTIALS'
  | 'CONFIDENTIAL_KEYWORD'
  | 'INTERNAL_ID';

export interface DetectedEntity {
  id: string;
  type: EntityType;
  category: EntityCategory;
  raw: string;
  index: number;
  length: number;
  placeholder?: string;
  riskWeight: number;
  label: string;
  description: string;
}

export type RiskLevel = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
export type SecurityDecision = 'ALLOW' | 'MASK' | 'BLOCK';
export type PrivacyMode = 'standard' | 'strict';

export interface RiskAssessment {
  score: number; // 0 to 100
  level: RiskLevel;
  decision: SecurityDecision;
  reasons: string[];
  entityCounts: Record<string, number>;
  hasCredentials: boolean;
  hasDangerousCombinations: boolean;
  confidentialFlags: string[];
  activeMode: PrivacyMode;
}

export interface SessionTokenMapping {
  placeholder: string; // e.g. [NAME_001]
  entityType: EntityType;
  category: EntityCategory;
  raw: string;
  createdAt: number;
}

export interface PreSendGateResult {
  passed: boolean;
  sensitiveScanComplete: boolean;
  rawValuesRemoved: boolean;
  protectedPromptVerified: boolean;
  safeForExternalAI: boolean;
  residualLeaks: string[];
  timestamp: string;
}

export interface ScanResponse {
  sessionId: string;
  entities: DetectedEntity[];
  assessment: RiskAssessment;
  entitySummary: { type: string; count: number; category: EntityCategory }[];
}

export interface ProtectResponse {
  sessionId: string;
  originalPromptLength: number;
  protectedPrompt: string;
  placeholdersCount: number;
  tokens: { placeholder: string; type: EntityType }[];
  preSendGate: PreSendGateResult;
  assessment: RiskAssessment;
}

export interface ChatResponse {
  sessionId: string;
  protectedPrompt: string;
  rawAIResponse: string; // This has [NAME_001] etc
  provider: string;
  model: string;
  status: 'SUCCESS' | 'BLOCKED' | 'ERROR';
  blockedReason?: string;
  transmissionAudit: {
    externalAIReceived: string[]; // only placeholders
    rawSensitiveExposed: number; // 0
    safeForExternalAI: boolean;
  };
}

export interface RestoreResponse {
  sessionId: string;
  protectedResponse: string;
  restoredResponse: string;
  restoredTokensCount: number;
  restorationMapping: { placeholder: string; type: EntityType; restoredLength: number }[];
}

export interface ActivityEvent {
  id: string;
  timestamp: string;
  timeFormatted: string;
  type: 'SCAN' | 'PROTECT' | 'GATE_CHECK' | 'EXTERNAL_AI_TX' | 'AI_RX' | 'RESTORE' | 'BLOCK';
  event: string;
  riskLevel: RiskLevel;
  decision: SecurityDecision;
  safeDetails: string;
}

export interface GatewaySession {
  sessionId: string;
  createdAt: number;
  privacyMode: PrivacyMode;
  mappings: Record<string, string>; // placeholder -> raw value (in-memory only)
  lastAssessment?: RiskAssessment;
  entitiesCount: number;
}
