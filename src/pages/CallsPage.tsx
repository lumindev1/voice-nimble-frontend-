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
    'in-progress': 'info',
    'no-answer': 'warning',
    transferred: 'info',
  };
  return <Badge tone={toneMap[status] || 'info'}>{status}</Badge>;
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
    call.callerNumber,
    <StatusBadge key={call._id} status={call.status} />,
    formatDuration(call.duration),
    <SentimentBadge key={`${call._id}-s`} sentiment={call.sentiment} />,
    call.intentDetected || '—',
    <InlineStack key={`${call._id}-a`} gap="200">
      {call.hasTranscript && (
        <Button size="slim" onClick={() => openCallDetail(call)}>Transcript</Button>
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
    <Page title="Call History" subtitle="All incoming calls handled by your AI agent">
      <BlockStack gap="400">
        <Card>
          <BlockStack gap="300">
            <Select
              label="Filter by status"
              options={[
                { label: 'All calls', value: '' },
                { label: 'Completed', value: 'completed' },
                { label: 'Failed', value: 'failed' },
                { label: 'No Answer', value: 'no-answer' },
                { label: 'Transferred', value: 'transferred' },
                { label: 'In Progress', value: 'in-progress' },
              ]}
              value={statusFilter}
              onChange={setStatusFilter}
            />
          </BlockStack>
        </Card>

        <Card padding="0">
          {calls.length === 0 && !isLoading ? (
            <EmptyState
              heading="No calls yet"
              image=""
            >
              <p>Calls will appear here once your agent is active and receiving calls.</p>
            </EmptyState>
          ) : (
            <DataTable
              columnContentTypes={['text', 'text', 'text', 'text', 'text', 'text', 'text']}
              headings={['Date', 'Caller', 'Status', 'Duration', 'Sentiment', 'Intent', 'Actions']}
              rows={rows}
            />
          )}
        </Card>

        {pagination.pages > 1 && (
          <Pagination
            hasPrevious={pagination.page > 1}
            onPrevious={() => loadCalls(pagination.page - 1)}
            hasNext={pagination.page < pagination.pages}
            onNext={() => loadCalls(pagination.page + 1)}
            label={`Page ${pagination.page} of ${pagination.pages} — ${pagination.total} total calls`}
          />
        )}
      </BlockStack>

      {/* Call detail modal */}
      <Modal
        open={!!selectedCall}
        onClose={() => { setSelectedCall(null); setTranscript(null); }}
        title={`Call from ${selectedCall?.callerNumber}`}
        size="large"
      >
        <Modal.Section>
          {selectedCall && (
            <BlockStack gap="400">
              <InlineStack gap="400" wrap>
                <Text as="span" variant="bodySm" tone="subdued">
                  Duration: <strong>{formatDuration(selectedCall.duration)}</strong>
                </Text>
                <Text as="span" variant="bodySm" tone="subdued">
                  Date: <strong>{dayjs(selectedCall.createdAt).format('MMM D, YYYY h:mm A')}</strong>
                </Text>
                <Text as="span" variant="bodySm" tone="subdued">
                  Status: <strong>{selectedCall.status}</strong>
                </Text>
                {selectedCall.wasTransferred && (
                  <Text as="span" variant="bodySm" tone="subdued">
                    Transferred to: <strong>{selectedCall.callerNumber}</strong>
                  </Text>
                )}
              </InlineStack>

              <Divider />

              {transcriptLoading && <Text as="p">Loading transcript...</Text>}

              {transcript && (
                <BlockStack gap="300">
                  <Text as="h3" variant="headingMd">Conversation Transcript</Text>
                  <div style={{ maxHeight: 400, overflowY: 'auto', padding: '8px 0' }}>
                    {transcript.messages.map((msg, idx) => (
                      <div
                        key={idx}
                        style={{
                          marginBottom: 12,
                          display: 'flex',
                          justifyContent: msg.role === 'assistant' ? 'flex-start' : 'flex-end',
                        }}
                      >
                        <div
                          style={{
                            maxWidth: '80%',
                            padding: '8px 12px',
                            borderRadius: 8,
                            background: msg.role === 'assistant' ? '#f1f2f3' : '#5C6AC4',
                            color: msg.role === 'assistant' ? '#333' : '#fff',
                            fontSize: 13,
                          }}
                        >
                          <div style={{ fontWeight: 600, fontSize: 10, marginBottom: 4, opacity: 0.7 }}>
                            {msg.role === 'assistant' ? '🤖 AI Agent' : '👤 Customer'}
                          </div>
                          {msg.content}
                        </div>
                      </div>
                    ))}
                  </div>
                </BlockStack>
              )}

              {!transcript && !transcriptLoading && selectedCall.hasTranscript && (
                <Text as="p" tone="subdued">Transcript not available</Text>
              )}

              {!selectedCall.hasTranscript && (
                <Text as="p" tone="subdued">No transcript available for this call</Text>
              )}
            </BlockStack>
          )}
        </Modal.Section>
      </Modal>
    </Page>
  );
}
