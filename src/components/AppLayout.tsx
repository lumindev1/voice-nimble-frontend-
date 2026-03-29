import { ReactNode } from 'react';
import { Frame, Navigation, Text, InlineStack } from '@shopify/polaris';
import {
  HomeIcon,
  PhoneIcon,
  ClockIcon,
  ChartVerticalIcon,
  AppsIcon,
  CreditCardIcon,
  EmailIcon,
  QuestionCircleIcon,
  PersonIcon,
  NoteIcon,
  SoundIcon,
  SettingsIcon,
} from '@shopify/polaris-icons';
import { useNavigate, useLocation } from 'react-router-dom';

interface AppLayoutProps {
  children: ReactNode;
}

export default function AppLayout({ children }: AppLayoutProps) {
  const navigate = useNavigate();
  const location = useLocation();

  const isSelected = (path: string) => location.pathname === path || (path !== '/dashboard' && location.pathname.startsWith(path));

  const logo = {
    topBarSource: '',
    width: 0,
  };

  const navigationMarkup = (
    <Navigation location={location.pathname}>
      <div style={{ padding: '20px 16px 12px', borderBottom: '1px solid #e1e3e5' }}>
        <InlineStack gap="300" blockAlign="center">
          <div style={{
            width: 36,
            height: 36,
            borderRadius: 10,
            background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#fff',
            fontWeight: 700,
            fontSize: 16,
            letterSpacing: -0.5,
          }}>
            VN
          </div>
          <div>
            <Text as="p" variant="headingSm" fontWeight="bold">Voice Nimble</Text>
            <Text as="p" variant="bodySm" tone="subdued">AI Phone Agent</Text>
          </div>
        </InlineStack>
      </div>

      <Navigation.Section
        items={[
          {
            label: 'Dashboard',
            icon: HomeIcon,
            selected: isSelected('/dashboard'),
            onClick: () => navigate('/dashboard'),
          },
        ]}
      />
      <Navigation.Section
        title="Manage"
        items={[
          {
            label: 'Virtual Agent',
            icon: PhoneIcon,
            selected: isSelected('/agent'),
            onClick: () => navigate('/agent'),
          },
          {
            label: 'Knowledge Base',
            icon: NoteIcon,
            selected: isSelected('/knowledge-base'),
            onClick: () => navigate('/knowledge-base'),
          },
          {
            label: 'Call Templates',
            icon: SoundIcon,
            selected: isSelected('/templates'),
            onClick: () => navigate('/templates'),
          },
          {
            label: 'Contacts',
            icon: PersonIcon,
            selected: isSelected('/contacts'),
            onClick: () => navigate('/contacts'),
          },
        ]}
      />
      <Navigation.Section
        title="Campaigns"
        items={[
          {
            label: 'Broadcast Calls',
            icon: ChartVerticalIcon,
            selected: isSelected('/broadcast'),
            onClick: () => navigate('/broadcast'),
          },
          {
            label: 'Event-Driven Calls',
            icon: AppsIcon,
            selected: isSelected('/event-driven'),
            onClick: () => navigate('/event-driven'),
          },
          {
            label: 'Test Call',
            icon: PhoneIcon,
            selected: isSelected('/test-call'),
            onClick: () => navigate('/test-call'),
          },
        ]}
      />
      <Navigation.Section
        title="Insights"
        items={[
          {
            label: 'Call History',
            icon: ClockIcon,
            selected: isSelected('/call-history'),
            onClick: () => navigate('/call-history'),
          },
          {
            label: 'Analytics',
            icon: ChartVerticalIcon,
            selected: isSelected('/analytics'),
            onClick: () => navigate('/analytics'),
          },
        ]}
      />
      <Navigation.Section
        title="Settings"
        separator
        items={[
          {
            label: 'SIP Trunks',
            icon: SettingsIcon,
            selected: isSelected('/sip-trunks'),
            onClick: () => navigate('/sip-trunks'),
          },
          {
            label: 'Phone Providers',
            icon: PhoneIcon,
            selected: isSelected('/phone-providers'),
            onClick: () => navigate('/phone-providers'),
          },
          {
            label: 'Agent Skills',
            icon: AppsIcon,
            selected: isSelected('/skills'),
            onClick: () => navigate('/skills'),
          },
          {
            label: 'Subscription',
            icon: CreditCardIcon,
            selected: isSelected('/billing'),
            onClick: () => navigate('/billing'),
          },
          {
            label: 'Notifications',
            icon: EmailIcon,
            selected: isSelected('/notifications'),
            onClick: () => navigate('/notifications'),
          },
          {
            label: 'FAQ',
            icon: QuestionCircleIcon,
            selected: isSelected('/faq'),
            onClick: () => navigate('/faq'),
          },
        ]}
      />
    </Navigation>
  );

  return (
    <Frame navigation={navigationMarkup} logo={logo}>
      <div style={{ background: '#f6f6f7', minHeight: '100vh' }}>
        {children}
      </div>
    </Frame>
  );
}
