import { useEffect, useState, useCallback } from 'react';
import {
  Page,
  Card,
  DataTable,
  Badge,
  Button,
  Modal,
  BlockStack,
  Text,
  InlineStack,
  Select,
  Pagination,
  EmptyState,
  Divider,
} from '@shopify/polaris';
import dayjs from 'dayjs';
import { callsApi, Call, Transcript, Pagination as PaginationData } from '../api/calls.api';

function formatDuration(seconds: number): string {
  if (!seconds) return '0s';
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return m > 0 ? `${m}m ${s}s` : `${s}s`;
}

function SentimentBadge({ sentiment }: { sentiment: string }) {
  const toneMap: Record<string, 'success' | 'critical' | 'info' | 'attention'> = {
    positive: 'success',
    negative: 'critical',
    neutral: 'info',
    unknown: 'attention',
  };
  return <Badge tone={toneMap[sentiment] || 'attention'}>{sentiment}</Badge>;
}

function StatusBadge({ status }: { status: string }) {
  const toneMap: Record<string, 'success' | 'critical' | 'info' | 'warning'> = {
    completed: 'success',
    failed: 'critical',
    busy: 'critical',
    canceled: 'critical',
    'no-answer': 'warning',
    'in-progress': 'info',
    transferred: 'info',
  };
  const labelMap: Record<string, string> = {
    busy: 'Declined',
    canceled: 'Canceled',
    'no-answer': 'No Answer',
    'in-progress': 'In Progress',
  };
  return <Badge tone={toneMap[status] || 'info'}>{labelMap[status] || status}</Badge>;
}

