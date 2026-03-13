import { useEffect, useState, useCallback } from 'react';
import {
  Page,
  Card,
  Text,
  BlockStack,
  InlineStack,
  Button,
  TextField,
  Select,
  Modal,
  FormLayout,
  Toast,
  EmptyState,
  Badge,
  SkeletonBodyText,
  Divider,
  Banner,
} from '@shopify/polaris';
import { agentApi, AgentConfig, AgentVoice } from '../api/agent.api';

const DEFAULT_FORM = {
  agentName: '',
  callType: 'inbound' as 'inbound' | 'outbound',
  agentRole: 'customer support agent',
  greetingMessage: 'Hello! How can I help you today?',
  goalDescription: '',
  primaryLanguage: 'en-US',
  voiceGender: 'female' as 'male' | 'female' | 'neutral',
  voiceId: 'en-US-Standard-F',
  voiceSpeed: 1.0,
  ttsVendor: 'google' as 'google' | 'elevenlabs',
  legalBusinessName: '',
  businessDomain: '',
  bringYourOwnNumber: false,
  byonPhoneNumber: '',
  countryCode: 'US',
  humanHandoffNumber: '',
  extraInformationToShare: '',
};

const AGENT_COLORS = [
  { gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', light: '#eef2ff' },
  { gradient: 'linear-gradient(135deg, #11998e 0%, #38ef7d 100%)', light: '#ecfdf5' },
  { gradient: 'linear-gradient(135deg, #fc5c7d 0%, #6a82fb 100%)', light: '#fef2f2' },
  { gradient: 'linear-gradient(135deg, #f7971e 0%, #ffd200 100%)', light: '#fffbeb' },
  { gradient: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)', light: '#eff6ff' },
];

export default function AgentPage() {
  const [agents, setAgents] = useState<AgentConfig[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [toastMsg, setToastMsg] = useState('');
  const [toastError, setToastError] = useState(false);
  const [voices, setVoices] = useState<AgentVoice[]>([]);

  const [showModal, setShowModal] = useState(false);
  const [editingAgent, setEditingAgent] = useState<AgentConfig | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [form, setForm] = useState({ ...DEFAULT_FORM });

  const load = useCallback(async () => {
    setIsLoading(true);
    try {
      const r = await agentApi.getAll();
      setAgents(r.data.agents);
    } catch {
      setToastMsg('Failed to load agents');
      setToastError(true);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
    agentApi.getVoices().then((r) => setVoices(r.data.voices)).catch(() => {});
  }, [load]);

  const openCreate = () => {
    setEditingAgent(null);
    setForm({ ...DEFAULT_FORM });
    setShowModal(true);
  };

  const openEdit = (a: AgentConfig) => {
    setEditingAgent(a);
    setForm({
      agentName: a.agentName,
      callType: a.callType,
      agentRole: a.agentRole,
      greetingMessage: a.greetingMessage,
      goalDescription: a.goalDescription,
      primaryLanguage: a.primaryLanguage,
      voiceGender: a.voiceGender,
      voiceId: a.voiceId,
      voiceSpeed: a.voiceSpeed,
      ttsVendor: a.ttsVendor || 'google',
      legalBusinessName: a.legalBusinessName,
      businessDomain: a.businessDomain,
      bringYourOwnNumber: a.bringYourOwnNumber,
      byonPhoneNumber: a.byonPhoneNumber || '',
      countryCode: a.countryCode,
      humanHandoffNumber: a.humanHandoffNumber || '',
      extraInformationToShare: a.extraInformationToShare,
    });
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!form.agentName.trim()) {
      setToastMsg('Agent name is required');
      setToastError(true);
      return;
    }
    setIsSaving(true);
    try {
      if (editingAgent) {
        await agentApi.update(editingAgent._id, form);
        setToastMsg('Agent updated');
      } else {
        await agentApi.create(form);
        setToastMsg('Agent created');
      }
      setToastError(false);
      setShowModal(false);
      load();
    } catch (e: unknown) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const msg = (e as any)?.response?.data?.message || 'Failed to save agent';
      setToastMsg(msg);
      setToastError(true);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await agentApi.delete(id);
      setToastMsg('Agent deleted');
      setToastError(false);
      load();
    } catch {
      setToastMsg('Failed to delete agent');
      setToastError(true);
    }
  };

  const handleToggleActive = async (agent: AgentConfig) => {
    try {
      if (agent.isActive) {
        await agentApi.deactivate(agent._id);
        setToastMsg(`${agent.agentName} deactivated`);
      } else {
        await agentApi.activate(agent._id);
        setToastMsg(`${agent.agentName} activated`);
      }
      setToastError(false);
      load();
    } catch (e: unknown) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const msg = (e as any)?.response?.data?.message || (e instanceof Error ? e.message : 'Failed to toggle agent');
      setToastMsg(msg);
      setToastError(true);
    }
  };

  const ELEVENLABS_VOICES = [
    { label: 'Sarah (Female, en-US)', value: 'EXAVITQu4vr4xnSDxMaL' },
    { label: 'Laura (Female, en-US)', value: 'FGY2WhTYpPnrIDTdsKH5' },
    { label: 'Charlie (Male, en-US)', value: 'IKne3meq5aSn9XLyUdCD' },
    { label: 'George (Male, en-GB)', value: 'JBFqnCBsd6RMkjVDRZzb' },
    { label: 'Callum (Male, en-US)', value: 'N2lVS1w4EtoT3dr4eOWO' },
    { label: 'Charlotte (Female, en-US)', value: 'XB0fDUnXU5powFXDhCwa' },
    { label: 'Alice (Female, en-US)', value: 'Xb7hH8MSUJpSbSDYk0k2' },
    { label: 'Matilda (Female, en-US)', value: 'XrExE9yKIg1WjnnlVkGX' },
    { label: 'Will (Male, en-US)', value: 'bIHbv24MWmeRgasZH58o' },
    { label: 'Jessica (Female, en-US)', value: 'cgSgspJ2msm6clMCkdW9' },
    { label: 'Eric (Male, en-US)', value: 'cjVigY5qzO86Huf0OWal' },
    { label: 'Chris (Male, en-US)', value: 'iP95p4xoKVk53GoZ742B' },
    { label: 'Brian (Male, en-US)', value: 'nPczCjzI2devNBz1zQrb' },
    { label: 'Daniel (Male, en-GB)', value: 'onwK4e9ZLuTAKqWW03F9' },
    { label: 'Lily (Female, en-GB)', value: 'pFZP5JQG7iQjIQuC4Bku' },
  ];

  const googleVoiceOptions = voices.map((v) => ({ label: `${v.name} (${v.language}, ${v.gender})`, value: v.id }));
  const voiceOptions = form.ttsVendor === 'elevenlabs'
    ? ELEVENLABS_VOICES
    : (googleVoiceOptions.length > 0 ? googleVoiceOptions : [{ label: 'Default (Jenny, en-US)', value: 'en-US-JennyNeural' }]);

  return (
    <Page
      title="Virtual AI Agents"
      subtitle="Create and manage your AI-powered phone agents"
      primaryAction={{ content: '+ Create Agent', onAction: openCreate }}
    >
      <BlockStack gap="500">
        {isLoading ? (
          <Card><SkeletonBodyText lines={5} /></Card>
        ) : agents.length === 0 ? (
          <Card>
            <EmptyState
              heading="No AI agents yet"
              action={{ content: 'Create Your First Agent', onAction: openCreate }}
              image=""
            >
              <p>Create an AI agent to start handling inbound or outbound calls automatically.</p>
            </EmptyState>
          </Card>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 20 }}>
            {agents.map((agent, idx) => {
              const colorSet = AGENT_COLORS[idx % AGENT_COLORS.length];
              return (
                <div key={agent._id} style={{
                  background: '#fff',
                  borderRadius: 16,
                  border: '1px solid #e5e7eb',
                  overflow: 'hidden',
                  transition: 'box-shadow 0.2s',
                }}>
                  {/* Color header bar */}
                  <div style={{
                    height: 6,
                    background: colorSet.gradient,
                  }} />

                  <div style={{ padding: '20px' }}>
                    <BlockStack gap="400">
                      <InlineStack align="space-between" blockAlign="center">
                        <InlineStack gap="300" blockAlign="center">
                          <div style={{
                            width: 48,
                            height: 48,
                            borderRadius: 12,
                            background: colorSet.light,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: 24,
                          }}>
                            🤖
                          </div>
                          <BlockStack gap="050">
                            <Text as="h3" variant="headingSm" fontWeight="bold">{agent.agentName}</Text>
                            <Badge tone={agent.callType === 'inbound' ? 'info' : 'attention'}>
                              {agent.callType.toUpperCase()}
                            </Badge>
                          </BlockStack>
                        </InlineStack>
                        <div style={{
                          width: 10,
                          height: 10,
                          borderRadius: '50%',
                          background: agent.isActive ? '#22c55e' : '#ef4444',
                          boxShadow: agent.isActive ? '0 0 8px rgba(34,197,94,0.4)' : '0 0 8px rgba(239,68,68,0.3)',
                        }} />
                      </InlineStack>

                      <Text as="p" variant="bodySm" tone="subdued">
                        {agent.greetingMessage.slice(0, 100)}{agent.greetingMessage.length > 100 ? '...' : ''}
                      </Text>

                      <div style={{
                        display: 'grid',
                        gridTemplateColumns: '1fr 1fr 1fr',
                        gap: 8,
                        background: '#f9fafb',
                        borderRadius: 10,
                        padding: '12px 8px',
                        textAlign: 'center',
                      }}>
                        <BlockStack gap="050" align="center">
                          <Text as="p" variant="headingSm" fontWeight="bold">0</Text>
                          <Text as="p" variant="bodySm" tone="subdued">Requests</Text>
                        </BlockStack>
                        <div style={{ borderLeft: '1px solid #e5e7eb', borderRight: '1px solid #e5e7eb' }}>
                          <BlockStack gap="050" align="center">
                            <Text as="p" variant="headingSm" fontWeight="bold">0s</Text>
                            <Text as="p" variant="bodySm" tone="subdued">Duration</Text>
                          </BlockStack>
                        </div>
                        <BlockStack gap="050" align="center">
                          <Text as="p" variant="headingSm" fontWeight="bold">0</Text>
                          <Text as="p" variant="bodySm" tone="subdued">Success</Text>
                        </BlockStack>
                      </div>

                      <InlineStack gap="200">
                        <div style={{ flex: 1 }}>
                          <Button size="slim" onClick={() => openEdit(agent)} fullWidth>Edit</Button>
                        </div>
                        <div style={{ flex: 1 }}>
                          <Button
                            size="slim"
                            variant={agent.isActive ? 'secondary' : 'primary'}
                            onClick={() => handleToggleActive(agent)}
                            fullWidth
                          >
                            {agent.isActive ? 'Deactivate' : 'Activate'}
                          </Button>
                        </div>
                        <Button size="slim" tone="critical" onClick={() => handleDelete(agent._id)}>Delete</Button>
                      </InlineStack>
                    </BlockStack>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </BlockStack>

      <Modal
        open={showModal}
        onClose={() => setShowModal(false)}
        title={editingAgent ? `Edit: ${editingAgent.agentName}` : 'Create New Agent'}
        primaryAction={{ content: 'Save', onAction: handleSave, loading: isSaving }}
        secondaryActions={[{ content: 'Cancel', onAction: () => setShowModal(false) }]}
        size="large"
      >
        <Modal.Section>
          <FormLayout>
            <FormLayout.Group>
              <TextField
                label="Agent Name *"
                value={form.agentName}
                onChange={(v) => setForm({ ...form, agentName: v })}
                autoComplete="off"
                placeholder="e.g. Sales Assistant"
              />
              <Select
                label="Call Type"
                options={[
                  { label: 'Inbound (Receives calls)', value: 'inbound' },
                  { label: 'Outbound (Makes calls)', value: 'outbound' },
                ]}
                value={form.callType}
                onChange={(v) => setForm({ ...form, callType: v as 'inbound' | 'outbound' })}
              />
            </FormLayout.Group>

            <TextField
              label="Greeting Message"
              value={form.greetingMessage}
              onChange={(v) => setForm({ ...form, greetingMessage: v })}
              multiline={3}
              autoComplete="off"
            />

            <TextField
              label="Agent Role"
              value={form.agentRole}
              onChange={(v) => setForm({ ...form, agentRole: v })}
              autoComplete="off"
            />

            <TextField
              label="Goal / Instructions"
              value={form.goalDescription}
              onChange={(v) => setForm({ ...form, goalDescription: v })}
              multiline={4}
              autoComplete="off"
              placeholder="Describe what this agent should do..."
            />

            <Divider />
            <Text as="h3" variant="headingSm">Voice & Language</Text>

            <FormLayout.Group>
              <Select
                label="Language"
                options={[
                  { label: 'English (US)', value: 'en-US' },
                  { label: 'English (UK)', value: 'en-GB' },
                  { label: 'Spanish', value: 'es-ES' },
                  { label: 'French', value: 'fr-FR' },
                  { label: 'German', value: 'de-DE' },
                  { label: 'Bengali', value: 'bn-BD' },
                ]}
                value={form.primaryLanguage}
                onChange={(v) => setForm({ ...form, primaryLanguage: v })}
              />
              <Select
                label="TTS Provider"
                options={[
                  { label: 'Google', value: 'google' },
                  { label: 'ElevenLabs', value: 'elevenlabs' },
                ]}
                value={form.ttsVendor}
                onChange={(v) => {
                  const vendor = v as 'google' | 'elevenlabs';
                  const defaultVoice = vendor === 'elevenlabs' ? 'EXAVITQu4vr4xnSDxMaL' : 'en-US-Standard-F';
                  setForm({ ...form, ttsVendor: vendor, voiceId: defaultVoice });
                }}
              />
            </FormLayout.Group>

            <Select
              label="Voice"
              options={voiceOptions}
              value={form.voiceId}
              onChange={(v) => setForm({ ...form, voiceId: v })}
            />

            <Divider />
            <Text as="h3" variant="headingSm">Business Info</Text>

            <FormLayout.Group>
              <TextField label="Business Name" value={form.legalBusinessName} onChange={(v) => setForm({ ...form, legalBusinessName: v })} autoComplete="organization" />
              <TextField label="Business Domain" value={form.businessDomain} onChange={(v) => setForm({ ...form, businessDomain: v })} autoComplete="url" />
            </FormLayout.Group>

            <FormLayout.Group>
              <TextField label="Your Phone Number (BYON)" value={form.byonPhoneNumber} onChange={(v) => setForm({ ...form, byonPhoneNumber: v })} autoComplete="tel" placeholder="+1234567890" />
              <TextField label="Human Handoff Number" value={form.humanHandoffNumber} onChange={(v) => setForm({ ...form, humanHandoffNumber: v })} autoComplete="tel" placeholder="+1234567890" />
            </FormLayout.Group>

            {!form.agentName.trim() && (
              <Banner tone="warning"><p>Agent name is required before saving.</p></Banner>
            )}
          </FormLayout>
        </Modal.Section>
      </Modal>

      {toastMsg && <Toast content={toastMsg} error={toastError} onDismiss={() => setToastMsg('')} duration={3000} />}
    </Page>
  );
}
