import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Save, X, Image, Search, ExternalLink, Sparkles, RefreshCw, Upload, Trash2 } from 'lucide-react';
import { useApp } from '../../contexts/AppContext';
import { Product } from '../../types';

interface EditProductFormProps {
  product: Product;
  onClose: () => void;
  onUpdate: (product: Product) => void;
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

const EditProductForm: React.FC<EditProductFormProps> = ({ product, onClose, onUpdate }) => {
  const { state } = useApp();
  const [formData, setFormData] = useState({
    name: product.name,
    description: product.description || '',
    price: product.price.toString(),
    stock: product.stock.toString(),
    minStock: product.minStock?.toString() || '',
    unit: product.unit,
    category: product.category,
    image: product.image || '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  // Image mode and suggestions
  const [imageMode, setImageMode] = useState<'upload' | 'ai'>('upload');
  const [suggestedImages, setSuggestedImages] = useState<UnsplashImage[]>([]);
  const [isLoadingImages, setIsLoadingImages] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string>('');
  
  // File upload state
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  // File upload handlers
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        alert('Please select an image file');
        return;
      }
      
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert('File size must be less than 5MB');
        return;
      }
      
      setUploadedFile(file);
      
      // Create preview URL
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
      
      // Update form data with the file
      setFormData(prev => ({ ...prev, image: url }));
    }
  };

  const handleRemoveFile = () => {
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }
    setUploadedFile(null);
    setPreviewUrl('');
    setFormData(prev => ({ ...prev, image: product.image || '' }));
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
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
  const fetchSuggestedImages = useCallback(async () => {
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
  }, [formData.name, formData.category]);

  // Auto-fetch images when product name or category changes
  useEffect(() => {
    if (formData.name.trim() && formData.category.trim()) {
      const timer = setTimeout(() => {
        fetchSuggestedImages();
      }, 1000);
      
      return () => clearTimeout(timer);
    }
  }, [formData.name, formData.category, fetchSuggestedImages]);

  // Cleanup object URLs on unmount
  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  // Helper function to convert file to base64
  const convertFileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = error => reject(error);
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    let imageUrl = formData.image.trim();
    
    // If we have an uploaded file, convert it to base64
    if (uploadedFile) {
      try {
        const base64 = await convertFileToBase64(uploadedFile);
        imageUrl = base64;
      } catch (error) {
        console.error('Error converting file to base64:', error);
        alert('Error processing image file. Please try again.');
        return;
      }
    }

    // Find the category ID based on the selected category name
    const selectedCategory = state.categories.find(cat => cat.name === formData.category.trim());
    const categoryId = selectedCategory?.id;

    const updatedProduct: Product & { categoryId?: string } = {
      ...product,
      name: formData.name.trim(),
      description: formData.description.trim(),
      price: parseFloat(formData.price),
      stock: parseInt(formData.stock),
      minStock: parseInt(formData.minStock),
      unit: formData.unit,
      category: formData.category.trim(),
      categoryId: categoryId,
      image: imageUrl,
      updatedAt: new Date(),
    };

    onUpdate(updatedProduct);
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
              onClick={() => setImageMode('upload')}
              className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                imageMode === 'upload'
                  ? 'bg-primary text-white'
                  : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
              }`}
            >
              <Upload className="w-4 h-4" />
              <span>Upload Photo</span>
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

          {imageMode === 'upload' ? (
            /* File Upload Interface */
            <div className="space-y-3">
              {/* Hidden file input */}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileSelect}
                className="hidden"
              />
              
              {/* Current image preview */}
              {formData.image && !previewUrl && (
                <div className="relative inline-block">
                  <img 
                    src={formData.image} 
                    alt="Current image" 
                    className="w-32 h-32 object-cover rounded-lg border shadow-sm"
                  />
                  <button
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, image: '' }))}
                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              )}
              
              {/* Upload button */}
              <div className="flex items-center justify-center w-full">
                <button
                  type="button"
                  onClick={handleUploadClick}
                  className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg cursor-pointer bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                >
                  <Upload className="w-8 h-8 text-gray-400 mb-2" />
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    <span className="font-medium text-primary">Click to upload</span> or drag and drop
                  </p>
                  <p className="text-xs text-gray-400 mt-1">
                    PNG, JPG, GIF up to 5MB
                  </p>
                </button>
              </div>
              
              {/* File preview */}
              {previewUrl && (
                <div className="relative inline-block">
                  <img 
                    src={previewUrl} 
                    alt="Preview" 
                    className="w-32 h-32 object-cover rounded-lg border shadow-sm"
                  />
                  <button
                    type="button"
                    onClick={handleRemoveFile}
                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                  {uploadedFile && (
                    <div className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                      <p className="font-medium">{uploadedFile.name}</p>
                      <p>{(uploadedFile.size / 1024 / 1024).toFixed(2)} MB</p>
                    </div>
                  )}
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
          <span>Update Product</span>
        </button>
      </div>
    </form>
  );
};

export default EditProductForm;
