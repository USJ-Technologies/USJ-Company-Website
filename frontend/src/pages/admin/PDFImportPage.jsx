import React, { useState } from 'react';
import api from '../../services/api';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import { UploadCloud, FileText, CheckCircle, AlertCircle, Save, CheckSquare, Square, Trash2, Edit } from 'lucide-react';
import toast from 'react-hot-toast';

const PDFImportPage = () => {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState(null);
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [importing, setImporting] = useState(false);
  const [importResults, setImportResults] = useState(null);

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setResults(null);
      setImportResults(null);
    }
  };

  const handleUpload = async () => {
    if (!file) return toast.error('Please select a PDF file first');
    
    setLoading(true);
    setResults(null);
    setImportResults(null);
    const formData = new FormData();
    formData.append('catalog', file);

    try {
      const { data } = await api.post('/products/import-pdf', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      
      if (data.success) {
        setResults(data.data);
        if (data.data.products && data.data.products.length > 0) {
          setSelectedProducts(data.data.products.map((_, index) => index));
        } else {
          toast.error('No products could be automatically extracted. Check raw text.');
        }
        toast.success(data.message || `Successfully parsed products from PDF`);
      } else {
        toast.error(data.message || 'Failed to parse PDF');
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to process PDF');
    } finally {
      setLoading(false);
    }
  };

  const toggleSelect = (index) => {
    if (selectedProducts.includes(index)) {
      setSelectedProducts(selectedProducts.filter(i => i !== index));
    } else {
      setSelectedProducts([...selectedProducts, index]);
    }
  };

  const toggleSelectAll = () => {
    if (selectedProducts.length === results.products.length) {
      setSelectedProducts([]);
    } else {
      setSelectedProducts(results.products.map((_, index) => index));
    }
  };

  const handleProductChange = (index, field, value) => {
    const updatedProducts = [...results.products];
    updatedProducts[index] = { ...updatedProducts[index], [field]: value };
    setResults({ ...results, products: updatedProducts });
  };

  const removeLocalProduct = (index) => {
    const updatedProducts = results.products.filter((_, i) => i !== index);
    setResults({ ...results, products: updatedProducts });
    setSelectedProducts(
      selectedProducts
        .filter(i => i !== index)
        .map(i => i > index ? i - 1 : i)
    );
  };

  const handleImportSelected = async () => {
    const productsToImport = results.products.filter((_, index) => selectedProducts.includes(index));
    if (productsToImport.length === 0) {
      return toast.error('Please select at least one product to import');
    }

    const cleanedProducts = productsToImport.map(p => ({
      ...p,
      price: p.price ? parseFloat(p.price) : 0,
      salePrice: p.salePrice ? parseFloat(p.salePrice) : undefined,
      categoryName: p.categoryName || 'General',
      stock: p.stock ? parseInt(p.stock) : 50,
      unit: p.unit || 'piece'
    }));

    setImporting(true);
    try {
      const { data } = await api.post('/products/bulk', { products: cleanedProducts });
      if (data.success) {
        setImportResults(data.data);
        toast.success(data.message || `Successfully imported ${data.data.importedCount} products`);
        setResults(null);
        setFile(null);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to import products');
    } finally {
      setImporting(false);
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto px-4 py-6">
      <h1 className="text-3xl font-bold text-[#0A1628]">Import Products from PDF</h1>
      <p className="text-gray-600">
        Upload a vendor catalog or price list PDF to automatically extract and review products before importing them into the database.
      </p>

      {/* Upload Box */}
      {!results && (
        <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 max-w-2xl">
          <div 
            className="border-2 border-dashed border-gray-300 rounded-xl p-12 text-center hover:border-[#C9A84C] transition-colors cursor-pointer bg-gray-50"
            onClick={() => document.getElementById('pdf-upload').click()}
          >
            <input 
              id="pdf-upload" 
              type="file" 
              accept=".pdf" 
              className="hidden" 
              onChange={handleFileChange}
            />
            <UploadCloud size={48} className="mx-auto text-gray-400 mb-4 animate-bounce" />
            <h3 className="text-lg font-medium text-[#0A1628] mb-1">
              {file ? file.name : 'Click to select PDF file'}
            </h3>
            <p className="text-sm text-gray-500">
              {file ? `${(file.size / 1024 / 1024).toFixed(2)} MB` : 'Supported formats: .pdf (Max 10MB)'}
            </p>
          </div>

          <div className="mt-6 flex justify-end">
            <Button 
              variant="primary" 
              onClick={handleUpload} 
              isLoading={loading}
              disabled={!file}
              leftIcon={<FileText size={18} />}
            >
              Parse PDF Catalog
            </Button>
          </div>
        </div>
      )}

      {/* Import Status Results */}
      {importResults && (
        <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 max-w-3xl space-y-6">
          <h2 className="text-xl font-bold text-[#0A1628]">Bulk Import Status</h2>
          
          <div className="flex items-center gap-3 p-4 bg-green-50 text-green-700 rounded-lg border border-green-100">
            <CheckCircle size={24} className="shrink-0" />
            <div>
              <div className="font-bold">{importResults.importedCount} Products Imported</div>
              <div className="text-sm">Successfully created and saved to the database.</div>
            </div>
          </div>
          
          {importResults.errors && importResults.errors.length > 0 && (
            <div className="p-4 bg-red-50 text-red-700 rounded-lg border border-red-100">
              <div className="flex items-start gap-3">
                <AlertCircle size={24} className="mt-0.5 shrink-0" />
                <div className="font-bold">{importResults.errors.length} Errors Encountered</div>
              </div>
              <ul className="text-sm mt-3 list-disc list-inside space-y-1 pl-6">
                {importResults.errors.map((err, i) => (
                  <li key={i}>{err}</li>
                ))}
              </ul>
            </div>
          )}
          
          <div className="flex justify-end">
            <Button variant="secondary" onClick={() => setImportResults(null)}>
              Import Another PDF
            </Button>
          </div>
        </div>
      )}

      {/* Parsed Products Table / Review Box */}
      {results && results.products && (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden space-y-6">
          <div className="p-6 border-b border-gray-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-gray-50">
            <div>
              <h2 className="text-xl font-bold text-[#0A1628]">Review Parsed Products</h2>
              <p className="text-sm text-gray-500 mt-1">
                Parsed {results.products.length} product(s). Edit fields directly and select which ones to import.
              </p>
            </div>
            
            <div className="flex gap-3">
              <Button 
                variant="secondary" 
                size="sm" 
                onClick={() => setResults(null)}
              >
                Cancel
              </Button>
              <Button 
                variant="primary" 
                size="sm"
                onClick={handleImportSelected}
                isLoading={importing}
                disabled={selectedProducts.length === 0}
                leftIcon={<Save size={18} />}
              >
                Import Selected ({selectedProducts.length})
              </Button>
            </div>
          </div>

          <div className="overflow-x-auto p-4">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100 text-xs uppercase tracking-wider text-gray-500 font-semibold">
                  <th className="p-3 w-12 text-center">
                    <button 
                      onClick={toggleSelectAll} 
                      className="text-gray-400 hover:text-[#C9A84C] transition-colors"
                      title="Select All"
                    >
                      {selectedProducts.length === results.products.length ? (
                        <CheckSquare size={18} className="text-[#C9A84C]" />
                      ) : (
                        <Square size={18} />
                      )}
                    </button>
                  </th>
                  <th className="p-3 min-w-[200px]">Product Name</th>
                  <th className="p-3 w-32">SKU</th>
                  <th className="p-3 w-32">Price (₹)</th>
                  <th className="p-3 w-48">Category Name</th>
                  <th className="p-3 min-w-[200px]">Short Description</th>
                  <th className="p-3 w-16 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {results.products.map((product, index) => {
                  const isSelected = selectedProducts.includes(index);
                  return (
                    <tr 
                      key={index} 
                      className={`hover:bg-gray-50 transition-colors ${isSelected ? 'bg-amber-50/20' : ''}`}
                    >
                      <td className="p-3 text-center">
                        <button 
                          onClick={() => toggleSelect(index)}
                          className="text-gray-400 hover:text-[#C9A84C] transition-colors"
                        >
                          {isSelected ? (
                            <CheckSquare size={18} className="text-[#C9A84C]" />
                          ) : (
                            <Square size={18} />
                          )}
                        </button>
                      </td>
                      <td className="p-3">
                        <input
                          type="text"
                          value={product.name || ''}
                          onChange={(e) => handleProductChange(index, 'name', e.target.value)}
                          className="w-full px-2 py-1 border border-gray-200 rounded text-sm focus:ring-1 focus:ring-[#C9A84C] outline-none"
                        />
                      </td>
                      <td className="p-3">
                        <input
                          type="text"
                          value={product.sku || ''}
                          onChange={(e) => handleProductChange(index, 'sku', e.target.value)}
                          className="w-full px-2 py-1 border border-gray-200 rounded text-sm focus:ring-1 focus:ring-[#C9A84C] outline-none"
                        />
                      </td>
                      <td className="p-3">
                        <input
                          type="number"
                          value={product.price || ''}
                          onChange={(e) => handleProductChange(index, 'price', e.target.value)}
                          className="w-full px-2 py-1 border border-gray-200 rounded text-sm focus:ring-1 focus:ring-[#C9A84C] outline-none font-medium"
                        />
                      </td>
                      <td className="p-3">
                        <input
                          type="text"
                          value={product.categoryName || ''}
                          onChange={(e) => handleProductChange(index, 'categoryName', e.target.value)}
                          placeholder="e.g. Computer Peripherals"
                          className="w-full px-2 py-1 border border-gray-200 rounded text-sm focus:ring-1 focus:ring-[#C9A84C] outline-none"
                        />
                      </td>
                      <td className="p-3">
                        <textarea
                          rows={1}
                          value={product.shortDescription || ''}
                          onChange={(e) => handleProductChange(index, 'shortDescription', e.target.value)}
                          className="w-full px-2 py-1 border border-gray-200 rounded text-sm focus:ring-1 focus:ring-[#C9A84C] outline-none resize-y"
                        />
                      </td>
                      <td className="p-3 text-center">
                        <button
                          onClick={() => removeLocalProduct(index)}
                          className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded transition-colors"
                          title="Remove product from list"
                        >
                          <Trash2 size={16} />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          
          {results.rawText && (
            <div className="p-6 border-t border-gray-100 bg-gray-50">
              <h3 className="font-bold text-sm text-[#0A1628] mb-2">Raw PDF Output Preview</h3>
              <pre className="text-xs text-gray-600 bg-white p-4 rounded-lg border border-gray-200 overflow-auto max-h-60 whitespace-pre-wrap">
                {results.rawText}
              </pre>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default PDFImportPage;
