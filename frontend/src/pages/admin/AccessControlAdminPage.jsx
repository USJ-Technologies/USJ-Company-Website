import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { Shield, Plus, Trash2, X, Edit2, Save, UserCheck, Mail } from 'lucide-react';
import toast from 'react-hot-toast';
import useAuthStore from '../../store/authStore';

const ROLE_OPTIONS = [
  { value: 'admin',   label: 'Admin',   description: 'Full access — all admin pages including this one', color: '#1A56DB' },
  { value: 'manager', label: 'Manager', description: 'Manage products, inquiries & certifications', color: '#2D7D46' },
  { value: 'staff',   label: 'Staff',   description: 'View and respond to inquiries only', color: '#C9A84C' },
];

const ROLE_BADGE = {
  admin:    'bg-blue-100 text-blue-800',
  manager:  'bg-green-100 text-green-800',
  staff:    'bg-yellow-100 text-yellow-800',
  customer: 'bg-gray-100 text-gray-500',
};

export default function AccessControlAdminPage() {
  const [invitations, setInvitations] = useState([]);
  const [activeUsers, setActiveUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ email: '', role: 'staff', notes: '' });
  const [saving, setSaving] = useState(false);
  const [editingUser, setEditingUser] = useState(null); // { id, role }
  const isAdmin = useAuthStore((s) => s.isAdmin());

  useEffect(() => { if (isAdmin) fetchData(); }, [isAdmin]);

  const fetchData = async () => {
    setLoading(true);
    const [invRes, usersRes] = await Promise.all([
      supabase.from('invited_roles').select('*').order('created_at', { ascending: false }),
      supabase.from('profiles').select('id, name, email, role, created_at')
        .in('role', ['admin', 'manager', 'staff'])
        .order('role').order('created_at'),
    ]);
    if (!invRes.error) setInvitations(invRes.data ?? []);
    if (!usersRes.error) setActiveUsers(usersRes.data ?? []);
    setLoading(false);
  };

  const handleSaveInvitation = async () => {
    if (!form.email.trim()) { toast.error('Email is required'); return; }
    setSaving(true);

    const email = form.email.trim().toLowerCase();

    const { error: invErr } = await supabase.from('invited_roles').upsert({
      email,
      role: form.role,
      notes: form.notes.trim() || null,
    }, { onConflict: 'email' });

    if (invErr) {
      toast.error('Failed to save: ' + invErr.message);
      setSaving(false);
      return;
    }

    // If user already registered, update their profile immediately
    const { data: existing } = await supabase
      .from('profiles').select('id').eq('email', email).maybeSingle();

    if (existing) {
      const { error: profErr } = await supabase
        .from('profiles').update({ role: form.role }).eq('id', existing.id);
      if (profErr) {
        toast.error('Invitation saved but failed to update existing profile');
      } else {
        toast.success(`Role applied — ${email} now has ${form.role} access`);
      }
    } else {
      toast.success(`Pre-assigned ${form.role} role for ${email} — takes effect on registration`);
    }

    setSaving(false);
    setShowForm(false);
    setForm({ email: '', role: 'staff', notes: '' });
    fetchData();
  };

  const handleDeleteInvitation = async (email) => {
    if (!window.confirm(`Remove pre-assigned role for ${email}?`)) return;
    const { error } = await supabase.from('invited_roles').delete().eq('email', email);
    if (error) { toast.error('Failed to remove'); return; }
    toast.success('Role assignment removed');
    setInvitations((prev) => prev.filter((i) => i.email !== email));
  };

  const handleUpdateUserRole = async (userId, newRole) => {
    const { error } = await supabase.from('profiles').update({ role: newRole }).eq('id', userId);
    if (error) { toast.error('Failed to update role: ' + error.message); return; }
    toast.success('Role updated');
    setActiveUsers((prev) => prev.map((u) => u.id === userId ? { ...u, role: newRole } : u));
    setEditingUser(null);
  };

  if (!isAdmin) {
    return (
      <div className="bg-white rounded-xl border border-[#E2E8F0] p-8 text-center">
        <Shield size={32} className="mx-auto text-gray-300 mb-3" />
        <p className="text-sm font-semibold text-[#0A1628]">Admins only</p>
        <p className="text-xs text-[#718096] mt-1">Role and access management is restricted to admin accounts.</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#0A1628]">Access Control</h1>
          <p className="text-sm text-[#718096] mt-0.5">Manage who can access the admin panel and what they can do</p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center gap-2 px-4 py-2 bg-[#0A1628] text-white text-sm font-semibold rounded-[6px] hover:bg-[#1A2E4A] transition-colors"
        >
          <Plus size={16} /> Add Member
        </button>
      </div>

      {/* Role legend */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {ROLE_OPTIONS.map((r) => (
          <div key={r.value} className="bg-white border border-[#E2E8F0] rounded-xl p-4">
            <span className={`inline-block px-2.5 py-0.5 text-xs font-bold rounded-full mb-2 ${ROLE_BADGE[r.value]}`}>
              {r.label}
            </span>
            <p className="text-sm text-[#4A5568]">{r.description}</p>
          </div>
        ))}
      </div>

      {/* Active team members */}
      <div>
        <h2 className="text-sm font-bold text-[#0A1628] mb-3 flex items-center gap-2">
          <UserCheck size={15} className="text-[#718096]" />
          Active Team Members
          <span className="font-normal text-[#718096]">— registered users with admin access</span>
        </h2>

        {loading ? (
          <div className="space-y-2">
            {[1, 2].map((i) => (
              <div key={i} className="h-16 bg-white border border-[#E2E8F0] rounded-xl animate-pulse" />
            ))}
          </div>
        ) : activeUsers.length === 0 ? (
          <div className="bg-white border border-[#E2E8F0] rounded-xl p-8 text-center text-sm text-[#718096]">
            No registered team members yet — use "Add Member" to pre-assign a role
          </div>
        ) : (
          <div className="space-y-2">
            {activeUsers.map((user) => (
              <div
                key={user.id}
                className="bg-white border border-[#E2E8F0] rounded-xl px-5 py-3.5 flex items-center gap-4"
              >
                <div
                  className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold shrink-0"
                  style={{ backgroundColor: '#0A1628', color: '#C9A84C' }}
                >
                  {(user.name?.[0] ?? user.email[0]).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-sm text-[#0A1628]">{user.name || '(no name)'}</p>
                  <p className="text-xs text-[#718096]">{user.email}</p>
                </div>

                {editingUser?.id === user.id ? (
                  <div className="flex items-center gap-2">
                    <select
                      value={editingUser.role}
                      onChange={(e) => setEditingUser((u) => ({ ...u, role: e.target.value }))}
                      className="text-sm border border-[#E2E8F0] rounded-[6px] px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-[#C9A84C]"
                    >
                      {ROLE_OPTIONS.map((r) => (
                        <option key={r.value} value={r.value}>{r.label}</option>
                      ))}
                      <option value="customer">Customer (remove access)</option>
                    </select>
                    <button
                      onClick={() => handleUpdateUserRole(user.id, editingUser.role)}
                      className="p-1.5 rounded text-green-700 hover:bg-green-50"
                      title="Save"
                    >
                      <Save size={15} />
                    </button>
                    <button
                      onClick={() => setEditingUser(null)}
                      className="p-1.5 rounded text-gray-400 hover:bg-gray-50"
                      title="Cancel"
                    >
                      <X size={15} />
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 shrink-0">
                    <span className={`px-2.5 py-0.5 text-xs font-bold rounded-full ${ROLE_BADGE[user.role]}`}>
                      {user.role}
                    </span>
                    <button
                      onClick={() => setEditingUser({ id: user.id, role: user.role })}
                      className="p-1.5 rounded text-[#718096] hover:bg-gray-100 hover:text-[#0A1628]"
                      title="Change role"
                    >
                      <Edit2 size={14} />
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Pre-assigned roles (invitations) */}
      <div>
        <h2 className="text-sm font-bold text-[#0A1628] mb-3 flex items-center gap-2">
          <Mail size={15} className="text-[#718096]" />
          Pre-assigned Roles
          <span className="font-normal text-[#718096]">— applied automatically when the user registers</span>
        </h2>

        {loading ? (
          <div className="h-12 bg-white border border-[#E2E8F0] rounded-xl animate-pulse" />
        ) : invitations.length === 0 ? (
          <div className="bg-white border border-[#E2E8F0] rounded-xl p-6 text-center text-sm text-[#718096]">
            No pending role assignments
          </div>
        ) : (
          <div className="space-y-2">
            {invitations.map((inv) => (
              <div
                key={inv.email}
                className="bg-white border border-[#E2E8F0] rounded-xl px-5 py-3 flex items-center gap-3"
              >
                <Mail size={14} className="text-[#718096] shrink-0" />
                <p className="flex-1 text-sm font-medium text-[#0A1628]">{inv.email}</p>
                {inv.notes && (
                  <p className="text-xs text-[#718096] hidden sm:block truncate max-w-[180px]">{inv.notes}</p>
                )}
                <span className={`px-2.5 py-0.5 text-xs font-bold rounded-full shrink-0 ${ROLE_BADGE[inv.role]}`}>
                  {inv.role}
                </span>
                <p className="text-xs text-[#718096] hidden sm:block shrink-0">
                  {new Date(inv.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                </p>
                <button
                  onClick={() => handleDeleteInvitation(inv.email)}
                  className="p-1.5 rounded text-[#718096] hover:bg-red-50 hover:text-red-500 transition-colors"
                  title="Remove"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add / invite modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md">
            <div className="flex items-center justify-between px-6 py-4 border-b border-[#E2E8F0]">
              <h2 className="font-bold text-[#0A1628] flex items-center gap-2">
                <Shield size={16} /> Assign Access Role
              </h2>
              <button onClick={() => setShowForm(false)} className="p-1.5 rounded-md hover:bg-gray-100">
                <X size={18} />
              </button>
            </div>

            <div className="px-6 py-5 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-[#0A1628] mb-1">
                  Email Address *
                </label>
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                  placeholder="name@usjtechnologies.com"
                  className="w-full px-3 py-2 text-sm border border-[#E2E8F0] rounded-[6px] focus:outline-none focus:ring-2 focus:ring-[#C9A84C]"
                  autoFocus
                />
                <p className="text-xs text-[#718096] mt-1">
                  If already registered, their access is updated immediately.
                </p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#0A1628] mb-2">Role *</label>
                <div className="space-y-2">
                  {ROLE_OPTIONS.map((r) => (
                    <label
                      key={r.value}
                      className={`flex items-start gap-3 p-3 border rounded-lg cursor-pointer transition-colors ${
                        form.role === r.value
                          ? 'border-[#0A1628] bg-[#F8F9FA]'
                          : 'border-[#E2E8F0] hover:border-[#0A1628]/40'
                      }`}
                    >
                      <input
                        type="radio"
                        name="role"
                        value={r.value}
                        checked={form.role === r.value}
                        onChange={() => setForm((f) => ({ ...f, role: r.value }))}
                        className="mt-0.5 accent-[#0A1628]"
                      />
                      <div>
                        <p className="text-sm font-semibold text-[#0A1628]">{r.label}</p>
                        <p className="text-xs text-[#718096]">{r.description}</p>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#0A1628] mb-1">
                  Notes <span className="font-normal text-[#718096]">(optional)</span>
                </label>
                <input
                  type="text"
                  value={form.notes}
                  onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
                  placeholder="e.g. Sales team, Dehradun office"
                  className="w-full px-3 py-2 text-sm border border-[#E2E8F0] rounded-[6px] focus:outline-none focus:ring-2 focus:ring-[#C9A84C]"
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 px-6 py-4 border-t border-[#E2E8F0]">
              <button
                onClick={() => { setShowForm(false); setForm({ email: '', role: 'staff', notes: '' }); }}
                className="px-4 py-2 text-sm font-medium text-[#4A5568] border border-[#E2E8F0] rounded-[6px] hover:border-[#0A1628] transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveInvitation}
                disabled={saving}
                className="flex items-center gap-2 px-4 py-2 bg-[#0A1628] text-white text-sm font-semibold rounded-[6px] hover:bg-[#1A2E4A] disabled:opacity-60 transition-colors"
              >
                <Shield size={15} />
                {saving ? 'Saving...' : 'Assign Role'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
