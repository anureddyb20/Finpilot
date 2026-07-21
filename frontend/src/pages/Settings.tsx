import { useState } from 'react';
import { 
  User, 
  Settings as SettingsIcon, 
  Shield, 
  Bell, 
  Database, 
  HelpCircle 
} from 'lucide-react';
import { cn } from '../components/ui/Button';

// Placeholder imports for tab components (we will create these next)
import { GeneralTab } from './settings/GeneralTab';
import { PreferencesTab } from './settings/PreferencesTab';
import { SecurityTab } from './settings/SecurityTab';
import { NotificationsTab } from './settings/NotificationsTab';
import { DataIntegrationsTab } from './settings/DataIntegrationsTab';
import { SupportTab } from './settings/SupportTab';

const tabs = [
  { id: 'general', label: 'General', icon: User, component: GeneralTab },
  { id: 'preferences', label: 'Preferences', icon: SettingsIcon, component: PreferencesTab },
  { id: 'security', label: 'Security & Privacy', icon: Shield, component: SecurityTab },
  { id: 'notifications', label: 'Notifications', icon: Bell, component: NotificationsTab },
  { id: 'data', label: 'Data & Integrations', icon: Database, component: DataIntegrationsTab },
  { id: 'support', label: 'Support & About', icon: HelpCircle, component: SupportTab },
];

export function Settings() {
  const [activeTab, setActiveTab] = useState(tabs[0].id);

  const ActiveComponent = tabs.find(t => t.id === activeTab)?.component || GeneralTab;

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900">Settings</h1>
        <p className="text-slate-500 mt-1">Manage your account settings and preferences.</p>
      </div>

      <div className="flex flex-col md:flex-row gap-8">
        {/* Sidebar Navigation for Settings */}
        <div className="w-full md:w-64 shrink-0">
          <nav className="flex flex-row md:flex-col gap-1 overflow-x-auto pb-4 md:pb-0">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  'flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all whitespace-nowrap',
                  activeTab === tab.id
                    ? 'bg-primary text-white shadow-md shadow-primary/20'
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                )}
              >
                <tab.icon className={cn("w-5 h-5", activeTab === tab.id ? "text-white" : "text-slate-400")} />
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        {/* Content Area */}
        <div className="flex-1 min-w-0">
          <div className="bg-white rounded-2xl border border-slate-100 p-6 md:p-8 shadow-sm">
            <ActiveComponent />
          </div>
        </div>
      </div>
    </div>
  );
}
