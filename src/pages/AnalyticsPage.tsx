import { useEffect, useState } from 'react';
import {
  Page,
  Layout,
  Card,
  Text,
  BlockStack,
  InlineStack,
  Badge,
  Tabs,
  DataTable,
  SkeletonBodyText,
} from '@shopify/polaris';
import { analyticsApi, DashboardData } from '../api/analytics.api';

export default function AnalyticsPage() {
  const [selected, setSelected] = useState(0);
  const [dashboard, setDashboard] = useState<DashboardData | null>(null);
  const [weekly, setWeekly] = useState<{ summary: Record<string, number>; daily: Array<{ date: string; totalCalls: number; averageDuration: number; positiveSentiment: number; negativeSentiment: number }> } | null>(null);
  const [monthly, setMonthly] = useState<typeof weekly>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      analyticsApi.getDashboard().then((r) => setDashboard(r.data.dashboard)),
      analyticsApi.getWeekly().then((r) => setWeekly(r.data)),
      analyticsApi.getMonthly().then((r) => setMonthly(r.data)),
    ]).finally(() => setIsLoading(false));
  }, []);

  const tabs = [
    { id: 'overview', content: 'Overview' },
    { id: 'weekly', content: 'Weekly' },
    { id: 'monthly', content: 'Monthly' },
  ];

  const formatDuration = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = Math.round(seconds % 60);
    return `${m}m ${s}s`;
  };

  if (isLoading) {
    return (
      <Page title="Analytics">
        <Card><SkeletonBodyText lines={6} /></Card>
      </Page>
    );
  }

  const weeklyRows = (weekly?.daily || []).map((d) => [
    d.date,
    String(d.totalCalls),
    formatDuration(d.averageDuration),
    String(d.positiveSentiment),
    String(d.negativeSentiment),
  ]);

  const monthlyRows = (monthly?.daily || []).map((d) => [
    d.date,
    String(d.totalCalls),
    formatDuration(d.averageDuration),
    String(d.positiveSentiment),
    String(d.negativeSentiment),
  ]);

  return (
    <Page title="Analytics" subtitle="Track your AI phone agent performance">
      <BlockStack gap="500">
        {/* Summary stats */}
        <Layout>
          {[
            { label: 'Total Calls (All Time)', value: dashboard?.totalCalls ?? 0 },
            { label: 'Last 30 Days', value: dashboard?.recentCalls ?? 0 },
            { label: 'Avg Duration', value: formatDuration(dashboard?.averageDuration ?? 0) },
            { label: "Today's Calls", value: dashboard?.todayCalls ?? 0 },
          ].map(({ label, value }) => (
            <Layout.Section key={label} variant="oneThird">
              <Card>
                <BlockStack gap="200">
                  <Text as="p" variant="bodySm" tone="subdued">{label}</Text>
                  <Text as="p" variant="headingXl" fontWeight="bold">{value}</Text>
                </BlockStack>
              </Card>
            </Layout.Section>
          ))}
        </Layout>

        {/* Tabs */}
        <Card padding="0">
          <Tabs tabs={tabs} selected={selected} onSelect={setSelected} fitted>
            <div style={{ padding: '16px' }}>
              {selected === 0 && dashboard && (
                <BlockStack gap="400">
                  <Text as="h3" variant="headingMd">30-Day Trend</Text>
                  <div style={{ overflowX: 'auto' }}>
                    <div style={{ display: 'flex', alignItems: 'flex-end', gap: 3, height: 160, minWidth: 700, padding: '8px 0' }}>
                      {dashboard.dailyTrend.map((day) => {
                        const maxCalls = Math.max(...dashboard.dailyTrend.map((d) => d.calls), 1);
                        const barHeight = Math.max(4, (day.calls / maxCalls) * 140);
                        return (
                          <div key={day.date} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flex: 1 }}>
                            <div
                              title={`${day.date}: ${day.calls} calls`}
                              style={{ width: '100%', height: barHeight, background: '#5C6AC4', borderRadius: 3, minHeight: 4 }}
                            />
                            <span style={{ fontSize: 8, color: '#6d7175', marginTop: 4, transform: 'rotate(-45deg)', whiteSpace: 'nowrap' }}>
                              {day.date.slice(5)}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                  <InlineStack gap="400">
                    <Badge tone="success">{`Positive: ${dashboard.todayPositive}`}</Badge>
                    <Badge tone="critical">{`Negative: ${dashboard.todayNegative}`}</Badge>
                  </InlineStack>
                </BlockStack>
              )}

              {selected === 1 && (
                <BlockStack gap="400">
                  {weekly?.summary && (
                    <InlineStack gap="400" wrap>
                      <Text as="p">Total Calls: <strong>{weekly.summary.totalCalls}</strong></Text>
                      <Text as="p">Total Duration: <strong>{formatDuration(weekly.summary.totalDuration)}</strong></Text>
                      <Text as="p">Positive: <strong>{weekly.summary.positive}</strong></Text>
                      <Text as="p">Negative: <strong>{weekly.summary.negative}</strong></Text>
                    </InlineStack>
                  )}
                  <DataTable
                    columnContentTypes={['text', 'numeric', 'text', 'numeric', 'numeric']}
                    headings={['Date', 'Total Calls', 'Avg Duration', 'Positive', 'Negative']}
                    rows={weeklyRows}
                  />
                </BlockStack>
              )}

              {selected === 2 && (
                <BlockStack gap="400">
                  {monthly?.summary && (
                    <InlineStack gap="400" wrap>
                      <Text as="p">Total Calls: <strong>{monthly.summary.totalCalls}</strong></Text>
                      <Text as="p">Total Duration: <strong>{formatDuration(monthly.summary.totalDuration)}</strong></Text>
                      <Text as="p">Positive: <strong>{monthly.summary.positive}</strong></Text>
                      <Text as="p">Negative: <strong>{monthly.summary.negative}</strong></Text>
                    </InlineStack>
                  )}
                  <DataTable
                    columnContentTypes={['text', 'numeric', 'text', 'numeric', 'numeric']}
                    headings={['Date', 'Total Calls', 'Avg Duration', 'Positive', 'Negative']}
                    rows={monthlyRows}
                  />
                </BlockStack>
              )}
            </div>
          </Tabs>
        </Card>
      </BlockStack>
    </Page>
  );
}
