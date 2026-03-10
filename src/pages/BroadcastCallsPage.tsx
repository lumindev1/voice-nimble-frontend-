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
  DataTable,
  SkeletonBodyText,
  Divider,
} from '@shopify/polaris';
import { broadcastApi, Broadcast } from '../api/broadcast.api';
import { templatesApi, CallTemplate } from '../api/templates.api';
import { contactsApi } from '../api/contacts.api';
import { agentApi, AgentConfig } from '../api/agent.api';
import dayjs from 'dayjs';

const STATUS_TONES: Record<Broadcast['status'], 'info' | 'success' | 'critical' | 'warning' | 'attention'> = {
  pending: 'attention',
  running: 'info',
  completed: 'success',
  failed: 'critical',
  cancelled: 'warning',
};

export default function BroadcastCallsPage() {
  const [broadcasts, setBroadcasts] = useState<Broadcast[]>([]);
  const [total, setTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [toastMsg, setToastMsg] = useState('');
  const [toastError, setToastError] = useState(false);
  const [templates, setTemplates] = useState<CallTemplate[]>([]);
  const [agents, setAgents] = useState<AgentConfig[]>([]);
  const [allTags, setAllTags] = useState<string[]>([]);

  // Create modal
  const [showModal, setShowModal] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [form, setForm] = useState({
    title: '',
    templateId: '',
    agentId: '',
    tags: '',
    scheduledAt: '',
    timezone: 'Asia/Dhaka',
  });

  const load = useCallback(async () => {
    setIsLoading(true);
    try {
      const r = await broadcastApi.getAll({ limit: 20 });
      setBroadcasts(r.data.broadcasts);
      setTotal(r.data.pagination.total);
    } catch {
      setToastMsg('Failed to load broadcasts');
      setToastError(true);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
    templatesApi.getAll().then((r) => setTemplates(r.data.templates)).catch(() => {});
    agentApi.getAll().then((r) => setAgents(r.data.agents)).catch(() => {});
    contactsApi.getTags().then((r) => setAllTags(r.data.tags)).catch(() => {});
  }, [load]);

  const handleCreate = async () => {
    if (!form.title.trim() || !form.templateId) {
      setToastMsg('Title and template are required');
      setToastError(true);
      return;
    }
    setIsSaving(true);
    try {
      const tags = form.tags.split(',').map((t) => t.trim()).filter(Boolean);
      await broadcastApi.create({
        title: form.title,
        templateId: form.templateId,
        agentId: form.agentId || undefined,
        tags,
        scheduledAt: form.scheduledAt || undefined,
        timezone: form.timezone,
      });
      setToastMsg('Broadcast campaign created');
      setToastError(false);
      setShowModal(false);
      setForm({ title: '', templateId: '', agentId: '', tags: '', scheduledAt: '', timezone: 'Asia/Dhaka' });
      load();
    } catch {
      setToastMsg('Failed to create broadcast');
      setToastError(true);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await broadcastApi.delete(id);
      setToastMsg('Broadcast deleted');
      setToastError(false);
      load();
    } catch {
      setToastMsg('Failed to delete broadcast');
      setToastError(true);
    }
  };

  const handleCancel = async (id: string) => {
    try {
      await broadcastApi.cancel(id);
      setToastMsg('Broadcast cancelled');
      setToastError(false);
      load();
    } catch {
      setToastMsg('Failed to cancel broadcast');
      setToastError(true);
    }
  };

  const getTemplateName = (t: Broadcast['templateId']) =>
    typeof t === 'object' && t !== null ? (t as { name: string }).name : String(t);

  const rows = broadcasts.map((b) => [
    <Text as="span" variant="bodySm" tone="subdued">
      {b.scheduledAt
        ? dayjs(b.scheduledAt).format('YYYY-MM-DD HH:mm')
        : dayjs(b.createdAt).format('YYYY-MM-DD HH:mm')}
    </Text>,
    <Text as="span" variant="bodyMd" fontWeight="semibold">{b.title}</Text>,
    b.totalContacts.toString(),
    b.tags.join(', ') || '—',
    getTemplateName(b.templateId),
    <Badge tone={STATUS_TONES[b.status]}>{b.status.toUpperCase()}</Badge>,
    b.timezone,
    <InlineStack gap="200">
      {(b.status === 'pending' || b.status === 'running') && (
        <Button size="slim" tone="critical" onClick={() => handleCancel(b._id)}>Cancel</Button>
      )}
      <Button size="slim" onClick={() => handleDelete(b._id)}>Delete</Button>
    </InlineStack>,
  ]);

  const TIMEZONES = [
    'UTC', 'Asia/Dhaka', 'Asia/Kolkata', 'Asia/Karachi', 'Asia/Dubai',
    'America/New_York', 'America/Los_Angeles', 'Europe/London', 'Europe/Paris',
    'Africa/Accra', 'Africa/Asmara',
  ];

  return (
    <Page
      title="Broadcast Calls"
      subtitle="Schedule and automate bulk promotional calls"
      primaryAction={{ content: 'Create Broadcast Campaign', onAction: () => setShowModal(true) }}
    >
      <BlockStack gap="500">
        {/* Statistics filter row */}
        <Card>
          <BlockStack gap="300">
            <Text as="h3" variant="headingSm">Statistics</Text>
            <InlineStack gap="300">
              <div style={{ flex: 1 }}>
                <Select label="Template Title" options={[{ label: 'Template Title', value: '' }, ...templates.map((t) => ({ label: t.name, value: t._id }))]} value="" onChange={() => {}} />
              </div>
              <div style={{ flex: 1 }}>
                <Select label="Status" options={[{ label: 'Select Status', value: '' }, ...['pending', 'running', 'completed', 'failed', 'cancelled'].map((s) => ({ label: s.charAt(0).toUpperCase() + s.slice(1), value: s }))]} value="" onChange={() => {}} />
              </div>
            </InlineStack>
          </BlockStack>
        </Card>

        <Card>
          <BlockStack gap="400">
            {isLoading ? (
              <SkeletonBodyText lines={5} />
            ) : broadcasts.length === 0 ? (
              <EmptyState heading="No broadcast campaigns yet" image="">
                <p>Create your first broadcast to start sending bulk calls to contacts.</p>
              </EmptyState>
            ) : (
              <DataTable
                columnContentTypes={['text', 'text', 'text', 'text', 'text', 'text', 'text', 'text']}
                headings={['Scheduled At', 'Title', 'Contacts', 'Tags', 'Call Template', 'Status', 'Time Zone', 'Actions']}
                rows={rows}
                footerContent={`${total} campaign(s)`}
              />
            )}
          </BlockStack>
        </Card>
      </BlockStack>

      {/* Create Modal */}
      <Modal
        open={showModal}
        onClose={() => setShowModal(false)}
        title="Create Broadcast Campaign"
        primaryAction={{ content: 'Create', onAction: handleCreate, loading: isSaving }}
        secondaryActions={[{ content: 'Cancel', onAction: () => setShowModal(false) }]}
        size="large"
      >
        <Modal.Section>
          <FormLayout>
            <TextField
              label="Campaign Title"
              value={form.title}
              onChange={(v) => setForm({ ...form, title: v })}
              autoComplete="off"
              placeholder="e.g. Flash Sale Promotion"
            />
            <Select
              label="Call Template"
              options={[{ label: 'Select Template', value: '' }, ...templates.map((t) => ({ label: t.name, value: t._id }))]}
              value={form.templateId}
              onChange={(v) => setForm({ ...form, templateId: v })}
            />
            <Select
              label="Virtual Agent (optional)"
              options={[{ label: 'No Agent', value: '' }, ...agents.map((a) => ({ label: `${a.agentName} (${a.callType})`, value: a._id }))]}
              value={form.agentId}
              onChange={(v) => setForm({ ...form, agentId: v })}
            />
            <Divider />
            <TextField
              label="Filter by Tags (comma separated)"
              value={form.tags}
              onChange={(v) => setForm({ ...form, tags: v })}
              autoComplete="off"
              placeholder={allTags.slice(0, 3).join(', ')}
              helpText="Contacts with these tags will be called. Leave empty to select contacts manually."
            />
            <Divider />
            <TextField
              label="Scheduled Date & Time (optional)"
              type="datetime-local"
              value={form.scheduledAt}
              onChange={(v) => setForm({ ...form, scheduledAt: v })}
              autoComplete="off"
              helpText="Leave empty to start immediately"
            />
            <Select
              label="Timezone"
              options={TIMEZONES.map((tz) => ({ label: tz, value: tz }))}
              value={form.timezone}
              onChange={(v) => setForm({ ...form, timezone: v })}
            />
          </FormLayout>
        </Modal.Section>
      </Modal>

      {toastMsg && <Toast content={toastMsg} error={toastError} onDismiss={() => setToastMsg('')} duration={3000} />}
    </Page>
  );
}
