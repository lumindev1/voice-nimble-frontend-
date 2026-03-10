import { useEffect, useState } from 'react';
import {
  Page,
  Layout,
  Card,
  Text,
  BlockStack,
  InlineStack,
  Badge,
  Divider,
  SkeletonBodyText,
  Button,
} from '@shopify/polaris';
import { useNavigate } from 'react-router-dom';
import { analyticsApi } from '../api/analytics.api';

interface DashboardData {
  totalCalls: number;
  successCalls: number;
  failedCalls: number;
  otherCalls: number;
  averageDuration: number;
  todayCalls: number;
  todayPositive: number;
  todayNegative: number;
  totalAgents: number;
  totalTemplates: number;
  totalBroadcast: number;
  totalContacts: number;
  dailyTrend: Array<{ date: string; calls: number }>;
}

function CampaignStatCard({ label, value, percent, icon }: { label: string; value: number; percent?: string; icon: string }) {
  return (
    <Card>
      <BlockStack gap="200">
        <InlineStack align="space-between" blockAlign="start">
          <BlockStack gap="100">
            <Text as="p" variant="bodySm" tone="subdued">{label}</Text>
            <Text as="p" variant="heading2xl" fontWeight="bold">{value}</Text>
            {percent && <Text as="span" variant="bodySm" tone="success">↑ {percent}</Text>}
          </BlockStack>
          <div style={{ fontSize: 28, opacity: 0.6 }}>{icon}</div>
        </InlineStack>
      </BlockStack>
    </Card>
  );
}

function TotalRecordCard({ label, value, icon }: { label: string; value: number; icon: string }) {
  return (
    <div style={{ background: '#f9fafb', borderRadius: 8, padding: '12px 16px', flex: 1, minWidth: 120 }}>
      <InlineStack align="space-between" blockAlign="center">
        <BlockStack gap="100">
          <Text as="p" variant="bodySm" tone="subdued">{label}</Text>
          <InlineStack gap="100" blockAlign="center">
            <Text as="span" variant="bodySm" tone="success">↑</Text>
            <Text as="p" variant="headingMd" fontWeight="bold">{value}</Text>
          </InlineStack>
        </BlockStack>
        <div style={{ fontSize: 22 }}>{icon}</div>
      </InlineStack>
    </div>
  );
}

