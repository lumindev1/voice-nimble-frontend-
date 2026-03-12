import { useEffect, useState } from 'react';
import {
  Page,
  Card,
  BlockStack,
  Text,
  InlineStack,
  Badge,
  Button,
  Divider,
  Banner,
  Toast,
} from '@shopify/polaris';
import { skillsApi, Skill } from '../api/skills.api';

const SKILL_DESCRIPTIONS: Record<string, string> = {
  order_status: 'Let customers check their order status, tracking, and delivery estimates by providing their order number or email.',
  product_browsing: 'Allow customers to browse products, ask about availability, pricing, and product details.',
  policies_info: 'Share your store policies including return, refund, shipping, and privacy policies.',
  refund_request: 'Collect refund request information from customers and send you a notification. The AI will NOT process refunds automatically.',
  exchange_request: 'Collect exchange request details and send notifications. No automatic store modifications.',
  modify_shipping: 'Collect shipping address change requests and notify your team. No automatic modifications.',
  cancel_order: 'Collect cancellation requests and send notifications. No orders will be cancelled automatically.',
  place_order: 'Guide customers through placing orders over the phone, creating draft orders in Shopify for your review.',
};

const SKILL_ICONS: Record<string, string> = {
  order_status: '📦',
  product_browsing: '🛍',
  policies_info: '📜',
  refund_request: '💰',
  exchange_request: '🔄',
  modify_shipping: '🚚',
  cancel_order: '❌',
  place_order: '🛒',
};

const SKILL_CATEGORIES = {
  default: ['order_status', 'product_browsing', 'policies_info'],
  advanced: ['refund_request', 'exchange_request', 'modify_shipping', 'cancel_order', 'place_order'],
};

export default function SkillsPage() {
  const [skills, setSkills] = useState<Skill[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [toastMessage, setToastMessage] = useState('');

  useEffect(() => {
    skillsApi.list().then((r) => setSkills(r.data.skills)).finally(() => setIsLoading(false));
  }, []);

  const handleToggle = async (skillId: string) => {
    try {
      const res = await skillsApi.toggle(skillId);
      setSkills((prev) => prev.map((s) => (s.skillId === skillId ? res.data.skill : s)));
      const skill = skills.find((s) => s.skillId === skillId);
      setToastMessage(`${skill?.name} ${skill?.isEnabled ? 'disabled' : 'enabled'}`);
    } catch {
      setToastMessage('Failed to update skill');
    }
  };

  const getSkill = (skillId: string) => skills.find((s) => s.skillId === skillId);

  if (isLoading) return <Page title="Agent Skills"><Card><Text as="p">Loading...</Text></Card></Page>;

  const renderSkillItem = (skillId: string) => {
    const skill = getSkill(skillId);
    if (!skill) return null;
    return (
      <div key={skillId} style={{
        padding: '16px',
        borderRadius: 12,
        border: '1px solid #e5e7eb',
        background: skill.isEnabled ? '#f0fdf4' : '#fff',
        transition: 'all 0.2s',
      }}>
        <InlineStack align="space-between" blockAlign="start">
          <InlineStack gap="300" blockAlign="start">
            <div style={{
              width: 40,
              height: 40,
              borderRadius: 10,
              background: skill.isEnabled ? '#dcfce7' : '#f3f4f6',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 20,
              flexShrink: 0,
            }}>
              {SKILL_ICONS[skillId] || '⚙'}
            </div>
            <BlockStack gap="100">
              <InlineStack gap="200" blockAlign="center">
                <Text as="p" variant="bodyMd" fontWeight="semibold">{skill.name}</Text>
                {skill.isEnabled && <Badge tone="success">Active</Badge>}
              </InlineStack>
              <Text as="p" variant="bodySm" tone="subdued">
                {SKILL_DESCRIPTIONS[skillId]}
              </Text>
            </BlockStack>
          </InlineStack>
          <Button
            onClick={() => handleToggle(skillId)}
            tone={skill.isEnabled ? 'critical' : undefined}
            variant={skill.isEnabled ? 'secondary' : 'primary'}
            size="slim"
          >
            {skill.isEnabled ? 'Disable' : 'Enable'}
          </Button>
        </InlineStack>
      </div>
    );
  };

  return (
    <Page title="Agent Skills" subtitle="Control what your AI phone agent can do">
      <BlockStack gap="500">
        <Banner title="Safe by Design" tone="info">
          <p>
            Your AI agent will <strong>never</strong> automatically modify your Shopify store.
            Advanced skills collect information and notify you for manual processing.
          </p>
        </Banner>

        <Card>
          <BlockStack gap="400">
            <InlineStack align="space-between" blockAlign="center">
              <BlockStack gap="050">
                <Text as="h2" variant="headingMd" fontWeight="semibold">Core Skills</Text>
                <Text as="p" variant="bodySm" tone="subdued">Essential capabilities for customer service</Text>
              </BlockStack>
              <Badge tone="success">Recommended</Badge>
            </InlineStack>
            <Divider />
            <BlockStack gap="300">
              {SKILL_CATEGORIES.default.map(renderSkillItem)}
            </BlockStack>
          </BlockStack>
        </Card>

        <Card>
          <BlockStack gap="400">
            <InlineStack align="space-between" blockAlign="center">
              <BlockStack gap="050">
                <Text as="h2" variant="headingMd" fontWeight="semibold">Advanced Skills</Text>
                <Text as="p" variant="bodySm" tone="subdued">Extended capabilities with notification-only processing</Text>
              </BlockStack>
              <Badge tone="attention">Notification Only</Badge>
            </InlineStack>
            <Divider />
            <BlockStack gap="300">
              {SKILL_CATEGORIES.advanced.map(renderSkillItem)}
            </BlockStack>
          </BlockStack>
        </Card>
      </BlockStack>

      {toastMessage && (
        <Toast content={toastMessage} onDismiss={() => setToastMessage('')} duration={2500} />
      )}
    </Page>
  );
}
