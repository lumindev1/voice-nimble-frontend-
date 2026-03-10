import { Spinner, Frame } from '@shopify/polaris';

export default function LoadingScreen() {
  return (
    <Frame>
      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: '100vh',
        }}
      >
        <Spinner size="large" />
      </div>
    </Frame>
  );
}
