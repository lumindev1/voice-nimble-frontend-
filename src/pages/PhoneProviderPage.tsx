import { useState, useEffect, useCallback } from 'react';
import {
  Page,
  Card,
  BlockStack,
  InlineStack,
  Text,
  Button,
  TextField,
  Select,
  Toast,
  Badge,
  Banner,
  Divider,
  SkeletonBodyText,
  Modal,
  Spinner,
} from '@shopify/polaris';
import { phoneProviderApi, PhoneProvider, AvailableNumber } from '../api/phone-provider.api';

const PROVIDER_OPTIONS = [
  { label: 'Twilio', value: 'twilio' },
  { label: 'Telnyx', value: 'telnyx' },
  { label: 'Vonage', value: 'vonage' },
];

const COUNTRY_OPTIONS = [
  { label: 'United States (+1)', value: 'US' },
  { label: 'United Kingdom (+44)', value: 'GB' },
  { label: 'Bangladesh (+880)', value: 'BD' },
  { label: 'India (+91)', value: 'IN' },
  { label: 'Canada (+1)', value: 'CA' },
  { label: 'Australia (+61)', value: 'AU' },
  { label: 'Germany (+49)', value: 'DE' },
  { label: 'France (+33)', value: 'FR' },
  { label: 'Spain (+34)', value: 'ES' },
];

const NUMBER_TYPE_OPTIONS = [
  { label: 'Local', value: 'local' },
  { label: 'Toll-Free', value: 'tollfree' },
];

