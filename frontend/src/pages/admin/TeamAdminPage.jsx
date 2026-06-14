import { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, X, Save, Users, GripVertical } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import toast from 'react-hot-toast';

const emptyMember = {
  name: '',
  role: '',
  department: '',
  bio: '',
  email: '',
  linkedin_url: '',
  image_url: '',
  display_order: 0,
  is_active: true,
};

export default function TeamAdminPage() {
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(null); // null | 'new' | member object
  const [form, setForm] = useState(emptyMember);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(null);

  const fetchMembers = async () => {
    const { data, error } = await supabase
      .from('team_members')
      .select('*')
      .order('display_order')
      .order('created_at');
    if (!error) setMembers(data ?? []);
    setLoading(false);
  };

  useEffect(() => { fetchMembers(); }, []);

  const openNew = () => {
    setForm({ ...emptyMember, display_order: members.length + 1 });
    setEditing('new');
  };

  const openEdit = (member) => {
    // Normalize null values from DB to empty strings so controlled inputs work
    setForm({
      name: member.name ?? '',
      role: member.role ?? '',
      department: member.department ?? '',
      bio: member.bio ?? '',
      email: member.email ?? '',
      linkedin_url: member.linkedin_url ?? '',
      image_url: member.image_url ?? '',
      display_order: member.display_order ?? 0,
      is_active: member.is_active ?? true,
    });
    setEditing(member);
  };

  const closeForm = () => {
    setEditing(null);
    setForm(emptyMember);
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((f) => ({ ...f, [name]: type === 'checkbox' ? checked : value }));
  };

  const handleSave = async () => {
    if (!form.name?.trim() || !form.role?.trim()) {
      toast.error('Name and role are required');
      return;
    }
    setSaving(true);
    const payload = {
      name: form.name.trim(),
      role: form.role.trim(),
      department: form.department?.trim() || null,
      bio: form.bio?.trim() || null,
      email: form.email?.trim() || null,
      linkedin_url: form.linkedin_url?.trim() || null,
      image_url: form.image_url?.trim() || null,
      display_order: parseInt(form.display_order) || 0,
      is_active: form.is_active,
    };

    let error;
    if (editing === 'new') {
      ({ error } = await supabase.from('team_members').insert(payload));
    } else {
      ({ error } = await supabase.from('team_members').update({ ...payload, updated_at: new Date().toISOString() }).eq('id', editing.id));
    }

    setSaving(false);
    if (error) {
      toast.error('Failed to save: ' + error.message);
    } else {
      toast.success(editing === 'new' ? 'Team member added' : 'Team member updated');
      closeForm();
      fetchMembers();
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Remove this team member?')) return;
    setDeleting(id);
    const { error } = await supabase.from('team_members').delete().eq('id', id);
    setDeleting(null);
    if (error) {
      toast.error('Failed to delete');
    } else {
      toast.success('Removed');
      setMembers((m) => m.filter((x) => x.id !== id));
    }
  };

  const toggleActive = async (member) => {
    const { error } = await supabase
      .from('team_members')
      .update({ is_active: !member.is_active })
      .eq('id', member.id);
    if (!error) {
      setMembers((m) => m.map((x) => x.id === member.id ? { ...x, is_active: !x.is_active } : x));
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#0A1628]">Team Members</h1>
          <p className="text-sm text-[#718096] mt-0.5">Manage your internal team displayed on the About page</p>
        </div>
        <button
          onClick={openNew}
          className="flex items-center gap-2 px-4 py-2 bg-[#0A1628] text-white text-sm font-semibold rounded-[6px] hover:bg-[#1A2E4A] transition-colors"
        >
          <Plus size={16} /> Add Member
        </button>
      </div>

      {/* Form Modal */}
      {editing !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between px-6 py-4 border-b border-[#E2E8F0]">
              <h2 className="font-bold text-[#0A1628]">
                {editing === 'new' ? 'Add Team Member' : 'Edit Team Member'}
              </h2>
              <button onClick={closeForm} className="p-1.5 rounded-md hover:bg-gray-100">
                <X size={18} />
              </button>
            </div>

            <div className="px-6 py-5 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-[#0A1628] mb-1">Full Name *</label>
                  <input
                    name="name"
                    value={form.name}
                    onChange={handleChange}
                    className="w-full px-3 py-2 text-sm border border-[#E2E8F0] rounded-[6px] focus:outline-none focus:ring-2 focus:ring-[#C9A84C]"
                    placeholder="Ujjwal Singh Jeena"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#0A1628] mb-1">Job Title *</label>
                  <input
                    name="role"
                    value={form.role}
                    onChange={handleChange}
                    className="w-full px-3 py-2 text-sm border border-[#E2E8F0] rounded-[6px] focus:outline-none focus:ring-2 focus:ring-[#C9A84C]"
                    placeholder="Founder & CEO"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-[#0A1628] mb-1">Department</label>
                  <input
                    name="department"
                    value={form.department}
                    onChange={handleChange}
                    className="w-full px-3 py-2 text-sm border border-[#E2E8F0] rounded-[6px] focus:outline-none focus:ring-2 focus:ring-[#C9A84C]"
                    placeholder="Leadership"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#0A1628] mb-1">Display Order</label>
                  <input
                    name="display_order"
                    type="number"
                    value={form.display_order}
                    onChange={handleChange}
                    className="w-full px-3 py-2 text-sm border border-[#E2E8F0] rounded-[6px] focus:outline-none focus:ring-2 focus:ring-[#C9A84C]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#0A1628] mb-1">Bio</label>
                <textarea
                  name="bio"
                  rows={3}
                  value={form.bio}
                  onChange={handleChange}
                  className="w-full px-3 py-2 text-sm border border-[#E2E8F0] rounded-[6px] focus:outline-none focus:ring-2 focus:ring-[#C9A84C] resize-none"
                  placeholder="Short professional biography..."
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-[#0A1628] mb-1">Email</label>
                  <input
                    name="email"
                    type="email"
                    value={form.email}
                    onChange={handleChange}
                    className="w-full px-3 py-2 text-sm border border-[#E2E8F0] rounded-[6px] focus:outline-none focus:ring-2 focus:ring-[#C9A84C]"
                    placeholder="name@usjtechnologies.com"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#0A1628] mb-1">LinkedIn URL</label>
                  <input
                    name="linkedin_url"
                    value={form.linkedin_url}
                    onChange={handleChange}
                    className="w-full px-3 py-2 text-sm border border-[#E2E8F0] rounded-[6px] focus:outline-none focus:ring-2 focus:ring-[#C9A84C]"
                    placeholder="https://linkedin.com/in/..."
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#0A1628] mb-1">Photo URL</label>
                <input
                  name="image_url"
                  value={form.image_url}
                  onChange={handleChange}
                  className="w-full px-3 py-2 text-sm border border-[#E2E8F0] rounded-[6px] focus:outline-none focus:ring-2 focus:ring-[#C9A84C]"
                  placeholder="https://..."
                />
                {form.image_url && (
                  <img src={form.image_url} alt="preview" className="mt-2 w-16 h-16 rounded-full object-cover border border-[#E2E8F0]" />
                )}
              </div>

              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  name="is_active"
                  checked={form.is_active}
                  onChange={handleChange}
                  className="rounded accent-[#C9A84C]"
                />
                <span className="text-sm text-[#4A5568]">Show on website</span>
              </label>
            </div>

            <div className="flex justify-end gap-3 px-6 py-4 border-t border-[#E2E8F0]">
              <button
                onClick={closeForm}
                className="px-4 py-2 text-sm font-medium text-[#4A5568] border border-[#E2E8F0] rounded-[6px] hover:border-[#0A1628] transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="flex items-center gap-2 px-4 py-2 bg-[#0A1628] text-white text-sm font-semibold rounded-[6px] hover:bg-[#1A2E4A] disabled:opacity-60 transition-colors"
              >
                <Save size={15} /> {saving ? 'Saving...' : 'Save Member'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Team list */}
      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-20 bg-white border border-[#E2E8F0] rounded-xl animate-pulse" />
          ))}
        </div>
      ) : members.length === 0 ? (
        <div className="bg-white rounded-xl border border-[#E2E8F0] py-16 text-center">
          <Users size={40} className="mx-auto text-gray-300 mb-3" />
          <p className="font-semibold text-[#0A1628] mb-1">No team members yet</p>
          <p className="text-sm text-[#718096] mb-5">Add your team to display them on the About page.</p>
          <button
            onClick={openNew}
            className="px-4 py-2 bg-[#0A1628] text-white text-sm font-semibold rounded-[6px] hover:bg-[#1A2E4A] transition-colors"
          >
            Add First Member
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {members.map((member) => (
            <div
              key={member.id}
              className="bg-white border border-[#E2E8F0] rounded-xl p-4 flex items-center gap-4"
            >
              <GripVertical size={16} className="text-gray-300 shrink-0 cursor-grab" />

              {/* Avatar */}
              {member.image_url ? (
                <img
                  src={member.image_url}
                  alt={member.name}
                  className="w-12 h-12 rounded-full object-cover border border-[#E2E8F0] shrink-0"
                />
              ) : (
                <div
                  className="w-12 h-12 rounded-full flex items-center justify-center text-sm font-bold shrink-0"
                  style={{ backgroundColor: '#0A1628', color: '#C9A84C' }}
                >
                  {member.name.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase()}
                </div>
              )}

              {/* Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="font-semibold text-[#0A1628] text-sm">{member.name}</p>
                  {!member.is_active && (
                    <span className="px-1.5 py-0.5 text-[10px] font-semibold bg-gray-100 text-gray-500 rounded">Hidden</span>
                  )}
                </div>
                <p className="text-xs text-[#C9A84C] font-medium">{member.role}</p>
                {member.department && (
                  <p className="text-xs text-[#718096]">{member.department}</p>
                )}
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={() => toggleActive(member)}
                  className="px-2 py-1 text-xs rounded border border-[#E2E8F0] text-[#718096] hover:border-[#0A1628] hover:text-[#0A1628] transition-colors"
                  title={member.is_active ? 'Hide from website' : 'Show on website'}
                >
                  {member.is_active ? 'Visible' : 'Hidden'}
                </button>
                <button
                  onClick={() => openEdit(member)}
                  className="p-2 rounded-md text-[#4A5568] hover:bg-blue-50 hover:text-blue-600 transition-colors"
                  title="Edit"
                >
                  <Edit2 size={15} />
                </button>
                <button
                  onClick={() => handleDelete(member.id)}
                  disabled={deleting === member.id}
                  className="p-2 rounded-md text-[#4A5568] hover:bg-red-50 hover:text-red-500 transition-colors disabled:opacity-40"
                  title="Delete"
                >
                  <Trash2 size={15} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="text-xs text-[#718096] bg-blue-50 border border-blue-100 rounded-lg p-3">
        <strong>Note:</strong> Run <code className="font-mono bg-white px-1 rounded">supabase/migrations/20240614000004_team_members.sql</code> in Supabase SQL Editor to create the team_members table if you haven't yet.
      </div>
    </div>
  );
}
