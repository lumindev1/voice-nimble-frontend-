import { useEffect, useState, useCallback } from 'react';
import {
  Page,
  Card,
  Text,
  BlockStack,
  InlineStack,
  Button,
  TextField,
  Modal,
  FormLayout,
  Toast,
  EmptyState,
  Badge,
  Select,
  SkeletonBodyText,
  Divider,
  List,
} from '@shopify/polaris';
import { knowledgeBaseApi, KnowledgeBase, KBDocument } from '../api/knowledge-base.api';
import dayjs from 'dayjs';

export default function KnowledgeBasePage() {
  const [knowledgeBases, setKnowledgeBases] = useState<KnowledgeBase[]>([]);
  const [selectedKB, setSelectedKB] = useState<KnowledgeBase | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [toastMsg, setToastMsg] = useState('');
  const [toastError, setToastError] = useState(false);

  // KB create modal
  const [showKBModal, setShowKBModal] = useState(false);
  const [kbName, setKbName] = useState('');
  const [isSavingKB, setIsSavingKB] = useState(false);

  // Doc add modal
  const [showDocModal, setShowDocModal] = useState(false);
  const [docForm, setDocForm] = useState({
    title: '',
    sourceType: 'text' as 'pdf' | 'text' | 'url',
    content: '',
    fileUrl: '',
    sourceUrl: '',
  });
  const [isSavingDoc, setIsSavingDoc] = useState(false);

  const load = useCallback(async () => {
    setIsLoading(true);
    try {
      const r = await knowledgeBaseApi.getAll();
      setKnowledgeBases(r.data.knowledgeBases);
      if (r.data.knowledgeBases.length > 0 && !selectedKB) {
        setSelectedKB(r.data.knowledgeBases[0]);
      } else if (selectedKB) {
        const updated = r.data.knowledgeBases.find((kb) => kb._id === selectedKB._id);
        setSelectedKB(updated || r.data.knowledgeBases[0] || null);
      }
    } catch {
      setToastMsg('Failed to load knowledge bases');
      setToastError(true);
    } finally {
      setIsLoading(false);
    }
  }, [selectedKB?._id]);

  useEffect(() => { load(); }, []);

  const handleCreateKB = async () => {
    if (!kbName.trim()) return;
    setIsSavingKB(true);
    try {
      const r = await knowledgeBaseApi.create(kbName);
      setToastMsg('Knowledge base created');
      setToastError(false);
      setShowKBModal(false);
      setKbName('');
      setSelectedKB(r.data.knowledgeBase);
      load();
    } catch {
      setToastMsg('Failed to create knowledge base');
      setToastError(true);
    } finally {
      setIsSavingKB(false);
    }
  };

  const handleDeleteKB = async (id: string) => {
    try {
      await knowledgeBaseApi.delete(id);
      setToastMsg('Knowledge base deleted');
      setToastError(false);
      setSelectedKB(null);
      load();
    } catch {
      setToastMsg('Failed to delete knowledge base');
      setToastError(true);
    }
  };

  const handleAddDocument = async () => {
    if (!selectedKB || !docForm.title.trim()) return;
    setIsSavingDoc(true);
    try {
      const payload = {
        title: docForm.title,
        sourceType: docForm.sourceType,
        content: docForm.sourceType === 'text' ? docForm.content : undefined,
        fileUrl: docForm.sourceType === 'pdf' ? docForm.fileUrl : undefined,
        sourceUrl: docForm.sourceType === 'url' ? docForm.sourceUrl : undefined,
      };
      await knowledgeBaseApi.addDocument(selectedKB._id, payload);
      setToastMsg('Document added');
      setToastError(false);
      setShowDocModal(false);
      setDocForm({ title: '', sourceType: 'text', content: '', fileUrl: '', sourceUrl: '' });
      load();
    } catch {
      setToastMsg('Failed to add document');
      setToastError(true);
    } finally {
      setIsSavingDoc(false);
    }
  };

  const handleDeleteDocument = async (docId: string) => {
    if (!selectedKB) return;
    try {
      await knowledgeBaseApi.deleteDocument(selectedKB._id, docId);
      setToastMsg('Document deleted');
      setToastError(false);
      load();
    } catch {
      setToastMsg('Failed to delete document');
      setToastError(true);
    }
  };

  const sourceTypeLabel = (t: KBDocument['sourceType']) => ({ pdf: 'PDF File', text: 'Text Document', url: 'URL' }[t]);

  return (
    <Page
      title="Knowledge Base"
      subtitle="Store and manage key business information for AI calls"
      primaryAction={{ content: '+ New', onAction: () => setShowKBModal(true) }}
    >
      <BlockStack gap="500">
        {isLoading ? (
          <Card><SkeletonBodyText lines={8} /></Card>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: '260px 1fr', gap: 16 }}>
            {/* Left: KB list */}
            <Card>
              <BlockStack gap="300">
                <Text as="h3" variant="headingSm">Knowledge Bases</Text>
                <Divider />
                {knowledgeBases.length === 0 ? (
                  <Text as="p" variant="bodySm" tone="subdued">No knowledge bases yet.</Text>
                ) : (
                  <List>
                    {knowledgeBases.map((kb) => (
                      <List.Item key={kb._id}>
                        <div
                          style={{
                            padding: '8px 12px',
                            borderRadius: 6,
                            cursor: 'pointer',
                            background: selectedKB?._id === kb._id ? '#f1f5f9' : 'transparent',
                            fontWeight: selectedKB?._id === kb._id ? 600 : 400,
                          }}
                          onClick={() => setSelectedKB(kb)}
                        >
                          {kb.name}
                        </div>
                      </List.Item>
                    ))}
                  </List>
                )}
              </BlockStack>
            </Card>

            {/* Right: Documents */}
            <Card>
              {!selectedKB ? (
                <EmptyState heading="Select a knowledge base" image="">
                  <p>Choose from the left or create a new knowledge base.</p>
                </EmptyState>
              ) : (
                <BlockStack gap="400">
                  <InlineStack align="space-between" blockAlign="center">
                    <Text as="h2" variant="headingMd">{selectedKB.name}</Text>
                    <InlineStack gap="200">
                      <Button
                        size="slim"
                        onClick={() => setShowDocModal(true)}
                      >
                        + Add Document
                      </Button>
                      <Button size="slim" tone="critical" onClick={() => handleDeleteKB(selectedKB._id)}>
                        Delete KB
                      </Button>
                    </InlineStack>
                  </InlineStack>
                  <Divider />

                  {selectedKB.documents.length === 0 ? (
                    <EmptyState heading="No documents" image="">
                      <p>Add documents via PDF upload, blank text, or URL.</p>
                    </EmptyState>
                  ) : (
                    <BlockStack gap="300">
                      {selectedKB.documents.map((doc) => (
                        <Card key={doc._id} padding="300">
                          <InlineStack align="space-between" blockAlign="center">
                            <InlineStack gap="300" blockAlign="center">
                              <Text as="span" variant="bodyMd" fontWeight="semibold">{doc.title}</Text>
                              <Badge>{sourceTypeLabel(doc.sourceType)}</Badge>
                              <Text as="span" variant="bodySm" tone="subdued">
                                {dayjs(doc.createdAt).format('MMM DD, YYYY')}
                              </Text>
                            </InlineStack>
                            <Button size="slim" tone="critical" onClick={() => handleDeleteDocument(doc._id!)}>
                              Delete
                            </Button>
                          </InlineStack>
                          {doc.content && (
                            <Text as="p" variant="bodySm" tone="subdued">
                              {doc.content.slice(0, 120)}{doc.content.length > 120 ? '...' : ''}
                            </Text>
                          )}
                          {doc.sourceUrl && (
                            <Text as="p" variant="bodySm" tone="subdued">{doc.sourceUrl}</Text>
                          )}
                        </Card>
                      ))}
                    </BlockStack>
                  )}
                </BlockStack>
              )}
            </Card>
          </div>
        )}
      </BlockStack>

      {/* Create KB Modal */}
      <Modal
        open={showKBModal}
        onClose={() => setShowKBModal(false)}
        title="New Knowledge Base"
        primaryAction={{ content: 'Create', onAction: handleCreateKB, loading: isSavingKB }}
        secondaryActions={[{ content: 'Cancel', onAction: () => setShowKBModal(false) }]}
      >
        <Modal.Section>
          <TextField label="Knowledge Base Name" value={kbName} onChange={setKbName} autoComplete="off" />
        </Modal.Section>
      </Modal>

      {/* Add Document Modal */}
      <Modal
        open={showDocModal}
        onClose={() => setShowDocModal(false)}
        title="Add Document"
        primaryAction={{ content: 'Add', onAction: handleAddDocument, loading: isSavingDoc }}
        secondaryActions={[{ content: 'Cancel', onAction: () => setShowDocModal(false) }]}
        large
      >
        <Modal.Section>
          <FormLayout>
            <TextField label="Document Title" value={docForm.title} onChange={(v) => setDocForm({ ...docForm, title: v })} autoComplete="off" />
            <Select
              label="Source Type"
              options={[
                { label: 'Blank Document (Manual Text)', value: 'text' },
                { label: 'PDF File URL', value: 'pdf' },
                { label: 'Paste from URL', value: 'url' },
              ]}
              value={docForm.sourceType}
              onChange={(v) => setDocForm({ ...docForm, sourceType: v as 'pdf' | 'text' | 'url' })}
            />

            {docForm.sourceType === 'text' && (
              <TextField
                label="Content"
                value={docForm.content}
                onChange={(v) => setDocForm({ ...docForm, content: v })}
                multiline={8}
                autoComplete="off"
                placeholder="Enter the knowledge content here..."
              />
            )}
            {docForm.sourceType === 'pdf' && (
              <TextField
                label="PDF File URL"
                value={docForm.fileUrl}
                onChange={(v) => setDocForm({ ...docForm, fileUrl: v })}
                autoComplete="off"
                placeholder="https://example.com/document.pdf"
                helpText="Directly upload your file with the required information."
              />
            )}
            {docForm.sourceType === 'url' && (
              <TextField
                label="URL"
                value={docForm.sourceUrl}
                onChange={(v) => setDocForm({ ...docForm, sourceUrl: v })}
                autoComplete="off"
                placeholder="https://example.com/page"
                helpText="Scan information from a URL link."
              />
            )}
          </FormLayout>
        </Modal.Section>
      </Modal>

      {toastMsg && <Toast content={toastMsg} error={toastError} onDismiss={() => setToastMsg('')} duration={3000} />}
    </Page>
  );
}