export default function CallsPage() {
  const [calls, setCalls] = useState<Call[]>([]);
  const [pagination, setPagination] = useState<PaginationData>({ page: 1, limit: 20, total: 0, pages: 1 });
  const [isLoading, setIsLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [selectedCall, setSelectedCall] = useState<Call | null>(null);
  const [transcript, setTranscript] = useState<Transcript | null>(null);
  const [transcriptLoading, setTranscriptLoading] = useState(false);

  const loadCalls = useCallback(async (page = 1) => {
    setIsLoading(true);
    try {
      const res = await callsApi.list(page, 20, statusFilter || undefined);
      setCalls(res.data.calls);
      setPagination(res.data.pagination);
    } finally {
      setIsLoading(false);
    }
  }, [statusFilter]);

  useEffect(() => { loadCalls(1); }, [loadCalls]);

  const openCallDetail = async (call: Call) => {
    setSelectedCall(call);
    setTranscript(null);
    if (call.hasTranscript) {
      setTranscriptLoading(true);
      try {
        const res = await callsApi.getTranscript(call._id);
        setTranscript(res.data.transcript);
      } finally {
        setTranscriptLoading(false);
      }
    }
  };

  const rows = calls.map((call) => [
    dayjs(call.createdAt).format('MMM D, YYYY h:mm A'),
    <InlineStack key={call._id} gap="200" blockAlign="center">
      <div style={{
        width: 24,
        height: 24,
        borderRadius: '50%',
        background: call.direction === 'outbound' ? '#eef2ff' : '#ecfdf5',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: 11,
      }}>
        {call.direction === 'outbound' ? '↗' : '↙'}
      </div>
      <Text as="span" variant="bodyMd">
        {call.direction === 'outbound' ? call.calledNumber : call.callerNumber}
      </Text>
    </InlineStack>,
    <StatusBadge key={`${call._id}-st`} status={call.status} />,
    formatDuration(call.duration),
    <SentimentBadge key={`${call._id}-s`} sentiment={call.sentiment} />,
    call.intentDetected || '—',
    <InlineStack key={`${call._id}-a`} gap="200">
      {call.hasTranscript && (
        <Button size="slim" variant="primary" onClick={() => openCallDetail(call)}>View</Button>
      )}
      {call.hasRecording && (
        <Button
          size="slim"
          onClick={async () => {
            const res = await callsApi.getRecordingUrl(call._id);
            window.open(res.data.recordingUrl, '_blank');
          }}
        >
          Recording
        </Button>
      )}
    </InlineStack>,
  ]);

  return (
    <Page title="Call History" subtitle="View all calls handled by your AI agents">
      <BlockStack gap="400">
        {/* Stats bar */}
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
          {[
            { label: 'Total', value: pagination.total, color: '#6366f1', bg: '#eef2ff' },
          ].map((s) => (
            <div key={s.label} style={{
              background: s.bg,
              borderRadius: 10,
              padding: '10px 20px',
              display: 'flex',
              gap: 8,
              alignItems: 'center',
            }}>
              <Text as="p" variant="headingSm" fontWeight="bold">
                <span style={{ color: s.color }}>{s.value}</span>
              </Text>
              <Text as="p" variant="bodySm" tone="subdued">{s.label} calls</Text>
            </div>
          ))}
        </div>

        <Card>
          <BlockStack gap="300">
            <InlineStack gap="300" blockAlign="end">
              <div style={{ minWidth: 200 }}>
                <Select
                  label="Filter by status"
                  options={[
                    { label: 'All calls', value: '' },
                    { label: 'Completed', value: 'completed' },
                    { label: 'Failed', value: 'failed' },
                    { label: 'Declined', value: 'busy' },
                    { label: 'No Answer', value: 'no-answer' },
                    { label: 'Canceled', value: 'canceled' },
                    { label: 'Transferred', value: 'transferred' },
                    { label: 'In Progress', value: 'in-progress' },
                  ]}
                  value={statusFilter}
                  onChange={setStatusFilter}
                />
              </div>
            </InlineStack>
          </BlockStack>
        </Card>

        <Card padding="0">
          {calls.length === 0 && !isLoading ? (
            <EmptyState heading="No calls yet" image="">
              <p>Calls will appear here once your agent is active and receiving calls.</p>
            </EmptyState>
          ) : (
            <DataTable
              columnContentTypes={['text', 'text', 'text', 'text', 'text', 'text', 'text']}
              headings={['Date', 'Number', 'Status', 'Duration', 'Sentiment', 'Intent', 'Actions']}
              rows={rows}
            />
          )}
        </Card>

        {pagination.pages > 1 && (
          <div style={{ display: 'flex', justifyContent: 'center' }}>
            <Pagination
              hasPrevious={pagination.page > 1}
              onPrevious={() => loadCalls(pagination.page - 1)}
              hasNext={pagination.page < pagination.pages}
              onNext={() => loadCalls(pagination.page + 1)}
              label={`Page ${pagination.page} of ${pagination.pages}`}
            />
          </div>
        )}
      </BlockStack>

      {/* Call detail modal */}
      <Modal
        open={!!selectedCall}
        onClose={() => { setSelectedCall(null); setTranscript(null); }}
        title={selectedCall?.direction === 'outbound' ? `Outbound to ${selectedCall?.calledNumber}` : `Inbound from ${selectedCall?.callerNumber}`}
        size="large"
      >
        <Modal.Section>
          {selectedCall && (
            <BlockStack gap="400">
              <div style={{
                display: 'flex',
                gap: 16,
                flexWrap: 'wrap',
                background: '#f9fafb',
                borderRadius: 10,
                padding: '14px 16px',
              }}>
                {[
                  { label: 'Duration', value: formatDuration(selectedCall.duration) },
                  { label: 'Date', value: dayjs(selectedCall.createdAt).format('MMM D, YYYY h:mm A') },
                  { label: 'Status', value: selectedCall.status },
                ].map((item) => (
                  <div key={item.label} style={{ minWidth: 120 }}>
                    <Text as="p" variant="bodySm" tone="subdued">{item.label}</Text>
                    <Text as="p" variant="bodyMd" fontWeight="semibold">{item.value}</Text>
                  </div>
                ))}
                {selectedCall.wasTransferred && (
                  <div>
                    <Text as="p" variant="bodySm" tone="subdued">Transferred to</Text>
                    <Text as="p" variant="bodyMd" fontWeight="semibold">{selectedCall.callerNumber}</Text>
                  </div>
                )}
              </div>

              <Divider />

              {transcriptLoading && (
                <div style={{ textAlign: 'center', padding: 24 }}>
                  <Text as="p" tone="subdued">Loading transcript...</Text>
                </div>
              )}

              {transcript && (
                <BlockStack gap="300">
                  <Text as="h3" variant="headingMd" fontWeight="semibold">Conversation</Text>
                  <div style={{ maxHeight: 420, overflowY: 'auto', padding: '8px 4px' }}>
                    {transcript.messages.map((msg, idx) => (
                      <div
                        key={idx}
                        style={{
                          marginBottom: 12,
                          display: 'flex',
                          justifyContent: msg.role === 'assistant' ? 'flex-start' : 'flex-end',
                        }}
                      >
                        <div style={{
                          maxWidth: '78%',
                          padding: '10px 14px',
                          borderRadius: msg.role === 'assistant' ? '4px 16px 16px 16px' : '16px 4px 16px 16px',
                          background: msg.role === 'assistant' ? '#f3f4f6' : 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
                          color: msg.role === 'assistant' ? '#1f2937' : '#fff',
                          fontSize: 13,
                          lineHeight: 1.5,
                        }}>
                          <div style={{
                            fontWeight: 600,
                            fontSize: 10,
                            marginBottom: 4,
                            opacity: 0.7,
                            textTransform: 'uppercase',
                            letterSpacing: 0.5,
                          }}>
                            {msg.role === 'assistant' ? 'AI Agent' : 'Customer'}
                          </div>
                          {msg.content}
                        </div>
                      </div>
                    ))}
                  </div>
                </BlockStack>
              )}

              {!transcript && !transcriptLoading && (
                <div style={{ textAlign: 'center', padding: 32 }}>
                  <Text as="p" tone="subdued">
                    {selectedCall.hasTranscript ? 'Transcript not available' : 'No transcript for this call'}
                  </Text>
                </div>
              )}
            </BlockStack>
          )}
        </Modal.Section>
      </Modal>
    </Page>
  );
}
