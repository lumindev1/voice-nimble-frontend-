import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AppProvider } from '@shopify/polaris';
import enTranslations from '@shopify/polaris/locales/en.json';
import { Provider as AppBridgeProvider } from '@shopify/app-bridge-react';

import { AuthProvider, useAuth } from './hooks/useAuth';
import AppLayout from './components/AppLayout';
import DashboardPage from './pages/DashboardPage';
import AgentPage from './pages/AgentPage';
import CallsPage from './pages/CallsPage';
import AnalyticsPage from './pages/AnalyticsPage';
import SkillsPage from './pages/SkillsPage';
import BillingPage from './pages/BillingPage';
import NotificationsPage from './pages/NotificationsPage';
import FaqPage from './pages/FaqPage';
import ContactsPage from './pages/ContactsPage';
import CallTemplatePage from './pages/CallTemplatePage';
import KnowledgeBasePage from './pages/KnowledgeBasePage';
import BroadcastCallsPage from './pages/BroadcastCallsPage';
import EventDrivenCallPage from './pages/EventDrivenCallPage';
import TestCallPage from './pages/TestCallPage';
import LoadingScreen from './components/LoadingScreen';

function getShopifyConfig() {
  const params = new URLSearchParams(window.location.search);
  const host = params.get('host') || '';
  let shop = params.get('shop') || '';

  if (!shop && host) {
    try {
      const decoded = atob(host);
      const match = decoded.match(/\/store\/([^/]+)/);
      if (match) shop = `${match[1]}.myshopify.com`;
    } catch (e) {
      // ignore decode errors
    }
  }

  if (!shop) shop = localStorage.getItem('vn_shop') || '';
  const apiKey = import.meta.env.VITE_SHOPIFY_API_KEY || '';
  if (shop) localStorage.setItem('vn_shop', shop);

  return { shop, host, apiKey };
}

function AuthenticatedRoutes() {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) return <LoadingScreen />;

  if (!isAuthenticated) {
    const { shop } = getShopifyConfig();
    const apiUrl = import.meta.env.VITE_API_URL || '';
    if (shop) window.location.href = `${apiUrl}/api/auth/install?shop=${shop}`;
    return <LoadingScreen />;
  }

  return (
    <AppLayout>
      <Routes>
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="/dashboard" element={<DashboardPage />} />

        {/* Apps Section */}
        <Route path="/agent" element={<AgentPage />} />
        <Route path="/knowledge-base" element={<KnowledgeBasePage />} />
        <Route path="/templates" element={<CallTemplatePage />} />
        <Route path="/contacts" element={<ContactsPage />} />
        <Route path="/broadcast" element={<BroadcastCallsPage />} />
        <Route path="/event-driven" element={<EventDrivenCallPage />} />
        <Route path="/test-call" element={<TestCallPage />} />
        <Route path="/call-history" element={<CallsPage />} />

        {/* Settings */}
        <Route path="/analytics" element={<AnalyticsPage />} />
        <Route path="/skills" element={<SkillsPage />} />
        <Route path="/billing" element={<BillingPage />} />
        <Route path="/notifications" element={<NotificationsPage />} />
        <Route path="/faq" element={<FaqPage />} />

        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </AppLayout>
  );
}

export default function App() {
  const { shop, host, apiKey } = getShopifyConfig();

  const appBridgeConfig = {
    apiKey,
    host: host || btoa(`admin.shopify.com/store/${shop.replace('.myshopify.com', '')}`),
    forceRedirect: false,
  };

  return (
    <AppProvider i18n={enTranslations}>
      <AppBridgeProvider config={appBridgeConfig}>
        <AuthProvider>
          <BrowserRouter>
            <AuthenticatedRoutes />
          </BrowserRouter>
        </AuthProvider>
      </AppBridgeProvider>
    </AppProvider>
  );
}
