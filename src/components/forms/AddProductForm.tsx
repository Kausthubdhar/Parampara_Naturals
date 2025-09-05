import React, { useState, useEffect } from 'react';
import { Package, Save, X, Image, Search, ExternalLink, Sparkles, RefreshCw } from 'lucide-react';
import { useApp } from '../../contexts/AppContext';
import { Product } from '../../types';

interface AddProductFormProps {
  onClose: () => void;
}

interface UnsplashImage {
  id: string;
  urls: {
    regular: string;
    thumb: string;
  };
  alt_description: string;
  links: {
    html: string;
  };
  user: {
    name: string;
    links: {
      html: string;
    };
  };
}

const AddProductForm: React.FC<AddProductFormProps> = ({ onClose }) => {
  const { addProduct, state } = useApp();
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    stock: '',
    minStock: '',
    unit: 'kg' as const,
    category: '',
    image: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  // New state for AI image suggestions
  const [imageMode, setImageMode] = useState<'manual' | 'ai'>('manual');
  const [suggestedImages, setSuggestedImages] = useState<UnsplashImage[]>([]);
  const [isLoadingImages, setIsLoadingImages] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string>('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Product name is required';
    }

    if (!formData.price || parseFloat(formData.price) <= 0) {
      newErrors.price = 'Valid price is required';
    }

    if (!formData.stock || parseInt(formData.stock) < 0) {
      newErrors.stock = 'Valid stock quantity is required';
    }

    if (!formData.minStock || parseInt(formData.minStock) < 0) {
      newErrors.minStock = 'Valid minimum stock is required';
    }

    if (!formData.category.trim()) {
      newErrors.category = 'Category is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Function to fetch AI-suggested images
  const fetchSuggestedImages = async () => {
    if (!formData.name.trim() || !formData.category.trim()) {
      return;
    }

    setIsLoadingImages(true);
    try {
      const UNSPLASH_ACCESS_KEY = process.env.REACT_APP_UNSPLASH_ACCESS_KEY;
      
      if (!UNSPLASH_ACCESS_KEY) {
        console.error('Unsplash API key not found. Please check your .env file.');
        return;
      }

      // Create a smart search query for natural products
      const query = `${formData.name} ${formData.category} natural organic healthy`;
      
      const response = await fetch(
        `https://api.unsplash.com/search/photos?query=${encodeURIComponent(query)}&per_page=6&orientation=landscape&content_filter=high`,
        {
          headers: {
            'Authorization': `Client-ID ${UNSPLASH_ACCESS_KEY}`
          }
        }
      );
      
      if (response.ok) {
        const data = await response.json();
        setSuggestedImages(data.results || []);
      } else {
        console.error('Unsplash API error:', response.status);
      }
    } catch (error) {
      console.error('Error fetching images:', error);
    } finally {
      setIsLoadingImages(false);
    }
  };

  // Auto-fetch images when product name or category changes
  useEffect(() => {
    if (formData.name.trim() && formData.category.trim()) {
      const timer = setTimeout(() => {
        fetchSuggestedImages();
      }, 1000); // Debounce for 1 second
      
      return () => clearTimeout(timer);
    }
  }, [formData.name, formData.category]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    const newProduct: Omit<Product, 'id'> = {
      name: formData.name.trim(),
      description: formData.description.trim(),
      price: parseFloat(formData.price),
      stock: parseInt(formData.stock),
      minStock: parseInt(formData.minStock),
      unit: formData.unit,
      category: formData.category.trim(),
      image: formData.image.trim() || '',
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    addProduct(newProduct);
    onClose();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Product Name */}
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-text dark:text-text-dark mb-2">
            Product Name *
          </label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            className={`input-field ${errors.name ? 'border-red-500 focus:border-red-500 focus:ring-red-500/30' : ''}`}
            placeholder="Enter product name"
          />
          {errors.name && (
            <p className="text-red-500 text-xs mt-1">{errors.name}</p>
          )}
        </div>

        {/* Description */}
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-text dark:text-text-dark mb-2">
            Description
          </label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            rows={2}
            className="input-field"
            placeholder="Enter product description"
          />
        </div>

        {/* Price */}
        <div>
          <label className="block text-sm font-medium text-text dark:text-text-dark mb-2">
            Price (₹) *
          </label>
          <input
            type="number"
            name="price"
            value={formData.price}
            onChange={handleChange}
            step="0.01"
            min="0"
            className={`input-field ${errors.price ? 'border-red-500 focus:border-red-500 focus:ring-red-500/30' : ''}`}
            placeholder="0.00"
          />
          {errors.price && (
            <p className="text-red-500 text-xs mt-1">{errors.price}</p>
          )}
        </div>

        {/* Stock */}
        <div>
          <label className="block text-sm font-medium text-text dark:text-text-dark mb-2">
            Stock Quantity *
          </label>
          <input
            type="number"
            name="stock"
            value={formData.stock}
            onChange={handleChange}
            min="0"
            className={`input-field ${errors.stock ? 'border-red-500 focus:border-red-500 focus:ring-red-500/30' : ''}`}
            placeholder="0"
          />
          {errors.stock && (
            <p className="text-red-500 text-xs mt-1">{errors.stock}</p>
          )}
        </div>

        {/* Min Stock */}
        <div>
          <label className="block text-sm font-medium text-text dark:text-text-dark mb-2">
            Minimum Stock *
          </label>
          <input
            type="number"
            name="minStock"
            value={formData.minStock}
            onChange={handleChange}
            min="0"
            className={`input-field ${errors.minStock ? 'border-red-500 focus:border-red-500 focus:ring-red-500/30' : ''}`}
            placeholder="0"
          />
          {errors.minStock && (
            <p className="text-red-500 text-xs mt-1">{errors.minStock}</p>
          )}
        </div>

        {/* Unit */}
        <div>
          <label className="block text-sm font-medium text-text dark:text-text-dark mb-2">
            Unit
          </label>
          <select
            name="unit"
            value={formData.unit}
            onChange={handleChange}
            className="input-field"
          >
            <option value="kg">Kilogram (kg)</option>
            <option value="g">Gram (g)</option>
            <option value="l">Liter (l)</option>
            <option value="ml">Milliliter (ml)</option>
            <option value="pcs">Pieces (pcs)</option>
            <option value="pack">Pack</option>
          </select>
        </div>

        {/* Category */}
        <div>
          <label className="block text-sm font-medium text-text dark:text-text-dark mb-2">
            Category *
          </label>
          <select
            name="category"
            value={formData.category}
            onChange={handleChange}
            className={`input-field ${errors.category ? 'border-red-500 focus:border-red-500 focus:ring-red-500/30' : ''}`}
          >
            <option value="">Select category</option>
            {state.categories.map(category => (
              <option key={category.id} value={category.name}>
                {category.name}
              </option>
            ))}
          </select>
          {errors.category && (
            <p className="text-red-500 text-xs mt-1">{errors.category}</p>
          )}
        </div>

        {/* Enhanced Image Section */}
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-text dark:text-text-dark mb-2">
            Product Image
          </label>
          
          {/* Image Mode Toggle */}
          <div className="flex space-x-2 mb-3">
            <button
              type="button"
              onClick={() => setImageMode('manual')}
              className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                imageMode === 'manual'
                  ? 'bg-primary text-white'
                  : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
              }`}
            >
              <Image className="w-4 h-4" />
              <span>Manual URL</span>
            </button>
            
            <button
              type="button"
              onClick={() => setImageMode('ai')}
              className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                imageMode === 'ai'
                  ? 'bg-primary text-white'
                  : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
              }`}
            >
              <Sparkles className="w-4 h-4" />
              <span>AI Suggestions</span>
            </button>
          </div>

          {imageMode === 'manual' ? (
            /* Manual URL Input */
            <div>
              <input
                type="url"
                name="image"
                value={formData.image}
                onChange={handleChange}
                className="input-field"
                placeholder="https://example.com/image.jpg"
              />
              {formData.image && (
                <div className="mt-2">
                  <img 
                    src={formData.image} 
                    alt="Preview" 
                    className="w-20 h-20 object-cover rounded-lg border"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                    }}
                  />
                </div>
              )}
            </div>
          ) : (
            /* AI Image Suggestions */
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  AI will suggest images based on your product name and category
                </p>
                <button
                  type="button"
                  onClick={fetchSuggestedImages}
                  disabled={isLoadingImages || !formData.name.trim() || !formData.category.trim()}
                  className="btn-secondary flex items-center space-x-2 text-sm px-3 py-2"
                >
                  {isLoadingImages ? (
                    <RefreshCw className="w-4 h-4 animate-spin" />
                  ) : (
                    <Search className="w-4 h-4" />
                  )}
                  <span>Refresh</span>
                </button>
              </div>

              {isLoadingImages ? (
                <div className="flex items-center justify-center py-6">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
                </div>
              ) : suggestedImages.length > 0 ? (
                <div className="grid grid-cols-3 gap-2">
                  {suggestedImages.map((image) => (
                    <div
                      key={image.id}
                      className={`relative cursor-pointer rounded-lg overflow-hidden border-2 transition-all ${
                        selectedImage === image.urls.regular
                          ? 'border-primary ring-2 ring-primary/20'
                          : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                      }`}
                      onClick={() => {
                        setSelectedImage(image.urls.regular);
                        setFormData(prev => ({ ...prev, image: image.urls.regular }));
                      }}
                    >
                      <img
                        src={image.urls.thumb}
                        alt={image.alt_description || 'Product image'}
                        className="w-full h-20 object-cover"
                      />
                      <div className="absolute inset-0 bg-black/0 hover:bg-black/20 transition-colors flex items-center justify-center">
                        {selectedImage === image.urls.regular && (
                          <div className="bg-primary text-white rounded-full p-1">
                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-6 text-gray-500 dark:text-gray-400">
                  <Image className="w-10 h-10 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">Enter a product name and category to see AI image suggestions</p>
                </div>
              )}

              {selectedImage && (
                <div className="mt-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                    Selected image:
                  </p>
                  <div className="flex items-center space-x-3">
                    <img 
                      src={selectedImage} 
                      alt="Selected" 
                      className="w-14 h-14 object-cover rounded-lg"
                    />
                    <div className="flex-1">
                      <a
                        href={selectedImage}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary hover:text-primary-dark text-sm flex items-center space-x-1 mb-1"
                      >
                        <ExternalLink className="w-4 h-4" />
                        <span>View full size</span>
                      </a>
                      <p className="text-xs text-gray-500">
                        Powered by Unsplash
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Form Actions */}
      <div className="flex items-center justify-end space-x-3 pt-4 border-t border-border/50 dark:border-border-dark/50">
        <button
          type="button"
          onClick={onClose}
          className="btn-secondary flex items-center space-x-2"
        >
          <X className="w-4 h-4" />
          <span>Cancel</span>
        </button>
        <button
          type="submit"
          className="btn-primary flex items-center space-x-2"
        >
          <Save className="w-4 h-4" />
          <span>Add Product</span>
        </button>
      </div>
    </form>
  );
};

export default AddProductForm;