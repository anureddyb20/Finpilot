

export function NotificationsTab() {
  return (
    <div className="space-y-10">
      
      {/* Communication Channels */}
      <section>
        <h3 className="text-lg font-semibold text-slate-900 mb-4">Communication Channels</h3>
        <p className="text-sm text-slate-500 mb-6">Select how you would like to receive notifications.</p>
        <div className="space-y-4">
          {[
            { label: 'Push Notifications', desc: 'Receive instant alerts on your devices.' },
            { label: 'Email Notifications', desc: 'Receive daily/weekly summaries and important alerts via email.' },
            { label: 'SMS Notifications', desc: 'Receive text messages for critical security and transaction alerts.' },
          ].map((item, i) => (
            <div key={i} className="flex items-center justify-between p-4 border border-slate-200 rounded-xl">
              <div>
                <p className="text-sm font-medium text-slate-900">{item.label}</p>
                <p className="text-xs text-slate-500">{item.desc}</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" className="sr-only peer" defaultChecked={i < 2} />
                <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
              </label>
            </div>
          ))}
        </div>
      </section>

      <hr className="border-slate-100" />

      {/* Alert Preferences */}
      <section>
        <h3 className="text-lg font-semibold text-slate-900 mb-4">Alert Preferences</h3>
        <p className="text-sm text-slate-500 mb-6">Choose what you want to be notified about.</p>
        
        <div className="space-y-4">
          {[
            { label: 'Budget Alerts', desc: 'When you approach or exceed your set budget limits.' },
            { label: 'Goal Reminders', desc: 'Updates on your progress towards savings goals.' },
            { label: 'Bill Reminders', desc: 'Upcoming due dates for your tracked bills.' },
            { label: 'Recurring Payments', desc: 'Notifications about automated subscriptions and transfers.' },
            { label: 'Monthly Reports', desc: 'When your monthly financial summary is ready.' },
            { label: 'AI Suggestions', desc: 'Personalized insights and tips from the AI Advisor.' },
            { label: 'Security Alerts', desc: 'Critical alerts about logins and account changes.', locked: true },
          ].map((item, i) => (
            <div key={i} className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-900 flex items-center gap-2">
                  {item.label}
                  {item.locked && <span className="text-[10px] bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded font-bold uppercase">Required</span>}
                </p>
                <p className="text-xs text-slate-500">{item.desc}</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" className="sr-only peer" defaultChecked={true} disabled={item.locked} />
                <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary peer-disabled:opacity-50"></div>
              </label>
            </div>
          ))}
        </div>
      </section>

    </div>
  );
}
