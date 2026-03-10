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

  return (
    <Page title="Agent Skills" subtitle="Control what your AI phone agent can help customers with">
        <BlockStack gap="500">
          <Banner title="Important" tone="info">
            <p>
              The AI agent will <strong>never</strong> automatically modify your Shopify store data.
              For advanced skills, it collects information and sends you email notifications for manual processing.
            </p>
          </Banner>

          {/* Default Skills */}
          <Card>
            <BlockStack gap="400">
              <InlineStack align="space-between">
                <Text as="h2" variant="headingMd">Default Skills</Text>
                <Badge tone="success">Always Recommended</Badge>
              </InlineStack>
              <Divider />
              {SKILL_CATEGORIES.default.map((skillId) => {
                const skill = getSkill(skillId);
                if (!skill) return null;
                return (
                  <div key={skillId}>
                    <InlineStack align="space-between">
                      <BlockStack gap="100">
                        <InlineStack gap="200">
                          <Text as="p" variant="bodyMd" fontWeight="semibold">{skill.name}</Text>
                          {skill.isEnabled ? <Badge tone="success">Enabled</Badge> : <Badge>Disabled</Badge>}
                        </InlineStack>
                        <Text as="p" variant="bodySm" tone="subdued">
                          {SKILL_DESCRIPTIONS[skillId]}
                        </Text>
                      </BlockStack>
                      <Button
                        onClick={() => handleToggle(skillId)}
                        tone={skill.isEnabled ? 'critical' : undefined}
                        variant={skill.isEnabled ? 'secondary' : 'primary'}
                      >
                        {skill.isEnabled ? 'Disable' : 'Enable'}
                      </Button>
                    </InlineStack>
                    <Divider />
                  </div>
                );
              })}
            </BlockStack>
          </Card>

          {/* Advanced Skills */}
          <Card>
            <BlockStack gap="400">
              <InlineStack align="space-between">
                <Text as="h2" variant="headingMd">Advanced Skills</Text>
                <Badge tone="attention">Notification Only — No Auto-Modifications</Badge>
              </InlineStack>
              <Divider />
              {SKILL_CATEGORIES.advanced.map((skillId) => {
                const skill = getSkill(skillId);
                if (!skill) return null;
                return (
                  <div key={skillId}>
                    <InlineStack align="space-between">
                      <BlockStack gap="100">
                        <InlineStack gap="200">
                          <Text as="p" variant="bodyMd" fontWeight="semibold">{skill.name}</Text>
                          {skill.isEnabled ? <Badge tone="success">Enabled</Badge> : <Badge>Disabled</Badge>}
                        </InlineStack>
                        <Text as="p" variant="bodySm" tone="subdued">
                          {SKILL_DESCRIPTIONS[skillId]}
                        </Text>
                      </BlockStack>
                      <Button
                        onClick={() => handleToggle(skillId)}
                        tone={skill.isEnabled ? 'critical' : undefined}
                        variant={skill.isEnabled ? 'secondary' : 'primary'}
                      >
                        {skill.isEnabled ? 'Disable' : 'Enable'}
                      </Button>
                    </InlineStack>
                    <Divider />
                  </div>
                );
              })}
            </BlockStack>
          </Card>
        </BlockStack>

        {toastMessage && (
          <Toast content={toastMessage} onDismiss={() => setToastMessage('')} duration={2500} />
        )}
      </Page>
  );
}
