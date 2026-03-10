import { useState } from 'react';
import {
  Page,
  Card,
  BlockStack,
  Text,
  Collapsible,
  Divider,
  InlineStack,
} from '@shopify/polaris';

const FAQ_ITEMS = [
  {
    q: 'How does Voice Nimble work?',
    a: 'Voice Nimble provides you with an AI-powered phone agent that answers calls to your store. When a customer calls, the AI answers, understands their question using advanced language models, and provides helpful responses based on your store\'s data — including orders, products, and policies.',
  },
  {
    q: 'Will the AI automatically modify my Shopify store?',
    a: 'No. The AI will never automatically modify your Shopify store. For actions like refunds, cancellations, or order modifications, the AI collects the customer\'s request and sends you an email notification so you can take manual action. This is by design to keep you in full control.',
  },
  {
    q: 'How does the AI know about my store\'s orders and products?',
    a: 'Voice Nimble connects to your Shopify store through the official Shopify Admin API. When a customer calls and asks about an order, the AI can look up order status, products, and policies in real time. Sensitive data is never stored — it\'s fetched fresh for each conversation.',
  },
  {
    q: 'What is a Jambonz and why does Voice Nimble use it?',
    a: 'Jambonz is an open-source programmable voice platform (similar to Twilio) that handles the telephony infrastructure. It routes phone calls to Voice Nimble, manages call recording, transcriptions, and call transfers. Voice Nimble uses Jambonz to provide enterprise-grade telephony without vendor lock-in.',
  },
  {
    q: 'Can I use my existing business phone number?',
    a: 'Yes! Voice Nimble supports "Bring Your Own Number" (BYON). You can configure your existing SIP-compatible phone number in the Agent settings. Alternatively, we can provision a new number for you through Jambonz.',
  },
  {
    q: 'How is call recording handled?',
    a: 'Call recording is available on the Advanced and Pro plans. Recordings are stored securely and accessible from the Call History page. Recordings are retained for 30 days (Advanced) or 90 days (Pro) and then automatically deleted. On the Basic plan, recordings are not available.',
  },
  {
    q: 'What happens if all agent lines are busy?',
    a: 'Your subscription plan defines how many simultaneous calls your agent can handle (1 on Basic, 3 on Advanced, 10 on Pro). If all lines are busy, the AI politely informs the caller that all agents are busy and asks them to try again shortly.',
  },
  {
    q: 'How is billing calculated?',
    a: 'Billing is based on the number of minutes your AI agent spends on calls. Each plan includes a set number of minutes per month. If you exceed your included minutes, you\'ll be charged an overage rate per additional minute. Billing is processed through Shopify\'s secure billing system.',
  },
  {
    q: 'Can I transfer a call to a human agent?',
    a: 'Yes! You can configure a "Human Handoff" phone number in the Agent settings. When a customer asks to speak to a human, or when the AI determines that a transfer is appropriate (e.g., complex issues), it will announce the transfer and connect the caller to your configured number.',
  },
  {
    q: 'What AI model powers Voice Nimble?',
    a: 'Voice Nimble uses Anthropic\'s Claude model for natural conversation understanding and response generation. Claude is known for its helpfulness, harmlessness, and ability to follow complex instructions — making it ideal for customer service applications.',
  },
  {
    q: 'Is my data secure?',
    a: 'Yes. Voice Nimble only stores call metadata, transcripts, and configuration. We never store your Shopify products or orders permanently — they are fetched in real-time and cached briefly for performance. All data transmission is encrypted via HTTPS. Your Shopify access token is stored encrypted in our database.',
  },
  {
    q: 'Can I cancel my subscription?',
    a: 'Yes, you can cancel at any time from the Subscription page. There are no long-term contracts. Your access will continue until the end of the current billing period.',
  },
];

function FaqItem({ question, answer }: { question: string; answer: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div>
      <div style={{ padding: '12px 0' }}>
        <div
          role="button"
          tabIndex={0}
          onClick={() => setOpen((o) => !o)}
          onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') setOpen((o) => !o); }}
          style={{ cursor: 'pointer', width: '100%', background: 'none', border: 'none', padding: 0 }}
        >
          <InlineStack align="space-between" blockAlign="center">
            <Text as="span" variant="bodyMd" fontWeight="semibold">{question}</Text>
            <Text as="span" variant="bodySm">{open ? '▲' : '▼'}</Text>
          </InlineStack>
        </div>
        <Collapsible open={open} id={question}>
          <div style={{ padding: '8px 0 4px' }}>
            <Text as="p" variant="bodySm" tone="subdued">{answer}</Text>
          </div>
        </Collapsible>
      </div>
      <Divider />
    </div>
  );
}

export default function FaqPage() {
  return (
    <Page title="FAQ" subtitle="Frequently asked questions about Voice Nimble">
      <BlockStack gap="400">
        <Card>
          <BlockStack gap="200">
            <Text as="h2" variant="headingMd">General Questions</Text>
            <Divider />
            {FAQ_ITEMS.map((item) => (
              <FaqItem key={item.q} question={item.q} answer={item.a} />
            ))}
          </BlockStack>
        </Card>

        <Card>
          <BlockStack gap="300">
            <Text as="h2" variant="headingMd">Need more help?</Text>
            <Text as="p" variant="bodyMd">
              Contact our support team at{' '}
              <a href="mailto:support@voicenimble.com" style={{ color: '#5C6AC4' }}>
                support@voicenimble.com
              </a>
            </Text>
          </BlockStack>
        </Card>
      </BlockStack>
    </Page>
  );
}
