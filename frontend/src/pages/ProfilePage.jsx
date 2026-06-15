import { useState } from 'react';
import useAuthStore from '../store/authStore';
import { User, Mail, Phone, Building2, Edit2, LogOut, ShieldCheck, Save, X } from 'lucide-react';

export default function ProfilePage() {
  const { user, profile, updateProfile, logout, isLoading } = useAuthStore();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: profile?.name || '',
    phone: profile?.phone || '',
    organization: profile?.organization || '',
  });

  const handleChange = (e) => {
    setFormData((f) => ({ ...f, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const result = await updateProfile({
      name: formData.name.trim() || null,
      phone: formData.phone.trim() || null,
      organization: formData.organization.trim() || null,
    });
    if (result.success) setIsEditing(false);
  };

  const handleEditOpen = () => {
    setFormData({
      name: profile?.name || '',
      phone: profile?.phone || '',
      organization: profile?.organization || '',
    });
    setIsEditing(true);
  };

  const displayName = profile?.name || user?.email?.split('@')[0] || 'User';
  const initials = displayName
    .split(' ')
    .map((n) => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  const infoFields = [
    {
      icon: User,
      label: 'Full Name',
      value: profile?.name,
      placeholder: 'Not set — click Edit to add',
    },
    {
      icon: Mail,
      label: 'Email Address',
      value: user?.email,
      placeholder: '—',
    },
    {
      icon: Phone,
      label: 'Phone Number',
      value: profile?.phone,
      placeholder: 'Not provided',
    },
    {
      icon: Building2,
      label: 'Organization',
      value: profile?.organization,
      placeholder: 'Not provided',
    },
  ];

  return (
    <div className="bg-[#F8F9FA] min-h-screen py-10">
      <div className="max-w-2xl mx-auto px-4">

        {/* Header card */}
        <div className="bg-[#0A1628] rounded-2xl overflow-hidden mb-5 shadow-lg">
          <div className="px-8 py-10 flex flex-col sm:flex-row items-center gap-6">
            <div
              className="w-20 h-20 rounded-2xl flex items-center justify-center text-2xl font-bold flex-shrink-0"
              style={{ backgroundColor: '#C9A84C', color: '#0A1628' }}
            >
              {initials}
            </div>
            <div className="text-center sm:text-left flex-1">
              <h1 className="text-2xl font-bold text-white mb-1">{displayName}</h1>
              <p className="text-[#A0AEC0] text-sm">{user?.email}</p>
              {['admin', 'manager', 'staff'].includes(profile?.role) && (
                <span className="inline-flex items-center gap-1.5 mt-2 px-3 py-1 rounded-full text-xs font-bold"
                  style={{ backgroundColor: 'rgba(201,168,76,0.2)', color: '#C9A84C' }}>
                  <ShieldCheck size={12} />
                  {{ admin: 'Administrator', manager: 'Manager', staff: 'Staff' }[profile.role]}
                </span>
              )}
            </div>
            <button
              onClick={logout}
              className="flex items-center gap-2 px-4 py-2 rounded-[6px] text-sm font-semibold border border-white/20 text-white hover:bg-white/10 transition-colors"
            >
              <LogOut size={15} /> Logout
            </button>
          </div>
        </div>

        {/* Info card */}
        <div className="bg-white rounded-2xl border border-[#E2E8F0] shadow-sm overflow-hidden">
          <div className="flex items-center justify-between px-6 py-5 border-b border-[#E2E8F0]">
            <h2 className="font-bold text-[#0A1628]">Personal Information</h2>
            {!isEditing && (
              <button
                onClick={handleEditOpen}
                className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-semibold border border-[#E2E8F0] rounded-[6px] text-[#0A1628] hover:border-[#0A1628] transition-colors"
              >
                <Edit2 size={14} /> Edit
              </button>
            )}
          </div>

          {isEditing ? (
            <form onSubmit={handleSubmit} className="px-6 py-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-[#0A1628] mb-1">Full Name</label>
                <input
                  name="name"
                  type="text"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Your full name"
                  className="w-full px-3 py-2 text-sm border border-[#E2E8F0] rounded-[6px] focus:outline-none focus:ring-2 focus:ring-[#C9A84C]"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-[#0A1628] mb-1">Phone Number</label>
                <input
                  name="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="+91 XXXXX XXXXX"
                  className="w-full px-3 py-2 text-sm border border-[#E2E8F0] rounded-[6px] focus:outline-none focus:ring-2 focus:ring-[#C9A84C]"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-[#0A1628] mb-1">Organization / Company</label>
                <input
                  name="organization"
                  type="text"
                  value={formData.organization}
                  onChange={handleChange}
                  placeholder="Your organization name"
                  className="w-full px-3 py-2 text-sm border border-[#E2E8F0] rounded-[6px] focus:outline-none focus:ring-2 focus:ring-[#C9A84C]"
                />
              </div>
              <p className="text-xs text-[#718096]">Email address cannot be changed here.</p>
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="flex items-center gap-1.5 px-4 py-2 text-sm font-medium border border-[#E2E8F0] rounded-[6px] text-[#4A5568] hover:border-[#0A1628] transition-colors"
                >
                  <X size={14} /> Cancel
                </button>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="flex items-center gap-1.5 px-4 py-2 text-sm font-semibold rounded-[6px] text-white bg-[#0A1628] hover:bg-[#1A2E4A] disabled:opacity-60 transition-colors"
                >
                  <Save size={14} /> {isLoading ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          ) : (
            <div className="divide-y divide-[#E2E8F0]">
              {infoFields.map(({ icon: Icon, label, value, placeholder }) => (
                <div key={label} className="flex items-center gap-4 px-6 py-4">
                  <div
                    className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0"
                    style={{ backgroundColor: '#F8F9FA' }}
                  >
                    <Icon size={16} className="text-[#C9A84C]" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-[#718096] mb-0.5">{label}</p>
                    <p className={`text-sm font-medium truncate ${value ? 'text-[#0A1628]' : 'text-[#A0AEC0] italic'}`}>
                      {value || placeholder}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Account info */}
        <div className="mt-4 bg-white rounded-2xl border border-[#E2E8F0] shadow-sm px-6 py-5">
          <h3 className="font-bold text-[#0A1628] mb-3 text-sm">Account</h3>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-[#718096]">Member since</p>
              <p className="text-sm font-medium text-[#0A1628]">
                {profile?.created_at
                  ? new Date(profile.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })
                  : '—'}
              </p>
            </div>
            <div>
              <p className="text-xs text-[#718096]">Account type</p>
              <p className="text-sm font-medium text-[#0A1628] capitalize">{profile?.role || 'Customer'}</p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
