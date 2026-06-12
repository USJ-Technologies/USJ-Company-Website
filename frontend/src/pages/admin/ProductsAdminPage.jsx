import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import Skeleton from '../../components/ui/Skeleton';
import { Plus, Edit, Trash2, Search, Filter } from 'lucide-react';
import toast from 'react-hot-toast';

const ProductsAdminPage = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/products');
      setProducts(data.data?.products || data.products || []);
    } catch (error) {
      toast.error('Failed to load products');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      try {
        await api.delete(`/admin/products/${id}`);
        toast.success('Product deleted');
        fetchProducts();
      } catch (error) {
        toast.error('Failed to delete product');
      }
    }
  };

  const filteredProducts = products.filter(p => {
    const name = p.name || '';
    const cat = p.categoryName || p.category?.name || (typeof p.category === 'string' ? p.category : '');
    return name.toLowerCase().includes(searchTerm.toLowerCase()) || 
           cat.toLowerCase().includes(searchTerm.toLowerCase());
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-3xl font-bold text-[#0A1628]">Manage Products</h1>
        <Button variant="primary" leftIcon={<Plus size={18} />}>
          Add New Product
        </Button>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-4 border-b border-gray-100 flex flex-col sm:flex-row gap-4 justify-between items-center bg-gray-50">
          <div className="relative w-full sm:w-96">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search size={18} className="text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search products..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 w-full px-4 py-2 bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#C9A84C] focus:border-transparent outline-none transition-all text-sm"
            />
          </div>
          <Button variant="secondary" size="sm" leftIcon={<Filter size={16} />}>
            Filter
          </Button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100 text-xs uppercase tracking-wider text-gray-500 font-semibold">
                <th className="p-4">Product</th>
                <th className="p-4">Category</th>
                <th className="p-4">Price</th>
                <th className="p-4">Stock</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                [1, 2, 3, 4, 5].map(i => (
                  <tr key={i}>
                    <td className="p-4"><Skeleton className="h-10 w-48" /></td>
                    <td className="p-4"><Skeleton className="h-6 w-24" /></td>
                    <td className="p-4"><Skeleton className="h-6 w-20" /></td>
                    <td className="p-4"><Skeleton className="h-6 w-16" /></td>
                    <td className="p-4"><Skeleton className="h-8 w-24 ml-auto" /></td>
                  </tr>
                ))
              ) : filteredProducts.length > 0 ? (
                filteredProducts.map((product) => (
                  <tr key={product._id} className="hover:bg-gray-50 transition-colors">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-white border border-gray-100 overflow-hidden flex items-center justify-center p-1">
                          {(product.images?.[0] || product.image) ? (
                            <img src={product.images?.[0] || product.image} alt="" className="max-w-full max-h-full object-contain" />
                          ) : (
                            <div className="w-full h-full bg-gray-100"></div>
                          )}
                        </div>
                        <div className="font-medium text-[#0A1628] line-clamp-1 max-w-xs">{product.name}</div>
                      </div>
                    </td>
                    <td className="p-4 text-sm text-gray-600">{product.categoryName || product.category?.name || (typeof product.category === 'string' ? product.category : '')}</td>
                    <td className="p-4 font-medium text-[#0A1628]">
                      ₹{(product.salePrice || product.price).toLocaleString()}
                    </td>
                    <td className="p-4">
                      <Badge variant={product.stock > 10 ? 'success' : product.stock > 0 ? 'warning' : 'danger'}>
                        {product.stock} left
                      </Badge>
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex justify-end gap-2">
                        <button className="p-2 text-gray-400 hover:text-[#C9A84C] hover:bg-yellow-50 rounded-lg transition-colors">
                          <Edit size={18} />
                        </button>
                        <button 
                          onClick={() => handleDelete(product._id)}
                          className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="p-8 text-center text-gray-500">
                    No products found matching "{searchTerm}"
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ProductsAdminPage;
