import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import Skeleton from '../../components/ui/Skeleton';
import { Users, Package, FileText, Clock, BarChart2, TrendingUp, PieChart } from 'lucide-react';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, Legend, BarChart, Bar } from 'recharts';
import { Link } from 'react-router-dom';

const formatDuration = (seconds) => {
  if (typeof seconds !== 'number' || Number.isNaN(seconds) || seconds < 0) return '—';
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return mins > 0 ? `${mins}m ${secs}s` : `${secs}s`;
};

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

const AnalyticsPage = () => {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);
  const [daily, setDaily] = useState([]);
  const [funnel, setFunnel] = useState([]);
  const [topProducts, setTopProducts] = useState([]);
  const [topSearches, setTopSearches] = useState([]);

  useEffect(() => {
    const load = async () => {
      setLoading(true);

      // Stat cards: total events this week, add_to_cart, quote_form_submitted, distinct sessions this week
      const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();

      const [{ count: totalWeek }, { count: cartsWeek }, { count: quotesWeek }] = await Promise.all([
        supabase.from('analytics_events').select('*', { count: 'exact', head: true }).gt('created_at', weekAgo),
        supabase.from('analytics_events').select('*', { count: 'exact', head: true }).eq('event_name', 'add_to_cart').gt('created_at', weekAgo),
        supabase.from('analytics_events').select('*', { count: 'exact', head: true }).eq('event_name', 'quote_form_submitted').gt('created_at', weekAgo),
      ]).catch(() => [ { count: 0 }, { count: 0 }, { count: 0 }]);

      // If RPC not available, compute sessionsWeek with a query
      let distinctSessions = 0;
      try {
        const { data: sdata } = await supabase
          .from('analytics_events')
          .select('session_id')
          .gt('created_at', weekAgo)
          .not('session_id', 'is', null);
        distinctSessions = new Set((sdata || []).map((r) => r.session_id)).size;
      } catch {
        distinctSessions = 0;
      }

      let avgSessionDuration = '—';
      try {
        const { data: sessionEnds } = await supabase
          .from('analytics_events')
          .select('metadata')
          .eq('event_name', 'session_end')
          .gt('created_at', weekAgo)
          .limit(2000);

        const durations = (sessionEnds || [])
          .map((row) => Number(row?.metadata?.duration_seconds))
          .filter((value) => Number.isFinite(value) && value >= 0);

        if (durations.length) {
          const avgSeconds = Math.round(durations.reduce((sum, value) => sum + value, 0) / durations.length);
          avgSessionDuration = formatDuration(avgSeconds);
        }
      } catch {
        avgSessionDuration = '—';
      }

      let returningPercent = 0;
      let returningCount = 0;
      let newCount = 0;
      try {
        const lookback90Days = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString();
        const { data: recentSessions } = await supabase
          .from('analytics_events')
          .select('session_id, created_at')
          .gt('created_at', lookback90Days)
          .not('session_id', 'is', null)
          .order('created_at', { ascending: true })
          .limit(4000);

        const firstSeen = {};
        const activeSessions = new Set();
        const weekAgoDate = new Date(weekAgo);

        (recentSessions || []).forEach((row) => {
          const sessionId = row.session_id;
          if (!sessionId) return;
          const createdAt = new Date(row.created_at);
          if (!firstSeen[sessionId] || createdAt < firstSeen[sessionId]) {
            firstSeen[sessionId] = createdAt;
          }
          if (createdAt >= weekAgoDate) activeSessions.add(sessionId);
        });

        activeSessions.forEach((sessionId) => {
          const firstSeenAt = firstSeen[sessionId];
          if (!firstSeenAt) return;
          if (firstSeenAt < new Date(weekAgo)) {
            returningCount += 1;
          } else {
            newCount += 1;
          }
        });

        const totalActive = returningCount + newCount;
        returningPercent = totalActive ? Math.round((returningCount / totalActive) * 100) : 0;
      } catch {
        returningPercent = 0;
        returningCount = 0;
        newCount = 0;
      }

      setStats({
        totalWeek: totalWeek ?? 0,
        cartsWeek: cartsWeek ?? 0,
        quotesWeek: quotesWeek ?? 0,
        distinctSessions,
        avgSessionDuration,
        returningPercent,
        returningCount,
        newCount,
      });

      // Daily counts for last 30 days
      const since30 = new Date(Date.now() - 29 * 24 * 60 * 60 * 1000).toISOString();
      const { data: rows } = await supabase
        .from('analytics_events')
        .select('event_name, created_at')
        .gt('created_at', since30)
        .order('created_at', { ascending: true });

      const dayMap = {};
      for (let i = 0; i < 30; i++) {
        const d = new Date();
        d.setDate(d.getDate() - (29 - i));
        const key = d.toISOString().slice(0,10);
        dayMap[key] = { date: key, add_to_cart: 0, quote_form_started: 0, quote_form_submitted: 0, product_search: 0, cta_click: 0 };
      }

      (rows || []).forEach(r => {
        const key = new Date(r.created_at).toISOString().slice(0,10);
        if (!dayMap[key]) return;
        if (r.event_name && dayMap[key][r.event_name] !== undefined) dayMap[key][r.event_name]++;
      });

      setDaily(Object.values(dayMap));

      // Funnel counts
      const [{ count: views }, { count: adds }, { count: qstarts }, { count: qsubs }] = await Promise.all([
        supabase.from('user_product_views').select('*', { count: 'exact', head: true }),
        supabase.from('analytics_events').select('*', { count: 'exact', head: true }).eq('event_name', 'add_to_cart'),
        supabase.from('analytics_events').select('*', { count: 'exact', head: true }).eq('event_name', 'quote_form_started'),
        supabase.from('analytics_events').select('*', { count: 'exact', head: true }).eq('event_name', 'quote_form_submitted'),
      ]).catch(() => [{ count: 0 }, { count: 0 }, { count: 0 }, { count: 0 }]);

      setFunnel([
        { step: 'product_view', count: views ?? 0 },
        { step: 'add_to_cart', count: adds ?? 0 },
        { step: 'quote_form_started', count: qstarts ?? 0 },
        { step: 'quote_form_submitted', count: qsubs ?? 0 },
      ]);

      // Top products
      try {
        const { data: topP } = await supabase
          .from('user_product_views')
          .select('product_id, products(id, name, slug)')
          .limit(2000);

        const grouped = (topP || []).reduce((acc, row) => {
          if (!row?.product_id) return acc;
          const existing = acc.find((item) => item.product_id === row.product_id);
          const name = row.products?.name ?? row.products?.slug ?? null;
          if (existing) {
            existing.count += 1;
          } else {
            acc.push({ product_id: row.product_id, name, count: 1 });
          }
          return acc;
        }, []);

        grouped.sort((a, b) => b.count - a.count);
        setTopProducts(grouped.slice(0, 10));
      } catch {
        setTopProducts([]);
      }

      // Top searches
      try {
        const { data: searches } = await supabase
          .from('analytics_events')
          .select('metadata')
          .eq('event_name', 'product_search')
          .limit(2000);

        const countMap = {};
        (searches || []).forEach((row) => {
          const meta = row?.metadata;
          const value = (meta?.search_query ?? meta?.query ?? '').toString().trim().toLowerCase();
          if (!value) return;
          countMap[value] = (countMap[value] || 0) + 1;
        });

        const normalized = Object.entries(countMap)
          .map(([query, count]) => ({ query, count }))
          .sort((a, b) => b.count - a.count);

        setTopSearches(normalized.slice(0, 10));
      } catch {
        setTopSearches([]);
      }

      setLoading(false);
    };

    load();
  }, []);

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-[#0A1628]">Analytics</h1>
        <div className="text-xs text-[#718096]">Supabase connected</div>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-5">
          {[1,2,3,4,5].map(i => <Skeleton key={i} className="h-32 rounded-xl" />)}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-5">
          <StatCard title="Events (7d)" value={stats.totalWeek} icon={BarChart2} sub="Total events this week" />
          <StatCard title="Add To Cart (7d)" value={stats.cartsWeek} icon={Package} sub="Adds this week" />
          <StatCard title="Quotes Submitted (7d)" value={stats.quotesWeek} icon={FileText} sub="Submitted quotes" />
          <StatCard title="Distinct Sessions (7d)" value={stats.distinctSessions} icon={Users} sub="Unique session ids" />
          <StatCard title="Avg Session Duration" value={stats.avgSessionDuration} icon={Clock} sub="Average session_end duration" />
          <StatCard
            title="New vs Returning"
            value={stats.returningPercent != null ? `${stats.returningPercent}% returning` : '—'}
            icon={TrendingUp}
            sub={`${stats.returningCount ?? 0} returning / ${stats.newCount ?? 0} new`}
          />
        </div>
      )}

      <div className="bg-white rounded-xl border border-[#E2E8F0] shadow-sm p-6">
        <h2 className="text-base font-bold text-[#0A1628] mb-4">Daily Events (30 days)</h2>
        {loading ? <Skeleton className="h-72 rounded-xl" /> : (
          <div style={{ width: '100%', height: 320 }}>
            <ResponsiveContainer>
              <LineChart data={daily}>
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="product_search" stroke="#8884d8" />
                <Line type="monotone" dataKey="add_to_cart" stroke="#82ca9d" />
                <Line type="monotone" dataKey="quote_form_started" stroke="#ffc658" />
                <Line type="monotone" dataKey="quote_form_submitted" stroke="#ff6b6b" />
                <Line type="monotone" dataKey="cta_click" stroke="#888888" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="bg-white rounded-xl border border-[#E2E8F0] shadow-sm p-6">
          <h3 className="text-sm font-bold text-[#0A1628] mb-3">Funnel</h3>
          {loading ? <Skeleton className="h-48 rounded-lg" /> : (
            <div className="space-y-3">
              {funnel.map((f, idx) => {
                const prev = idx === 0 ? f.count : funnel[idx-1].count || 1;
                const pct = prev ? Math.round((f.count / prev) * 100) : 0;
                return (
                  <div key={f.step} className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-[#0A1628]">{f.step.replace('_', ' ')}</p>
                      <p className="text-xs text-[#4A5568]">{f.count} — {pct}%</p>
                    </div>
                    <div className="w-40">
                      <div className="h-3 bg-[#F1F5F9] rounded overflow-hidden">
                        <div style={{ width: `${pct}%`, background: '#C9A84C', height: '100%' }} />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div className="bg-white rounded-xl border border-[#E2E8F0] shadow-sm p-6 lg:col-span-2">
          <h3 className="text-sm font-bold text-[#0A1628] mb-3">Top Products</h3>
          {loading ? <Skeleton className="h-40 rounded-lg" /> : (
            <table className="w-full text-sm">
              <thead>
                <tr className="text-xs text-[#718096] text-left">
                  <th className="px-4 py-2">Product</th>
                  <th className="px-4 py-2">Views</th>
                </tr>
              </thead>
              <tbody>
                {topProducts.map(tp => (
                  <tr key={tp.product_id} className="border-t border-[#F0F4F8]">
                    <td className="px-4 py-3 text-[#0A1628]">
                      {tp.name ? tp.name : `Unknown product (ID: ${tp.product_id})`}
                    </td>
                    <td className="px-4 py-3 text-[#4A5568]">{tp.count ?? '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <div className="bg-white rounded-xl border border-[#E2E8F0] shadow-sm p-6">
          <h3 className="text-sm font-bold text-[#0A1628] mb-3">Top Search Terms</h3>
          {loading ? <Skeleton className="h-40 rounded-lg" /> : (
            <div className="space-y-2">
              {(topSearches || []).map((s, i) => (
                <div key={`${s.query}-${i}`} className="flex items-center justify-between">
                  <div className="text-sm text-[#0A1628]">{s.query || '—'}</div>
                  <div className="text-xs text-[#4A5568]">{s.count ?? '—'}</div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="bg-white rounded-xl border border-[#E2E8F0] shadow-sm p-6">
          <h3 className="text-sm font-bold text-[#0A1628] mb-3">Zero-result Terms (failed_searches)</h3>
          {loading ? <Skeleton className="h-40 rounded-lg" /> : (
            <div className="space-y-2">
              {/* reuse failed_searches table */}
              {/* simple fetch */}
              <FailedSearchesList />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

function FailedSearchesList() {
  const [data, setData] = useState(null);
  useEffect(() => {
    let mounted = true;
    supabase.from('failed_searches').select('search_term, created_at').order('created_at', { ascending: false }).limit(10).then(({ data }) => {
      if (!mounted) return;
      setData(data || []);
    });
    return () => { mounted = false; };
  }, []);
  if (!data) return <Skeleton className="h-40 rounded-lg" />;
  return (
    <div>
      {data.map((r) => (
        <div key={r.search_term + r.created_at} className="flex items-center justify-between text-sm">
          <div className="text-[#0A1628]">{r.search_term}</div>
          <div className="text-xs text-[#4A5568]">{new Date(r.created_at).toLocaleDateString()}</div>
        </div>
      ))}
    </div>
  );
}

export default AnalyticsPage;
