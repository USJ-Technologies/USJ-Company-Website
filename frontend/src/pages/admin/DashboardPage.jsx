import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import Skeleton from '../../components/ui/Skeleton';
import { Users, Package, FileText, Clock, TrendingUp, CheckCircle } from 'lucide-react';
import { Link } from 'react-router-dom';

const StatCard = ({ title, value, icon: Icon, sub, color = '#C9A84C' }) => (
  <div className="bg-white p-6 rounded-xl border border-[#E2E8F0] shadow-sm">
    <div className="flex items-start justify-between mb-4">
      <div className="p-2.5 rounded-lg" style={{ backgroundColor: `${color}18` }}>
        <Icon size={22} style={{ color }} />
      </div>
    </div>
    <p className="text-3xl font-bold text-[#0A1628] mb-1">{value ?? '—'}</p>
    <p className="text-sm font-medium text-[#4A5568]">{title}</p>
    {sub && <p className="text-xs text-[#718096] mt-0.5">{sub}</p>}
  </div>
);

const STATUS_COLORS = {
  new: '#D97706',
  in_review: '#1A56DB',
  responded: '#2D7D46',
  closed: '#718096',
};

const DashboardPage = () => {
  const [stats, setStats] = useState(null);
  const [recentQuotes, setRecentQuotes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const [
        { count: productCount },
        { count: quoteCount },
        { count: newQuoteCount },
        { count: userCount },
        { data: quotes },
      ] = await Promise.all([
        supabase.from('products').select('*', { count: 'exact', head: true }).eq('is_active', true),
        supabase.from('quote_requests').select('*', { count: 'exact', head: true }),
        supabase.from('quote_requests').select('*', { count: 'exact', head: true }).eq('status', 'new'),
        supabase.from('profiles').select('*', { count: 'exact', head: true }),
        supabase
          .from('quote_requests')
          .select('id, reference_number, name, email, organization, status, created_at, quote_items(quantity)')
          .order('created_at', { ascending: false })
          .limit(5),
      ]);

      setStats({
        products: productCount ?? 0,
        totalQuotes: quoteCount ?? 0,
        newQuotes: newQuoteCount ?? 0,
        users: userCount ?? 0,
      });
      setRecentQuotes(quotes ?? []);
      setLoading(false);
    };
    load();
  }, []);

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-[#0A1628]">Dashboard</h1>
        <div className="flex items-center gap-2 text-xs text-[#718096]">
          <CheckCircle size={13} className="text-green-500" />
          Supabase connected
        </div>
      </div>

      {/* Stat cards */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {[1, 2, 3, 4].map((i) => <Skeleton key={i} className="h-32 rounded-xl" />)}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          <StatCard title="Active Products" value={stats.products} icon={Package} sub="Across all brands" />
          <StatCard title="Total Quotes" value={stats.totalQuotes} icon={FileText} sub="All time" color="#1A56DB" />
          <StatCard title="New Quotes" value={stats.newQuotes} icon={Clock} sub="Awaiting review" color="#D97706" />
          <StatCard title="Registered Users" value={stats.users} icon={Users} sub="In Supabase Auth" color="#2D7D46" />
        </div>
      )}

      {/* Recent quote requests */}
      <div className="bg-white rounded-xl border border-[#E2E8F0] shadow-sm overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#E2E8F0]">
          <h2 className="text-base font-bold text-[#0A1628]">Recent Quote Requests</h2>
          <Link
            to="/admin/inquiries"
            className="text-sm text-[#C9A84C] hover:text-[#B8973B] font-semibold transition-colors"
          >
            View all →
          </Link>
        </div>

        {loading ? (
          <div className="p-6 space-y-3">
            {[1, 2, 3].map((i) => <Skeleton key={i} className="h-12 rounded-lg" />)}
          </div>
        ) : recentQuotes.length === 0 ? (
          <div className="p-12 text-center text-[#718096] text-sm">
            No quote requests yet. They'll appear here when customers submit them.
          </div>
        ) : (
          <div className="divide-y divide-[#F0F4F8]">
            {recentQuotes.map((q) => {
              const itemCount = q.quote_items?.reduce((sum, i) => sum + i.quantity, 0) ?? 0;
              return (
                <div key={q.id} className="flex items-center justify-between px-6 py-3.5 hover:bg-[#F8F9FA] transition-colors">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-semibold text-[#0A1628] truncate">{q.name}</p>
                      <span className="text-[10px] font-mono text-[#718096]">{q.reference_number}</span>
                    </div>
                    <p className="text-xs text-[#718096] truncate">
                      {q.organization ? `${q.organization} · ` : ''}{q.email}
                      {itemCount > 0 && ` · ${itemCount} item${itemCount !== 1 ? 's' : ''}`}
                    </p>
                  </div>
                  <div className="flex items-center gap-3 flex-shrink-0 ml-3">
                    <span
                      className="text-[10px] font-semibold px-2 py-0.5 rounded-full capitalize"
                      style={{
                        backgroundColor: `${STATUS_COLORS[q.status] ?? '#718096'}18`,
                        color: STATUS_COLORS[q.status] ?? '#718096',
                      }}
                    >
                      {q.status?.replace('_', ' ')}
                    </span>
                    <span className="text-[10px] text-[#718096]">
                      {new Date(q.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Quick links */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { label: 'Manage Quote Requests', to: '/admin/inquiries', desc: 'Review and respond to customer quotes' },
          { label: 'Manage Products', to: '/admin/products', desc: 'View and update the product catalog' },
          { label: 'Manage Ventures', to: '/admin/ventures', desc: 'Update USJ ventures & certifications' },
        ].map((link) => (
          <Link
            key={link.to}
            to={link.to}
            className="block p-5 bg-white rounded-xl border border-[#E2E8F0] hover:border-[#C9A84C] hover:shadow-md transition-all group"
          >
            <p className="text-sm font-bold text-[#0A1628] group-hover:text-[#C9A84C] transition-colors mb-1">
              {link.label} →
            </p>
            <p className="text-xs text-[#718096]">{link.desc}</p>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default DashboardPage;
