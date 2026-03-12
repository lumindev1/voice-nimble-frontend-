import { useEffect, useState } from 'react';
import {
  Page,
  Card,
  Text,
  BlockStack,
  InlineStack,
  Badge,
  Divider,
  SkeletonBodyText,
  Button,
  Icon,
} from '@shopify/polaris';
import {
  PhoneIcon,
  ChartVerticalIcon,
  PersonIcon,
  NoteIcon,
} from '@shopify/polaris-icons';
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

const STAT_STYLES: Array<{ bg: string; accent: string; iconBg: string }> = [
  { bg: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', accent: '#e8daef', iconBg: 'rgba(255,255,255,0.2)' },
  { bg: 'linear-gradient(135deg, #11998e 0%, #38ef7d 100%)', accent: '#d5f5e3', iconBg: 'rgba(255,255,255,0.2)' },
  { bg: 'linear-gradient(135deg, #eb3349 0%, #f45c43 100%)', accent: '#fadbd8', iconBg: 'rgba(255,255,255,0.2)' },
  { bg: 'linear-gradient(135deg, #f7971e 0%, #ffd200 100%)', accent: '#fef9e7', iconBg: 'rgba(255,255,255,0.2)' },
];

function StatCard({ label, value, percent, style }: {
  label: string; value: number; percent?: string; style: typeof STAT_STYLES[0];
}) {
  return (
    <div style={{
      background: style.bg,
      borderRadius: 16,
      padding: '24px 20px',
      color: '#fff',
      position: 'relative',
      overflow: 'hidden',
      minHeight: 120,
    }}>
      <div style={{
        position: 'absolute',
        top: -20,
        right: -20,
        width: 80,
        height: 80,
        borderRadius: '50%',
        background: 'rgba(255,255,255,0.1)',
      }} />
      <div style={{
        position: 'absolute',
        bottom: -30,
        right: 20,
        width: 60,
        height: 60,
        borderRadius: '50%',
        background: 'rgba(255,255,255,0.08)',
      }} />
      <BlockStack gap="200">
        <Text as="p" variant="bodySm" fontWeight="medium">
          <span style={{ color: 'rgba(255,255,255,0.85)' }}>{label}</span>
        </Text>
        <Text as="p" variant="heading2xl" fontWeight="bold">
          <span style={{ color: '#fff' }}>{value.toLocaleString()}</span>
        </Text>
        {percent && (
          <Text as="span" variant="bodySm">
            <span style={{
              background: 'rgba(255,255,255,0.2)',
              padding: '2px 8px',
              borderRadius: 12,
              fontSize: 11,
              color: '#fff',
            }}>
              {percent}
            </span>
          </Text>
        )}
      </BlockStack>
    </div>
  );
}

function QuickStatCard({ label, value, icon }: { label: string; value: number; icon: typeof PhoneIcon }) {
  return (
    <div style={{
      background: '#fff',
      borderRadius: 12,
      padding: '16px 18px',
      flex: 1,
      minWidth: 140,
      border: '1px solid #e5e7eb',
      transition: 'box-shadow 0.2s',
    }}>
      <InlineStack align="space-between" blockAlign="center">
        <BlockStack gap="100">
          <Text as="p" variant="bodySm" tone="subdued">{label}</Text>
          <Text as="p" variant="headingLg" fontWeight="bold">{value}</Text>
        </BlockStack>
        <div style={{
          width: 40,
          height: 40,
          borderRadius: 10,
          background: '#f0f0ff',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}>
          <Icon source={icon} tone="base" />
        </div>
      </InlineStack>
    </div>
  );
}

export default function DashboardPage() {
  const navigate = useNavigate();
  const [dashboard, setDashboard] = useState<DashboardData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [period, setPeriod] = useState<'12m' | '30d' | '7d' | '24h'>('30d');

  useEffect(() => {
    analyticsApi.getDashboard()
      .then((r) => setDashboard(r.data.dashboard as unknown as DashboardData))
      .catch(() => {})
      .finally(() => setIsLoading(false));
  }, []);

  const PERIOD_LABELS = { '12m': '12 Months', '30d': '30 Days', '7d': '7 Days', '24h': '24 Hours' };

  return (
    <Page title="Dashboard" subtitle="Overview of your AI phone agent performance">
      <BlockStack gap="600">
        {/* Period selector + actions */}
        <InlineStack align="space-between" blockAlign="center">
          <div style={{
            display: 'inline-flex',
            background: '#fff',
            borderRadius: 10,
            border: '1px solid #e5e7eb',
            padding: 3,
            gap: 2,
          }}>
            {(['12m', '30d', '7d', '24h'] as const).map((p) => (
              <button
                key={p}
                onClick={() => setPeriod(p)}
                style={{
                  padding: '6px 16px',
                  borderRadius: 8,
                  border: 'none',
                  cursor: 'pointer',
                  fontSize: 13,
                  fontWeight: period === p ? 600 : 400,
                  background: period === p ? '#6366f1' : 'transparent',
                  color: period === p ? '#fff' : '#6b7280',
                  transition: 'all 0.2s',
                }}
              >
                {PERIOD_LABELS[p]}
              </button>
            ))}
          </div>
          <InlineStack gap="200">
            <Button onClick={() => navigate('/contacts')} size="slim">Add Contact</Button>
            <Button variant="primary" onClick={() => navigate('/broadcast')} size="slim">New Campaign</Button>
          </InlineStack>
        </InlineStack>

        {/* Stat cards */}
        {isLoading ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16 }}>
            {[...Array(4)].map((_, i) => (
              <Card key={i}><SkeletonBodyText lines={3} /></Card>
            ))}
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16 }}>
            <StatCard
              label="Total Calls"
              value={dashboard?.totalCalls ?? 0}
              percent="All time"
              style={STAT_STYLES[0]}

            />
            <StatCard
              label="Successful"
              value={dashboard?.successCalls ?? 0}
              percent={dashboard?.totalCalls ? `${((dashboard.successCalls / dashboard.totalCalls) * 100).toFixed(1)}%` : '0%'}
              style={STAT_STYLES[1]}

            />
            <StatCard
              label="Failed"
              value={dashboard?.failedCalls ?? 0}
              percent={dashboard?.totalCalls ? `${((dashboard.failedCalls / dashboard.totalCalls) * 100).toFixed(1)}%` : '0%'}
              style={STAT_STYLES[2]}

            />
            <StatCard
              label="Others"
              value={dashboard?.otherCalls ?? 0}
              percent={dashboard?.totalCalls ? `${((dashboard.otherCalls / dashboard.totalCalls) * 100).toFixed(1)}%` : '0%'}
              style={STAT_STYLES[3]}

            />
          </div>
        )}

        {/* Quick stats row */}
        {!isLoading && dashboard && (
          <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
            <QuickStatCard label="Active Agents" value={dashboard.totalAgents} icon={PhoneIcon} />
            <QuickStatCard label="Templates" value={dashboard.totalTemplates} icon={NoteIcon} />
            <QuickStatCard label="Campaigns" value={dashboard.totalBroadcast} icon={ChartVerticalIcon} />
            <QuickStatCard label="Contacts" value={dashboard.totalContacts} icon={PersonIcon} />
          </div>
        )}

        {/* Call trend chart */}
        {dashboard && dashboard.dailyTrend.length > 0 && (
          <Card>
            <BlockStack gap="400">
              <InlineStack align="space-between" blockAlign="center">
                <Text as="h2" variant="headingMd" fontWeight="semibold">Call Trend (Last 30 Days)</Text>
                <InlineStack gap="300">
                  <Badge tone="success">{`Positive: ${dashboard.todayPositive}`}</Badge>
                  <Badge tone="critical">{`Negative: ${dashboard.todayNegative}`}</Badge>
                </InlineStack>
              </InlineStack>
              <div style={{ overflowX: 'auto' }}>
                <div style={{
                  display: 'flex',
                  alignItems: 'flex-end',
                  gap: 6,
                  height: 160,
                  minWidth: 700,
                  padding: '8px 0 24px',
                }}>
                  {dashboard.dailyTrend.map((day) => {
                    const maxCalls = Math.max(...dashboard.dailyTrend.map((d) => d.calls), 1);
                    const height = Math.max(6, (day.calls / maxCalls) * 140);
                    return (
                      <div
                        key={day.date}
                        style={{
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center',
                          flex: 1,
                          position: 'relative',
                        }}
                        title={`${day.date}: ${day.calls} calls`}
                      >
                        <div style={{
                          fontSize: 9,
                          color: '#6b7280',
                          marginBottom: 4,
                          opacity: day.calls > 0 ? 1 : 0,
                        }}>
                          {day.calls}
                        </div>
                        <div style={{
                          width: '80%',
                          height,
                          background: `linear-gradient(180deg, #6366f1 0%, #818cf8 100%)`,
                          borderRadius: 4,
                          minHeight: 4,
                          transition: 'height 0.3s ease',
                        }} />
                        <span style={{
                          fontSize: 9,
                          color: '#9ca3af',
                          marginTop: 6,
                          transform: 'rotate(-45deg)',
                          whiteSpace: 'nowrap',
                          position: 'absolute',
                          bottom: -18,
                        }}>
                          {day.date.slice(5)}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </BlockStack>
          </Card>
        )}

        {/* Today's activity */}
        {dashboard && (
          <Card>
            <BlockStack gap="300">
              <Text as="h2" variant="headingMd" fontWeight="semibold">Today's Activity</Text>
              <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
                {[
                  { label: 'Calls Today', value: dashboard.todayCalls, color: '#6366f1', bg: '#eef2ff' },
                  { label: 'Positive', value: dashboard.todayPositive, color: '#059669', bg: '#ecfdf5' },
                  { label: 'Negative', value: dashboard.todayNegative, color: '#dc2626', bg: '#fef2f2' },
                  { label: 'Neutral', value: Math.max(0, dashboard.todayCalls - dashboard.todayPositive - dashboard.todayNegative), color: '#6b7280', bg: '#f9fafb' },
                ].map((item) => (
                  <div key={item.label} style={{
                    flex: 1,
                    minWidth: 120,
                    background: item.bg,
                    borderRadius: 12,
                    padding: '14px 16px',
                    textAlign: 'center',
                  }}>
                    <Text as="p" variant="heading2xl" fontWeight="bold">
                      <span style={{ color: item.color }}>{item.value}</span>
                    </Text>
                    <Text as="p" variant="bodySm" tone="subdued">{item.label}</Text>
                  </div>
                ))}
              </div>
            </BlockStack>
          </Card>
        )}

        {/* Quick actions */}
        <Card>
          <BlockStack gap="400">
            <Text as="h2" variant="headingMd" fontWeight="semibold">Quick Actions</Text>
            <Divider />
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 12 }}>
              {[
                { label: 'Manage Agents', path: '/agent', icon: '🤖' },
                { label: 'Knowledge Base', path: '/knowledge-base', icon: '📚' },
                { label: 'Call Templates', path: '/templates', icon: '📋' },
                { label: 'Contacts', path: '/contacts', icon: '👥' },
                { label: 'Broadcast Calls', path: '/broadcast', icon: '📢' },
                { label: 'Event-Driven', path: '/event-driven', icon: '⚡' },
                { label: 'Test Call', path: '/test-call', icon: '📞' },
                { label: 'Call History', path: '/call-history', icon: '🕐' },
              ].map((action) => (
                <button
                  key={action.path}
                  onClick={() => navigate(action.path)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 10,
                    padding: '14px 16px',
                    borderRadius: 10,
                    border: '1px solid #e5e7eb',
                    background: '#fff',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    fontSize: 14,
                    color: '#374151',
                    fontWeight: 500,
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = '#6366f1';
                    e.currentTarget.style.background = '#fafafe';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = '#e5e7eb';
                    e.currentTarget.style.background = '#fff';
                  }}
                >
                  <span style={{ fontSize: 20 }}>{action.icon}</span>
                  {action.label}
                </button>
              ))}
            </div>
          </BlockStack>
        </Card>
      </BlockStack>
    </Page>
  );
}