export default function PhoneProviderPage() {
  const [providers, setProviders] = useState<PhoneProvider[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [toastMsg, setToastMsg] = useState('');
  const [toastError, setToastError] = useState(false);

  // Connect form
  const [showConnectForm, setShowConnectForm] = useState(false);
  const [connectForm, setConnectForm] = useState({ provider: 'twilio', accountSid: '', authToken: '' });
  const [connecting, setConnecting] = useState(false);

  // Search numbers
  const [showSearchModal, setShowSearchModal] = useState(false);
  const [searchProviderId, setSearchProviderId] = useState('');
  const [searchCountry, setSearchCountry] = useState('US');
  const [searchType, setSearchType] = useState('local');
  const [availableNumbers, setAvailableNumbers] = useState<AvailableNumber[]>([]);
  const [searching, setSearching] = useState(false);
  const [buying, setBuying] = useState('');

  const load = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await phoneProviderApi.getAll();
      setProviders(res.data.providers);
    } catch {
      setToastMsg('Failed to load providers');
      setToastError(true);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleConnect = async () => {
    if (!connectForm.accountSid || !connectForm.authToken) {
      setToastMsg('Account SID and Auth Token are required');
      setToastError(true);
      return;
    }
    setConnecting(true);
    try {
      const res = await phoneProviderApi.connect(connectForm);
      setToastMsg(res.data.message);
      setToastError(false);
      setShowConnectForm(false);
      setConnectForm({ provider: 'twilio', accountSid: '', authToken: '' });
      load();
    } catch (e: unknown) {
      const msg = (e as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Failed to connect';
      setToastMsg(msg);
      setToastError(true);
    } finally {
      setConnecting(false);
    }
  };

  const handleDisconnect = async (providerId: string) => {
    try {
      await phoneProviderApi.disconnect(providerId);
      setToastMsg('Provider disconnected');
      setToastError(false);
      load();
    } catch {
      setToastMsg('Failed to disconnect');
      setToastError(true);
    }
  };

  const handleSearchNumbers = async () => {
    setSearching(true);
    setAvailableNumbers([]);
    try {
      const res = await phoneProviderApi.searchNumbers(searchProviderId, searchCountry, searchType);
      setAvailableNumbers(res.data.numbers);
      if (res.data.numbers.length === 0) {
        setToastMsg('No numbers available for this country/type');
        setToastError(false);
      }
    } catch (e: unknown) {
      const msg = (e as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Failed to search numbers';
      setToastMsg(msg);
      setToastError(true);
    } finally {
      setSearching(false);
    }
  };

  const handleBuyNumber = async (number: string) => {
    setBuying(number);
    try {
      const res = await phoneProviderApi.buyNumber(searchProviderId, number);
      setToastMsg(res.data.message);
      setToastError(false);
      setShowSearchModal(false);
      load();
    } catch (e: unknown) {
      const msg = (e as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Failed to buy number';
      setToastMsg(msg);
      setToastError(true);
    } finally {
      setBuying('');
    }
  };

  const handleReleaseNumber = async (providerId: string, numberSid: string) => {
    try {
      await phoneProviderApi.releaseNumber(providerId, numberSid);
      setToastMsg('Number released');
      setToastError(false);
      load();
    } catch {
      setToastMsg('Failed to release number');
      setToastError(true);
    }
  };

  const handleSetDefault = async (providerId: string, numberSid: string) => {
    try {
      await phoneProviderApi.setDefault(providerId, numberSid);
      setToastMsg('Default number updated');
      setToastError(false);
      load();
    } catch {
      setToastMsg('Failed to set default');
      setToastError(true);
    }
  };

  const openSearchModal = (providerId: string) => {
    setSearchProviderId(providerId);
    setAvailableNumbers([]);
    setShowSearchModal(true);
  };

  return (
    <Page
      title="Phone Providers"
      subtitle="Connect your Twilio, Telnyx, or Vonage account to easily manage phone numbers"
      primaryAction={{
        content: 'Connect Provider',
        onAction: () => setShowConnectForm(true),
      }}
    >
      <BlockStack gap="400">
        <Banner tone="info">
          <p>
            Connect your VoIP provider account to buy and manage phone numbers directly from Voice Nimble.
            No need to manually configure SIP trunks — everything is set up automatically when you buy a number.
          </p>
        </Banner>

        {/* Connect Form */}
        {showConnectForm && (
          <Card>
            <BlockStack gap="400">
              <Text as="h2" variant="headingMd">Connect a Provider</Text>

              <Select
                label="Provider"
                options={PROVIDER_OPTIONS}
                value={connectForm.provider}
                onChange={(v) => setConnectForm({ ...connectForm, provider: v })}
              />

              <TextField
                label="Account SID"
                value={connectForm.accountSid}
                onChange={(v) => setConnectForm({ ...connectForm, accountSid: v })}
                placeholder={connectForm.provider === 'twilio' ? 'AC1234567890abcdef...' : 'Your account ID'}
                autoComplete="off"
                helpText={
                  connectForm.provider === 'twilio'
                    ? 'Find this in your Twilio Console → Dashboard'
                    : 'Find this in your provider dashboard'
                }
              />

              <TextField
                label="Auth Token"
                type="password"
                value={connectForm.authToken}
                onChange={(v) => setConnectForm({ ...connectForm, authToken: v })}
                placeholder="Your auth token"
                autoComplete="off"
                helpText="This is kept secure and used only to manage your phone numbers"
              />

              <InlineStack gap="200">
                <Button variant="primary" onClick={handleConnect} loading={connecting}>
                  Connect
                </Button>
                <Button onClick={() => setShowConnectForm(false)}>
                  Cancel
                </Button>
              </InlineStack>
            </BlockStack>
          </Card>
        )}

        {/* Loading */}
        {isLoading && <Card><SkeletonBodyText lines={4} /></Card>}

        {/* No providers */}
        {!isLoading && providers.length === 0 && !showConnectForm && (
          <Card>
            <BlockStack gap="300" inlineAlign="center">
              <Text as="p" tone="subdued">No phone providers connected yet.</Text>
              <Text as="p" tone="subdued">
                Connect your Twilio or Telnyx account to buy phone numbers and start making calls.
              </Text>
              <Button variant="primary" onClick={() => setShowConnectForm(true)}>
                Connect Provider
              </Button>
            </BlockStack>
          </Card>
        )}

        {/* Connected Providers */}
        {providers.map((provider) => (
          <Card key={provider._id}>
            <BlockStack gap="400">
              {/* Provider Header */}
              <InlineStack align="space-between" blockAlign="center">
                <InlineStack gap="200" blockAlign="center">
                  <Text as="h2" variant="headingMd">
                    {provider.provider.charAt(0).toUpperCase() + provider.provider.slice(1)}
                  </Text>
                  <Badge tone="success">Connected</Badge>
                </InlineStack>
                <InlineStack gap="200">
                  <Button
                    size="slim"
                    variant="primary"
                    onClick={() => openSearchModal(provider._id)}
                  >
                    Buy Number
                  </Button>
                  <Button
                    size="slim"
                    tone="critical"
                    onClick={() => handleDisconnect(provider._id)}
                  >
                    Disconnect
                  </Button>
                </InlineStack>
              </InlineStack>

              <Text as="p" variant="bodySm" tone="subdued">
                Account: {provider.accountSid.substring(0, 8)}...
                {provider.connectedAt && ` | Connected: ${new Date(provider.connectedAt).toLocaleDateString()}`}
              </Text>

              <Divider />

              {/* Phone Numbers */}
              <Text as="h3" variant="headingSm">My Phone Numbers</Text>

              {provider.phoneNumbers.length === 0 ? (
                <Text as="p" tone="subdued">
                  No phone numbers yet. Click "Buy Number" to get a phone number for your AI agent.
                </Text>
              ) : (
                <BlockStack gap="300">
                  {provider.phoneNumbers.map((num) => (
                    <InlineStack key={num.sid} align="space-between" blockAlign="center">
                      <InlineStack gap="200" blockAlign="center">
                        <Text as="span" variant="bodyMd" fontWeight="bold">{num.number}</Text>
                        <Text as="span" variant="bodySm" tone="subdued">{num.friendlyName}</Text>
                        {num.isDefault && <Badge tone="success">Default</Badge>}
                        {num.capabilities.voice && <Badge>Voice</Badge>}
                        {num.capabilities.sms && <Badge>SMS</Badge>}
                      </InlineStack>
                      <InlineStack gap="200">
                        {!num.isDefault && (
                          <Button size="slim" onClick={() => handleSetDefault(provider._id, num.sid)}>
                            Set Default
                          </Button>
                        )}
                        <Button
                          size="slim"
                          tone="critical"
                          onClick={() => handleReleaseNumber(provider._id, num.sid)}
                        >
                          Release
                        </Button>
                      </InlineStack>
                    </InlineStack>
                  ))}
                </BlockStack>
              )}
            </BlockStack>
          </Card>
        ))}
      </BlockStack>

      {/* Search Numbers Modal */}
      <Modal
        open={showSearchModal}
        onClose={() => setShowSearchModal(false)}
        title="Buy a Phone Number"
        size="large"
      >
        <Modal.Section>
          <BlockStack gap="400">
            <InlineStack gap="200">
              <div style={{ flex: 1 }}>
                <Select
                  label="Country"
                  options={COUNTRY_OPTIONS}
                  value={searchCountry}
                  onChange={setSearchCountry}
                />
              </div>
              <div style={{ flex: 1 }}>
                <Select
                  label="Number Type"
                  options={NUMBER_TYPE_OPTIONS}
                  value={searchType}
                  onChange={setSearchType}
                />
              </div>
            </InlineStack>

            <Button variant="primary" onClick={handleSearchNumbers} loading={searching}>
              Search Available Numbers
            </Button>

            {searching && (
              <InlineStack align="center" gap="200">
                <Spinner size="small" />
                <Text as="p">Searching for available numbers...</Text>
              </InlineStack>
            )}

            {availableNumbers.length > 0 && (
              <>
                <Divider />
                <Text as="h3" variant="headingSm">
                  Available Numbers ({availableNumbers.length})
                </Text>
                <BlockStack gap="200">
                  {availableNumbers.map((num) => (
                    <Card key={num.number}>
                      <InlineStack align="space-between" blockAlign="center">
                        <BlockStack gap="100">
                          <Text as="span" variant="bodyMd" fontWeight="bold">{num.number}</Text>
                          <Text as="span" variant="bodySm" tone="subdued">
                            {num.friendlyName} {num.region && `| ${num.region}`}
                          </Text>
                        </BlockStack>
                        <InlineStack gap="200" blockAlign="center">
                          <Text as="span" variant="bodySm">{num.monthlyPrice}/mo</Text>
                          <Button
                            variant="primary"
                            size="slim"
                            onClick={() => handleBuyNumber(num.number)}
                            loading={buying === num.number}
                          >
                            Buy
                          </Button>
                        </InlineStack>
                      </InlineStack>
                    </Card>
                  ))}
                </BlockStack>
              </>
            )}
          </BlockStack>
        </Modal.Section>
      </Modal>

      {toastMsg && (
        <Toast
          content={toastMsg}
          error={toastError}
          onDismiss={() => setToastMsg('')}
        />
      )}
    </Page>
  );
}
