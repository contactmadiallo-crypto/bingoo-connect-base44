import React, { useState, useEffect } from 'react';
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ShoppingCart, Star, ArrowRight, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { PRODUCTS } from '@/lib/shopProducts';
import { addToCart, getCartCount } from '@/lib/cartStore';

export default function Shop() {
  const [cartCount, setCartCount] = useState(getCartCount());
  const [addedId, setAddedId] = useState(null);
  const [filter, setFilter] = useState('all');

  const categories = [
    { id: 'all', label: 'All Products' },
    { id: 'card', label: 'Cards' },
    { id: 'accessory', label: 'Accessories' },
    { id: 'stand', label: 'Stands' },
    { id: 'bundle', label: 'Bundles' },
    { id: 'bulk', label: 'Corporate' },
  ];

  const filtered = filter === 'all' ? PRODUCTS : PRODUCTS.filter(p => p.category === filter);

  const handleAddToCart = (product) => {
    addToCart(product, 1);
    setCartCount(getCartCount());
    setAddedId(product.id);
    setTimeout(() => setAddedId(null), 1500);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-50">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-xl border-b border-slate-200 sticky top-0 z-20">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <div>
            <Link to="/" className="text-sm text-blue-600 hover:underline">← Bingoo Connect</Link>
            <h1 className="text-2xl font-bold text-slate-900">NFC Shop</h1>
          </div>
          <Link to="/cart">
            <Button variant="outline" className="relative gap-2">
              <ShoppingCart className="w-4 h-4" />
              Cart
              {cartCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-blue-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
                  {cartCount}
                </span>
              )}
            </Button>
          </Link>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Hero Banner */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-2xl p-8 mb-8 text-white overflow-hidden relative"
        >
          <div className="relative z-10">
            <div className="flex items-center gap-2 mb-2">
              <Zap className="w-5 h-5 text-yellow-300" />
              <span className="text-blue-100 text-sm font-medium">Smart NFC Technology</span>
            </div>
            <h2 className="text-3xl font-bold mb-2">Share Your World with One Tap</h2>
            <p className="text-blue-100 mb-4 max-w-md">Professional NFC products that let you share your digital profile instantly. No app required for recipients.</p>
            <Link to="/pricing">
              <Button className="bg-white text-blue-600 hover:bg-blue-50 gap-2">
                View Subscription Plans <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
          </div>
          <div className="absolute right-8 top-4 text-8xl opacity-20">📲</div>
        </motion.div>

        {/* Category Filter */}
        <div className="flex gap-2 overflow-x-auto pb-2 mb-6 scrollbar-hide">
          {categories.map(cat => (
            <button
              key={cat.id}
              onClick={() => setFilter(cat.id)}
              className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all ${
                filter === cat.id
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'bg-white text-slate-600 border border-slate-200 hover:border-blue-300'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((product, idx) => (
            <motion.div
              key={product.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05 }}
              className="bg-white rounded-2xl border border-slate-200 overflow-hidden hover:shadow-lg hover:border-blue-200 transition-all group"
            >
              {/* Product Image Area */}
              <div className="bg-gradient-to-br from-slate-50 to-blue-50 p-8 text-center relative">
                <div className="text-6xl mb-2">{product.emoji}</div>
                {product.badge && (
                  <span className="absolute top-3 right-3 bg-blue-600 text-white text-xs font-bold px-2 py-1 rounded-full">
                    {product.badge}
                  </span>
                )}
              </div>

              {/* Product Info */}
              <div className="p-5">
                <h3 className="font-bold text-slate-900 text-lg mb-1">{product.name}</h3>
                <p className="text-slate-500 text-sm mb-3 line-clamp-2">{product.description}</p>

                <div className="flex items-center gap-1 mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-3.5 h-3.5 fill-yellow-400 text-yellow-400" />
                  ))}
                  <span className="text-xs text-slate-500 ml-1">(4.9)</span>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-2xl font-bold text-slate-900">${product.price}</span>
                    {product.id === 'nfc-bundle' && (
                      <span className="text-xs text-green-600 font-medium ml-2">Save $12</span>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <Link to={`/product/${product.id}`}>
                      <Button variant="outline" size="sm">Details</Button>
                    </Link>
                    <Button
                      size="sm"
                      onClick={() => handleAddToCart(product)}
                      className={`transition-all ${addedId === product.id ? 'bg-green-600 hover:bg-green-700' : 'bg-blue-600 hover:bg-blue-700'}`}
                    >
                      {addedId === product.id ? '✓ Added' : 'Add to Cart'}
                    </Button>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}