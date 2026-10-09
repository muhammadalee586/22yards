"use client";

import React, { useState, useEffect } from 'react';
import { ShoppingBag, Search, Filter, Plus, Minus, ShoppingCart } from 'lucide-react';
import apiClient from '@/lib/apiClient';
import { Product } from '@/types';
import { useCartStore } from '@/store/useCartStore';
import { formatPKR, getMediaUrl } from '@/lib/format';
import CartDrawer from '@/components/cart/CartDrawer';
import { useAuthStore } from '@/store/useAuthStore';
import { toast } from '@/store/useToastStore';

export default function ShopPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [category, setCategory] = useState('All');
  const [loading, setLoading] = useState(true);
  const [isCartOpen, setIsCartOpen] = useState(false);
  
  const { addItem, getTotalItems } = useCartStore();
  const { user } = useAuthStore();

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await apiClient.get('/products/');
        setProducts(res.data.results || res.data);
        setFilteredProducts(res.data.results || res.data);
      } catch (err) {
        console.error("Shop fetch error:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  useEffect(() => {
    let result = products;
    if (searchQuery) {
      result = result.filter(p => 
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
        p.description.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    if (category !== 'All') {
      result = result.filter(p => p.category_name === category);
    }
    setFilteredProducts(result);
  }, [searchQuery, category, products]);

  const categories = ['All', ...new Set(products.map(p => p.category_name))];

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-pitch-cream dark:bg-stadium-dark">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-field-green"></div>
    </div>
  );

  return (
    <div className="min-h-screen bg-pitch-cream dark:bg-stadium-dark">
      <CartDrawer isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
      
      {/* Shop Header */}
      <div className="bg-boundary-white dark:bg-stadium-surface border-b border-stadium-grey dark:border-slate-700 sticky top-0 z-30">
        <div className="container mx-auto px-4 py-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <h1 className="text-4xl font-black text-stadium-dark dark:text-boundary-white mb-2">Pro Gear Shop</h1>
              <p className="text-gray-500 dark:text-gray-400">Equip yourself with the best cricket gear in Karachi.</p>
            </div>
            <button 
              onClick={() => setIsCartOpen(true)}
              className="relative p-4 bg-stadium-grey dark:bg-slate-800 rounded-2xl text-stadium-dark dark:text-boundary-white hover:bg-field-green hover:text-white transition-all group"
            >
              <ShoppingCart size={24} />
              {getTotalItems() > 0 && (
                <span className="absolute -top-2 -right-2 bg-orange-500 text-white text-xs font-bold w-6 h-6 rounded-full flex items-center justify-center ring-4 ring-boundary-white dark:ring-stadium-surface">
                  {getTotalItems()}
                </span>
              )}
            </button>
          </div>

          {/* Filters Bar */}
          <div className="mt-8 flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
              <input 
                type="text" 
                placeholder="Search for bats, balls, pads..." 
                className="w-full pl-10 pr-4 py-3 rounded-xl border border-stadium-grey dark:border-slate-700 bg-white dark:bg-stadium-dark text-gray-800 dark:text-white focus:ring-2 ring-field-green outline-none transition-all"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="flex gap-2 overflow-x-auto pb-2">
              {categories.map(cat => (
                <button 
                  key={cat}
                  onClick={() => setCategory(cat)}
                  className={`px-4 py-2 rounded-full text-sm font-bold whitespace-nowrap transition-all ${
                    category === cat 
                      ? 'bg-field-green text-white shadow-md' 
                      : 'bg-stadium-grey dark:bg-slate-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-slate-700'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Products Grid */}
      <div className="container mx-auto px-4 py-12">
        {filteredProducts.length === 0 ? (
          <div className="text-center py-20">
            <div className="p-6 bg-stadium-grey dark:bg-slate-800 rounded-full w-20 h-20 mx-auto mb-4 flex items-center justify-center">
              <Search size={32} className="text-gray-400" />
            </div>
            <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-2">No gear found</h3>
            <p className="text-gray-500 dark:text-gray-400">Try adjusting your search or category filters.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {filteredProducts.map((product) => (
              <div key={product.id} className="group bg-boundary-white dark:bg-stadium-surface rounded-3xl overflow-hidden border border-stadium-grey dark:border-slate-700 hover:shadow-xl transition-all transform hover:-translate-y-1">
                <div className="relative h-64 overflow-hidden">
                  <img
                    src={getMediaUrl(product.main_image)}
                    alt={product.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                  <div className="absolute top-4 right-4">
                    <span className="px-3 py-1 bg-white/90 dark:bg-slate-900/90 backdrop-blur-sm text-xs font-black rounded-full text-stadium-dark dark:text-boundary-white">
                      {product.category_name}
                    </span>
                  </div>
                </div>
                <div className="p-6">
                  <h3 className="text-lg font-black text-stadium-dark dark:text-boundary-white mb-2 line-clamp-1">{product.name}</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-4 line-clamp-2 h-10">{product.description}</p>
                  <div className="flex items-center justify-between mt-6">
                    <span className="text-2xl font-black text-field-green dark:text-field-green-light">
                      {formatPKR(product.price)}
                    </span>
                    <button 
                      onClick={() => {
                        addItem(product, 1);
                        toast.success(`${product.name} added to cart! 🛒`);
                      }}
                      className="p-3 bg-stadium-dark dark:bg-boundary-white text-white dark:text-stadium-dark rounded-2xl hover:bg-field-green dark:hover:bg-field-green-light transition-all shadow-sm transform active:scale-90 cursor-pointer"
                      title="Add to Cart"
                    >
                      <Plus size={20} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
