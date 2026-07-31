import { useState, useEffect } from 'react';
import { Button } from '../../components/ui/Button';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';

export function PreferencesTab() {
  const { user } = useAuth();
  const [settings, setSettings] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    async function loadSettings() {
      if (!user) return;
      try {
        const { data, error } = await supabase
          .from('settings')
          .select('*')
          .eq('user_id', user.id)
          .single();
        if (error && error.code !== 'PGRST116') throw error; // ignore no rows
        
        if (data) {
          setSettings(data);
        } else {
          // Defaults if not created
          setSettings({
            preferred_currency: 'INR',
            language: 'English',
            dark_mode: false,
            notifications: true
          });
        }
      } catch (error) {
        console.error("Error loading settings:", error);
      } finally {
        setLoading(false);
      }
    }
    loadSettings();
  }, [user]);

  const handleSave = async () => {
    if (!user || !settings) return;
    setSaving(true);
    try {
      const { error } = await supabase
        .from('settings')
        .upsert({
          user_id: user.id,
          preferred_currency: settings.preferred_currency,
          language: settings.language,
          dark_mode: settings.dark_mode,
          notifications: settings.notifications
        }, { onConflict: 'user_id' });
      
      if (error) throw error;
      toast.success("Preferences updated successfully");
    } catch (error) {
      console.error("Error saving settings:", error);
      toast.error("Error saving preferences");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="text-slate-500">Loading preferences...</div>;

  return (
    <div className="space-y-10">
      
      {/* Currency & Language Settings */}
      <section>
        <h3 className="text-lg font-semibold text-slate-900 mb-4">Localization</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-slate-700">Default Currency</label>
            <select 
              value={settings?.preferred_currency}
              onChange={(e) => setSettings({...settings, preferred_currency: e.target.value})}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm"
            >
              <option value="INR">Indian Rupee (₹)</option>
              <option value="USD">USD ($)</option>
              <option value="EUR">EUR (€)</option>
              <option value="GBP">GBP (£)</option>
            </select>
          </div>
          
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-slate-700">Display Language</label>
            <select 
              value={settings?.language}
              onChange={(e) => setSettings({...settings, language: e.target.value})}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm"
            >
              <option value="English">English</option>
              <option value="Hindi">Hindi</option>
              <option value="Kannada">Kannada</option>
              <option value="Telugu">Telugu</option>
              <option value="Tamil">Tamil</option>
            </select>
          </div>
        </div>
      </section>

      <hr className="border-slate-100" />

      {/* Appearance */}
      <section>
        <h3 className="text-lg font-semibold text-slate-900 mb-4">Appearance</h3>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
          <label className="cursor-pointer">
            <input 
              type="radio" 
              name="theme" 
              className="peer sr-only" 
              checked={!settings?.dark_mode} 
              onChange={() => setSettings({...settings, dark_mode: false})} 
            />
            <div className="p-4 border-2 border-slate-100 rounded-xl peer-checked:border-primary peer-checked:bg-blue-50 transition-all text-center">
              <div className="w-12 h-12 bg-white border border-slate-200 rounded-full mx-auto mb-2 flex items-center justify-center">☀️</div>
              <span className="text-sm font-medium text-slate-900">Light</span>
            </div>
          </label>
          <label className="cursor-pointer">
            <input 
              type="radio" 
              name="theme" 
              className="peer sr-only" 
              checked={settings?.dark_mode}
              onChange={() => setSettings({...settings, dark_mode: true})} 
            />
            <div className="p-4 border-2 border-slate-100 rounded-xl peer-checked:border-primary peer-checked:bg-blue-50 transition-all text-center">
              <div className="w-12 h-12 bg-slate-900 rounded-full mx-auto mb-2 flex items-center justify-center">🌙</div>
              <span className="text-sm font-medium text-slate-900">Dark</span>
            </div>
          </label>
        </div>
      </section>
      
      <hr className="border-slate-100" />
      
      {/* Notifications */}
      <section>
        <h3 className="text-lg font-semibold text-slate-900 mb-4">Notifications</h3>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-slate-900">Enable Notifications</p>
            <p className="text-xs text-slate-500">Receive alerts and updates.</p>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input 
              type="checkbox" 
              className="sr-only peer" 
              checked={settings?.notifications}
              onChange={(e) => setSettings({...settings, notifications: e.target.checked})}
            />
            <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
          </label>
        </div>
      </section>

      <div className="mt-6 flex justify-end">
        <Button onClick={handleSave} disabled={saving}>
          {saving ? 'Saving...' : 'Save Preferences'}
        </Button>
      </div>
    </div>
  );
}
