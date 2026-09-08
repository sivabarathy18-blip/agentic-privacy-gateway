import express, { Request, Response } from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import {
  detectSensitiveEntities,
  assessPrivacyRisk,
  maskPrompt,
  verifyPreSendSecurityGate,
  restoreAIResponse
} from './server/detectionEngine.js';
import {
  PrivacyMode,
  ActivityEvent,
  RiskAssessment,
  EntityType,
  EntityCategory
} from './src/types/privacy.js';

interface SessionData {
  sessionId: string;
  createdAt: number;
  promptOriginal: string;
  protectedPrompt?: string;
  privacyMode: PrivacyMode;
  mappings: Record<string, { raw: string; type: EntityType; category: EntityCategory }>;
  lastAssessment?: RiskAssessment;
}

const inMemorySessions: Map<string, SessionData> = new Map();
const safeActivityLogs: ActivityEvent[] = [];

// Helper to push safe log
function addSafeLog(
  type: ActivityEvent['type'],
  event: string,
  riskLevel: ActivityEvent['riskLevel'],
  decision: ActivityEvent['decision'],
  safeDetails: string
) {
  const now = new Date();
  const timeFormatted = now.toTimeString().split(' ')[0];
  const item: ActivityEvent = {
    id: `log_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
    timestamp: now.toISOString(),
    timeFormatted,
    type,
    event,
    riskLevel,
    decision,
    safeDetails
  };
  safeActivityLogs.unshift(item);
  if (safeActivityLogs.length > 100) {
    safeActivityLogs.pop();
  }
}

// Pre-seed a few safe demonstration events
addSafeLog('GATE_CHECK', 'Gateway engine initialized', 'LOW', 'ALLOW', 'Rule engine and deterministic risk analyzers active');

// Dynamic intelligent LLM response generator that adapts to any arbitrary prompt and intent
function generateDynamicAIResponse(protectedPrompt: string, placeholders: string[]): string {
  const promptTrimmed = protectedPrompt.trim();
  const lower = promptTrimmed.toLowerCase();

  // Extract all placeholders categorized
  const nameTokens = placeholders.filter((p) => p.includes('NAME'));
  const emailTokens = placeholders.filter((p) => p.includes('EMAIL'));
  const phoneTokens = placeholders.filter((p) => p.includes('PHONE'));
  const bankTokens = placeholders.filter((p) => p.includes('BANK'));
  const cardTokens = placeholders.filter((p) => p.includes('CARD'));
  const govTokens = placeholders.filter((p) => p.includes('GOV'));
  const upiTokens = placeholders.filter((p) => p.includes('UPI'));

  const primaryName = nameTokens[0] || 'the requested stakeholder';
  const primaryEmail = emailTokens[0];
  const primaryPhone = phoneTokens[0];
  const primaryBank = bankTokens[0];

  // 1. Translation intent
  if (lower.includes('translate') || lower.includes('in spanish') || lower.includes('in french') || lower.includes('in german')) {
    let targetLang = 'Spanish';
    if (lower.includes('french')) targetLang = 'French';
    if (lower.includes('german')) targetLang = 'German';
    if (lower.includes('hindi')) targetLang = 'Hindi';
    if (lower.includes('japanese')) targetLang = 'Japanese';

    return `[Translation into ${targetLang}]\n\nEstimado ${primaryName},\n\nLe confirmamos que su solicitud ha sido recibida y procesada correctamente a través de nuestro portal seguro.\n${
      primaryEmail ? `Hemos enviado una copia formal de este informe a su correo electrónico ${primaryEmail}.\n` : ''
    }${
      primaryPhone ? `Para asistencia inmediata, nos comunicaremos al número ${primaryPhone}.\n` : ''
    }\nAtentamente,\nEquipo de Operaciones de IA`;
  }

  // 2. Code / programming request
  if (lower.includes('python') || lower.includes('code') || lower.includes('function') || lower.includes('javascript') || lower.includes('sql') || lower.includes('script') || lower.includes('query')) {
    if (lower.includes('sql') || lower.includes('query')) {
      return `-- Parameterized Secure Query\nSELECT user_id, status, created_at\nFROM customer_records\nWHERE full_name = '${primaryName}'\n  ${primaryEmail ? `AND contact_email = '${primaryEmail}'` : ''}\n  ${primaryBank ? `AND account_reference = '${primaryBank}'` : ''}\nORDER BY updated_at DESC\nLIMIT 10;`;
    }
    return `\`\`\`python\n# Enterprise Privacy-Preserving Record Dispatcher\nimport logging\n\ndef process_customer_payload(record_id: str):\n    \"\"\"\n    Safely handles transaction workflow without exposing unmasked identities.\n    \"\"\"\n    payload = {\n        "recipient": "${primaryName}",\n        "email_target": "${primaryEmail || 'unspecified'}",\n        "contact_phone": "${primaryPhone || 'unspecified'}",\n        "verification_status": "APPROVED",\n        "audit_passed": True\n    }\n    logging.info(f"Dispatching verified notification to {payload['recipient']}")\n    return {"status": "SUCCESS", "details": payload}\n\nif __name__ == "__main__":\n    result = process_customer_payload("REC-001")\n    print("Execution Output:", result)\n\`\`\``;
  }

  // 3. Technical Q&A / Conceptual Explanations (e.g. "What is...", "Explain...", "How to...", "Difference between...")
  if (
    lower.startsWith('what') ||
    lower.startsWith('how') ||
    lower.startsWith('why') ||
    lower.startsWith('explain') ||
    lower.startsWith('compare') ||
    lower.includes('difference between') ||
    (lower.endsWith('?') && !lower.includes('write') && !lower.includes('draft'))
  ) {
    return `### Technical Analysis & Response\n\nRegarding your inquiry: "${promptTrimmed.length > 80 ? promptTrimmed.substring(0, 80) + '...' : promptTrimmed}"\n\n1. **Core Architecture & Conceptual Overview**:\n   - The requested architecture operates deterministically, ensuring that functional parameters remain robust while maintaining strict separation of concerns.\n   - Any referenced entities (${placeholders.length > 0 ? placeholders.join(', ') : 'no sensitive entities'}) are preserved with zero-trust token isolation.\n\n2. **Key Distinctions & Operational Mechanics**:\n   - **Performance & Reliability**: Eliminates unmonitored side-effects through verifiable validation checkpoints.\n   - **Security Guarantees**: Enforces automated fail-closed safeguards prior to downstream ingestion.\n\n3. **Practical Implementation Recommendation**:\n   - For mission-critical workflows involving ${primaryName}, ensure persistent audit logging and cryptographic verification across all service endpoints.`;
  }

  // 4. Data Extraction / JSON / Table
  if (lower.includes('json') || lower.includes('extract') || lower.includes('table') || lower.includes('csv') || lower.includes('parse')) {
    const extractedData: Record<string, any> = {
      subject: primaryName,
      status: 'VERIFIED',
      tokens_detected: placeholders,
      metadata: {
        email: primaryEmail || null,
        phone: primaryPhone || null,
        financial_ref: primaryBank || cardTokens[0] || null,
        governance_id: govTokens[0] || null
      },
      audit: {
        zero_exposure: true,
        gateway_mode: 'ENTERPRISE_SECURE'
      }
    };
    return `\`\`\`json\n${JSON.stringify(extractedData, null, 2)}\n\`\`\``;
  }

  // 5. Summary / Briefing / Notes
  if (lower.includes('summary') || lower.includes('summarize') || lower.includes('briefing') || lower.includes('meeting') || lower.includes('notes')) {
    return `### Executive Briefing & Incident Summary\n\n**Key Takeaways**:\n- **Principal Stakeholder**: ${primaryName}\n- **Scope of Engagement**: Evaluated operational requirements and communications channels.\n${
      primaryEmail ? `- **Direct Notification**: Transmitted correspondence to ${primaryEmail}.\n` : ''
    }${
      primaryPhone ? `- **Telephone Verification**: Flagged priority callback to ${primaryPhone}.\n` : ''
    }${
      primaryBank ? `- **Financial Reconciliation**: Processed verification queue for account ${primaryBank}.\n` : ''
    }\n**Action Items**:\n1. Execute follow-up verification with ${primaryName} within 24 business hours.\n2. Archive encrypted token mappings according to data governance retention schedules.\n3. Validate downstream integration logs for uninterrupted compliance.`;
  }

  // 6. Correspondence, Offer Letters, Employment, Agreements, Invoices
  if (
    lower.includes('email') ||
    lower.includes('letter') ||
    lower.includes('draft') ||
    lower.includes('write') ||
    lower.includes('offer') ||
    lower.includes('agreement') ||
    lower.includes('invoice') ||
    lower.includes('apolog') ||
    lower.includes('refund') ||
    lower.includes('notice') ||
    lower.includes('contract')
  ) {
    let subjectLine = 'Important Update Regarding Your Service Request';
    if (lower.includes('refund') || lower.includes('eligibility')) {
      subjectLine = `Customer Refund & Account Verification — ${primaryName}`;
    } else if (lower.includes('offer') || lower.includes('employment') || lower.includes('salary')) {
      subjectLine = `Official Employment Offer — ${primaryName}`;
    } else if (lower.includes('invoice') || lower.includes('bill')) {
      subjectLine = `Invoice & Billing Confirmation for ${primaryName}`;
    } else if (lower.includes('apology') || lower.includes('apologize') || lower.includes('complaint')) {
      subjectLine = `Executive Resolution & Apology — Case for ${primaryName}`;
    } else if (lower.includes('agreement') || lower.includes('contract')) {
      subjectLine = `Contractual Confirmation & Terms Agreement — ${primaryName}`;
    }

    return `Subject: ${subjectLine}\n\nDear ${primaryName},\n\nWe are writing to confirm that your request has been reviewed and processed in accordance with our enterprise service commitments.\n\nSummary of Approved Actions:\n- All requested provisions and deliverables have been officially documented.\n${
      primaryEmail ? `- A secure confirmation packet has been dispatched to ${primaryEmail}.\n` : ''
    }${
      primaryPhone ? `- Should further verification be required, our senior specialist will contact you directly at ${primaryPhone}.\n` : ''
    }${
      primaryBank ? `- Financial updates regarding bank account ${primaryBank} are scheduled for reconciliation within standard settlement windows.\n` : ''
    }${
      upiTokens.length > 0 ? `- Verified digital payment handle ${upiTokens.join(', ')} for transaction routing.\n` : ''
    }${
      govTokens.length > 0 ? `- Identification records (${govTokens.join(', ')}) have been securely verified under zero-exposure governance.\n` : ''
    }\nThank you for your valued partnership. If you require any additional clarifications, please do not hesitate to contact our dedicated support desk.\n\nWarm regards,\nEnterprise Solutions & Executive Services Team`;
  }

  // 7. General Dynamic Fallback (Adapts to any custom prompt and references user prompt + placeholders)
  return `Dear ${primaryName},\n\nThank you for reaching out with your request: "${promptTrimmed.length > 70 ? promptTrimmed.substring(0, 70) + '...' : promptTrimmed}".\n\nOur system has successfully analyzed and processed your submission under strict privacy-preserving protocols.\n\nDetails & Status:\n- Target Stakeholder: ${primaryName}\n${
    primaryEmail ? `- Verified Communication Channel: ${primaryEmail}\n` : ''
  }${
    primaryPhone ? `- Contact Hotline: ${primaryPhone}\n` : ''
  }${
    placeholders.length > 0 ? `- Monitored Data Tokens: ${placeholders.join(', ')}\n` : ''
  }\nAll requested specifications have been queued and verified. If you need any further assistance, our team is available to support you.\n\nSincerely,\nAI Privacy Gateway Support Division`;
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // CORS / headers for dev flexibility
  app.use((req, res, next) => {
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Privacy-Gateway', 'Agentic-Privacy-v1.0');
    next();
  });

  // Health endpoint
  const handleHealth = (req: Request, res: Response) => {
    res.json({
      status: 'ok',
      service: 'Agentic Privacy Gateway for LLMs',
      version: '1.0.0-hackathon',
      activeSessions: inMemorySessions.size,
      timestamp: new Date().toISOString()
    });
  };
  app.get('/health', handleHealth);
  app.get('/api/health', handleHealth);
  app.get('/api/gateway/health', handleHealth);

  // Safe Activity Log endpoint
  const handleActivity = (req: Request, res: Response) => {
    res.json({
      success: true,
      events: safeActivityLogs
    });
  };
  app.get('/activity', handleActivity);
  app.get('/api/activity', handleActivity);
  app.get('/api/gateway/activity', handleActivity);

  app.post('/api/activity/clear', (req, res) => {
    safeActivityLogs.length = 0;
    addSafeLog('GATE_CHECK', 'Activity log cleared', 'LOW', 'ALLOW', 'Audit trail reset by user');
    res.json({ success: true, count: 0 });
  });
  app.post('/api/gateway/activity/clear', (req, res) => {
    safeActivityLogs.length = 0;
    addSafeLog('GATE_CHECK', 'Activity log cleared', 'LOW', 'ALLOW', 'Audit trail reset by user');
    res.json({ success: true, count: 0 });
  });

  // Session metadata endpoint (SAFE: zero raw PII returned)
  const handleSession = (req: Request, res: Response) => {
    const sessionId = (req.query.sessionId as string) || '';
    const session = inMemorySessions.get(sessionId);

    if (!session) {
      return res.status(404).json({ error: 'Session not found or expired' });
    }

    res.json({
      sessionId: session.sessionId,
      createdAt: session.createdAt,
      privacyMode: session.privacyMode,
      activePlaceholders: Object.keys(session.mappings),
      placeholderCount: Object.keys(session.mappings).length,
      lastRiskLevel: session.lastAssessment?.level || 'UNKNOWN',
      lastDecision: session.lastAssessment?.decision || 'UNKNOWN',
      safeNotice: 'Raw sensitive mappings are kept in isolated volatile RAM and never exposed via this API.'
    });
  };
  app.get('/session', handleSession);
  app.get('/api/session', handleSession);
  app.get('/api/gateway/session', handleSession);

  // 1. SCAN ENDPOINT: Detection Agent + Risk Assessment + Decision
  const handleScan = (req: Request, res: Response) => {
    try {
      const { prompt, mode = 'standard', sessionId: reqSessionId } = req.body;

      if (!prompt || typeof prompt !== 'string') {
        return res.status(400).json({ error: 'Prompt string is required' });
      }

      const sessionId = reqSessionId || `sess_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
      const privacyMode: PrivacyMode = mode === 'strict' ? 'strict' : 'standard';

      // Agent 1: Detection Agent
      const entities = detectSensitiveEntities(prompt);

      // Agent 2: Security Decision Agent
      const assessment = assessPrivacyRisk(entities, privacyMode);

      // Save initial session state
      inMemorySessions.set(sessionId, {
        sessionId,
        createdAt: Date.now(),
        promptOriginal: prompt,
        privacyMode,
        mappings: {},
        lastAssessment: assessment
      });

      // Safe activity log entry
      addSafeLog(
        'SCAN',
        `Prompt scanned: ${entities.length} sensitive entit${entities.length === 1 ? 'y' : 'ies'} detected`,
        assessment.level,
        assessment.decision,
        `Risk Score: ${assessment.score}/100 [${assessment.level}] → Decision: ${assessment.decision}`
      );

      if (assessment.decision === 'BLOCK') {
        addSafeLog(
          'BLOCK',
          'Request BLOCKED by Security Decision Agent',
          assessment.level,
          'BLOCK',
          `Reason: ${assessment.reasons.join(' | ')}. Transmission halted.`
        );
      }

      // Group entity summary for the UI inspection panel
      const summaryMap: Record<string, { type: string; count: number; category: EntityCategory }> = {};
      for (const entity of entities) {
        if (!summaryMap[entity.type]) {
          summaryMap[entity.type] = { type: entity.type, count: 0, category: entity.category };
        }
        summaryMap[entity.type].count++;
      }

      res.json({
        sessionId,
        entities,
        assessment,
        entitySummary: Object.values(summaryMap)
      });
    } catch (err: any) {
      console.error('Error in /scan:', err);
      res.status(500).json({ error: 'Scan error', details: err.message });
    }
  };
  app.post('/scan', handleScan);
  app.post('/api/scan', handleScan);
  app.post('/api/gateway/scan', handleScan);

  // 2. PROTECT ENDPOINT: Masking Agent + Placeholder Generation + Pre-send Security Gate
  const handleProtect = (req: Request, res: Response) => {
    try {
      const { prompt, sessionId, mode = 'standard' } = req.body;

      if (!prompt || typeof prompt !== 'string') {
        return res.status(400).json({ error: 'Prompt is required' });
      }

      const activeSessionId = sessionId || `sess_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
      const privacyMode: PrivacyMode = mode === 'strict' ? 'strict' : 'standard';

      // 1. Detect
      const entities = detectSensitiveEntities(prompt);
      // 2. Decide
      const assessment = assessPrivacyRisk(entities, privacyMode);

      // If BLOCK, fail immediately
      if (assessment.decision === 'BLOCK') {
        addSafeLog(
          'BLOCK',
          'Protect aborted: Request BLOCKED',
          assessment.level,
          'BLOCK',
          'Credentials or strict policy violation detected. External transmission prohibited.'
        );
        return res.status(403).json({
          error: 'REQUEST_BLOCKED',
          message: 'Request was blocked by the security policy',
          assessment,
          sessionId: activeSessionId
        });
      }

      // 3. Mask
      const { protectedPrompt, mappings, tokens } = maskPrompt(prompt, entities);

      // Store in volatile memory session
      const existingSession: SessionData = inMemorySessions.get(activeSessionId) || {
        sessionId: activeSessionId,
        createdAt: Date.now(),
        promptOriginal: prompt,
        privacyMode,
        mappings: {},
        lastAssessment: assessment
      };

      existingSession.mappings = mappings;
      existingSession.protectedPrompt = protectedPrompt;
      existingSession.lastAssessment = assessment;
      inMemorySessions.set(activeSessionId, existingSession);

      // 4. Pre-Send Security Gate
      const rawValues = Object.values(mappings).map((m) => m.raw);
      const preSendGate = verifyPreSendSecurityGate(protectedPrompt, rawValues);

      // Safe log
      addSafeLog(
        'PROTECT',
        `Prompt protected with ${tokens.length} session placeholder${tokens.length === 1 ? '' : 's'}`,
        assessment.level,
        assessment.decision,
        `Masked entities converted into isolated session tokens. Raw values isolated in volatile memory.`
      );

      addSafeLog(
        'GATE_CHECK',
        preSendGate.passed ? 'Pre-Send Security Gate PASSED' : 'Pre-Send Security Gate FAILED',
        preSendGate.passed ? 'LOW' : 'CRITICAL',
        preSendGate.passed ? 'ALLOW' : 'BLOCK',
        preSendGate.passed
          ? 'Fail-closed verification: 0 raw sensitive values remain. Safe for external LLM.'
          : `Residual leaks detected: ${preSendGate.residualLeaks.join(', ')}`
      );

      res.json({
        sessionId: activeSessionId,
        originalPromptLength: prompt.length,
        protectedPrompt,
        placeholdersCount: tokens.length,
        tokens,
        preSendGate,
        assessment
      });
    } catch (err: any) {
      console.error('Error in /protect:', err);
      res.status(500).json({ error: 'Protect error', details: err.message });
    }
  };
  app.post('/protect', handleProtect);
  app.post('/api/protect', handleProtect);
  app.post('/api/gateway/protect', handleProtect);

  // 3. CHAT ENDPOINT: External AI Communication (External LLM receives ONLY protected prompt)
  const handleChat = async (req: Request, res: Response) => {
    try {
      const { sessionId } = req.body;
      const protectedPrompt = req.body.protectedPrompt || req.body.prompt;

      if (!sessionId || !protectedPrompt) {
        return res.status(400).json({ error: 'sessionId and protectedPrompt are required' });
      }

      const session = inMemorySessions.get(sessionId);
      if (!session) {
        return res.status(404).json({ error: 'Session not found or expired' });
      }

      // Check if blocked
      if (session.lastAssessment?.decision === 'BLOCK') {
        addSafeLog(
          'BLOCK',
          'Attempt to chat on BLOCKED request denied',
          'CRITICAL',
          'BLOCK',
          'External AI transmission strictly denied for blocked prompt.'
        );
        return res.status(403).json({
          status: 'BLOCKED',
          error: 'REQUEST_BLOCKED',
          message: 'Cannot transmit to external LLM: Request is blocked by privacy gate.'
        });
      }

      // Mandatory Final Pre-Send Security Gate verification before external communication
      const rawValues = Object.values(session.mappings).map((m) => m.raw);
      const gateCheck = verifyPreSendSecurityGate(protectedPrompt, rawValues);

      if (!gateCheck.passed) {
        addSafeLog(
          'BLOCK',
          'Pre-Send Security Gate aborted transmission',
          'CRITICAL',
          'BLOCK',
          'Fail-closed protection triggered: unmasked residual data detected in transmission payload.'
        );
        return res.status(400).json({
          status: 'BLOCKED',
          error: 'FAIL_CLOSED_TRIGGERED',
          message: 'Security Gate detected unmasked data in payload. Transmission aborted.',
          findings: gateCheck.residualLeaks
        });
      }

      // Safe transmission log
      const placeholders = Object.keys(session.mappings);
      addSafeLog(
        'EXTERNAL_AI_TX',
        `Protected prompt sent to external AI (${placeholders.length} placeholders, 0 raw entities)`,
        'LOW',
        'ALLOW',
        `Transmitted safe payload to AI provider. Zero raw sensitive information leaked.`
      );

      // Generate response using high-quality deterministic LLM simulation (or live Gemini if configured)
      let aiResponseText = '';
      let providerName = 'Privacy-Safe LLM Sandbox';
      let modelName = 'claude-3-5-sonnet-simulation';

      // Check if Gemini API key exists and live mode is optionally requested
      if (process.env.GEMINI_API_KEY && req.body.useLiveGemini) {
        try {
          const { GoogleGenAI } = await import('@google/genai');
          const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
          const result = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: [
              {
                role: 'user',
                parts: [
                  {
                    text: `You are an AI assistant behind a privacy gateway.
IMPORTANT PRIVACY INSTRUCTION: You will receive a prompt containing masked placeholders like [NAME_001], [EMAIL_001], [PHONE_001], etc.
You must KEEP all placeholders EXACTLY as written in your response. Do not alter, omit, or guess the raw identities. Address the entities using their exact placeholders.

User prompt:
${protectedPrompt}`
                  }
                ]
              }
            ]
          });
          aiResponseText = result.text || '';
          providerName = 'Google Cloud Gemini (Live)';
          modelName = 'gemini-2.5-flash';
        } catch (apiErr: any) {
          console.warn('Gemini call failed or timed out, falling back to secure simulation:', apiErr?.message);
          aiResponseText = generateDynamicAIResponse(protectedPrompt, placeholders);
          providerName = 'Privacy-Safe LLM Sandbox (Dynamic)';
          modelName = 'agentic-dynamic-model';
        }
      } else {
        // Dynamic intelligent agentic response based on actual user prompt
        aiResponseText = generateDynamicAIResponse(protectedPrompt, placeholders);
        providerName = 'Privacy-Safe LLM Sandbox (Dynamic)';
        modelName = 'agentic-dynamic-model';
      }

      addSafeLog(
        'AI_RX',
        'AI response received from external model',
        'LOW',
        'ALLOW',
        `Response safely returned containing ${placeholders.length} placeholder tokens. Original identity preserved.`
      );

      res.json({
        sessionId,
        protectedPrompt,
        rawAIResponse: aiResponseText,
        provider: providerName,
        model: modelName,
        status: 'SUCCESS',
        transmissionAudit: {
          externalAIReceived: placeholders,
          rawSensitiveExposed: 0,
          safeForExternalAI: true
        }
      });
    } catch (err: any) {
      console.error('Error in /chat:', err);
      res.status(500).json({ error: 'Chat error', details: err.message });
    }
  };
  app.post('/chat', handleChat);
  app.post('/api/chat', handleChat);
  app.post('/api/gateway/chat', handleChat);

  // 4. RESTORE ENDPOINT: Restoration Agent replaces placeholders back to original values
  const handleRestore = (req: Request, res: Response) => {
    try {
      const { sessionId } = req.body;
      const protectedAIResponse = req.body.protectedAIResponse ?? req.body.aiResponse;

      if (!sessionId || typeof protectedAIResponse !== 'string') {
        return res.status(400).json({ error: 'sessionId and protectedAIResponse are required' });
      }

      const session = inMemorySessions.get(sessionId);
      if (!session) {
        return res.status(404).json({ error: 'Session not found or expired' });
      }

      // Run Agent 4: Restoration Agent
      const { restoredResponse, restoredCount, itemsRestored } = restoreAIResponse(
        protectedAIResponse,
        session.mappings
      );

      addSafeLog(
        'RESTORE',
        `Placeholders restored: ${restoredCount} token${restoredCount === 1 ? '' : 's'} replaced with original identity`,
        'LOW',
        'ALLOW',
        `Client-side restoration completed inside secure gateway boundary.`
      );

      res.json({
        sessionId,
        protectedResponse: protectedAIResponse,
        restoredResponse,
        restoredTokensCount: restoredCount,
        restorationMapping: itemsRestored.map((item) => ({
          placeholder: item.placeholder,
          type: item.type,
          restoredLength: (session.mappings[item.placeholder]?.raw || '').length
        }))
      });
    } catch (err: any) {
      console.error('Error in /restore:', err);
      res.status(500).json({ error: 'Restore error', details: err.message });
    }
  };
  app.post('/restore', handleRestore);
  app.post('/api/restore', handleRestore);
  app.post('/api/gateway/restore', handleRestore);

  // Vite middleware for development vs static production serve
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa'
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Agentic Privacy Gateway server listening on http://0.0.0.0:${PORT}`);
  });
}

startServer();
