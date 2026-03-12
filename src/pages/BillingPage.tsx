import { useEffect, useState } from 'react';
import {
  Page,
  Layout,
  Card,
  BlockStack,
  Text,
  Badge,
  Button,
  InlineStack,
  ProgressBar,
  List,
  Divider,
  Banner,
  Toast,
} from '@shopify/polaris';
import { billingApi, Plan, Subscription } from '../api/billing.api';

const PLAN_FEATURES: Record<string, string[]> = {
  basic: [
    '100 minutes/month included',
    '1 simultaneous call',
    'Call history & transcripts',
    '7-day recording retention',
    'Email support',
  ],
  advanced: [
    '500 minutes/month included',
    '3 simultaneous calls',
    'Advanced analytics',
    'Call recording (30-day retention)',
    'Daily & weekly reports',
    'Priority support',
  ],
  pro: [
    '2,000 minutes/month included',
    '10 simultaneous calls',
    'Advanced analytics',
    'Call recording (90-day retention)',
    'All report types',
    'Dedicated support',
    'Custom integrations',
  ],
};

const PLAN_COLORS: Record<string, { gradient: string; badge: string }> = {
  basic: { gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', badge: '#667eea' },
  advanced: { gradient: 'linear-gradient(135deg, #f7971e 0%, #ffd200 100%)', badge: '#f7971e' },
  pro: { gradient: 'linear-gradient(135deg, #11998e 0%, #38ef7d 100%)', badge: '#11998e' },
};

export default function BillingPage() {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [subscribing, setSubscribing] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState('');

  useEffect(() => {
    Promise.all([
      billingApi.getPlans().then((r) => setPlans(r.data.plans)),
      billingApi.getSubscription().then((r) => setSubscription(r.data.subscription)),
    ]).finally(() => setIsLoading(false));
  }, []);

  const handleSubscribe = async (planName: string) => {
    setSubscribing(planName);
    try {
      const res = await billingApi.subscribe(planName);
      window.open(res.data.confirmationUrl, '_top');
    } catch {
      setToastMessage('Failed to initiate subscription');
    } finally {
      setSubscribing(null);
    }
  };

  const minutesPercent = subscription
    ? Math.min(100, (subscription.minutesUsed / subscription.minutesIncluded) * 100)
    : 0;

  if (isLoading) return <Page title="Subscription"><Card><Text as="p">Loading...</Text></Card></Page>;

  return (
    <Page title="Subscription" subtitle="Choose the plan that fits your business">
      <BlockStack gap="600">
        {/* Current usage card */}
        {subscription && (
          <Card>
            <BlockStack gap="400">
              <InlineStack align="space-between" blockAlign="center">
                <InlineStack gap="300" blockAlign="center">
                  <div style={{
                    width: 44,
                    height: 44,
                    borderRadius: 12,
                    background: PLAN_COLORS[subscription.planName]?.gradient || PLAN_COLORS.basic.gradient,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#fff',
                    fontWeight: 700,
                    fontSize: 18,
                  }}>
                    {subscription.planName.charAt(0).toUpperCase()}
                  </div>
                  <BlockStack gap="050">
                    <Text as="h2" variant="headingMd" fontWeight="bold">Current Plan</Text>
                    <Text as="p" variant="bodySm" tone="subdued">{subscription.planName.charAt(0).toUpperCase() + subscription.planName.slice(1)} Plan</Text>
                  </BlockStack>
                </InlineStack>
                <Badge tone={subscription.status === 'active' ? 'success' : 'attention'}>
                  {subscription.status.toUpperCase()}
                </Badge>
              </InlineStack>

              <Divider />

              <BlockStack gap="200">
                <InlineStack align="space-between">
                  <Text as="p" variant="bodySm" fontWeight="medium">Minutes Used</Text>
                  <Text as="p" variant="bodySm" fontWeight="bold">
                    {subscription.minutesUsed} / {subscription.minutesIncluded} min
                  </Text>
                </InlineStack>
                <ProgressBar progress={minutesPercent} tone={minutesPercent > 90 ? 'critical' : minutesPercent > 70 ? 'highlight' : 'success'} size="small" />
              </BlockStack>

              {subscription.overageMinutes > 0 && (
                <Banner tone="warning" title="Overage Usage">
                  <p>{subscription.overageMinutes} overage minutes — additional charge of ${subscription.overageCost.toFixed(2)}</p>
                </Banner>
              )}

              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(3, 1fr)',
                gap: 12,
                background: '#f9fafb',
                borderRadius: 10,
                padding: '14px',
              }}>
                <BlockStack gap="050" align="center">
                  <Text as="p" variant="headingSm" fontWeight="bold">{subscription.simultaneousCalls}</Text>
                  <Text as="p" variant="bodySm" tone="subdued">Simultaneous</Text>
                </BlockStack>
                <BlockStack gap="050" align="center">
                  <Text as="p" variant="headingSm" fontWeight="bold">{subscription.hasCallRecording ? 'Yes' : 'No'}</Text>
                  <Text as="p" variant="bodySm" tone="subdued">Recording</Text>
                </BlockStack>
                <BlockStack gap="050" align="center">
                  <Text as="p" variant="headingSm" fontWeight="bold">{subscription.hasAdvancedAnalytics ? 'Yes' : 'No'}</Text>
                  <Text as="p" variant="bodySm" tone="subdued">Analytics</Text>
                </BlockStack>
              </div>
            </BlockStack>
          </Card>
        )}

        {/* Plan cards */}
        <Layout>
          {plans.map((plan) => {
            const isCurrent = subscription?.planName === plan.name && subscription?.status === 'active';
            const colors = PLAN_COLORS[plan.name] || PLAN_COLORS.basic;
            const isPopular = plan.name === 'advanced';

            return (
              <Layout.Section key={plan.name} variant="oneThird">
                <div style={{
                  background: '#fff',
                  borderRadius: 16,
                  border: isCurrent ? `2px solid ${colors.badge}` : '1px solid #e5e7eb',
                  overflow: 'hidden',
                  position: 'relative',
                }}>
                  {isPopular && (
                    <div style={{
                      position: 'absolute',
                      top: 12,
                      right: -28,
                      background: '#f7971e',
                      color: '#fff',
                      fontSize: 10,
                      fontWeight: 700,
                      padding: '4px 32px',
                      transform: 'rotate(45deg)',
                      letterSpacing: 0.5,
                    }}>
                      POPULAR
                    </div>
                  )}

                  {/* Header */}
                  <div style={{
                    background: colors.gradient,
                    padding: '24px 20px',
                    color: '#fff',
                  }}>
                    <BlockStack gap="200">
                      <Text as="h2" variant="headingMd" fontWeight="bold">
                        <span style={{ color: '#fff' }}>{plan.displayName}</span>
                      </Text>
                      <InlineStack gap="100" blockAlign="end">
                        <Text as="p" variant="heading2xl" fontWeight="bold">
                          <span style={{ color: '#fff' }}>${plan.priceMonthly}</span>
                        </Text>
                        <Text as="p" variant="bodySm">
                          <span style={{ color: 'rgba(255,255,255,0.8)' }}>/month</span>
                        </Text>
                      </InlineStack>
                    </BlockStack>
                  </div>

                  {/* Features */}
                  <div style={{ padding: '20px' }}>
                    <BlockStack gap="400">
                      <List>
                        {(PLAN_FEATURES[plan.name] || []).map((feature) => (
                          <List.Item key={feature}>{feature}</List.Item>
                        ))}
                      </List>

                      <Text as="p" variant="bodySm" tone="subdued">
                        Overage: ${plan.overageRatePerMinute.toFixed(2)}/min
                      </Text>

                      <Button
                        variant={isCurrent ? 'secondary' : 'primary'}
                        disabled={isCurrent}
                        loading={subscribing === plan.name}
                        onClick={() => handleSubscribe(plan.name)}
                        fullWidth
                        size="large"
                      >
                        {isCurrent ? 'Current Plan' : `Upgrade to ${plan.displayName}`}
                      </Button>
                    </BlockStack>
                  </div>
                </div>
              </Layout.Section>
            );
          })}
        </Layout>

        {/* Billing notes */}
        <Card>
          <BlockStack gap="300">
            <Text as="h2" variant="headingMd" fontWeight="semibold">Billing Information</Text>
            <Divider />
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16 }}>
              {[
                { icon: '🎁', text: '7-day free trial on all plans' },
                { icon: '🔒', text: 'Secure billing via Shopify' },
                { icon: '📊', text: 'Overage billed at cycle end' },
                { icon: '🔄', text: 'Upgrade or downgrade anytime' },
                { icon: '❌', text: 'No long-term contracts' },
              ].map((note) => (
                <InlineStack key={note.text} gap="200" blockAlign="start">
                  <span style={{ fontSize: 18 }}>{note.icon}</span>
                  <Text as="p" variant="bodySm" tone="subdued">{note.text}</Text>
                </InlineStack>
              ))}
            </div>
          </BlockStack>
        </Card>
      </BlockStack>

      {toastMessage && (
        <Toast content={toastMessage} error onDismiss={() => setToastMessage('')} duration={3000} />
      )}
    </Page>
  );
}
