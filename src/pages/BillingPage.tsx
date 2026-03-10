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
    <Page title="Subscription Management" subtitle="Choose the plan that fits your store">
        <BlockStack gap="500">
          {/* Current usage */}
          {subscription && (
            <Card>
              <BlockStack gap="400">
                <InlineStack align="space-between">
                  <Text as="h2" variant="headingMd">Current Plan</Text>
                  <InlineStack gap="200">
                    <Badge tone={subscription.status === 'active' ? 'success' : 'attention'}>
                      {subscription.status}
                    </Badge>
                    <Badge>{subscription.planName.toUpperCase()}</Badge>
                  </InlineStack>
                </InlineStack>
                <Divider />
                <BlockStack gap="200">
                  <InlineStack align="space-between">
                    <Text as="p" variant="bodySm">Minutes Used</Text>
                    <Text as="p" variant="bodySm">
                      {subscription.minutesUsed} / {subscription.minutesIncluded} min
                    </Text>
                  </InlineStack>
                  <ProgressBar progress={minutesPercent} tone={minutesPercent > 90 ? 'critical' : 'success'} />
                  {subscription.overageMinutes > 0 && (
                    <Banner tone="warning" title="Overage Usage">
                      <p>
                        {subscription.overageMinutes} overage minutes — additional charge of $
                        {subscription.overageCost.toFixed(2)}
                      </p>
                    </Banner>
                  )}
                </BlockStack>
                <InlineStack gap="400">
                  <Text as="p" variant="bodySm" tone="subdued">
                    Simultaneous calls: <strong>{subscription.simultaneousCalls}</strong>
                  </Text>
                  <Text as="p" variant="bodySm" tone="subdued">
                    Recording: <strong>{subscription.hasCallRecording ? 'Enabled' : 'Not included'}</strong>
                  </Text>
                  <Text as="p" variant="bodySm" tone="subdued">
                    Advanced Analytics: <strong>{subscription.hasAdvancedAnalytics ? 'Enabled' : 'Not included'}</strong>
                  </Text>
                </InlineStack>
              </BlockStack>
            </Card>
          )}

          {/* Plan cards */}
          <Layout>
            {plans.map((plan) => {
              const isCurrent = subscription?.planName === plan.name && subscription?.status === 'active';
              return (
                <Layout.Section key={plan.name} variant="oneThird">
                  <Card>
                    <BlockStack gap="400">
                      <InlineStack align="space-between">
                        <Text as="h2" variant="headingMd">{plan.displayName}</Text>
                        {isCurrent && <Badge tone="success">Current Plan</Badge>}
                      </InlineStack>
                      <InlineStack gap="100" blockAlign="end">
                        <Text as="p" variant="heading2xl" fontWeight="bold">
                          ${plan.priceMonthly}
                        </Text>
                        <Text as="p" variant="bodySm" tone="subdued">/month</Text>
                      </InlineStack>
                      <Divider />
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
                      >
                        {isCurrent ? 'Current Plan' : `Upgrade to ${plan.displayName}`}
                      </Button>
                    </BlockStack>
                  </Card>
                </Layout.Section>
              );
            })}
          </Layout>

          <Card>
            <BlockStack gap="200">
              <Text as="h2" variant="headingMd">Billing Notes</Text>
              <List>
                <List.Item>All plans include a 7-day free trial</List.Item>
                <List.Item>Billing is handled securely through Shopify Billing</List.Item>
                <List.Item>Overage minutes are billed at the end of each billing cycle</List.Item>
                <List.Item>You can upgrade or downgrade at any time</List.Item>
                <List.Item>Cancel anytime — no long-term contracts</List.Item>
              </List>
            </BlockStack>
          </Card>
        </BlockStack>

        {toastMessage && (
          <Toast content={toastMessage} error onDismiss={() => setToastMessage('')} duration={3000} />
        )}
      </Page>
  );
}
