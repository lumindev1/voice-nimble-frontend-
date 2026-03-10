import { useEffect, useState, useCallback } from 'react';
import {
  Page,
  Card,
  Text,
  BlockStack,
  InlineStack,
  Button,
  TextField,
  Badge,
  DataTable,
  Checkbox,
  Modal,
  FormLayout,
  Toast,
  EmptyState,
  Tag,
  SkeletonBodyText,
  Divider,
} from '@shopify/polaris';
import { contactsApi, Contact } from '../api/contacts.api';

export default function ContactsPage() {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [toastMsg, setToastMsg] = useState('');
  const [toastError, setToastError] = useState(false);
  const [allTags, setAllTags] = useState<string[]>([]);

  // Create/Edit modal
  const [showModal, setShowModal] = useState(false);
  const [editingContact, setEditingContact] = useState<Contact | null>(null);
  const [form, setForm] = useState({ name: '', phone: '', email: '', tags: '' });
  const [isSaving, setIsSaving] = useState(false);

  // Import modal
  const [showImport, setShowImport] = useState(false);
  const [csvText, setCsvText] = useState('');
  const [isImporting, setIsImporting] = useState(false);

  const load = useCallback(async () => {
    setIsLoading(true);
    try {
      const r = await contactsApi.getAll({ page, limit: 10, search: search || undefined });
      setContacts(r.data.contacts);
      setTotal(r.data.pagination.total);
    } catch {
      setToastMsg('Failed to load contacts');
      setToastError(true);
    } finally {
      setIsLoading(false);
    }
  }, [page, search]);

  useEffect(() => { load(); }, [load]);

  useEffect(() => {
    contactsApi.getTags().then((r) => setAllTags(r.data.tags)).catch(() => {});
  }, [contacts]);

  const openCreate = () => {
    setEditingContact(null);
    setForm({ name: '', phone: '', email: '', tags: '' });
    setShowModal(true);
  };

  const openEdit = (c: Contact) => {
    setEditingContact(c);
    setForm({ name: c.name, phone: c.phone, email: c.email || '', tags: c.tags.join(', ') });
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!form.name.trim() || !form.phone.trim()) {
      setToastMsg('Name and phone are required');
      setToastError(true);
      return;
    }
    setIsSaving(true);
    try {
      const tags = form.tags.split(',').map((t) => t.trim()).filter(Boolean);
      if (editingContact) {
        await contactsApi.update(editingContact._id, { ...form, tags });
        setToastMsg('Contact updated');
      } else {
        await contactsApi.create({ ...form, tags });
        setToastMsg('Contact created');
      }
      setToastError(false);
      setShowModal(false);
      load();
    } catch {
      setToastMsg('Failed to save contact');
      setToastError(true);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await contactsApi.delete(id);
      setToastMsg('Contact deleted');
      setToastError(false);
      load();
    } catch {
      setToastMsg('Failed to delete contact');
      setToastError(true);
    }
  };

  const handleBulkDelete = async () => {
    if (selectedIds.length === 0) return;
    try {
      await contactsApi.bulkDelete(selectedIds);
      setToastMsg(`${selectedIds.length} contact(s) deleted`);
      setToastError(false);
      setSelectedIds([]);
      load();
    } catch {
      setToastMsg('Bulk delete failed');
      setToastError(true);
    }
  };

  const handleImport = async () => {
    if (!csvText.trim()) return;
    setIsImporting(true);
    try {
      const lines = csvText.trim().split('\n').slice(1); // skip header
      const parsed = lines.map((line) => {
        const [name, phone, email, tags] = line.split(',').map((v) => v.trim());
        return { name, phone, email, tags: tags ? tags.split(';').map((t) => t.trim()) : [] };
      }).filter((c) => c.name && c.phone);

      const r = await contactsApi.import(parsed);
      setToastMsg(`${r.data.count} contacts imported`);
      setToastError(false);
      setShowImport(false);
      setCsvText('');
      load();
    } catch {
      setToastMsg('Import failed');
      setToastError(true);
    } finally {
      setIsImporting(false);
    }
  };

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );
  };

  const rows = contacts.map((c) => [
    <Checkbox key={`cb-${c._id}`} label="" labelHidden checked={selectedIds.includes(c._id)} onChange={() => toggleSelect(c._id)} />,
    <Text as="span" variant="bodyMd" fontWeight="semibold">{c.name}</Text>,
    c.phone,
    c.email || '—',
    <InlineStack gap="100" wrap>
      {c.tags.map((t) => <Tag key={t}>{t}</Tag>)}
    </InlineStack>,
    <InlineStack gap="200">
      <Button size="slim" onClick={() => openEdit(c)}>Edit</Button>
      <Button size="slim" tone="critical" onClick={() => handleDelete(c._id)}>Delete</Button>
    </InlineStack>,
  ]);

  return (
    <Page
      title="Contacts"
      subtitle="All your contacts from every segments, lists"
      primaryAction={{ content: '+ Create', onAction: openCreate }}
      secondaryActions={[{ content: 'Import', onAction: () => setShowImport(true) }]}
    >
      <BlockStack gap="500">
        {/* Tags */}
        {allTags.length > 0 && (
          <Card>
            <BlockStack gap="200">
              <Text as="p" variant="bodySm" tone="subdued">Filter by tag</Text>
              <InlineStack gap="200" wrap>
                {allTags.map((t) => <Tag key={t}>{t}</Tag>)}
              </InlineStack>
            </BlockStack>
          </Card>
        )}

        <Card>
          <BlockStack gap="400">
            <InlineStack gap="300" blockAlign="center">
              <div style={{ flex: 1 }}>
                <TextField
                  label=""
                  labelHidden
                  placeholder={`Search ${total} rows`}
                  value={search}
                  onChange={(v) => { setSearch(v); setPage(1); }}
                  autoComplete="off"
                />
              </div>
              {selectedIds.length > 0 && (
                <Button tone="critical" onClick={handleBulkDelete}>
                  Delete ({selectedIds.length})
                </Button>
              )}
            </InlineStack>
            <Divider />
            {isLoading ? (
              <SkeletonBodyText lines={5} />
            ) : contacts.length === 0 ? (
              <EmptyState heading="No contacts yet" image="">
                <p>Create your first contact or import from CSV.</p>
              </EmptyState>
            ) : (
              <DataTable
                columnContentTypes={['text', 'text', 'text', 'text', 'text', 'text']}
                headings={['', 'Name', 'Phone Number', 'Email', 'Tags', 'Action']}
                rows={rows}
                footerContent={`Showing ${contacts.length} of ${total} contacts`}
              />
            )}

            {/* Pagination */}
            {total > 10 && (
              <InlineStack gap="200" align="center">
                <Button disabled={page === 1} onClick={() => setPage((p) => p - 1)}>Previous</Button>
                <Text as="span" variant="bodySm">Page {page} of {Math.ceil(total / 10)}</Text>
                <Button disabled={page * 10 >= total} onClick={() => setPage((p) => p + 1)}>Next</Button>
              </InlineStack>
            )}
          </BlockStack>
        </Card>
      </BlockStack>

      {/* Create/Edit Modal */}
      <Modal
        open={showModal}
        onClose={() => setShowModal(false)}
        title={editingContact ? 'Edit Contact' : 'Create Contact'}
        primaryAction={{ content: 'Save', onAction: handleSave, loading: isSaving }}
        secondaryActions={[{ content: 'Cancel', onAction: () => setShowModal(false) }]}
      >
        <Modal.Section>
          <FormLayout>
            <TextField label="Name" value={form.name} onChange={(v) => setForm({ ...form, name: v })} autoComplete="off" />
            <TextField label="Phone Number" value={form.phone} onChange={(v) => setForm({ ...form, phone: v })} autoComplete="tel" />
            <TextField label="Email" value={form.email} onChange={(v) => setForm({ ...form, email: v })} autoComplete="email" />
            <TextField
              label="Tags (comma separated)"
              value={form.tags}
              onChange={(v) => setForm({ ...form, tags: v })}
              placeholder="e.g. VIP, New, Dhaka"
              autoComplete="off"
              helpText="Separate tags with commas"
            />
          </FormLayout>
        </Modal.Section>
      </Modal>

      {/* Import Modal */}
      <Modal
        open={showImport}
        onClose={() => setShowImport(false)}
        title="Import Contacts from CSV"
        primaryAction={{ content: 'Import', onAction: handleImport, loading: isImporting }}
        secondaryActions={[{ content: 'Cancel', onAction: () => setShowImport(false) }]}
      >
        <Modal.Section>
          <BlockStack gap="300">
            <Text as="p" variant="bodySm" tone="subdued">
              Paste CSV data with header: name,phone,email,tags (tags separated by semicolons)
            </Text>
            <Text as="p" variant="bodyMd" tone="caution">
              Example: John Doe,+8801234567890,john@gmail.com,New;VIP
            </Text>
            <TextField
              label="CSV Data"
              value={csvText}
              onChange={setCsvText}
              multiline={8}
              autoComplete="off"
              placeholder="name,phone,email,tags&#10;John Doe,+8801234567890,john@gmail.com,New;VIP"
            />
          </BlockStack>
        </Modal.Section>
      </Modal>

      {toastMsg && <Toast content={toastMsg} error={toastError} onDismiss={() => setToastMsg('')} duration={3000} />}
    </Page>
  );
}