export default function DashboardPage() {
  const navigate = useNavigate();
  const [dashboard, setDashboard] = useState<DashboardData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [period, setPeriod] = useState<'12m' | '30d' | '7d' | '24h'>('12m');

  useEffect(() => {
    analyticsApi.getDashboard()
      .then((r) => setDashboard(r.data.dashboard as unknown as DashboardData))
      .catch(() => {})
      .finally(() => setIsLoading(false));
  }, []);

  const PERIOD_LABELS = { '12m': '12 Months', '30d': '30 Days', '7d': '7 Days', '24h': '24 Hours' };

  return (
    <Page title="Dashboard" subtitle="Your current call summary and activity.">
      <BlockStack gap="500">
        {/* Header row */}
        <InlineStack align="space-between" blockAlign="center">
          <InlineStack gap="200">
            {(['12m', '30d', '7d', '24h'] as const).map((p) => (
              <Button key={p} size="slim" variant={period === p ? 'primary' : 'secondary'} onClick={() => setPeriod(p)}>
                {PERIOD_LABELS[p]}
              </Button>
            ))}
          </InlineStack>
          <InlineStack gap="200">
            <Button onClick={() => navigate('/contacts')} size="slim">+ New Contact</Button>
            <Button variant="primary" onClick={() => navigate('/broadcast')} size="slim">Schedule Campaign</Button>
          </InlineStack>
        </InlineStack>

        {/* Campaign Overview */}
        <Text as="h2" variant="headingMd">Campaign Overview</Text>

        {isLoading ? (
          <Layout>
            {[...Array(4)].map((_, i) => (
              <Layout.Section key={i} variant="oneQuarter">
                <Card><SkeletonBodyText lines={3} /></Card>
              </Layout.Section>
            ))}
          </Layout>
        ) : (
          <Layout>
            <Layout.Section variant="oneQuarter">
              <CampaignStatCard label="Total Call" value={dashboard?.totalCalls ?? 0} percent="0%" icon="📞" />
            </Layout.Section>
            <Layout.Section variant="oneQuarter">
              <CampaignStatCard
                label="Successful Call"
                value={dashboard?.successCalls ?? 0}
                percent={dashboard?.totalCalls ? `${((dashboard.successCalls / dashboard.totalCalls) * 100).toFixed(2)}%` : '0%'}
                icon="📲"
              />
            </Layout.Section>
            <Layout.Section variant="oneQuarter">
              <CampaignStatCard
                label="Failed Call"
                value={dashboard?.failedCalls ?? 0}
                percent={dashboard?.totalCalls ? `${((dashboard.failedCalls / dashboard.totalCalls) * 100).toFixed(2)}%` : '0%'}
                icon="❌"
              />
            </Layout.Section>
            <Layout.Section variant="oneQuarter">
              <CampaignStatCard
                label="Others"
                value={dashboard?.otherCalls ?? 0}
                percent={dashboard?.totalCalls ? `${((dashboard.otherCalls / dashboard.totalCalls) * 100).toFixed(2)}%` : '0%'}
                icon="↩️"
              />
            </Layout.Section>
          </Layout>
        )}

        {/* Total Records */}
        <Card>
          <BlockStack gap="300">
            <Text as="h3" variant="headingSm">Total Records</Text>
            <Divider />
            {isLoading ? (
              <SkeletonBodyText lines={2} />
            ) : (
              <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                <TotalRecordCard label="Total Agents" value={dashboard?.totalAgents ?? 0} icon="🤖" />
                <TotalRecordCard label="Total Template" value={dashboard?.totalTemplates ?? 0} icon="📋" />
                <TotalRecordCard label="Total Broadcast" value={dashboard?.totalBroadcast ?? 0} icon="📢" />
                <TotalRecordCard label="Total Customers" value={dashboard?.totalContacts ?? 0} icon="👥" />
              </div>
            )}
          </BlockStack>
        </Card>

        {/* Call Trend Chart */}
        {dashboard && dashboard.dailyTrend.length > 0 && (
          <Card>
            <BlockStack gap="400">
              <Text as="h2" variant="headingMd">Call Trend (30 Days)</Text>
              <div style={{ overflowX: 'auto' }}>
                <div style={{ display: 'flex', alignItems: 'flex-end', gap: 4, height: 120, minWidth: 600 }}>
                  {dashboard.dailyTrend.map((day) => {
                    const maxCalls = Math.max(...dashboard.dailyTrend.map((d) => d.calls), 1);
                    const height = Math.max(4, (day.calls / maxCalls) * 100);
                    return (
                      <div key={day.date} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flex: 1 }} title={`${day.date}: ${day.calls} calls`}>
                        <div style={{ width: '100%', height: `${height}%`, background: '#C8A96E', borderRadius: 2, minHeight: 4 }} />
                        <span style={{ fontSize: 8, color: '#6d7175', marginTop: 2, transform: 'rotate(-45deg)' }}>{day.date.slice(5)}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </BlockStack>
          </Card>
        )}

        {/* Today */}
        {dashboard && (
          <Card>
            <BlockStack gap="300">
              <Text as="h2" variant="headingMd">Today's Activity</Text>
              <InlineStack gap="400">
                <Badge tone="info">{`Calls Today: ${dashboard.todayCalls}`}</Badge>
                <Badge tone="success">{`Positive: ${dashboard.todayPositive}`}</Badge>
                <Badge tone="critical">{`Negative: ${dashboard.todayNegative}`}</Badge>
                <Badge>{`Neutral: ${Math.max(0, dashboard.todayCalls - dashboard.todayPositive - dashboard.todayNegative)}`}</Badge>
              </InlineStack>
            </BlockStack>
          </Card>
        )}

        {/* Quick Actions */}
        <Card>
          <BlockStack gap="400">
            <Text as="h2" variant="headingMd">Quick Actions</Text>
            <Divider />
            <InlineStack gap="300" wrap>
              <Button onClick={() => navigate('/agent')}>Manage Agents</Button>
              <Button onClick={() => navigate('/knowledge-base')}>Knowledge Base</Button>
              <Button onClick={() => navigate('/templates')}>Call Templates</Button>
              <Button onClick={() => navigate('/contacts')}>Contacts</Button>
              <Button onClick={() => navigate('/broadcast')}>Broadcast Calls</Button>
              <Button onClick={() => navigate('/event-driven')}>Event-Driven</Button>
              <Button onClick={() => navigate('/test-call')}>Test Call</Button>
              <Button onClick={() => navigate('/call-history')}>Call History</Button>
            </InlineStack>
          </BlockStack>
        </Card>
      </BlockStack>
    </Page>
  );
}
