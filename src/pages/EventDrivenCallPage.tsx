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
import { eventDrivenApi, EventDrivenConfig, TriggerEvent } from '../api/event-driven.api';
import { templatesApi, CallTemplate } from '../api/templates.api';
import { agentApi, AgentConfig } from '../api/agent.api';

const TRIGGER_LABELS: Record<TriggerEvent, string> = {
  order_placed: 'Order Placed',
  order_fulfilled: 'Order Fulfilled',
  order_cancelled: 'Order Cancelled',
  payment_received: 'Payment Received',
  custom_webhook: 'Custom Webhook',
};

export default function EventDrivenCallPage() {
  const [configs, setConfigs] = useState<EventDrivenConfig[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [toastMsg, setToastMsg] = useState('');
  const [toastError, setToastError] = useState(false);
  const [templates, setTemplates] = useState<CallTemplate[]>([]);
  const [agents, setAgents] = useState<AgentConfig[]>([]);

  const [showModal, setShowModal] = useState(false);
  const [editingConfig, setEditingConfig] = useState<EventDrivenConfig | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [form, setForm] = useState({
    name: '',
    triggerEvent: 'order_placed' as TriggerEvent,
    templateId: '',
    agentId: '',
    fromNumber: '',
  });

  const load = useCallback(async () => {
    setIsLoading(true);
    try {
      const r = await eventDrivenApi.getAll();
      setConfigs(r.data.configs);
    } catch {
      setToastMsg('Failed to load event-driven configs');
      setToastError(true);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
    templatesApi.getAll().then((r) => setTemplates(r.data.templates)).catch(() => {});
    agentApi.getAll().then((r) => setAgents(r.data.agents)).catch(() => {});
  }, [load]);

  const openCreate = () => {
    setEditingConfig(null);
    setForm({ name: '', triggerEvent: 'order_placed', templateId: '', agentId: '', fromNumber: '' });
    setShowModal(true);
  };

  const openEdit = (c: EventDrivenConfig) => {
    setEditingConfig(c);
    const tId = typeof c.templateId === 'object' ? (c.templateId as { _id: string })._id : c.templateId || '';
    const aId = typeof c.agentId === 'object' ? (c.agentId as { _id: string })?._id : c.agentId || '';
    setForm({
      name: c.name,
      triggerEvent: c.triggerEvent,
      templateId: tId,
      agentId: aId,
      fromNumber: c.fromNumber || '',
    });
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!form.name.trim() || !form.triggerEvent || !form.templateId) {
      setToastMsg('Name, trigger event, and template are required');
      setToastError(true);
      return;
    }
    setIsSaving(true);
    try {
      const payload = {
        name: form.name,
        triggerEvent: form.triggerEvent,
        templateId: form.templateId,
        agentId: form.agentId || undefined,
        fromNumber: form.fromNumber || undefined,
      };
      if (editingConfig) {
        await eventDrivenApi.update(editingConfig._id, payload);
        setToastMsg('Config updated');
      } else {
        await eventDrivenApi.create(payload);
        setToastMsg('Event-driven call created');
      }
      setToastError(false);
      setShowModal(false);
      load();
    } catch {
      setToastMsg('Failed to save');
      setToastError(true);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await eventDrivenApi.delete(id);
      setToastMsg('Config deleted');
      setToastError(false);
      load();
    } catch {
      setToastMsg('Failed to delete');
      setToastError(true);
    }
  };

  const handleToggle = async (id: string) => {
    try {
      await eventDrivenApi.toggle(id);
      load();
    } catch {
      setToastMsg('Failed to toggle');
      setToastError(true);
    }
  };

  const getTemplateName = (t: EventDrivenConfig['templateId']) =>
    typeof t === 'object' && t ? (t as { name: string }).name : String(t);

  const getAgentName = (a: EventDrivenConfig['agentId']) =>
    typeof a === 'object' && a ? (a as { agentName: string }).agentName : (a ? String(a) : '—');

  const rows = configs.map((c) => [
    <Text as="span" variant="bodyMd" fontWeight="semibold">{c.name}</Text>,
    TRIGGER_LABELS[c.triggerEvent] || c.triggerEvent,
    getTemplateName(c.templateId),
    getAgentName(c.agentId),
    c.callCount.toString(),
    <Badge tone={c.isActive ? 'success' : 'critical'}>{c.isActive ? 'ACTIVE' : 'INACTIVE'}</Badge>,
    <InlineStack gap="200">
      <Button size="slim" onClick={() => handleToggle(c._id)}>
        {c.isActive ? 'Disable' : 'Enable'}
      </Button>
      <Button size="slim" onClick={() => openEdit(c)}>Edit</Button>
      <Button size="slim" tone="critical" onClick={() => handleDelete(c._id)}>Delete</Button>
    </InlineStack>,
  ]);

  return (
    <Page
      title="Event-Driven Call"
      subtitle="Automate calls triggered by customer actions"
      primaryAction={{ content: '+ Create', onAction: openCreate }}
    >
      <BlockStack gap="500">
        <Card>
          <BlockStack gap="400">
            {isLoading ? (
              <SkeletonBodyText lines={5} />
            ) : configs.length === 0 ? (
              <EmptyState heading="No event-driven calls yet" image="">
                <p>Automate calls when orders are placed, fulfilled, or payments received.</p>
              </EmptyState>
            ) : (
              <DataTable
                columnContentTypes={['text', 'text', 'text', 'text', 'text', 'text', 'text']}
                headings={['Name', 'Trigger Event', 'Template', 'Agent', 'Total Calls', 'Status', 'Actions']}
                rows={rows}
                footerContent={`${configs.length} config(s)`}
              />
            )}
          </BlockStack>
        </Card>
      </BlockStack>

      <Modal
        open={showModal}
        onClose={() => setShowModal(false)}
        title={editingConfig ? 'Edit Event-Driven Call' : 'Create Event-Driven Call'}
        primaryAction={{ content: 'Save', onAction: handleSave, loading: isSaving }}
        secondaryActions={[{ content: 'Cancel', onAction: () => setShowModal(false) }]}
      >
        <Modal.Section>
          <FormLayout>
            <TextField
              label="Configuration Name"
              value={form.name}
              onChange={(v) => setForm({ ...form, name: v })}
              autoComplete="off"
              placeholder="e.g. Order Confirmation Call"
            />
            <Select
              label="Trigger Event"
              options={Object.entries(TRIGGER_LABELS).map(([v, l]) => ({ label: l, value: v }))}
              value={form.triggerEvent}
              onChange={(v) => setForm({ ...form, triggerEvent: v as TriggerEvent })}
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
              label="From Number (optional)"
              value={form.fromNumber}
              onChange={(v) => setForm({ ...form, fromNumber: v })}
              autoComplete="tel"
              placeholder="+8809649364251"
              helpText="Leave empty to use the agent's default number"
            />
          </FormLayout>
        </Modal.Section>
      </Modal>

      {toastMsg && <Toast content={toastMsg} error={toastError} onDismiss={() => setToastMsg('')} duration={3000} />}
    </Page>
  );
}
