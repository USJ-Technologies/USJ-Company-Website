import React, { useState } from 'react';
import useAuthStore from '../store/authStore';
import Button from '../components/ui/Button';
import { User, Mail, Phone, MapPin, Edit2, LogOut } from 'lucide-react';

const ProfilePage = () => {
  const { user, updateProfile, logout, isLoading } = useAuthStore();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: user?.name || '',
    phone: user?.phone || '',
    street: user?.address?.street || '',
    city: user?.address?.city || '',
    state: user?.address?.state || '',
    pinCode: user?.address?.pinCode || '',
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const result = await updateProfile({
      name: formData.name,
      phone: formData.phone,
      address: {
        street: formData.street,
        city: formData.city,
        state: formData.state,
        pinCode: formData.pinCode,
      }
    });
    
    if (result.success) {
      setIsEditing(false);
    }
  };

  return (
    <div className="bg-gray-50 min-h-screen py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8 flex items-center justify-between">
          <h1 className="text-3xl font-bold text-[#0A1628]">My Profile</h1>
          <Button 
            variant="danger" 
            size="sm" 
            onClick={logout}
            leftIcon={<LogOut size={16} />}
          >
            Logout
          </Button>
        </div>

        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="bg-[#0A1628] p-8 sm:p-12 text-white flex flex-col sm:flex-row items-center gap-6">
            <div className="w-24 h-24 bg-[#C9A84C] rounded-full flex items-center justify-center text-4xl font-bold">
              {user?.name?.charAt(0).toUpperCase()}
            </div>
            <div className="text-center sm:text-left">
              <h2 className="text-3xl font-bold mb-2">{user?.name}</h2>
              <div className="flex items-center justify-center sm:justify-start gap-2 text-gray-300">
                <Mail size={16} />
                <span>{user?.email}</span>
              </div>
            </div>
          </div>

          <div className="p-8 sm:p-12">
            <div className="flex items-center justify-between mb-8">
              <h3 className="text-xl font-bold text-[#0A1628]">Personal Information</h3>
              {!isEditing && (
                <Button 
                  variant="secondary" 
                  size="sm" 
                  onClick={() => setIsEditing(true)}
                  leftIcon={<Edit2 size={16} />}
                >
                  Edit Profile
                </Button>
              )}
            </div>

            {isEditing ? (
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                    <input 
                      type="text" 
                      name="name"
                      required
                      value={formData.name}
                      onChange={handleChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#C9A84C] focus:border-transparent outline-none transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                    <input 
                      type="text" 
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#C9A84C] focus:border-transparent outline-none transition-all"
                    />
                  </div>
                </div>

                <div className="border-t border-gray-100 pt-6">
                  <h4 className="text-lg font-semibold text-[#0A1628] mb-4">Address</h4>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Street Address</label>
                      <input 
                        type="text" 
                        name="street"
                        value={formData.street}
                        onChange={handleChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#C9A84C] focus:border-transparent outline-none transition-all"
                      />
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
                        <input 
                          type="text" 
                          name="city"
                          value={formData.city}
                          onChange={handleChange}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#C9A84C] focus:border-transparent outline-none transition-all"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">State</label>
                        <input 
                          type="text" 
                          name="state"
                          value={formData.state}
                          onChange={handleChange}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#C9A84C] focus:border-transparent outline-none transition-all"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">PIN Code</label>
                        <input 
                          type="text" 
                          name="pinCode"
                          value={formData.pinCode}
                          onChange={handleChange}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#C9A84C] focus:border-transparent outline-none transition-all"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex gap-4 pt-4">
                  <Button 
                    type="button" 
                    variant="ghost" 
                    onClick={() => setIsEditing(false)}
                  >
                    Cancel
                  </Button>
                  <Button 
                    type="submit" 
                    variant="primary" 
                    isLoading={isLoading}
                  >
                    Save Changes
                  </Button>
                </div>
              </form>
            ) : (
              <div className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-6 gap-x-12">
                  <div className="flex items-start gap-4">
                    <div className="mt-1">
                      <User size={20} className="text-[#C9A84C]" />
                    </div>
                    <div>
                      <div className="text-sm text-gray-500 mb-1">Full Name</div>
                      <div className="font-medium text-[#0A1628]">{user?.name}</div>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-4">
                    <div className="mt-1">
                      <Mail size={20} className="text-[#C9A84C]" />
                    </div>
                    <div>
                      <div className="text-sm text-gray-500 mb-1">Email Address</div>
                      <div className="font-medium text-[#0A1628]">{user?.email}</div>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-4">
                    <div className="mt-1">
                      <Phone size={20} className="text-[#C9A84C]" />
                    </div>
                    <div>
                      <div className="text-sm text-gray-500 mb-1">Phone Number</div>
                      <div className="font-medium text-[#0A1628]">{user?.phone || 'Not provided'}</div>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-4">
                    <div className="mt-1">
                      <MapPin size={20} className="text-[#C9A84C]" />
                    </div>
                    <div>
                      <div className="text-sm text-gray-500 mb-1">Address</div>
                      <div className="font-medium text-[#0A1628]">
                        {user?.address?.street ? (
                          <>
                            {user.address.street}<br/>
                            {user.address.city}, {user.address.state} {user.address.pinCode}
                          </>
                        ) : (
                          'Not provided'
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
