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
  Banner,
  Divider,
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
    <Page title="Test Call" subtitle="Perform test calls to ensure quality and system setup">
      <Layout>
        {/* Call form */}
        <Layout.Section variant="oneHalf">
          <Card>
            <BlockStack gap="400">
              <Text as="h2" variant="headingMd">Calls Management</Text>
              <Text as="h3" variant="headingSm" tone="subdued">Initiate Call</Text>
              <Divider />

              <TextField
                label="Recipient Number *"
                value={form.to}
                onChange={(v) => setForm({ ...form, to: v })}
                placeholder="Enter recipient's number"
                autoComplete="tel"
                helpText="Include country code, e.g. +8801234567890"
              />

              <Select
                label="From Number *"
                options={[
                  { label: 'Select From Number', value: '' },
                  ...fromNumbers.map((n) => ({ label: n, value: n })),
                ]}
                value={form.fromNumber}
                onChange={(v) => setForm({ ...form, fromNumber: v })}
              />

              <Select
                label="Template"
                options={[
                  { label: 'Select Template', value: '' },
                  ...templates.map((t) => ({ label: t.name, value: t._id })),
                ]}
                value={form.templateId}
                onChange={(v) => setForm({ ...form, templateId: v })}
              />

              <Select
                label="Virtual Agent"
                options={[
                  { label: 'Select Assistant', value: '' },
                  ...agents.map((a) => ({
                    label: `${a.agentName} (${a.callType.toUpperCase()})`,
                    value: a._id,
                  })),
                ]}
                value={form.agentId}
                onChange={(v) => setForm({ ...form, agentId: v })}
              />

              <Button variant="primary" onClick={handleCall} loading={isCalling} fullWidth>
                Make Call
              </Button>
            </BlockStack>
          </Card>
        </Layout.Section>

        {/* Active call status */}
        <Layout.Section variant="oneHalf">
          <Card>
            <BlockStack gap="400">
              <Text as="h2" variant="headingMd">Call Status</Text>
              <Divider />

              {!activeCallSid && !isCalling ? (
                <BlockStack gap="400" align="center">
                  <div style={{ textAlign: 'center', padding: '40px 0' }}>
                    <div style={{ fontSize: 48, marginBottom: 12 }}>📞</div>
                    <Text as="p" variant="bodyMd" tone="subdued">No active call</Text>
                    <Text as="p" variant="bodySm" tone="subdued">
                      Fill in the form and click Make Call to initiate a test call.
                    </Text>
                  </div>
                </BlockStack>
              ) : isCalling ? (
                <BlockStack gap="300" align="center">
                  <div style={{ textAlign: 'center', padding: '40px 0' }}>
                    <div style={{ fontSize: 48, marginBottom: 12, animation: 'pulse 1s infinite' }}>📱</div>
                    <Text as="p" variant="bodyMd">Initiating call to {form.to}...</Text>
                  </div>
                </BlockStack>
              ) : (
                <Banner tone="success" title="Call initiated">
                  <BlockStack gap="200">
                    <Text as="p" variant="bodySm">Call SID: <strong>{activeCallSid}</strong></Text>
                    <Text as="p" variant="bodySm">The call has been placed to <strong>{form.to}</strong>.</Text>
                    <Text as="p" variant="bodySm" tone="subdued">
                      Check the Call History page to see the call status and transcript.
                    </Text>
                  </BlockStack>
                </Banner>
              )}
            </BlockStack>
          </Card>

          {/* Tips */}
          <Card>
            <BlockStack gap="300">
              <Text as="h3" variant="headingSm">Tips</Text>
              <Divider />
              <BlockStack gap="200">
                <Text as="p" variant="bodySm">• Make sure your virtual agent is <strong>activated</strong> before making a test call.</Text>
                <Text as="p" variant="bodySm">• Selecting a template will use that script during the call.</Text>
                <Text as="p" variant="bodySm">• The from number must be provisioned in your Jambonz account.</Text>
                <Text as="p" variant="bodySm">• Test calls are logged in the <strong>Call History</strong> page.</Text>
              </BlockStack>
            </BlockStack>
          </Card>
        </Layout.Section>
      </Layout>

      {toastMsg && <Toast content={toastMsg} error={toastError} onDismiss={() => setToastMsg('')} duration={4000} />}
    </Page>
  );
}
