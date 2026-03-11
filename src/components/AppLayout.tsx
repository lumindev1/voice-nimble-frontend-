import { ReactNode } from 'react';
import { Frame, Navigation } from '@shopify/polaris';
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
} from '@shopify/polaris-icons';
import { useNavigate, useLocation } from 'react-router-dom';

interface AppLayoutProps {
  children: ReactNode;
}

export default function AppLayout({ children }: AppLayoutProps) {
  const navigate = useNavigate();
  const location = useLocation();

  const isSelected = (path: string) => location.pathname.startsWith(path);

  const navigationMarkup = (
    <Navigation location={location.pathname}>
      <Navigation.Section
        title="ERP Analytics"
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
        title="Apps Section"
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
            label: 'Call Template',
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
          {
            label: 'Broadcast Calls',
            icon: ChartVerticalIcon,
            selected: isSelected('/broadcast'),
            onClick: () => navigate('/broadcast'),
          },
          {
            label: 'Event-Driven Call',
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
          {
            label: 'Call History',
            icon: ClockIcon,
            selected: isSelected('/call-history'),
            onClick: () => navigate('/call-history'),
          },
        ]}
      />
      <Navigation.Section
        title="Settings"
        items={[
          {
            label: 'SIP Trunks',
            icon: PhoneIcon,
            selected: isSelected('/sip-trunks'),
            onClick: () => navigate('/sip-trunks'),
          },
          {
            label: 'Analytics',
            icon: ChartVerticalIcon,
            selected: isSelected('/analytics'),
            onClick: () => navigate('/analytics'),
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
    <Frame navigation={navigationMarkup}>
      {children}
    </Frame>
  );
}
