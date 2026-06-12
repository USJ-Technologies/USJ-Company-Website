import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import Skeleton from '../../components/ui/Skeleton';
import { Users, Package, ShoppingCart, DollarSign, TrendingUp, Activity } from 'lucide-react';

const DashboardPage = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Mocking fetch stats for now as exact endpoint might vary
    setTimeout(() => {
      setStats({
        totalUsers: 1245,
        totalProducts: 450,
        totalOrders: 320,
        revenue: 1250000,
        recentOrders: [
          { id: 'ORD-001', user: 'John Doe', amount: 15000, status: 'Processing' },
          { id: 'ORD-002', user: 'Jane Smith', amount: 8500, status: 'Shipped' },
          { id: 'ORD-003', user: 'Bob Johnson', amount: 45000, status: 'Delivered' },
        ]
      });
      setLoading(false);
    }, 1000);
  }, []);

  const StatCard = ({ title, value, icon: Icon, trend, prefix = '' }) => (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
      <div className="flex justify-between items-start mb-4">
        <div className="p-3 bg-gray-50 rounded-xl">
          <Icon size={24} className="text-[#C9A84C]" />
        </div>
        {trend && (
          <span className={`text-sm font-medium ${trend > 0 ? 'text-green-500' : 'text-red-500'} flex items-center`}>
            {trend > 0 ? '+' : ''}{trend}%
            <TrendingUp size={14} className="ml-1" />
          </span>
        )}
      </div>
      <h3 className="text-gray-500 text-sm font-medium mb-1">{title}</h3>
      <p className="text-3xl font-bold text-[#0A1628]">
        {prefix}{typeof value === 'number' ? value.toLocaleString() : value}
      </p>
    </div>
  );

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-[#0A1628]">Dashboard Overview</h1>
        <div className="bg-white px-4 py-2 rounded-lg border border-gray-200 text-sm font-medium text-gray-600 flex items-center">
          <Activity size={16} className="mr-2 text-green-500" />
          System Status: Healthy
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-32 rounded-2xl" />)}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard title="Total Revenue" value={stats.revenue} prefix="₹" icon={DollarSign} trend={12.5} />
          <StatCard title="Total Orders" value={stats.totalOrders} icon={ShoppingCart} trend={8.2} />
          <StatCard title="Products" value={stats.totalProducts} icon={Package} trend={-2.4} />
          <StatCard title="Users" value={stats.totalUsers} icon={Users} trend={5.1} />
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <h2 className="text-lg font-bold text-[#0A1628] mb-4">Recent Orders</h2>
          {loading ? (
            <Skeleton className="h-64 rounded-xl" />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-gray-100 text-sm text-gray-500">
                    <th className="py-3 font-medium">Order ID</th>
                    <th className="py-3 font-medium">Customer</th>
                    <th className="py-3 font-medium">Amount</th>
                    <th className="py-3 font-medium">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {stats.recentOrders.map((order, i) => (
                    <tr key={i} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                      <td className="py-4 font-medium text-[#0A1628]">{order.id}</td>
                      <td className="py-4 text-gray-600">{order.user}</td>
                      <td className="py-4 font-medium">₹{order.amount.toLocaleString()}</td>
                      <td className="py-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium
                          ${order.status === 'Processing' ? 'bg-yellow-100 text-yellow-800' : 
                            order.status === 'Shipped' ? 'bg-blue-100 text-blue-800' : 
                            'bg-green-100 text-green-800'}`}>
                          {order.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
        
        <div className="bg-[#0A1628] p-8 rounded-2xl text-white shadow-sm flex flex-col justify-center items-center text-center">
          <div className="w-16 h-16 bg-[#C9A84C] rounded-full flex items-center justify-center mb-6">
            <DollarSign size={32} className="text-[#0A1628]" />
          </div>
          <h3 className="text-xl font-bold mb-2">Monthly Target</h3>
          <p className="text-gray-300 mb-6 text-sm">You have reached 85% of your sales goal for this month.</p>
          <div className="w-full bg-gray-700 rounded-full h-2.5 mb-2">
            <div className="bg-[#C9A84C] h-2.5 rounded-full" style={{ width: '85%' }}></div>
          </div>
          <p className="text-sm font-medium text-[#C9A84C] mt-2">₹1,250,000 / ₹1,500,000</p>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
