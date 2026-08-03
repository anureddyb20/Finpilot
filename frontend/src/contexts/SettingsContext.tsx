import React, { createContext, useContext, useEffect, useState } from 'react';
import { useAuth } from './AuthContext';
import { supabase } from '../lib/supabase';

interface Settings {
  dark_mode: boolean;
  preferred_currency: string;
  language: string;
  notifications: boolean;
}

interface SettingsContextType {
  settings: Settings | null;
  setSettings: (settings: Settings) => void;
  updateSetting: (key: keyof Settings, value: any) => Promise<void>;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export function SettingsProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [settings, setSettingsState] = useState<Settings | null>(null);

  useEffect(() => {
    async function loadSettings() {
      if (!user) {
        setSettingsState(null);
        document.documentElement.classList.remove('dark');
        return;
      }
      try {
        const { data, error } = await supabase
          .from('settings')
          .select('*')
          .eq('user_id', user.id)
          .single();
        
        if (error && error.code !== 'PGRST116') throw error;
        
        const currentSettings = data || {
          preferred_currency: 'INR',
          language: 'English',
          dark_mode: false,
          notifications: true
        };
        
        setSettingsState(currentSettings);
        
        if (currentSettings.dark_mode) {
          document.documentElement.classList.add('dark');
        } else {
          document.documentElement.classList.remove('dark');
        }
      } catch (error) {
        console.error("Error loading settings:", error);
      }
    }
    loadSettings();
  }, [user]);

  const setSettings = (newSettings: Settings) => {
    setSettingsState(newSettings);
    if (newSettings.dark_mode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  const updateSetting = async (key: keyof Settings, value: any) => {
    if (!user || !settings) return;
    
    const newSettings = { ...settings, [key]: value };
    setSettings(newSettings);

    try {
      await supabase
        .from('settings')
        .upsert({
          user_id: user.id,
          ...newSettings
        }, { onConflict: 'user_id' });
    } catch (error) {
      console.error("Error saving setting:", error);
    }
  };

  return (
    <SettingsContext.Provider value={{ settings, setSettings, updateSetting }}>
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  const context = useContext(SettingsContext);
  if (context === undefined) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
}
