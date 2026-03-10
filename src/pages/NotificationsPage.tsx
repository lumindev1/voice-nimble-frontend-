import { useEffect, useState } from 'react';
import {
  Page,
  Card,
  FormLayout,
  TextField,
  Checkbox,
  Select,
  Button,
  BlockStack,
  Text,
  Badge,
  Divider,
  Banner,
  Toast,
} from '@shopify/polaris';
import { notificationsApi, NotificationSettings } from '../api/notifications.api';

export default function NotificationsPage() {
  const [settings, setSettings] = useState<Partial<NotificationSettings>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isSendingVerification, setIsSendingVerification] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastError, setToastError] = useState(false);

  useEffect(() => {
    notificationsApi.get().then((r) => setSettings(r.data.settings)).finally(() => setIsLoading(false));
  }, []);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const res = await notificationsApi.update(settings);
      setSettings(res.data.settings);
      setToastMessage('Notification settings saved');
      setToastError(false);
    } catch {
      setToastMessage('Failed to save settings');
      setToastError(true);
    } finally {
      setIsSaving(false);
    }
  };

  const handleSendVerification = async () => {
    setIsSendingVerification(true);
    try {
      await notificationsApi.sendVerification();
      setToastMessage('Verification email sent! Check your inbox.');
      setToastError(false);
    } catch {
      setToastMessage('Failed to send verification email');
      setToastError(true);
    } finally {
      setIsSendingVerification(false);
    }
  };

  const weekdays = [
    { label: 'Sunday', value: '0' },
    { label: 'Monday', value: '1' },
    { label: 'Tuesday', value: '2' },
    { label: 'Wednesday', value: '3' },
    { label: 'Thursday', value: '4' },
    { label: 'Friday', value: '5' },
    { label: 'Saturday', value: '6' },
  ];

  if (isLoading) return <Page title="Email Preferences"><Card><Text as="p">Loading...</Text></Card></Page>;

  return (
    <Page
        title="Email Preferences"
        subtitle="Configure how Voice Nimble notifies you about calls"
        primaryAction={{ content: 'Save Settings', onAction: handleSave, loading: isSaving }}
      >
        <BlockStack gap="500">
          {/* Email config */}
          <Card>
            <BlockStack gap="400">
              <Text as="h2" variant="headingMd">Notification Email</Text>
              <Divider />
              <FormLayout>
                <TextField
                  label="Email Address"
                  type="email"
                  value={settings.notificationEmail || ''}
                  onChange={(v) => setSettings((p) => ({ ...p, notificationEmail: v }))}
                  autoComplete="email"
                  helpText="All notifications will be sent to this address"
                  connectedRight={
                    settings.isEmailVerified ? (
                      <Badge tone="success">Verified</Badge>
                    ) : (
                      <Button
                        onClick={handleSendVerification}
                        loading={isSendingVerification}
                        disabled={!settings.notificationEmail}
                      >
                        Verify
                      </Button>
                    )
                  }
                />
              </FormLayout>

              {!settings.isEmailVerified && settings.notificationEmail && (
                <Banner tone="warning" title="Email not verified">
                  <p>Please verify your email to receive notifications.</p>
                </Banner>
              )}
            </BlockStack>
          </Card>

          {/* Per-call notifications */}
          <Card>
            <BlockStack gap="400">
              <Text as="h2" variant="headingMd">Call Notifications</Text>
              <Divider />
              <FormLayout>
                <Checkbox
                  label="Send email notification after each call"
                  checked={!!settings.sendPerCallNotification}
                  onChange={(v) => setSettings((p) => ({ ...p, sendPerCallNotification: v }))}
                />
                {settings.sendPerCallNotification && (
                  <>
                    <Checkbox
                      label="Include call transcript"
                      checked={!!settings.includeTranscript}
                      onChange={(v) => setSettings((p) => ({ ...p, includeTranscript: v }))}
                    />
                    <Checkbox
                      label="Include recording link"
                      checked={!!settings.includeRecordingLink}
                      onChange={(v) => setSettings((p) => ({ ...p, includeRecordingLink: v }))}
                    />
                    <Checkbox
                      label="Include sentiment analysis"
                      checked={!!settings.includeSentimentAnalysis}
                      onChange={(v) => setSettings((p) => ({ ...p, includeSentimentAnalysis: v }))}
                    />
                  </>
                )}
              </FormLayout>
            </BlockStack>
          </Card>

          {/* Summary reports */}
          <Card>
            <BlockStack gap="400">
              <Text as="h2" variant="headingMd">Summary Reports</Text>
              <Divider />
              <FormLayout>
                <Checkbox
                  label="Daily Summary"
                  checked={!!settings.sendDailySummary}
                  onChange={(v) => setSettings((p) => ({ ...p, sendDailySummary: v }))}
                />
                {settings.sendDailySummary && (
                  <TextField
                    label="Daily summary time"
                    type="time"
                    value={settings.dailySummaryTime || '08:00'}
                    onChange={(v) => setSettings((p) => ({ ...p, dailySummaryTime: v }))}
                    autoComplete="off"
                    helpText="Time to send the daily summary (your store timezone)"
                  />
                )}

                <Checkbox
                  label="Weekly Report"
                  checked={!!settings.sendWeeklyReport}
                  onChange={(v) => setSettings((p) => ({ ...p, sendWeeklyReport: v }))}
                />
                {settings.sendWeeklyReport && (
                  <Select
                    label="Send weekly report on"
                    options={weekdays}
                    value={String(settings.weeklyReportDay ?? 1)}
                    onChange={(v) => setSettings((p) => ({ ...p, weeklyReportDay: parseInt(v) }))}
                  />
                )}

                <Checkbox
                  label="Monthly Report"
                  checked={!!settings.sendMonthlyReport}
                  onChange={(v) => setSettings((p) => ({ ...p, sendMonthlyReport: v }))}
                />
                {settings.sendMonthlyReport && (
                  <TextField
                    label="Send monthly report on day"
                    type="number"
                    value={String(settings.monthlyReportDay ?? 1)}
                    onChange={(v) => setSettings((p) => ({ ...p, monthlyReportDay: Math.min(28, parseInt(v)) }))}
                    autoComplete="off"
                    min="1"
                    max="28"
                    helpText="Day of the month (1-28)"
                  />
                )}
              </FormLayout>
            </BlockStack>
          </Card>
        </BlockStack>

        {toastMessage && (
          <Toast
            content={toastMessage}
            error={toastError}
            onDismiss={() => setToastMessage('')}
            duration={3000}
          />
        )}
      </Page>
  );
}
