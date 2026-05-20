import React, { createContext, useContext, useState, useEffect } from 'react';

type Currency = 'USD' | 'KES';

interface CurrencyContextType {
  currency: Currency;
  setCurrency: (currency: Currency) => void;
  exchangeRate: number; // KES to USD
  showCurrencyPrompt: boolean;
  setShowCurrencyPrompt: () => void;
  userLocation: string | null;
}

const CurrencyContext = createContext<CurrencyContextType | undefined>(undefined);

export const CurrencyProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currency, setCurrencyState] = useState<Currency>('KES');
  const [exchangeRate] = useState(130); // 1 USD = 130 KES (approximate)
  const [showCurrencyPrompt, setShowCurrencyPrompt] = useState(false);
  const [userLocation, setUserLocation] = useState<string | null>(null);
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    // Check if user has already set currency preference
    const savedCurrency = localStorage.getItem('preferred_currency') as Currency | null;
    const currencyPromptDismissed = localStorage.getItem('currency_prompt_dismissed');

    if (savedCurrency) {
      setCurrencyState(savedCurrency);
      setInitialized(true);
    } else {
      // Try to detect user location
      detectUserLocation();
    }
  }, []);

  const detectUserLocation = async () => {
    try {
      // Try to get location from IP geolocation API
      const response = await fetch('https://ipapi.co/json/');
      if (response.ok) {
        const data = await response.json();
        setUserLocation(data.country_name);
        
        // Determine currency based on location
        const country = data.country_code; // ISO country code
        const defaultCurrency = ['US', 'GB', 'CA', 'AU', 'NZ', 'SG', 'HK'].includes(country) ? 'USD' : 'KES';
        
        setCurrencyState(defaultCurrency);
        
        // Show prompt only if not dismissed before
        if (!localStorage.getItem('currency_prompt_dismissed')) {
          setShowCurrencyPrompt(true);
        }
      }
    } catch (error) {
      console.error('Failed to detect location:', error);
      // Default to KES if detection fails
      setCurrencyState('KES');
      if (!localStorage.getItem('currency_prompt_dismissed')) {
        setShowCurrencyPrompt(true);
      }
    } finally {
      setInitialized(true);
    }
  };

  const setCurrency = (newCurrency: Currency) => {
    setCurrencyState(newCurrency);
    localStorage.setItem('preferred_currency', newCurrency);
  };

  const handleCurrencyPromptDismiss = () => {
    setShowCurrencyPrompt(false);
    localStorage.setItem('currency_prompt_dismissed', 'true');
  };

  return (
    <CurrencyContext.Provider value={{ 
      currency, 
      setCurrency, 
      exchangeRate, 
      showCurrencyPrompt,
      setShowCurrencyPrompt: handleCurrencyPromptDismiss,
      userLocation 
    }}>
      {children}
    </CurrencyContext.Provider>
  );
};

export const useCurrency = () => {
  const context = useContext(CurrencyContext);
  if (!context) {
    throw new Error('useCurrency must be used within a CurrencyProvider');
  }
  return context;
};
