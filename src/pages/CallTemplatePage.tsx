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
import { templatesApi, CallTemplate } from '../api/templates.api';

export default function CallTemplatePage() {
  const [templates, setTemplates] = useState<CallTemplate[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [toastMsg, setToastMsg] = useState('');
  const [toastError, setToastError] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<CallTemplate | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [form, setForm] = useState({
    name: '',
    type: 'ai' as 'static' | 'ai',
    aiContentType: 'text' as 'text' | 'audio',
    text: '',
    audioUrl: '',
  });

  const load = useCallback(async () => {
    setIsLoading(true);
    try {
      const r = await templatesApi.getAll();
      setTemplates(r.data.templates);
    } catch {
      setToastMsg('Failed to load templates');
      setToastError(true);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const openCreate = () => {
    setEditingTemplate(null);
    setForm({ name: '', type: 'ai', aiContentType: 'text', text: '', audioUrl: '' });
    setShowModal(true);
  };

  const openEdit = (t: CallTemplate) => {
    setEditingTemplate(t);
    setForm({
      name: t.name,
      type: t.type,
      aiContentType: t.aiContentType || 'text',
      text: t.text || '',
      audioUrl: t.audioUrl || '',
    });
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!form.name.trim()) {
      setToastMsg('Template name is required');
      setToastError(true);
      return;
    }
    setIsSaving(true);
    try {
      const payload = {
        name: form.name,
        type: form.type,
        aiContentType: form.type === 'ai' ? form.aiContentType : undefined,
        text: form.type === 'static' ? form.text : (form.aiContentType === 'text' ? form.text : undefined),
        audioUrl: form.type === 'static' ? form.audioUrl : (form.aiContentType === 'audio' ? form.audioUrl : undefined),
      };
      if (editingTemplate) {
        await templatesApi.update(editingTemplate._id, payload);
        setToastMsg('Template updated');
      } else {
        await templatesApi.create(payload as Parameters<typeof templatesApi.create>[0]);
        setToastMsg('Template created');
      }
      setToastError(false);
      setShowModal(false);
      load();
    } catch {
      setToastMsg('Failed to save template');
      setToastError(true);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await templatesApi.delete(id);
      setToastMsg('Template deleted');
      setToastError(false);
      load();
    } catch {
      setToastMsg('Failed to delete template');
      setToastError(true);
    }
  };

  const rows = templates.map((t) => [
    <Text as="span" variant="bodyMd" fontWeight="semibold">{t.name}</Text>,
    <Badge tone={t.type === 'ai' ? 'info' : 'success'}>{t.type.toUpperCase()}</Badge>,
    t.type === 'ai' ? (t.aiContentType || 'text').toUpperCase() : 'AUDIO/TTS',
    <Text as="span" variant="bodySm" tone="subdued">
      {t.text ? t.text.slice(0, 60) + (t.text.length > 60 ? '...' : '') : t.audioUrl ? 'Audio file' : '—'}
    </Text>,
    <InlineStack gap="200">
      <Button size="slim" onClick={() => openEdit(t)}>Edit</Button>
      <Button size="slim" tone="critical" onClick={() => handleDelete(t._id)}>Delete</Button>
    </InlineStack>,
  ]);

  return (
    <Page
      title="Call Template"
      subtitle="Pre-set call scripts for quick and consistent messaging"
      primaryAction={{ content: 'Add New Template', onAction: openCreate }}
    >
      <BlockStack gap="500">
        <Card>
          <BlockStack gap="400">
            {isLoading ? (
              <SkeletonBodyText lines={5} />
            ) : templates.length === 0 ? (
              <EmptyState heading="No templates yet" image="">
                <p>Create your first call template to use in campaigns and broadcasts.</p>
              </EmptyState>
            ) : (
              <DataTable
                columnContentTypes={['text', 'text', 'text', 'text', 'text']}
                headings={['Template Name', 'Type', 'Content Type', 'Preview', 'Actions']}
                rows={rows}
                footerContent={`${templates.length} template(s)`}
              />
            )}
          </BlockStack>
        </Card>
      </BlockStack>

      <Modal
        open={showModal}
        onClose={() => setShowModal(false)}
        title={editingTemplate ? 'Edit Template' : 'Add New Template'}
        primaryAction={{ content: 'Save', onAction: handleSave, loading: isSaving }}
        secondaryActions={[{ content: 'Cancel', onAction: () => setShowModal(false) }]}
        size="large"
      >
        <Modal.Section>
          <FormLayout>
            <TextField
              label="Template Name"
              value={form.name}
              onChange={(v) => setForm({ ...form, name: v })}
              placeholder="e.g. new_campaign"
              autoComplete="off"
            />
            <Divider />
            <Text as="h3" variant="headingSm">Content</Text>
            <Select
              label="Type"
              options={[
                { label: 'AI (Conversational)', value: 'ai' },
                { label: 'Static (Pre-recorded / TTS)', value: 'static' },
              ]}
              value={form.type}
              onChange={(v) => setForm({ ...form, type: v as 'static' | 'ai' })}
            />

            {form.type === 'ai' && (
              <Select
                label="AI Type"
                options={[
                  { label: 'Text (AI generates speech)', value: 'text' },
                  { label: 'Audio (Pre-recorded)', value: 'audio' },
                ]}
                value={form.aiContentType}
                onChange={(v) => setForm({ ...form, aiContentType: v as 'text' | 'audio' })}
              />
            )}

            {(form.type === 'ai' && form.aiContentType === 'text') || form.type === 'static' ? (
              <TextField
                label="Script / Prompt Text"
                value={form.text}
                onChange={(v) => setForm({ ...form, text: v })}
                multiline={6}
                autoComplete="off"
                placeholder={
                  form.type === 'ai'
                    ? 'Hello! This is an AI agent. How can I help you today?'
                    : 'Hello! This is a message from [Business]. We have exciting news for you...'
                }
                helpText={form.type === 'ai' ? 'This is the initial prompt or greeting the AI will use.' : 'This text will be converted to speech (TTS).'}
              />
            ) : (
              <TextField
                label="Audio File URL"
                value={form.audioUrl}
                onChange={(v) => setForm({ ...form, audioUrl: v })}
                autoComplete="off"
                placeholder="https://example.com/audio.mp3"
                helpText="Publicly accessible MP3 or WAV file URL"
              />
            )}
          </FormLayout>
        </Modal.Section>
      </Modal>

      {toastMsg && <Toast content={toastMsg} error={toastError} onDismiss={() => setToastMsg('')} duration={3000} />}
    </Page>
  );
}
