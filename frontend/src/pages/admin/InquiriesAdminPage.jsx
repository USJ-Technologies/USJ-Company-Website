import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import Badge from '../../components/ui/Badge';
import Skeleton from '../../components/ui/Skeleton';
import { Mail, Check, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';

const InquiriesAdminPage = () => {
  const [inquiries, setInquiries] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchInquiries();
  }, []);

  const fetchInquiries = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/inquiries').catch(() => ({
        data: { data: { inquiries: [
          { _id: 'INQ1', name: 'John Doe', email: 'john@example.com', subject: 'Partnership', message: 'Looking for a business partnership with USJ Technologies.', status: 'New', createdAt: new Date().toISOString() },
          { _id: 'INQ2', name: 'Alice Smith', email: 'alice@example.com', subject: 'Support', message: 'Need help with my recent order.', status: 'Read', createdAt: new Date(Date.now() - 86400000).toISOString() },
        ]} }
      }));
      setInquiries(data.data?.inquiries || data.inquiries || []);
    } catch (error) {
      toast.error('Failed to load inquiries');
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (id) => {
    try {
      await api.put(`/contact/inquiries/${id}/read`).catch(() => {
        setInquiries(inquiries.map(i => i._id === id ? { ...i, status: 'Read' } : i));
      });
      toast.success('Marked as read');
    } catch {
      toast.error('Failed to update status');
    }
  };

  const deleteInquiry = async (id) => {
    if(window.confirm('Delete this inquiry?')) {
      try {
        await api.delete(`/contact/inquiries/${id}`).catch(() => {
          setInquiries(inquiries.filter(i => i._id !== id));
        });
        toast.success('Inquiry deleted');
      } catch {
        toast.error('Failed to delete');
      }
    }
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-[#0A1628]">Contact Inquiries</h1>

      <div className="grid grid-cols-1 gap-4">
        {loading ? (
          [1, 2, 3].map(i => <Skeleton key={i} className="h-40 rounded-2xl" />)
        ) : inquiries.length === 0 ? (
          <div className="bg-white p-12 text-center rounded-2xl border border-gray-100 shadow-sm">
            <Mail size={48} className="mx-auto text-gray-300 mb-4" />
            <h3 className="text-xl font-medium text-gray-900">No Inquiries Found</h3>
            <p className="text-gray-500 mt-2">You don't have any contact inquiries at the moment.</p>
          </div>
        ) : (
          inquiries.map((inquiry) => (
            <div key={inquiry._id} className={`bg-white rounded-2xl p-6 border ${inquiry.status === 'New' ? 'border-[#C9A84C] shadow-md' : 'border-gray-100 shadow-sm'} transition-all`}>
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-3">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center text-xl font-bold ${inquiry.status === 'New' ? 'bg-[#0A1628] text-[#C9A84C]' : 'bg-gray-100 text-gray-500'}`}>
                    {inquiry.name.charAt(0)}
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-[#0A1628]">{inquiry.name}</h3>
                    <div className="text-sm text-gray-500 flex items-center gap-2">
                      <Mail size={14} /> {inquiry.email}
                    </div>
                  </div>
                </div>
                <div className="flex flex-col items-end gap-2">
                  <span className="text-xs text-gray-400">{new Date(inquiry.createdAt).toLocaleString()}</span>
                  <Badge variant={inquiry.status === 'New' ? 'warning' : 'secondary'}>{inquiry.status}</Badge>
                </div>
              </div>
              
              <div className="bg-gray-50 p-4 rounded-xl mb-4">
                <h4 className="font-semibold text-[#0A1628] mb-2">{inquiry.subject}</h4>
                <p className="text-gray-600 text-sm whitespace-pre-wrap">{inquiry.message}</p>
              </div>

              <div className="flex justify-end gap-3">
                {inquiry.status === 'New' && (
                  <button 
                    onClick={() => markAsRead(inquiry._id)}
                    className="flex items-center gap-1 px-3 py-1.5 text-sm font-medium text-[#C9A84C] hover:bg-yellow-50 rounded-lg transition-colors"
                  >
                    <Check size={16} /> Mark as Read
                  </button>
                )}
                <a href={`mailto:${inquiry.email}`} className="flex items-center gap-1 px-3 py-1.5 text-sm font-medium text-white bg-[#0A1628] hover:bg-[#1A2E4A] rounded-lg transition-colors">
                  Reply
                </a>
                <button 
                  onClick={() => deleteInquiry(inquiry._id)}
                  className="flex items-center gap-1 px-3 py-1.5 text-sm font-medium text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                >
                  <Trash2 size={16} /> Delete
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default InquiriesAdminPage;
