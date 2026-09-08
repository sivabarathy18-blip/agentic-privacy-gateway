import {
  ScanResponse,
  ProtectResponse,
  ChatResponse,
  RestoreResponse,
  ActivityEvent,
  PrivacyMode
} from '../types/privacy';

export const gatewayApi = {
  async healthCheck(): Promise<boolean> {
    try {
      const res = await fetch('/api/health');
      if (!res.ok) return false;
      const data = await res.json();
      return data.status === 'ok';
    } catch {
      return false;
    }
  },

  async scanPrompt(prompt: string, mode: PrivacyMode, sessionId?: string): Promise<ScanResponse> {
    const res = await fetch('/api/scan', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt, mode, sessionId })
    });

    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      throw new Error(errorData.error || `Scan failed: ${res.statusText}`);
    }

    return res.json();
  },

  async protectPrompt(prompt: string, sessionId: string, mode: PrivacyMode): Promise<ProtectResponse> {
    const res = await fetch('/api/protect', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt, sessionId, mode })
    });

    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      if (res.status === 403) {
        const error = new Error('REQUEST_BLOCKED');
        (error as any).assessment = errorData.assessment;
        (error as any).sessionId = errorData.sessionId;
        throw error;
      }
      throw new Error(errorData.error || `Protection failed: ${res.statusText}`);
    }

    return res.json();
  },

  async sendToExternalAI(
    sessionId: string,
    protectedPrompt: string,
    useLiveGemini = false
  ): Promise<ChatResponse> {
    const res = await fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sessionId, protectedPrompt, useLiveGemini })
    });

    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      throw new Error(errorData.message || errorData.error || `External AI communication failed: ${res.statusText}`);
    }

    return res.json();
  },

  async restoreResponse(sessionId: string, protectedAIResponse: string): Promise<RestoreResponse> {
    const res = await fetch('/api/restore', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sessionId, protectedAIResponse })
    });

    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      throw new Error(errorData.error || `Restoration failed: ${res.statusText}`);
    }

    return res.json();
  },

  async getActivityLogs(): Promise<ActivityEvent[]> {
    try {
      const res = await fetch('/api/activity');
      if (!res.ok) return [];
      const data = await res.json();
      return data.events || [];
    } catch {
      return [];
    }
  },

  async clearActivityLogs(): Promise<boolean> {
    try {
      const res = await fetch('/api/activity/clear', { method: 'POST' });
      return res.ok;
    } catch {
      return false;
    }
  }
};
