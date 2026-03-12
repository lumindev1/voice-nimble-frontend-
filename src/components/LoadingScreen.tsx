import { Spinner, Frame, Text, BlockStack } from '@shopify/polaris';

export default function LoadingScreen() {
  return (
    <Frame>
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          height: '100vh',
          gap: 20,
        }}
      >
        <div style={{
          width: 56,
          height: 56,
          borderRadius: 14,
          background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#fff',
          fontWeight: 700,
          fontSize: 22,
          letterSpacing: -0.5,
        }}>
          VN
        </div>
        <BlockStack gap="200" align="center">
          <Spinner size="small" />
          <Text as="p" variant="bodySm" tone="subdued">Loading Voice Nimble...</Text>
        </BlockStack>
      </div>
    </Frame>
  );
}
