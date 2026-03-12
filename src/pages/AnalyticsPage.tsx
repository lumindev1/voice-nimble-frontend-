import { useEffect, useState } from 'react';
import {
  Page,
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

  const STAT_CARDS = [
    { label: 'Total Calls', value: dashboard?.totalCalls ?? 0, color: '#6366f1', bg: '#eef2ff' },
    { label: 'Last 30 Days', value: dashboard?.recentCalls ?? 0, color: '#059669', bg: '#ecfdf5' },
    { label: 'Avg Duration', value: formatDuration(dashboard?.averageDuration ?? 0), color: '#f59e0b', bg: '#fffbeb' },
    { label: "Today's Calls", value: dashboard?.todayCalls ?? 0, color: '#8b5cf6', bg: '#f5f3ff' },
  ];

  return (
    <Page title="Analytics" subtitle="Track your AI phone agent performance">
      <BlockStack gap="500">
        {/* Summary stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16 }}>
          {STAT_CARDS.map(({ label, value, color, bg }) => (
            <div key={label} style={{
              background: bg,
              borderRadius: 14,
              padding: '20px',
              borderLeft: `4px solid ${color}`,
            }}>
              <BlockStack gap="100">
                <Text as="p" variant="bodySm" tone="subdued">{label}</Text>
                <Text as="p" variant="headingXl" fontWeight="bold">
                  <span style={{ color }}>{value}</span>
                </Text>
              </BlockStack>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <Card padding="0">
          <Tabs tabs={tabs} selected={selected} onSelect={setSelected} fitted>
            <div style={{ padding: '20px' }}>
              {selected === 0 && dashboard && (
                <BlockStack gap="400">
                  <InlineStack align="space-between" blockAlign="center">
                    <Text as="h3" variant="headingMd" fontWeight="semibold">30-Day Trend</Text>
                    <InlineStack gap="300">
                      <Badge tone="success">{`Positive: ${dashboard.todayPositive}`}</Badge>
                      <Badge tone="critical">{`Negative: ${dashboard.todayNegative}`}</Badge>
                    </InlineStack>
                  </InlineStack>
                  <div style={{ overflowX: 'auto' }}>
                    <div style={{
                      display: 'flex',
                      alignItems: 'flex-end',
                      gap: 5,
                      height: 180,
                      minWidth: 700,
                      padding: '8px 0 28px',
                    }}>
                      {dashboard.dailyTrend.map((day) => {
                        const maxCalls = Math.max(...dashboard.dailyTrend.map((d) => d.calls), 1);
                        const barHeight = Math.max(6, (day.calls / maxCalls) * 150);
                        return (
                          <div key={day.date} style={{
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            flex: 1,
                            position: 'relative',
                          }}>
                            <div style={{
                              fontSize: 9,
                              color: '#6b7280',
                              marginBottom: 4,
                              opacity: day.calls > 0 ? 1 : 0,
                            }}>
                              {day.calls}
                            </div>
                            <div
                              title={`${day.date}: ${day.calls} calls`}
                              style={{
                                width: '75%',
                                height: barHeight,
                                background: 'linear-gradient(180deg, #6366f1 0%, #a5b4fc 100%)',
                                borderRadius: 4,
                                minHeight: 4,
                                transition: 'height 0.3s ease',
                              }}
                            />
                            <span style={{
                              fontSize: 9,
                              color: '#9ca3af',
                              marginTop: 6,
                              transform: 'rotate(-45deg)',
                              whiteSpace: 'nowrap',
                              position: 'absolute',
                              bottom: -20,
                            }}>
                              {day.date.slice(5)}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </BlockStack>
              )}

              {selected === 1 && (
                <BlockStack gap="400">
                  {weekly?.summary && (
                    <div style={{
                      display: 'flex',
                      gap: 24,
                      flexWrap: 'wrap',
                      padding: '12px 16px',
                      background: '#f9fafb',
                      borderRadius: 10,
                    }}>
                      {[
                        { label: 'Total Calls', value: weekly.summary.totalCalls },
                        { label: 'Total Duration', value: formatDuration(weekly.summary.totalDuration) },
                        { label: 'Positive', value: weekly.summary.positive },
                        { label: 'Negative', value: weekly.summary.negative },
                      ].map((s) => (
                        <BlockStack key={s.label} gap="050">
                          <Text as="p" variant="bodySm" tone="subdued">{s.label}</Text>
                          <Text as="p" variant="headingSm" fontWeight="bold">{s.value}</Text>
                        </BlockStack>
                      ))}
                    </div>
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
                    <div style={{
                      display: 'flex',
                      gap: 24,
                      flexWrap: 'wrap',
                      padding: '12px 16px',
                      background: '#f9fafb',
                      borderRadius: 10,
                    }}>
                      {[
                        { label: 'Total Calls', value: monthly.summary.totalCalls },
                        { label: 'Total Duration', value: formatDuration(monthly.summary.totalDuration) },
                        { label: 'Positive', value: monthly.summary.positive },
                        { label: 'Negative', value: monthly.summary.negative },
                      ].map((s) => (
                        <BlockStack key={s.label} gap="050">
                          <Text as="p" variant="bodySm" tone="subdued">{s.label}</Text>
                          <Text as="p" variant="headingSm" fontWeight="bold">{s.value}</Text>
                        </BlockStack>
                      ))}
                    </div>
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
