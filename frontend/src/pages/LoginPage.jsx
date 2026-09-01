import React, { useMemo, useState } from 'react';
import { Link, useNavigate, useLocation, useSearchParams } from 'react-router-dom';
import useAuthStore from '../store/authStore';
import Button from '../components/ui/Button';
import { Mail, Lock, LogIn, User, Store, Briefcase } from 'lucide-react';

const ACCOUNT_TYPES = [
  {
    id: 'customer',
    label: 'Customer',
    description: 'Shop & manage orders',
    icon: User,
  },
  {
    id: 'vendor',
    label: 'Vendor',
    description: 'Manage your storefront',
    icon: Store,
  },
  {
    id: 'employee',
    label: 'Employee',
    description: 'Admin & team portal',
    icon: Briefcase,
  },
];

const DEFAULT_DESTINATIONS = {
  customer: '/profile',
  vendor: '/vendor/dashboard',
  employee: '/admin/dashboard',
};

function getRedirectPath(accountType, fromPath) {
  const fallback = DEFAULT_DESTINATIONS[accountType] || DEFAULT_DESTINATIONS.customer;

  if (!fromPath || fromPath === '/login') {
    return fallback;
  }

  if (accountType === 'vendor' && fromPath.startsWith('/vendor')) return fromPath;
  if (accountType === 'employee' && fromPath.startsWith('/admin')) return fromPath;
  if (
    accountType === 'customer' &&
    !fromPath.startsWith('/vendor') &&
    !fromPath.startsWith('/admin')
  ) {
    return fromPath;
  }

  return fallback;
}

const LoginPage = () => {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [searchParams] = useSearchParams();
  const initialAccountType = searchParams.get('type');
  const [accountType, setAccountType] = useState(
    ACCOUNT_TYPES.some((type) => type.id === initialAccountType)
      ? initialAccountType
      : 'customer'
  );
  const { login, isLoading } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from?.pathname;

  const selectedType = useMemo(
    () => ACCOUNT_TYPES.find((type) => type.id === accountType) ?? ACCOUNT_TYPES[0],
    [accountType]
  );

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const result = await login({ ...formData, accountType });
    if (result.success) {
      navigate(getRedirectPath(accountType, from), { replace: true });
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 className="mt-6 text-center text-3xl font-extrabold text-[#0A1628]">
          Sign in to your account
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          Or{' '}
          <Link to="/register" className="font-medium text-[#C9A84C] hover:text-[#B8973B]">
            create a new account
          </Link>
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow-sm border border-gray-100 sm:rounded-2xl sm:px-10">
          <div className="mb-6">
            <p className="text-sm font-medium text-gray-700 mb-3">Sign in as</p>
            <div className="grid grid-cols-3 gap-2">
              {ACCOUNT_TYPES.map(({ id, label, description, icon: Icon }) => {
                const isSelected = accountType === id;
                return (
                  <button
                    key={id}
                    type="button"
                    onClick={() => setAccountType(id)}
                    className={`rounded-xl border px-2 py-3 text-center transition-colors ${
                      isSelected
                        ? 'border-[#0A1628] bg-[#0A1628] text-white shadow-sm'
                        : 'border-gray-200 bg-gray-50 text-gray-700 hover:border-[#C9A84C] hover:bg-white'
                    }`}
                  >
                    <Icon
                      size={18}
                      className={`mx-auto mb-1.5 ${isSelected ? 'text-[#C9A84C]' : 'text-[#718096]'}`}
                    />
                    <span className="block text-xs font-semibold">{label}</span>
                    <span
                      className={`mt-1 block text-[10px] leading-tight ${
                        isSelected ? 'text-white/75' : 'text-gray-500'
                      }`}
                    >
                      {description}
                    </span>
                  </button>
                );
              })}
            </div>
            <p className="mt-3 text-xs text-gray-500">
              {accountType === 'customer' && 'Use your shopping account credentials.'}
              {accountType === 'vendor' && 'For approved sellers managing products and orders.'}
              {accountType === 'employee' && 'For USJ team members with admin portal access.'}
            </p>
          </div>

          <form className="space-y-6" onSubmit={handleSubmit}>
            <div>
              <label className="block text-sm font-medium text-gray-700">Email address</label>
              <div className="mt-1 relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  name="email"
                  type="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  className="appearance-none block w-full pl-10 px-3 py-2 border border-gray-300 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-[#C9A84C] focus:border-[#C9A84C] sm:text-sm"
                  placeholder="you@example.com"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Password</label>
              <div className="mt-1 relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  name="password"
                  type="password"
                  required
                  value={formData.password}
                  onChange={handleChange}
                  className="appearance-none block w-full pl-10 px-3 py-2 border border-gray-300 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-[#C9A84C] focus:border-[#C9A84C] sm:text-sm"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  id="remember-me"
                  name="remember-me"
                  type="checkbox"
                  className="h-4 w-4 text-[#C9A84C] focus:ring-[#C9A84C] border-gray-300 rounded"
                />
                <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-900">
                  Remember me
                </label>
              </div>

              <div className="text-sm">
                <a href="#" className="font-medium text-[#C9A84C] hover:text-[#B8973B]">
                  Forgot your password?
                </a>
              </div>
            </div>

            <div>
              <Button
                type="submit"
                variant="primary"
                className="w-full"
                isLoading={isLoading}
                rightIcon={<LogIn size={18} />}
              >
                Sign in as {selectedType.label}
              </Button>
            </div>
          </form>

          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">New to USJ Technologies?</span>
              </div>
            </div>

            <div className="mt-6 space-y-3">
              <Link
                to="/register"
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-[#0A1628] bg-gray-50 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#0A1628]"
              >
                Create a customer account
              </Link>
              {accountType === 'vendor' && (
                <Link
                  to="/become-a-seller"
                  className="w-full flex justify-center py-2 px-4 border border-[#E2E8F0] rounded-lg text-sm font-medium text-[#0A1628] hover:bg-gray-50 transition-colors"
                >
                  Apply to become a vendor
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
