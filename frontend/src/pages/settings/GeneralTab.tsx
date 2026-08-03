import { useState, useEffect } from 'react';
import { Button } from '../../components/ui/Button';
import { Camera, CheckCircle2, User as UserIcon } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';

export function GeneralTab() {
  const { user } = useAuth();
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfile({ ...profile, profile_photo: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  useEffect(() => {
    async function loadProfile() {
      if (!user) return;
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();
        if (error) throw error;
        setProfile(data);
      } catch (error) {
        console.error("Error loading profile:", error);
      } finally {
        setLoading(false);
      }
    }
    loadProfile();
  }, [user]);

  const handleSave = async () => {
    if (!user || !profile) return;
    setSaving(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          full_name: profile.full_name,
          country: profile.country,
          profile_photo: profile.profile_photo,
        })
        .eq('id', user.id);
      if (error) throw error;
      toast.success("Profile updated successfully");
    } catch (error) {
      console.error("Error saving profile:", error);
      toast.error("Error saving profile");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-10">
      {/* Personalization Section */}
      <section>
        <div className="flex items-center gap-4 mb-6">
          <div className="relative group">
            <div className="w-20 h-20 rounded-full overflow-hidden bg-slate-100 border-4 border-white shadow-lg flex items-center justify-center text-slate-400">
              {profile?.profile_photo ? (
                <img src={profile.profile_photo} alt="Profile" className="w-full h-full object-cover" />
              ) : (
                <UserIcon className="w-8 h-8" />
              )}
            </div>
            <label className="absolute bottom-0 right-0 p-1.5 bg-white rounded-full shadow-md border border-slate-100 text-slate-600 hover:text-primary transition-colors cursor-pointer">
              <Camera className="w-4 h-4" />
              <input type="file" className="hidden" accept="image/*" onChange={handleImageUpload} />
            </label>
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-900">Good Evening, {profile?.full_name?.split(' ')[0] || 'User'}</h2>
            <p className="text-slate-500 text-sm">Welcome back.</p>
          </div>
        </div>

        <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-primary font-bold text-sm">
              92%
            </div>
            <div>
              <p className="text-sm font-medium text-slate-900">Your profile is almost complete</p>
              <p className="text-xs text-slate-500">Complete your profile to unlock better AI recommendations.</p>
            </div>
          </div>
          <Button onClick={() => toast.success('Feature coming soon!', { icon: '🚧' })}  variant="outline" size="sm">Complete Now</Button>
        </div>
      </section>

      <hr className="border-slate-100" />

      {/* Account Settings */}
      <section>
        <h3 className="text-lg font-semibold text-slate-900 mb-4">Account Settings</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-slate-700">Full Name</label>
            <input 
              type="text" 
              value={profile?.full_name || ''} 
              onChange={(e) => setProfile({...profile, full_name: e.target.value})}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm" 
            />
          </div>
          
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-slate-700">Email Address</label>
            <div className="relative">
              <input 
                type="email" 
                value={user?.email || ''} 
                readOnly
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm pr-10" 
              />
              <CheckCircle2 className="w-4 h-4 text-green-500 absolute right-3 top-1/2 -translate-y-1/2" />
            </div>
            <p className="text-xs text-slate-500">Verified</p>
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium text-slate-700">Country</label>
            <select 
              value={profile?.country || 'United States'}
              onChange={(e) => setProfile({...profile, country: e.target.value})}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm"
            >
              <option value="United States">United States</option>
              <option value="United Kingdom">United Kingdom</option>
              <option value="Canada">Canada</option>
              <option value="Australia">Australia</option>
              <option value="India">India</option>
              <option value="Germany">Germany</option>
              <option value="France">France</option>
              <option value="Japan">Japan</option>
              <option value="Brazil">Brazil</option>
              <option value="Other">Other</option>
            </select>
          </div>
        </div>
        <div className="mt-6 flex justify-end">
          <Button onClick={handleSave} disabled={saving}>
            {saving ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>
      </section>
    </div>
  );
}
