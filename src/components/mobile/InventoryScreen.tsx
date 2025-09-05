import React, { useState } from 'react';
import { Search, Plus, Filter, Package, TrendingUp, AlertTriangle } from 'lucide-react';
import { Product } from '../../types';
import { useApp } from '../../contexts/AppContext';

interface InventoryScreenProps {
  onAddProduct?: () => void;
}

const InventoryScreen: React.FC<InventoryScreenProps> = ({ onAddProduct }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
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

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-text">Inventory</h2>
        <button 
          onClick={onAddProduct}
          className="btn-primary flex items-center space-x-2 px-4 py-2"
        >
          <Plus className="h-4 w-4" />
          <span>Add Product</span>
        </button>
      </div>

      {/* Search and Filters */}
      <div className="space-y-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
          <input
            type="text"
            placeholder="Search products..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
          />
        </div>

        <div className="flex items-center space-x-2">
          <Filter className="h-4 w-4 text-gray-600" />
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="flex-1 input-field py-2"
          >
            <option value="all">All Categories</option>
            {categories.map(category => (
              <option key={category.id} value={category.name}>
                {category.icon} {category.name}
              </option>
            ))}
          </select>
        </div>

        {/* View Mode Toggle */}
        <div className="flex items-center justify-center space-x-1 bg-gray-100 rounded-lg p-1">
          <button
            onClick={() => setViewMode('grid')}
            className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
              viewMode === 'grid' ? 'bg-white text-primary shadow-sm' : 'text-gray-600'
            }`}
          >
            Grid
          </button>
          <button
            onClick={() => setViewMode('list')}
            className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
              viewMode === 'list' ? 'bg-white text-primary shadow-sm' : 'text-gray-600'
            }`}
          >
            List
          </button>
        </div>
      </div>

      {/* Low Stock Alerts */}
      {lowStockProducts.length > 0 && (
        <div className="card border-l-4 border-red-500">
          <div className="flex items-center space-x-2 mb-3">
            <AlertTriangle className="h-5 w-5 text-red-500" />
            <h3 className="font-semibold text-text">Low Stock Alerts</h3>
          </div>
          <div className="space-y-2">
            {lowStockProducts.slice(0, 3).map((product) => (
              <div key={product.id} className="flex items-center space-x-3 p-2 bg-red-50 rounded-lg">
                <img 
                  src={product.image} 
                  alt={product.name} 
                  className="w-8 h-8 rounded object-cover"
                />
                <div className="flex-1">
                  <p className="font-medium text-text text-sm">{product.name}</p>
                  <p className="text-xs text-red-600">
                    Only {product.stock} {product.unit} left
                  </p>
                </div>
                <button 
                  onClick={() => handleRestock(product)}
                  className="text-xs bg-primary text-white px-2 py-1 rounded"
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
        <div className="grid grid-cols-2 gap-3">
          {filteredProducts.map((product) => (
            <div key={product.id} className="card p-3">
              <img 
                src={product.image} 
                alt={product.name} 
                className="w-full h-24 object-cover rounded-lg mb-2"
              />
              <h3 className="font-medium text-text text-sm mb-1">{product.name}</h3>
              <p className="text-xs text-gray-600 mb-2">{product.category}</p>
              <div className="flex items-center justify-between mb-2">
                <span className="font-bold text-primary">₹{product.price}</span>
                <span className={`text-xs px-2 py-1 rounded-full ${
                  product.stock <= (product.minStock || 5) 
                    ? 'bg-red-100 text-red-600' 
                    : 'bg-green-100 text-green-600'
                }`}>
                  {product.stock} {product.unit}
                </span>
              </div>
              <div className="flex space-x-2">
                <button className="flex-1 btn-secondary text-xs py-1">
                  Edit
                </button>
                <button 
                  onClick={() => handleRestock(product)}
                  className="flex-1 btn-primary text-xs py-1"
                >
                  Restock
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="space-y-3">
          {filteredProducts.map((product) => (
            <div key={product.id} className="card">
              <div className="flex items-center space-x-3">
                <img 
                  src={product.image} 
                  alt={product.name} 
                  className="w-16 h-16 rounded-lg object-cover"
                />
                <div className="flex-1">
                  <h3 className="font-medium text-text">{product.name}</h3>
                  <p className="text-sm text-gray-600">{product.category}</p>
                  <div className="flex items-center space-x-4 mt-2">
                    <span className="font-bold text-primary">₹{product.price}</span>
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      product.stock <= (product.minStock || 5) 
                        ? 'bg-red-100 text-red-600' 
                        : 'bg-green-100 text-green-600'
                    }`}>
                      {product.stock} {product.unit}
                    </span>
                  </div>
                </div>
                <div className="flex flex-col space-y-2">
                  <button className="btn-secondary text-xs px-3 py-1">
                    Edit
                  </button>
                  <button 
                    onClick={() => handleRestock(product)}
                    className="btn-primary text-xs px-3 py-1"
                  >
                    Restock
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Empty State */}
      {filteredProducts.length === 0 && (
        <div className="text-center py-12">
          <Package className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No products found</h3>
          <p className="text-gray-500 mb-4">
            Try adjusting your search or filter criteria
          </p>
          <button 
            onClick={onAddProduct}
            className="btn-primary"
          >
            Add Your First Product
          </button>
        </div>
      )}

      {/* Quick Stats */}
      <div className="card">
        <h3 className="font-semibold text-text mb-3">Inventory Summary</h3>
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <p className="text-2xl font-bold text-primary">{products.length}</p>
            <p className="text-xs text-gray-600">Total Products</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-accent-orange">
              {products.reduce((sum, p) => sum + p.stock, 0)}
            </p>
            <p className="text-xs text-gray-600">Total Stock</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-red-500">{lowStockProducts.length}</p>
            <p className="text-xs text-gray-600">Low Stock</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InventoryScreen;
