import React, { useState, useEffect, useCallback } from 'react';
import { Header } from './components/Header';
import { Navigation, ActiveTab } from './components/Navigation';
import { PipelineFlow } from './components/PipelineFlow';
import { GatewayView } from './components/GatewayView';
import { AnalysisView } from './components/AnalysisView';
import { ProtectedView } from './components/ProtectedView';
import { BlockScreen } from './components/BlockScreen';
import { ResponseView } from './components/ResponseView';
import { ActivityLogView } from './components/ActivityLogView';
import { DEMO_PRESETS, DemoPreset } from './data/presets';
import { gatewayApi } from './services/gatewayApi';
import {
  PrivacyMode,
  ScanResponse,
  ProtectResponse,
  ChatResponse,
  RestoreResponse,
  ActivityEvent
} from './types/privacy';

export default function App() {
  // Core application state - dynamic by default, with presets available on demand
  const [prompt, setPrompt] = useState<string>('');
  const [selectedPresetId, setSelectedPresetId] = useState<string | null>(null);
  const [privacyMode, setPrivacyMode] = useState<PrivacyMode>('standard');
  const [activeTab, setActiveTab] = useState<ActiveTab>('gateway');

  // Pipeline stage tracking
  const [pipelineStage, setPipelineStage] = useState<
    'input' | 'detection' | 'decision' | 'protected' | 'ai' | 'restoration' | 'completed' | 'blocked'
  >('input');

  // Gateway API payloads
  const [sessionId, setSessionId] = useState<string>(`sess_${Date.now()}`);
  const [scanData, setScanData] = useState<ScanResponse | null>(null);
  const [protectData, setProtectData] = useState<ProtectResponse | null>(null);
  const [chatData, setChatData] = useState<ChatResponse | null>(null);
  const [restoreData, setRestoreData] = useState<RestoreResponse | null>(null);
  const [activityLogs, setActivityLogs] = useState<ActivityEvent[]>([]);

  // UI state
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isLoadingRestore, setIsLoadingRestore] = useState<boolean>(false);
  const [isBackendHealthy, setIsBackendHealthy] = useState<boolean>(true);
  const [useLiveGemini, setUseLiveGemini] = useState<boolean>(false);
  const [statusMessage, setStatusMessage] = useState<string>('');

  // Initial health check & activity log load
  useEffect(() => {
    let mounted = true;
    const check = async () => {
      const healthy = await gatewayApi.healthCheck();
      if (mounted) setIsBackendHealthy(healthy);
      const logs = await gatewayApi.getActivityLogs();
      if (mounted && logs.length > 0) setActivityLogs(logs);
    };
    check();
    const interval = setInterval(check, 10000);
    return () => {
      mounted = false;
      clearInterval(interval);
    };
  }, []);

  // Fetch updated logs helper
  const refreshLogs = useCallback(async () => {
    const logs = await gatewayApi.getActivityLogs();
    setActivityLogs(logs);
  }, []);

  // Clear logs helper
  const handleClearLogs = async () => {
    await gatewayApi.clearActivityLogs();
    refreshLogs();
  };

  // Dynamic Prompt Change Handler
  const handlePromptChange = (val: string) => {
    setPrompt(val);
    const matchingPreset = DEMO_PRESETS.find((p) => p.prompt === val);
    setSelectedPresetId(matchingPreset ? matchingPreset.id : null);

    // Invalidate stale run results if prompt changes
    if (pipelineStage !== 'input') {
      setPipelineStage('input');
      setScanData(null);
      setProtectData(null);
      setChatData(null);
      setRestoreData(null);
    }
  };

  // Reset entire session to clean slate
  const handleResetSession = () => {
    const newSessId = `sess_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    setSessionId(newSessId);
    setPrompt('');
    setSelectedPresetId(null);
    setScanData(null);
    setProtectData(null);
    setChatData(null);
    setRestoreData(null);
    setPipelineStage('input');
    setActiveTab('gateway');
    setStatusMessage('');
  };

  // Preset Selection
  const handleSelectPreset = (preset: DemoPreset) => {
    setSelectedPresetId(preset.id);
    setPrompt(preset.prompt);
    // Reset subsequent steps
    setScanData(null);
    setProtectData(null);
    setChatData(null);
    setRestoreData(null);
    setPipelineStage('input');
  };

  // Action: Step 1 Scan (Fresh session on every execution)
  const handleScan = async () => {
    if (!prompt.trim()) {
      setStatusMessage('Please enter a prompt to analyze.');
      return;
    }
    const freshSessionId = `sess_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    setSessionId(freshSessionId);
    setScanData(null);
    setProtectData(null);
    setChatData(null);
    setRestoreData(null);

    setIsLoading(true);
    setStatusMessage('Scanning prompt for sensitive entities...');
    try {
      const res = await gatewayApi.scanPrompt(prompt, privacyMode, freshSessionId);
      setScanData(res);
      setSessionId(res.sessionId);
      setPipelineStage(res.assessment.decision === 'BLOCK' ? 'blocked' : 'decision');
      setActiveTab('analyze');
      await refreshLogs();
    } catch (err: any) {
      console.error('Scan failed:', err);
      setStatusMessage(`Scan failed: ${err.message || 'Unknown error'}`);
    } finally {
      setIsLoading(false);
      setStatusMessage('');
    }
  };

  // Action: Step 2 Protect
  const handleProceedToProtect = async () => {
    if (scanData?.assessment.decision === 'BLOCK') {
      setActiveTab('protected');
      setPipelineStage('blocked');
      return;
    }

    const activeSessionId = scanData?.sessionId || sessionId;
    setIsLoading(true);
    setStatusMessage('Masking sensitive data with session tokens...');
    try {
      const res = await gatewayApi.protectPrompt(prompt, activeSessionId, privacyMode);
      setProtectData(res);
      setPipelineStage('protected');
      setActiveTab('protected');
      await refreshLogs();
    } catch (err: any) {
      console.error('Protection failed:', err);
      if (err.message === 'REQUEST_BLOCKED') {
        setPipelineStage('blocked');
        setActiveTab('protected');
      } else {
        alert(err.message || 'Protection failed');
      }
    } finally {
      setIsLoading(false);
      setStatusMessage('');
    }
  };

  // Action: Step 3 Transmit to External LLM
  const handleTransmitToAI = async () => {
    if (!protectData) return;
    const activeSessionId = protectData?.sessionId || scanData?.sessionId || sessionId;
    setIsLoading(true);
    setStatusMessage('Transmitting protected prompt to External LLM...');
    try {
      const res = await gatewayApi.sendToExternalAI(activeSessionId, protectData.protectedPrompt, useLiveGemini);
      setChatData(res);
      setActiveTab('response');
      setPipelineStage('ai');
      await refreshLogs();

      // Automatically execute Step 4: Restoration for seamless hackathon UX
      setIsLoadingRestore(true);
      const rest = await gatewayApi.restoreResponse(activeSessionId, res.rawAIResponse);
      setRestoreData(rest);
      setPipelineStage('completed');
      await refreshLogs();
    } catch (err: any) {
      console.error('AI chat failed:', err);
      alert(err.message || 'Communication with external LLM failed');
    } finally {
      setIsLoading(false);
      setIsLoadingRestore(false);
      setStatusMessage('');
    }
  };

  // Action: Step 4 Restoration (manual trigger if needed)
  const handleManualRestore = async () => {
    if (!chatData) return;
    const activeSessionId = chatData?.sessionId || protectData?.sessionId || scanData?.sessionId || sessionId;
    setIsLoadingRestore(true);
    try {
      const res = await gatewayApi.restoreResponse(activeSessionId, chatData.rawAIResponse);
      setRestoreData(res);
      setPipelineStage('completed');
      await refreshLogs();
    } catch (err: any) {
      console.error('Restore failed:', err);
      alert(err.message || 'Restoration failed');
    } finally {
      setIsLoadingRestore(false);
    }
  };

  // Action: Auto-Run Full Pipeline (One-Click End-to-End Demo with fresh isolated session)
  const handleAutoRunPipeline = async () => {
    if (!prompt.trim()) {
      setStatusMessage('Please enter a prompt to analyze.');
      return;
    }
    const freshSessionId = `sess_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    setSessionId(freshSessionId);
    setScanData(null);
    setProtectData(null);
    setChatData(null);
    setRestoreData(null);

    setIsLoading(true);
    setStatusMessage('Running Agentic Security Pipeline...');

    try {
      // 1. Scan
      const scanRes = await gatewayApi.scanPrompt(prompt, privacyMode, freshSessionId);
      setScanData(scanRes);
      setSessionId(scanRes.sessionId);

      if (scanRes.assessment.decision === 'BLOCK') {
        setPipelineStage('blocked');
        setActiveTab('protected'); // Will show BlockScreen
        await refreshLogs();
        return;
      }

      // 2. Protect
      const protRes = await gatewayApi.protectPrompt(prompt, scanRes.sessionId, privacyMode);
      setProtectData(protRes);

      // 3. AI Chat
      const chatRes = await gatewayApi.sendToExternalAI(scanRes.sessionId, protRes.protectedPrompt, useLiveGemini);
      setChatData(chatRes);

      // 4. Restore
      const restRes = await gatewayApi.restoreResponse(scanRes.sessionId, chatRes.rawAIResponse);
      setRestoreData(restRes);

      setPipelineStage('completed');
      setActiveTab('response');
      await refreshLogs();
    } catch (err: any) {
      console.error('Pipeline error:', err);
      if (err.message === 'REQUEST_BLOCKED') {
        setPipelineStage('blocked');
        setActiveTab('protected');
      } else {
        alert(err.message || 'Pipeline processing failed');
      }
    } finally {
      setIsLoading(false);
      setStatusMessage('');
    }
  };

  const isBlocked = scanData?.assessment.decision === 'BLOCK' || pipelineStage === 'blocked';

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      {/* Top Header */}
      <Header
        privacyMode={privacyMode}
        onModeChange={(newMode) => {
          setPrivacyMode(newMode);
          // If already scanned, re-evaluate or notify
          if (scanData) {
            handleScan();
          }
        }}
        onResetSession={handleResetSession}
        isBackendHealthy={isBackendHealthy}
        useLiveGemini={useLiveGemini}
        onToggleLiveGemini={setUseLiveGemini}
        lastAssessment={scanData?.assessment}
      />

      {/* Primary Navigation Tabs */}
      <Navigation
        activeTab={activeTab}
        onTabChange={setActiveTab}
        assessment={scanData?.assessment}
        entitiesCount={scanData?.entities.length || 0}
        isBlocked={isBlocked}
        hasProtectedPrompt={!!protectData}
        hasAIResponse={!!chatData}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Agentic Pipeline Architecture Stepper */}
        <PipelineFlow
          currentStage={pipelineStage}
          assessment={scanData?.assessment}
          decision={scanData?.assessment.decision}
        />

        {/* Global Loading Banner */}
        {isLoading && (
          <div className="mb-6 p-3 rounded-xl bg-cyan-950/60 border border-cyan-700/60 text-cyan-300 text-xs font-mono flex items-center justify-between animate-pulse">
            <div className="flex items-center space-x-2">
              <span className="w-2 h-2 rounded-full bg-cyan-400"></span>
              <span>{statusMessage || 'Processing Agent Pipeline...'}</span>
            </div>
            <span className="text-[10px] text-cyan-400/70 uppercase">Volatile Memory Only</span>
          </div>
        )}

        {/* Tab 1: Gateway */}
        {activeTab === 'gateway' && (
          <GatewayView
            prompt={prompt}
            onPromptChange={handlePromptChange}
            privacyMode={privacyMode}
            onModeChange={setPrivacyMode}
            onScan={handleScan}
            onAutoRunPipeline={handleAutoRunPipeline}
            isLoading={isLoading}
            selectedPresetId={selectedPresetId}
            onSelectPreset={handleSelectPreset}
          />
        )}

        {/* Tab 2: Security Analysis */}
        {activeTab === 'analyze' && (
          <AnalysisView
            assessment={scanData?.assessment}
            entities={scanData?.entities || []}
            entitySummary={scanData?.entitySummary || []}
            onProceedToProtect={handleProceedToProtect}
            onEditPrompt={() => setActiveTab('gateway')}
          />
        )}

        {/* Tab 3: Protected AI or Block Screen */}
        {activeTab === 'protected' && (
          isBlocked ? (
            <BlockScreen
              assessment={scanData?.assessment}
              entities={scanData?.entities || []}
              onEditPrompt={() => setActiveTab('gateway')}
              rawPrompt={prompt}
            />
          ) : (
            <ProtectedView
              protectData={protectData}
              originalPrompt={prompt}
              onTransmitToAI={handleTransmitToAI}
              isLoading={isLoading}
              onBackToAnalysis={() => setActiveTab('analyze')}
            />
          )
        )}

        {/* Tab 4: Response */}
        {activeTab === 'response' && (
          <ResponseView
            chatData={chatData}
            restoreData={restoreData}
            onRestore={handleManualRestore}
            isLoadingRestore={isLoadingRestore}
            onNewSession={handleResetSession}
          />
        )}

        {/* Tab 5: Activity Log */}
        {activeTab === 'activity' && (
          <ActivityLogView
            logs={activityLogs}
            onRefresh={refreshLogs}
            onClear={handleClearLogs}
            isLoading={isLoading}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-900 bg-slate-950 py-4 text-center text-xs text-slate-500 font-mono">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>Agentic Privacy Gateway for LLMs &bull; Hackathon MVP</span>
          <span className="text-slate-600">Zero Raw PII Exposure Architecture &bull; Fail-Closed Enforced</span>
        </div>
      </footer>
    </div>
  );
}
