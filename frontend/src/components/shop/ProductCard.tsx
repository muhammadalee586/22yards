import React from 'react';
import { ShoppingCart, Star } from 'lucide-react';
import { useCartStore } from '@/store/useCartStore';
import { Product } from '@/types';
import { formatPKR, getMediaUrl } from '@/lib/format';

interface ProductProps {
  product: Product;
}

const ProductCard = ({ product }: ProductProps) => {
  const { addItem } = useCartStore();

  return (
    <div className="group bg-boundary-white dark:bg-stadium-surface rounded-2xl shadow-sm border border-stadium-grey dark:border-slate-700 overflow-hidden transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
      <div className="relative h-64 overflow-hidden">
        <img 
          src={getMediaUrl(product.main_image)} 
          alt={product.name} 
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" 
        />
        <div className="absolute top-3 right-3 px-2 py-1 rounded-lg bg-white/90 dark:bg-slate-900/90 backdrop-blur-sm text-xs font-bold text-field-green dark:text-field-green-light shadow-sm">
          {product.category_name}
        </div>
      </div>

      <div className="p-5">
        <div className="flex justify-between items-start mb-2">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white leading-tight group-hover:text-field-green transition-colors">
            {product.name}
          </h3>
          <div className="flex items-center text-yellow-500">
            <Star size={14} fill="currentColor" />
            <span className="text-xs font-bold ml-1">4.9</span>
          </div>
        </div>
        
        <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-2 mb-4 h-10">
          {product.description}
        </p>
        
        <div className="flex items-center justify-between mt-auto">
          <span className="text-2xl font-extrabold text-gray-900 dark:text-white">
            {formatPKR(product.price)}
          </span>
          <button 
            onClick={() => addItem(product, 1)}
            className="p-3 bg-field-green dark:bg-field-green-light text-white rounded-xl hover:bg-green-700 transition-all active:scale-90 shadow-md cursor-pointer"
            title="Add to Cart"
          >
            <ShoppingCart size={20} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
