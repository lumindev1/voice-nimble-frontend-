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
  legalBusinessName: '',
  businessDomain: '',
  bringYourOwnNumber: false,
  byonPhoneNumber: '',
  countryCode: 'US',
  humanHandoffNumber: '',
  extraInformationToShare: '',
};

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
    } catch {
      setToastMsg('Failed to save agent');
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
      const msg = e instanceof Error ? e.message : 'Failed to toggle agent';
      setToastMsg(msg);
      setToastError(true);
    }
  };

  const voiceOptions = voices.map((v) => ({ label: `${v.name} (${v.language}, ${v.gender})`, value: v.id }));

  return (
    <Page
      title="Virtual AI Prompt"
      subtitle="Manage your AI agents for inbound and outbound calls"
      primaryAction={{ content: 'Create New Agent +', onAction: openCreate }}
    >
      <BlockStack gap="500">
        <InlineStack gap="200" blockAlign="center">
          <Text as="h2" variant="headingMd">All AI Agents</Text>
          <Text as="p" variant="bodySm" tone="subdued">— My Agent</Text>
        </InlineStack>

        {isLoading ? (
          <Card><SkeletonBodyText lines={5} /></Card>
        ) : agents.length === 0 ? (
          <Card>
            <EmptyState
              heading="No AI agents yet"
              action={{ content: 'Create New Agent', onAction: openCreate }}
              image=""
            >
              <p>Create your first AI agent to start handling inbound or outbound calls.</p>
            </EmptyState>
          </Card>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 16 }}>
            {agents.map((agent) => (
              <Card key={agent._id}>
                <BlockStack gap="300">
                  <InlineStack align="space-between" blockAlign="start">
                    <div style={{
                      width: 44, height: 44, borderRadius: 10,
                      background: agent.isActive ? '#d4edda' : '#f8d7da',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: 22,
                    }}>
                      🤖
                    </div>
                    <Badge tone={agent.isActive ? 'success' : 'critical'}>
                      {agent.isActive ? 'ACTIVE' : 'INACTIVE'}
                    </Badge>
                  </InlineStack>

                  <Text as="h3" variant="headingSm" fontWeight="bold">{agent.agentName}</Text>
                  <Badge tone="info">{agent.callType.toUpperCase()}</Badge>

                  <Text as="p" variant="bodySm" tone="subdued">
                    {agent.greetingMessage.slice(0, 90)}{agent.greetingMessage.length > 90 ? '...' : ''}
                  </Text>

                  <Divider />
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', textAlign: 'center' }}>
                    <BlockStack gap="050" align="center">
                      <Text as="p" variant="headingSm">0</Text>
                      <Text as="p" variant="bodySm" tone="subdued">Requests</Text>
                    </BlockStack>
                    <BlockStack gap="050" align="center">
                      <Text as="p" variant="headingSm">0s</Text>
                      <Text as="p" variant="bodySm" tone="subdued">Duration</Text>
                    </BlockStack>
                    <BlockStack gap="050" align="center">
                      <Text as="p" variant="headingSm">0</Text>
                      <Text as="p" variant="bodySm" tone="subdued">Success</Text>
                    </BlockStack>
                  </div>

                  <Divider />
                  <InlineStack gap="200">
                    <Button size="slim" onClick={() => openEdit(agent)}>Edit</Button>
                    <Button
                      size="slim"
                      tone={agent.isActive ? 'critical' : 'success'}
                      onClick={() => handleToggleActive(agent)}
                    >
                      {agent.isActive ? 'Deactivate' : 'Activate'}
                    </Button>
                    <Button size="slim" tone="critical" onClick={() => handleDelete(agent._id)}>Delete</Button>
                  </InlineStack>
                </BlockStack>
              </Card>
            ))}
          </div>
        )}
      </BlockStack>

      <Modal
        open={showModal}
        onClose={() => setShowModal(false)}
        title={editingAgent ? `Edit: ${editingAgent.agentName}` : 'Create New Agent'}
        primaryAction={{ content: 'Save', onAction: handleSave, loading: isSaving }}
        secondaryActions={[{ content: 'Cancel', onAction: () => setShowModal(false) }]}
        large
      >
        <Modal.Section>
          <FormLayout>
            <FormLayout.Group>
              <TextField
                label="Agent Name *"
                value={form.agentName}
                onChange={(v) => setForm({ ...form, agentName: v })}
                autoComplete="off"
                placeholder="e.g. DR-APPOINTMENT-BOT"
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
                label="Voice"
                options={voiceOptions.length > 0 ? voiceOptions : [{ label: 'Default (Jenny, en-US)', value: 'en-US-JennyNeural' }]}
                value={form.voiceId}
                onChange={(v) => setForm({ ...form, voiceId: v })}
              />
            </FormLayout.Group>

            <Divider />
            <Text as="h3" variant="headingSm">Business Info</Text>

            <FormLayout.Group>
              <TextField label="Business Name" value={form.legalBusinessName} onChange={(v) => setForm({ ...form, legalBusinessName: v })} autoComplete="organization" />
              <TextField label="Business Domain" value={form.businessDomain} onChange={(v) => setForm({ ...form, businessDomain: v })} autoComplete="url" />
            </FormLayout.Group>

            <FormLayout.Group>
              <TextField label="Your Phone Number (BYON)" value={form.byonPhoneNumber} onChange={(v) => setForm({ ...form, byonPhoneNumber: v })} autoComplete="tel" placeholder="+8809649364251" />
              <TextField label="Human Handoff Number" value={form.humanHandoffNumber} onChange={(v) => setForm({ ...form, humanHandoffNumber: v })} autoComplete="tel" placeholder="+8801234567890" />
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
