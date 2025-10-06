import React, { useState } from 'react';
import { Search, Plus, Filter, Package, AlertTriangle, Edit, X } from 'lucide-react';
import { Product } from '../types';
import { useApp } from '../contexts/AppContext';
import EditProductForm from './forms/EditProductForm';

interface ProductsProps {
  onAddProduct?: () => void;
}

const Products: React.FC<ProductsProps> = ({ onAddProduct }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const { state, updateProduct, showNotification } = useApp();

  const { products, categories } = state;

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         product.description?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || product.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const lowStockProducts = products.filter(p => p.stock <= (p.minStock || 5));

  const handleRestock = (product: Product) => {
    const newStock = product.stock + 10;
    updateProduct(product.id, { stock: newStock });
    showNotification(`${product.name} restocked with 10 ${product.unit}`, 'success');
  };

  const handleEdit = (product: Product) => {
    setEditingProduct(product);
  };

  const handleCloseEdit = () => {
    setEditingProduct(null);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-text dark:text-text-dark">Products</h1>
          <p className="text-gray-600 dark:text-gray-400">Manage your inventory and product catalog</p>
        </div>
        <button 
          onClick={onAddProduct}
          className="btn-primary flex items-center justify-center space-x-2 px-4 sm:px-6 py-3 w-full sm:w-auto"
        >
          <Plus className="h-5 w-5" />
          <span>Add Product</span>
        </button>
      </div>

      {/* Search and Filters */}
      <div className="card">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            <input
              type="text"
              placeholder="Search products by name, description, or category..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
            />
          </div>
          
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            <div className="flex items-center space-x-2">
              <Filter className="h-5 w-5 text-gray-600 dark:text-gray-400" />
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="input-field py-2 min-w-[200px]"
              >
                <option value="all">All Categories</option>
                {categories.map(category => (
                  <option key={category.id} value={category.name}>
                    {category.icon} {category.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center space-x-1 bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
              <button
                onClick={() => setViewMode('grid')}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  viewMode === 'grid' ? 'bg-white dark:bg-gray-700 text-primary dark:text-primary-dark shadow-sm' : 'text-gray-600 dark:text-gray-400'
                }`}
              >
                Grid
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  viewMode === 'list' ? 'bg-white dark:bg-gray-700 text-primary dark:text-primary-dark shadow-sm' : 'text-gray-600 dark:text-gray-400'
                }`}
              >
                List
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Low Stock Alerts */}
      {lowStockProducts.length > 0 && (
        <div className="card border-l-4 border-red-500">
          <div className="flex items-center space-x-3 mb-4">
            <AlertTriangle className="h-6 w-6 text-red-500" />
            <h3 className="text-lg font-semibold text-text">Low Stock Alerts</h3>
            <span className="bg-red-100 text-red-800 text-sm font-medium px-2.5 py-0.5 rounded-full">
              {lowStockProducts.length} items
            </span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {lowStockProducts.map((product) => (
              <div key={product.id} className="flex items-center space-x-3 p-3 bg-red-50 rounded-lg border border-red-200">
                <img 
                  src={product.image} 
                  alt={product.name} 
                  className="w-12 h-12 rounded object-cover"
                />
                <div className="flex-1">
                  <p className="font-medium text-text text-sm">{product.name}</p>
                  <p className="text-xs text-red-600">
                    Only {product.stock} {product.unit} left
                  </p>
                </div>
                <button 
                  onClick={() => handleRestock(product)}
                  className="btn-primary text-xs px-3 py-1"
                >
                  Restock
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Products Grid/List */}
      {viewMode === 'grid' ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
          {filteredProducts.map((product) => (
            <div key={product.id} className="card p-4 hover:shadow-lg transition-shadow">
              <img 
                src={product.image} 
                alt={product.name} 
                className="w-full h-32 object-cover rounded-lg mb-3"
              />
              <h3 className="font-semibold text-text mb-1">{product.name}</h3>
              <p className="text-sm text-gray-600 mb-3">{product.category}</p>
              <div className="flex items-center justify-between mb-3">
                <span className="text-xl font-bold text-primary">₹{product.price}</span>
                <span className={`text-sm px-2 py-1 rounded-full ${
                  product.stock <= (product.minStock || 5) 
                    ? 'bg-red-100 text-red-600' 
                    : 'bg-green-100 text-green-600'
                }`}>
                  {product.stock} {product.unit}
                </span>
              </div>
              {product.description && (
                <p className="text-sm text-gray-600 mb-3 line-clamp-2">{product.description}</p>
              )}
              <div className="flex space-x-2">
                <button 
                  onClick={() => handleEdit(product)}
                  className="flex-1 btn-secondary text-sm py-2"
                >
                  <Edit className="h-4 w-4 mr-1 inline" />
                  Edit
                </button>
                <button 
                  onClick={() => handleRestock(product)}
                  className="flex-1 btn-primary text-sm py-2"
                >
                  Restock
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="card">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 font-medium text-gray-700">Product</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-700">Category</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-700">Price</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-700">Stock</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-700">Status</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-700">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredProducts.map((product) => (
                  <tr key={product.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-3 px-4">
                      <div className="flex items-center space-x-3">
                        <img 
                          src={product.image} 
                          alt={product.name} 
                          className="w-10 h-10 rounded object-cover"
                        />
                        <div>
                          <p className="font-medium text-text">{product.name}</p>
                          {product.description && (
                            <p className="text-sm text-gray-600 truncate max-w-xs">{product.description}</p>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <span className="text-sm text-gray-600">{product.category}</span>
                    </td>
                    <td className="py-3 px-4">
                      <span className="font-medium text-primary">₹{product.price}</span>
                    </td>
                    <td className="py-3 px-4">
                      <span className="text-sm text-gray-600">{product.stock} {product.unit}</span>
                    </td>
                    <td className="py-3 px-4">
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        product.stock <= (product.minStock || 5) 
                          ? 'bg-red-100 text-red-600' 
                          : 'bg-green-100 text-green-600'
                      }`}>
                        {product.stock <= (product.minStock || 5) ? 'Low Stock' : 'In Stock'}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex space-x-2">
                        <button 
                          onClick={() => handleEdit(product)}
                          className="btn-secondary text-xs px-3 py-1"
                        >
                          <Edit className="h-3 w-3 mr-1 inline" />
                          Edit
                        </button>
                        <button 
                          onClick={() => handleRestock(product)}
                          className="btn-primary text-xs px-3 py-1"
                        >
                          Restock
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Empty State */}
      {filteredProducts.length === 0 && (
        <div className="text-center py-16">
          <Package className="h-24 w-24 text-gray-400 mx-auto mb-6" />
          <h3 className="text-2xl font-medium text-gray-900 mb-4">No products found</h3>
          <p className="text-gray-500 mb-8 max-w-md mx-auto">
            {searchQuery ? 'Try adjusting your search or filter criteria' : 'Start building your product catalog by adding your first product'}
          </p>
          <button 
            onClick={onAddProduct}
            className="btn-primary px-8 py-3"
          >
            Add Your First Product
          </button>
        </div>
      )}

      {/* Inventory Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <div className="card text-center">
          <div className="p-4 bg-primary/10 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
            <Package className="h-8 w-8 text-primary" />
          </div>
          <p className="text-3xl font-bold text-text">{state.products.length}</p>
          <p className="text-gray-600">Total Products</p>
        </div>

        <div className="card text-center">
          <div className="p-4 bg-accent-orange/10 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
            <Package className="h-8 w-8 text-accent-orange" />
          </div>
          <p className="text-3xl font-bold text-text">
            {products.reduce((sum, p) => sum + p.stock, 0)}
          </p>
          <p className="text-gray-600">Total Stock</p>
        </div>

        <div className="card text-center">
          <div className="p-4 bg-accent-brown/10 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
            <Package className="h-8 w-8 text-accent-brown" />
          </div>
          <p className="text-3xl font-bold text-text">{categories.length}</p>
          <p className="text-gray-600">Categories</p>
        </div>

        <div className="card text-center">
          <div className="p-4 bg-red-100 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
            <AlertTriangle className="h-8 w-8 text-red-500" />
          </div>
          <p className="text-3xl font-bold text-red-500">{lowStockProducts.length}</p>
          <p className="text-gray-600">Low Stock Items</p>
        </div>
      </div>

      {/* Edit Product Modal */}
      {editingProduct && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-text dark:text-text-dark">Edit Product</h2>
                <button
                  onClick={handleCloseEdit}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
              <EditProductForm 
                product={editingProduct} 
                onClose={handleCloseEdit}
                onUpdate={(updatedProduct) => {
                  const { id, ...updates } = updatedProduct;
                  updateProduct(id, updates);
                  handleCloseEdit();
                }}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Products;
