import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useAppBridge } from '@shopify/app-bridge-react';
import { getSessionToken } from '@shopify/app-bridge/utilities';
import { apiClient } from '../api/client';

interface AuthContextType {
  isAuthenticated: boolean;
  isLoading: boolean;
  token: string | null;
  shopDomain: string | null;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType>({
  isAuthenticated: false,
  isLoading: true,
  token: null,
  shopDomain: null,
  logout: () => {},
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const app = useAppBridge();
  const [token, setToken] = useState<string | null>(localStorage.getItem('vn_token'));
  const [isLoading, setIsLoading] = useState(true);
  const [shopDomain, setShopDomain] = useState<string | null>(localStorage.getItem('vn_shop'));

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const urlToken = params.get('token');
    const urlShop = params.get('shop');

    if (urlToken) {
      localStorage.setItem('vn_token', urlToken);
      setToken(urlToken);
      if (urlShop) {
        localStorage.setItem('vn_shop', urlShop);
        setShopDomain(urlShop);
      }
      setIsLoading(false);
      return;
    }

    // If we already have a stored token, use it
    const storedToken = localStorage.getItem('vn_token');
    if (storedToken) {
      setToken(storedToken);
      setIsLoading(false);
      return;
    }

    // Try exchanging Shopify session token (works when embedded)
    const timeoutId = setTimeout(() => {
      // If session token exchange takes too long, redirect to OAuth
      const shop = urlShop || localStorage.getItem('vn_shop') || '';
      if (shop) {
        window.location.href = `/api/auth/install?shop=${shop}`;
      }
      setIsLoading(false);
    }, 3000);

    getSessionToken(app)
      .then(async (sessionToken) => {
        clearTimeout(timeoutId);
        const shop = urlShop || localStorage.getItem('vn_shop') || '';
        const res = await apiClient.post<{ token: string }>('/auth/token', {
          sessionToken,
          shop,
        });
        const apiToken = res.data.token;
        localStorage.setItem('vn_token', apiToken);
        setToken(apiToken);
        if (shop) {
          localStorage.setItem('vn_shop', shop);
          setShopDomain(shop);
        }
      })
      .catch((err) => {
        clearTimeout(timeoutId);
        console.error('Auth failed:', err);
        // Fallback to OAuth flow
        const shop = urlShop || localStorage.getItem('vn_shop') || '';
        if (shop) {
          window.location.href = `/api/auth/install?shop=${shop}`;
          return;
        }
        setToken(null);
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, [app]);

  const logout = () => {
    localStorage.removeItem('vn_token');
    localStorage.removeItem('vn_shop');
    setToken(null);
    setShopDomain(null);
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated: !!token, isLoading, token, shopDomain, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
