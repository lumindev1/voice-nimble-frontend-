import { useEffect, useState } from 'react';
import {
  Page,
  Layout,
  Card,
  Text,
  BlockStack,
  InlineStack,
  Button,
  TextField,
  Select,
  Toast,
  Divider,
  Badge,
} from '@shopify/polaris';
import { apiClient } from '../api/client';
import { templatesApi, CallTemplate } from '../api/templates.api';
import { agentApi, AgentConfig } from '../api/agent.api';

export default function TestCallPage() {
  const [form, setForm] = useState({
    to: '',
    fromNumber: '',
    templateId: '',
    agentId: '',
  });
  const [fromNumbers, setFromNumbers] = useState<string[]>([]);
  const [templates, setTemplates] = useState<CallTemplate[]>([]);
  const [agents, setAgents] = useState<AgentConfig[]>([]);
  const [isCalling, setIsCalling] = useState(false);
  const [activeCallSid, setActiveCallSid] = useState('');
  const [toastMsg, setToastMsg] = useState('');
  const [toastError, setToastError] = useState(false);

  useEffect(() => {
    apiClient.get<{ success: boolean; numbers: string[] }>('/test-call/from-numbers')
      .then((r) => setFromNumbers(r.data.numbers))
      .catch(() => {});
    templatesApi.getAll().then((r) => setTemplates(r.data.templates)).catch(() => {});
    agentApi.getAll().then((r) => setAgents(r.data.agents)).catch(() => {});
  }, []);

  const handleCall = async () => {
    if (!form.to.trim()) {
      setToastMsg("Recipient number is required");
      setToastError(true);
      return;
    }
    setIsCalling(true);
    setActiveCallSid('');
    try {
      const payload: Record<string, string> = { to: form.to };
      if (form.fromNumber) payload.fromNumber = form.fromNumber;
      if (form.templateId) payload.templateId = form.templateId;
      if (form.agentId) payload.agentId = form.agentId;

      const r = await apiClient.post<{ success: boolean; callSid: string; message: string }>('/test-call', payload);
      setActiveCallSid(r.data.callSid);
      setToastMsg('Test call initiated successfully');
      setToastError(false);
    } catch {
      setToastMsg('Failed to place test call');
      setToastError(true);
    } finally {
      setIsCalling(false);
    }
  };

  return (
    <Page title="Test Call" subtitle="Verify your AI agent setup with a test call">
      <Layout>
        <Layout.Section variant="oneHalf">
          <Card>
            <BlockStack gap="500">
              <InlineStack gap="200" blockAlign="center">
                <div style={{
                  width: 40,
                  height: 40,
                  borderRadius: 10,
                  background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 20,
                }}>
                  📞
                </div>
                <BlockStack gap="050">
                  <Text as="h2" variant="headingMd" fontWeight="semibold">Make a Call</Text>
                  <Text as="p" variant="bodySm" tone="subdued">Fill in the details to initiate a test</Text>
                </BlockStack>
              </InlineStack>

              <Divider />

              <TextField
                label="Recipient Number"
                value={form.to}
                onChange={(v) => setForm({ ...form, to: v })}
                placeholder="+1234567890"
                autoComplete="tel"
                helpText="Include country code"
              />

              <Select
                label="From Number"
                options={[
                  { label: 'Select a number', value: '' },
                  ...fromNumbers.map((n) => ({ label: n, value: n })),
                ]}
                value={form.fromNumber}
                onChange={(v) => setForm({ ...form, fromNumber: v })}
              />

              <Select
                label="Template (optional)"
                options={[
                  { label: 'No template', value: '' },
                  ...templates.map((t) => ({ label: t.name, value: t._id })),
                ]}
                value={form.templateId}
                onChange={(v) => setForm({ ...form, templateId: v })}
              />

              <Select
                label="Virtual Agent"
                options={[
                  { label: 'Select an agent', value: '' },
                  ...agents.map((a) => ({
                    label: `${a.agentName} (${a.callType.toUpperCase()})`,
                    value: a._id,
                  })),
                ]}
                value={form.agentId}
                onChange={(v) => setForm({ ...form, agentId: v })}
              />

              <Button
                variant="primary"
                onClick={handleCall}
                loading={isCalling}
                fullWidth
                size="large"
              >
                Make Call
              </Button>
            </BlockStack>
          </Card>
        </Layout.Section>

        <Layout.Section variant="oneHalf">
          <BlockStack gap="400">
            <Card>
              <BlockStack gap="400">
                <Text as="h2" variant="headingMd" fontWeight="semibold">Call Status</Text>
                <Divider />

                {!activeCallSid && !isCalling ? (
                  <div style={{
                    textAlign: 'center',
                    padding: '48px 20px',
                    background: '#f9fafb',
                    borderRadius: 12,
                  }}>
                    <div style={{
                      width: 72,
                      height: 72,
                      borderRadius: '50%',
                      background: '#eef2ff',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: 32,
                      margin: '0 auto 16px',
                    }}>
                      📞
                    </div>
                    <Text as="p" variant="bodyMd" fontWeight="medium">Ready to call</Text>
                    <Text as="p" variant="bodySm" tone="subdued">
                      Fill in the form and click Make Call
                    </Text>
                  </div>
                ) : isCalling ? (
                  <div style={{
                    textAlign: 'center',
                    padding: '48px 20px',
                    background: '#eef2ff',
                    borderRadius: 12,
                  }}>
                    <div style={{
                      width: 72,
                      height: 72,
                      borderRadius: '50%',
                      background: '#6366f1',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: 32,
                      margin: '0 auto 16px',
                      animation: 'pulse 1.5s infinite',
                    }}>
                      📱
                    </div>
                    <Text as="p" variant="bodyMd" fontWeight="medium">Calling {form.to}...</Text>
                    <Text as="p" variant="bodySm" tone="subdued">Please wait</Text>
                  </div>
                ) : (
                  <div style={{
                    background: '#ecfdf5',
                    borderRadius: 12,
                    padding: '24px',
                  }}>
                    <BlockStack gap="300">
                      <InlineStack gap="200" blockAlign="center">
                        <div style={{
                          width: 32,
                          height: 32,
                          borderRadius: '50%',
                          background: '#059669',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: '#fff',
                          fontSize: 16,
                        }}>
                          ✓
                        </div>
                        <Text as="p" variant="headingSm" fontWeight="bold">Call Initiated</Text>
                      </InlineStack>
                      <BlockStack gap="100">
                        <Text as="p" variant="bodySm">
                          <span style={{ color: '#6b7280' }}>To:</span> <strong>{form.to}</strong>
                        </Text>
                        <Text as="p" variant="bodySm">
                          <span style={{ color: '#6b7280' }}>Call SID:</span>{' '}
                          <span style={{ fontFamily: 'monospace', fontSize: 11 }}>{activeCallSid}</span>
                        </Text>
                      </BlockStack>
                      <Badge tone="info">Check Call History for details</Badge>
                    </BlockStack>
                  </div>
                )}
              </BlockStack>
            </Card>

            <Card>
              <BlockStack gap="300">
                <Text as="h3" variant="headingSm" fontWeight="semibold">Quick Tips</Text>
                <Divider />
                <BlockStack gap="200">
                  {[
                    'Make sure your virtual agent is activated before calling',
                    'Selecting a template will use that script during the call',
                    'The from number must be provisioned in your SIP trunk',
                    'Test calls are logged in the Call History page',
                  ].map((tip, i) => (
                    <InlineStack key={i} gap="200" blockAlign="start">
                      <div style={{
                        width: 20,
                        height: 20,
                        borderRadius: '50%',
                        background: '#eef2ff',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: 10,
                        color: '#6366f1',
                        fontWeight: 700,
                        flexShrink: 0,
                        marginTop: 1,
                      }}>
                        {i + 1}
                      </div>
                      <Text as="p" variant="bodySm" tone="subdued">{tip}</Text>
                    </InlineStack>
                  ))}
                </BlockStack>
              </BlockStack>
            </Card>
          </BlockStack>
        </Layout.Section>
      </Layout>

      {toastMsg && <Toast content={toastMsg} error={toastError} onDismiss={() => setToastMsg('')} duration={4000} />}
    </Page>
  );
}
