import { useState, useEffect, useCallback } from 'react';
import {
  Page,
  Card,
  BlockStack,
  InlineStack,
  Text,
  Button,
  Badge,
  Modal,
  FormLayout,
  TextField,
  Select,
  Toast,
  EmptyState,
  SkeletonBodyText,
  Banner,
  Divider,
} from '@shopify/polaris';
import { sipTrunkApi, SipTrunk } from '../api/sip-trunk.api';

const PROTOCOL_OPTIONS = [
  { label: 'UDP', value: 'udp' },
  { label: 'TCP', value: 'tcp' },
  { label: 'TLS', value: 'tls' },
];

const EMPTY_FORM = {
  name: '',
  description: '',
  sipHost: '',
  sipPort: '5060',
  sipProtocol: 'udp',
  sipUsername: '',
  sipPassword: '',
  sipRealm: '',
  callerIdNumber: '',
  callerIdName: '',
};

export default function SipTrunkPage() {
  const [trunks, setTrunks] = useState<SipTrunk[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingTrunk, setEditingTrunk] = useState<SipTrunk | null>(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [toastMsg, setToastMsg] = useState('');
  const [toastError, setToastError] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  const loadTrunks = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await sipTrunkApi.getAll();
      setTrunks(res.data.trunks);
    } catch {
      setToastMsg('Failed to load SIP trunks');
      setToastError(true);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => { loadTrunks(); }, [loadTrunks]);

  const openCreate = () => {
    setEditingTrunk(null);
    setForm(EMPTY_FORM);
    setShowModal(true);
  };

  const openEdit = (trunk: SipTrunk) => {
    setEditingTrunk(trunk);
    setForm({
      name: trunk.name,
      description: trunk.description || '',
      sipHost: trunk.sipHost,
      sipPort: String(trunk.sipPort),
      sipProtocol: trunk.sipProtocol,
      sipUsername: trunk.sipUsername || '',
      sipPassword: trunk.sipPassword || '',
      sipRealm: trunk.sipRealm || '',
      callerIdNumber: trunk.callerIdNumber,
      callerIdName: trunk.callerIdName || '',
    });
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!form.name || !form.sipHost || !form.callerIdNumber) {
      setToastMsg('Name, SIP Host, and Caller ID Number are required');
      setToastError(true);
      return;
    }

    setSaving(true);
    try {
      const payload = {
        ...form,
        sipPort: parseInt(form.sipPort, 10) || 5060,
        sipProtocol: form.sipProtocol as 'udp' | 'tcp' | 'tls',
      };

      if (editingTrunk) {
        await sipTrunkApi.update(editingTrunk._id, payload);
        setToastMsg('SIP trunk updated');
      } else {
        await sipTrunkApi.create(payload);
        setToastMsg('SIP trunk created');
      }
      setToastError(false);
      setShowModal(false);
      loadTrunks();
    } catch {
      setToastMsg('Failed to save SIP trunk');
      setToastError(true);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await sipTrunkApi.delete(id);
      setToastMsg('SIP trunk deleted');
      setToastError(false);
      setDeleteConfirm(null);
      loadTrunks();
    } catch {
      setToastMsg('Failed to delete SIP trunk');
      setToastError(true);
    }
  };

  const handleSetDefault = async (id: string) => {
    try {
      await sipTrunkApi.setDefault(id);
      setToastMsg('Default SIP trunk updated');
      setToastError(false);
      loadTrunks();
    } catch {
      setToastMsg('Failed to set default');
      setToastError(true);
    }
  };

  const updateField = (field: string) => (value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <Page
      title="SIP Trunks"
      subtitle="Configure your own phone numbers for outbound calls"
      primaryAction={{ content: 'Add SIP Trunk', onAction: openCreate }}
    >
      <BlockStack gap="400">
        <Banner tone="info">
          <p>
            Each SIP trunk connects to your VoIP provider. The caller ID number you set here
            will be shown to customers when your AI agent calls them. You need a SIP trunk from
            a VoIP provider (e.g., Telnyx, Twilio, or local carrier) to use your own number.
          </p>
        </Banner>

        {isLoading ? (
          <Card><SkeletonBodyText lines={4} /></Card>
        ) : trunks.length === 0 ? (
          <Card>
            <EmptyState
              heading="No SIP trunks configured"
              image=""
              action={{ content: 'Add SIP Trunk', onAction: openCreate }}
            >
              <p>Add your VoIP provider's SIP trunk to make calls with your own phone number.</p>
            </EmptyState>
          </Card>
        ) : (
          trunks.map((trunk) => (
            <Card key={trunk._id}>
              <BlockStack gap="300">
                <InlineStack align="space-between" blockAlign="center">
                  <InlineStack gap="200" blockAlign="center">
                    <Text as="h2" variant="headingMd">{trunk.name}</Text>
                    {trunk.isDefault && <Badge tone="success">Default</Badge>}
                    {trunk.isActive ? (
                      <Badge tone="success">Active</Badge>
                    ) : (
                      <Badge>Inactive</Badge>
                    )}
                  </InlineStack>
                  <InlineStack gap="200">
                    {!trunk.isDefault && (
                      <Button size="slim" onClick={() => handleSetDefault(trunk._id)}>
                        Set as Default
                      </Button>
                    )}
                    <Button size="slim" onClick={() => openEdit(trunk)}>Edit</Button>
                    <Button size="slim" tone="critical" onClick={() => setDeleteConfirm(trunk._id)}>
                      Delete
                    </Button>
                  </InlineStack>
                </InlineStack>

                <Divider />

                <InlineStack gap="800">
                  <BlockStack gap="100">
                    <Text as="span" variant="bodySm" tone="subdued">Caller ID Number</Text>
                    <Text as="span" variant="bodyMd" fontWeight="semibold">{trunk.callerIdNumber}</Text>
                  </BlockStack>
                  <BlockStack gap="100">
                    <Text as="span" variant="bodySm" tone="subdued">SIP Host</Text>
                    <Text as="span" variant="bodyMd">{trunk.sipHost}:{trunk.sipPort}</Text>
                  </BlockStack>
                  <BlockStack gap="100">
                    <Text as="span" variant="bodySm" tone="subdued">Protocol</Text>
                    <Text as="span" variant="bodyMd">{trunk.sipProtocol.toUpperCase()}</Text>
                  </BlockStack>
                  {trunk.callerIdName && (
                    <BlockStack gap="100">
                      <Text as="span" variant="bodySm" tone="subdued">Caller Name</Text>
                      <Text as="span" variant="bodyMd">{trunk.callerIdName}</Text>
                    </BlockStack>
                  )}
                </InlineStack>

                {trunk.description && (
                  <Text as="p" variant="bodySm" tone="subdued">{trunk.description}</Text>
                )}
              </BlockStack>
            </Card>
          ))
        )}
      </BlockStack>

      {/* Create/Edit Modal */}
      <Modal
        open={showModal}
        onClose={() => setShowModal(false)}
        title={editingTrunk ? 'Edit SIP Trunk' : 'Add SIP Trunk'}
        primaryAction={{ content: 'Save', onAction: handleSave, loading: saving }}
        secondaryActions={[{ content: 'Cancel', onAction: () => setShowModal(false) }]}
      >
        <Modal.Section>
          <FormLayout>
            <TextField
              label="Name"
              value={form.name}
              onChange={updateField('name')}
              placeholder="e.g., My Business Line"
              autoComplete="off"
            />
            <TextField
              label="Description"
              value={form.description}
              onChange={updateField('description')}
              placeholder="Optional description"
              autoComplete="off"
            />

            <Divider />
            <Text as="h3" variant="headingSm">Caller ID</Text>

            <FormLayout.Group>
              <TextField
                label="Caller ID Number"
                value={form.callerIdNumber}
                onChange={updateField('callerIdNumber')}
                placeholder="e.g., +8801XXXXXXXXX"
                helpText="This number will show on the customer's phone"
                autoComplete="off"
              />
              <TextField
                label="Caller Name (optional)"
                value={form.callerIdName}
                onChange={updateField('callerIdName')}
                placeholder="e.g., My Store"
                autoComplete="off"
              />
            </FormLayout.Group>

            <Divider />
            <Text as="h3" variant="headingSm">SIP Provider Details</Text>
            <Banner tone="info">
              <p>Get these details from your VoIP provider (Telnyx, Twilio, local carrier, etc.)</p>
            </Banner>

            <FormLayout.Group>
              <TextField
                label="SIP Host / IP"
                value={form.sipHost}
                onChange={updateField('sipHost')}
                placeholder="e.g., sip.telnyx.com or 103.x.x.x"
                autoComplete="off"
              />
              <TextField
                label="SIP Port"
                type="number"
                value={form.sipPort}
                onChange={updateField('sipPort')}
                autoComplete="off"
              />
            </FormLayout.Group>

            <Select
              label="Protocol"
              options={PROTOCOL_OPTIONS}
              value={form.sipProtocol}
              onChange={updateField('sipProtocol')}
            />

            <FormLayout.Group>
              <TextField
                label="SIP Username (optional)"
                value={form.sipUsername}
                onChange={updateField('sipUsername')}
                autoComplete="off"
              />
              <TextField
                label="SIP Password (optional)"
                type="password"
                value={form.sipPassword}
                onChange={updateField('sipPassword')}
                autoComplete="off"
              />
            </FormLayout.Group>

            <TextField
              label="SIP Realm (optional)"
              value={form.sipRealm}
              onChange={updateField('sipRealm')}
              placeholder="Usually same as SIP Host"
              autoComplete="off"
            />
          </FormLayout>
        </Modal.Section>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        open={!!deleteConfirm}
        onClose={() => setDeleteConfirm(null)}
        title="Delete SIP Trunk?"
        primaryAction={{
          content: 'Delete',
          destructive: true,
          onAction: () => deleteConfirm && handleDelete(deleteConfirm),
        }}
        secondaryActions={[{ content: 'Cancel', onAction: () => setDeleteConfirm(null) }]}
      >
        <Modal.Section>
          <Text as="p">
            This will remove the SIP trunk and its connection to your VoIP provider.
            Calls will fall back to the default system number.
          </Text>
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
